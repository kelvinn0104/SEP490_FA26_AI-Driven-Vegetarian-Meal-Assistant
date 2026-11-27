using System.Text.Json;
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

        var hits = await ChatKnowledge.RetrieveAsync(_db, userId, text, session.PlanId, ct);
        var selected = await SelectSourcesAsync(userId, text, history, hits, ct);
        var answer = await RenderVerifiedAnswerAsync(selected, userId, ct);
        var citations = ChatKnowledge.ToCitations(selected);
        var userMsg = new ChatMessage { SessionId = sessionId, Sender = "user", Content = text };
        _db.ChatMessages.Add(userMsg);

        // SDD 3.19 (LI-01): câu hỏi liên quan y tế → luôn kèm khuyến cáo không thay thế tư vấn y khoa
        if (IsMedicalTopic(text) && !answer.Contains(Disclaimer, StringComparison.Ordinal))
            answer += "\n\n" + Disclaimer;

        answer += ChatKnowledge.ToFooter(citations);
        var aiMsg = new ChatMessage { SessionId = sessionId, Sender = "ai", Content = answer };
        _db.ChatMessages.Add(aiMsg);
        await _db.SaveChangesAsync(ct);

        return new ChatReplyDto(
            new ChatMessageDto(userMsg.Id, userMsg.Sender, userMsg.Content, userMsg.CreatedAt),
            new ChatMessageDto(aiMsg.Id, aiMsg.Sender, aiMsg.Content, aiMsg.CreatedAt), citations);
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

    private async Task<List<KnowledgeHit>> SelectSourcesAsync(int userId, string text,
        IReadOnlyList<ChatMessage> history, List<KnowledgeHit> hits, CancellationToken ct)
    {
        if (hits.Count == 0) return [];
        var folded = ChatKnowledge.Fold(text);
        var exact = hits.Where(hit => folded.Contains(ChatKnowledge.Fold(hit.Title), StringComparison.Ordinal)).ToList();
        if (exact.Any(hit => hit.Type == "recipe"))
            return exact.Where(hit => hit.Type == "recipe").Take(3).ToList();
        var namedRecipe = !folded.Contains("goi y") && (folded.Contains("cach nau") || folded.Contains("cach lam") ||
            folded.Contains("cong thuc") || (folded.StartsWith("nau ") && folded.Contains("nhu the nao")));
        if (namedRecipe)
            hits = hits.Where(hit => hit.Type == "recipe" && ChatKnowledge.MatchesNamedRecipe(text, hit.Title)).ToList();
        if (namedRecipe && hits.Count == 0) return [];
        if (_llm.IsConfigured)
        {
            var request = new LlmRequest
            {
                Task = AiModelTypes.Chatbot,
                UserId = userId,
                Temperature = 0.1,
                MaxOutputTokens = 300,
                JsonOutput = true,
                SystemPrompt = """
                    Chọn tối đa 3 mục trong danh sách VeggieAI để trả lời câu hỏi, chỉ trả JSON {"sources":[1,2]}.
                    Các số là chỉ mục của danh sách. Với yêu cầu công thức hoặc cách nấu một món cụ thể,
                    chỉ chọn đúng món đó, trả {"sources":[]} nếu tên món không khớp.
                    Với gợi ý mở, chọn công thức phù hợp nhất với nguyên liệu hoặc tiêu chí được hỏi.
                    Với câu hỏi về dinh dưỡng nguyên liệu, chỉ chọn dữ liệu nguyên liệu phù hợp.
                    Không chọn mục chỉ trùng vài từ nhưng sai món. Không viết câu trả lời, không thêm mục ngoài danh sách.
                    """ + "\n" + ChatKnowledge.ToPromptBlock(hits),
            };
            request.Messages.AddRange(history.TakeLast(4).Select(m => m.Sender == "ai" ? LlmMessage.Assistant(m.Content) : LlmMessage.User(m.Content)));
            request.Messages.Add(LlmMessage.User(text));
            try
            {
                var raw = (await _llm.GenerateAsync(request, ct)).Text;
                var first = raw.IndexOf('{');
                var last = raw.LastIndexOf('}');
                if (first >= 0 && last >= first)
                {
                    using var json = JsonDocument.Parse(raw[first..(last + 1)]);
                    if (json.RootElement.TryGetProperty("sources", out var sources) && sources.ValueKind == JsonValueKind.Array)
                        return sources.EnumerateArray().Where(x => x.ValueKind == JsonValueKind.Number && x.TryGetInt32(out _))
                            .Select(x => x.GetInt32()).Where(index => index >= 1 && index <= hits.Count).Distinct().Take(3)
                            .Select(index => hits[index - 1]).ToList();
                }
            }
            catch (Exception ex) when (!ct.IsCancellationRequested &&
                ex is AppException or HttpRequestException or TaskCanceledException or JsonException)
            {
                // Khi AI bận, chỉ trả nguồn khớp đầy đủ tên.
            }
        }

        return (namedRecipe ? hits : exact).Take(3).ToList();
    }

    private async Task<string> RenderVerifiedAnswerAsync(List<KnowledgeHit> selected, int userId, CancellationToken ct)
    {
        var ids = selected.Where(x => x.Type == "recipe").Select(x => x.Id).ToList();
        var allergens = await _db.AllergenIngredientIdsAsync(userId, ct);
        var recipes = await _db.Recipes.AsNoTracking().EligibleForPlan(allergens).Where(r => ids.Contains(r.Id))
            .Select(r => new
            {
                r.Id, r.Title, r.Servings, r.KcalPerServing, r.ProteinG, r.Instructions,
                Ingredients = r.RecipeIngredients.OrderByDescending(i => i.QuantityG)
                    .Select(i => new { i.Ingredient!.Name, i.QuantityG }).ToList(),
            }).ToDictionaryAsync(r => r.Id, ct);
        selected.RemoveAll(hit => hit.Type == "recipe" && !recipes.ContainsKey(hit.Id));
        if (selected.Count == 0)
            return "Chưa tìm thấy công thức phù hợp trong kho đã duyệt. Bạn có thể thử tên món khác hoặc nêu nguyên liệu đang có.";

        var paragraphs = new List<string>();
        foreach (var hit in selected)
        {
            if (hit.Type != "recipe")
            {
                paragraphs.Add(hit.Snippet);
                continue;
            }
            var recipe = recipes[hit.Id];
            var paragraph = $"**{recipe.Title}** · {recipe.KcalPerServing:0.#} kcal · {recipe.ProteinG:0.#} g đạm mỗi phần";
            if (recipes.Count == 1)
            {
                var ingredients = string.Join(", ", recipe.Ingredients.Select(i => $"{i.Name} ({i.QuantityG:0.#} g)"));
                paragraph += $"\n\n**Nguyên liệu cho {recipe.Servings} phần:** {ingredients}\n\n{recipe.Instructions}";
            }
            paragraphs.Add(paragraph);
        }
        return string.Join("\n\n", paragraphs);
    }
}
