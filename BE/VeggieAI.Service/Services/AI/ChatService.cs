using System.Text;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

/// <summary>Nutrition chatbot with the user's profile and optional meal plan as context.</summary>
public interface IChatService
{
    Task<ChatSessionDto> CreateSessionAsync(int userId, CreateChatSessionRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<ChatSessionDto>> GetSessionsAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(int userId, int sessionId, CancellationToken ct = default);
    Task<ChatReplyDto> SendAsync(int userId, int sessionId, string content, CancellationToken ct = default);
    Task DeleteSessionAsync(int userId, int sessionId, CancellationToken ct = default);
}

public class ChatService : IChatService
{
    private const int HistoryMessages = 12;

    public const string Disclaimer =
        "⚠️ Lưu ý: thông tin trên chỉ mang tính tham khảo về dinh dưỡng, không thay thế chẩn đoán hay điều trị của bác sĩ. " +
        "Nếu bạn có bệnh lý, đang mang thai/cho con bú hoặc đang dùng thuốc, hãy hỏi bác sĩ hoặc chuyên gia dinh dưỡng.";

    private static readonly string[] MedicalKeywords =
    {
        "bệnh", "benh", "thuốc", "thuoc", "tiểu đường", "tieu duong", "huyết áp", "huyet ap", "mỡ máu", "mo mau", "gout",
        "mang thai", "bà bầu", "ba bau", "cho con bú", "ung thư", "ung thu", "thiếu máu", "thieu mau", "dạ dày", "da day",
        "đau", "dau bung", "triệu chứng", "trieu chung", "chẩn đoán", "chan doan", "điều trị", "dieu tri", "dị ứng", "di ung",
        "suy thận", "suy than", "tim mạch", "tim mach", "cholesterol", "đường huyết", "duong huyet", "diabetes", "medication",
    };

    private static bool IsMedicalTopic(string text) =>
        MedicalKeywords.Any(k => text.Contains(k, StringComparison.OrdinalIgnoreCase));
    private readonly VeggieAIDbContext _db;
    private readonly ILlmClient _llm;

    public ChatService(VeggieAIDbContext db, ILlmClient llm)
    {
        _db = db;
        _llm = llm;
    }

    public async Task<ChatSessionDto> CreateSessionAsync(int userId, CreateChatSessionRequest req, CancellationToken ct = default)
    {
        if (req.PlanId is not null && !await _db.MealPlans.AnyAsync(p => p.Id == req.PlanId && p.UserId == userId, ct))
            throw AppException.NotFound("Thực đơn");

        var s = new ChatSession { UserId = userId, PlanId = req.PlanId };
        _db.ChatSessions.Add(s);
        await _db.SaveChangesAsync(ct);
        return new ChatSessionDto(s.Id, s.PlanId, s.CreatedAt, null, 0);
    }

    public async Task<IReadOnlyList<ChatSessionDto>> GetSessionsAsync(int userId, CancellationToken ct = default)
    {
        return await _db.ChatSessions.AsNoTracking()
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new ChatSessionDto(
                s.Id,
                s.PlanId,
                s.CreatedAt,
                s.Messages.OrderByDescending(m => m.CreatedAt)
                    .Select(m => m.Content.Length > 120 ? m.Content.Substring(0, 120) : m.Content)
                    .FirstOrDefault(),
                s.Messages.Count))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<ChatMessageDto>> GetMessagesAsync(int userId, int sessionId, CancellationToken ct = default)
    {
        await EnsureOwnedAsync(userId, sessionId, ct);
        return await _db.ChatMessages.AsNoTracking()
            .Where(m => m.SessionId == sessionId)
            .OrderBy(m => m.CreatedAt)
            .ThenBy(m => m.Id)
            .Select(m => new ChatMessageDto(m.Id, m.Sender, m.Content, m.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<ChatReplyDto> SendAsync(int userId, int sessionId, string content, CancellationToken ct = default)
    {
        var session = await EnsureOwnedAsync(userId, sessionId, ct);
        var history = await _db.ChatMessages.AsNoTracking()
            .Where(m => m.SessionId == sessionId)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .Take(HistoryMessages)
            .ToListAsync(ct);
        history.Reverse();

        var text = content.Trim();
        if (text.Length == 0) throw new AppException("Nội dung tin nhắn không được để trống.");

        // AI chưa cấu hình → báo lỗi có mã, KHÔNG lưu câu báo lỗi như một câu trả lời của AI
        if (!_llm.IsConfigured)
            throw new AppException("Trợ lý AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.", 503, "AI_NOT_CONFIGURED");

        var userMsg = new ChatMessage { SessionId = sessionId, Sender = "user", Content = text };
        _db.ChatMessages.Add(userMsg);
        await _db.SaveChangesAsync(ct);

        string answer;
        var req = new LlmRequest
        {
            Task = AiModelTypes.Chatbot,
            UserId = userId,
            Temperature = 0.6,
            MaxOutputTokens = 2048,
            SystemPrompt = await BuildSystemPromptAsync(userId, session.PlanId, ct),
        };
        req.Messages.AddRange(history.Select(m => m.Sender == "ai" ? LlmMessage.Assistant(m.Content) : LlmMessage.User(m.Content)));
        req.Messages.Add(LlmMessage.User(userMsg.Content));

        try
        {
            answer = (await _llm.GenerateAsync(req, ct)).Text.Trim();
            if (string.IsNullOrWhiteSpace(answer))
                throw new AppException("AI không trả lời.", 502);
        }
        catch (Exception ex) when (ex is AppException { StatusCode: >= 500 } or HttpRequestException or TaskCanceledException)
        {
            // Bỏ tin nhắn vừa lưu để lịch sử không có câu hỏi "treo"; FE giữ nội dung trong ô nhập và cho bấm thử lại
            _db.ChatMessages.Remove(userMsg);
            await _db.SaveChangesAsync(CancellationToken.None);
            throw new AppException("Trợ lý AI đang bận, vui lòng thử lại sau ít phút.", 503, "AI_UNAVAILABLE");
        }

        // SDD 3.19 (LI-01): câu hỏi liên quan y tế → luôn kèm khuyến cáo không thay thế tư vấn y khoa
        if (IsMedicalTopic(text) && !answer.Contains(Disclaimer, StringComparison.Ordinal))
            answer += "\n\n" + Disclaimer;

        var aiMsg = new ChatMessage { SessionId = sessionId, Sender = "ai", Content = answer };
        _db.ChatMessages.Add(aiMsg);
        await _db.SaveChangesAsync(ct);

        return new ChatReplyDto(
            new ChatMessageDto(userMsg.Id, userMsg.Sender, userMsg.Content, userMsg.CreatedAt),
            new ChatMessageDto(aiMsg.Id, aiMsg.Sender, aiMsg.Content, aiMsg.CreatedAt));
    }

    public async Task DeleteSessionAsync(int userId, int sessionId, CancellationToken ct = default)
    {
        var s = await EnsureOwnedAsync(userId, sessionId, ct);
        _db.ChatSessions.Remove(s);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<ChatSession> EnsureOwnedAsync(int userId, int sessionId, CancellationToken ct) =>
        await _db.ChatSessions.FirstOrDefaultAsync(s => s.Id == sessionId && s.UserId == userId, ct)
        ?? throw AppException.NotFound("Phiên chat");

    private async Task<string> BuildSystemPromptAsync(int userId, int? planId, CancellationToken ct)
    {
        var sb = new StringBuilder();
        sb.AppendLine("Bạn là VeggieAI — trợ lý dinh dưỡng cho người ăn chay tại Việt Nam. Trả lời tiếng Việt, ngắn gọn, thân thiện, có căn cứ khoa học.");
        sb.AppendLine("Không chẩn đoán bệnh hay kê đơn thuốc; với vấn đề sức khỏe nghiêm trọng, khuyên người dùng gặp bác sĩ/chuyên gia dinh dưỡng.");
        sb.AppendLine("Chỉ gợi ý món chay (không thịt, cá, hải sản). Chú ý vi chất người ăn chay dễ thiếu: B12, sắt, canxi, kẽm, omega-3, protein.");

        var p = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        if (p is not null)
        {
            sb.AppendLine($"Hồ sơ người dùng: {p.Gender}, {NutritionCalculator.AgeAt(p.DateOfBirth, AiMappers.TodayVn())} tuổi, " +
                          $"{p.HeightCm} cm, {p.WeightKg} kg, BMI {p.Bmi}, vận động {p.ActivityLevel}, mục tiêu {p.HealthGoal}; " +
                          $"nhu cầu/ngày {p.DailyKcalTarget:0} kcal, protein {p.ProteinTargetG:0} g, sắt {p.IronTargetMg} mg, B12 {p.B12TargetMcg} mcg.");
        }

        var allergies = await _db.UserAllergies
            .Where(ua => ua.UserId == userId)
            .Select(ua => ua.Allergy!.Name)
            .ToListAsync(ct);
        if (allergies.Count > 0)
        {
            sb.AppendLine($"Dị ứng (TUYỆT ĐỐI tránh): {string.Join(", ", allergies)}.");
        }

        var today = AiMappers.TodayVn();
        var eaten = await _db.MealLogs.AsNoTracking()
            .Where(l => l.UserId == userId && l.LogDate == today)
            .Select(l => new { l.Recipe!.Title, l.KcalConsumed })
            .ToListAsync(ct);
        if (eaten.Count > 0)
        {
            sb.AppendLine($"Hôm nay đã ăn: {string.Join("; ", eaten.Select(e => $"{e.Title} ({e.KcalConsumed:0} kcal)"))}.");
        }

        if (planId is not null)
        {
            var items = await _db.MealPlanItems.AsNoTracking()
                .Where(i => i.PlanId == planId)
                .OrderBy(i => i.PlanDate)
                .Select(i => new { i.Id, i.PlanDate, i.MealType, i.Recipe!.Title, i.Servings, Kcal = i.Recipe.KcalPerServing * i.Servings })
                .ToListAsync(ct);
            sb.AppendLine("Người dùng đang hỏi về thực đơn sau (itemId | ngày | bữa | món | khẩu phần | kcal):");
            foreach (var i in items)
            {
                sb.AppendLine($"{i.Id} | {i.PlanDate:dd/MM} | {i.MealType} | {i.Title} | {i.Servings} | {i.Kcal:0}");
            }
            sb.AppendLine("Nếu người dùng muốn đổi món, giải thích lý do và nhắc họ dùng nút \"Đổi món\" (API POST /api/meal-plans/{planId}/items/{itemId}/swap).");
        }
        return sb.ToString();
    }
}
