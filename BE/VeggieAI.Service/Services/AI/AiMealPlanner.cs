using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

/// <summary>AI meal planner (LLM + rule-based validation + fallback).</summary>
public interface IAiMealPlanner
{
    Task<GeneratedMealPlanDto> GenerateAsync(int userId, GenerateMealPlanRequest req, CancellationToken ct = default);
    Task<GeneratedMealPlanDto> SwapItemAsync(int userId, int planId, int itemId, SwapMealRequest req, CancellationToken ct = default);
    Task<SuggestedMenuDto?> SuggestDayMenuAsync(int userId, IReadOnlyCollection<int> ingredientIds, string? dishName, CancellationToken ct = default);
}

public class AiMealPlanner : IAiMealPlanner
{
    private const decimal MaxDeviation = 0.12m;      // ±12% kcal per day
    private const int MaxAttempts = 2;
    private const int MaxCandidatesForLlm = 80;

    private readonly VeggieAIDbContext _db;
    private readonly ILlmClient _llm;
    private readonly ILogger<AiMealPlanner> _log;

    public AiMealPlanner(VeggieAIDbContext db, ILlmClient llm, ILogger<AiMealPlanner> log)
    {
        _db = db;
        _llm = llm;
        _log = log;
    }

    public async Task<GeneratedMealPlanDto> GenerateAsync(int userId, GenerateMealPlanRequest req, CancellationToken ct = default)
    {
        var profile = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct)
                      ?? throw new AppException("Bạn cần tạo hồ sơ sức khỏe trước khi lập thực đơn.", 409);
        var goal = req.HealthGoal ?? profile.HealthGoal;
        var targets = goal == profile.HealthGoal ? profile.Targets() : await TargetsForGoalAsync(profile, goal, ct);

        var mealTypes = NormalizeMealTypes(req.MealTypes);
        var start = req.StartDate ?? AiMappers.TodayVn().AddDays(1);
        var dates = Enumerable.Range(0, req.Days).Select(start.AddDays).ToList();

        var preferred = (req.PreferredIngredientIds ?? new()).ToHashSet();
        if (req.ScanId is not null)
        {
            foreach (var id in await ScanIngredientIdsAsync(userId, req.ScanId.Value, ct)) preferred.Add(id);
        }

        var candidates = await LoadCandidatesAsync(userId, preferred, ct);
        if (candidates.Count < 3)
            throw new AppException("Chưa đủ công thức đã duyệt (published) phù hợp với dị ứng của bạn để lập thực đơn.");

        var notices = new List<string>();
        var attempts = 0;
        string? aiLabel = null, notes = null;
        Dictionary<DateOnly, List<PlannedMeal>>? plan = null;
        List<string> lastErrors = new();

        if (_llm.IsConfigured)
        {
            var llmCandidates = candidates.Take(MaxCandidatesForLlm).ToList();
            var byId = llmCandidates.ToDictionary(c => c.Id);
            string? feedback = null, lastRaw = null;
            while (attempts < MaxAttempts)
            {
                attempts++;
                try
                {
                    var res = await _llm.GenerateAsync(new LlmRequest
                    {
                        Task = AiModelTypes.MealPlanner,
                        UserId = userId,
                        JsonOutput = true,
                        Temperature = 0.5,
                        MaxOutputTokens = 8192,
                        SystemPrompt = SystemPromptPlanner,
                        Messages = BuildPlannerMessages(profile, goal, targets, mealTypes, dates, llmCandidates, preferred, req.Note, feedback, lastRaw),
                    }, ct);
                    lastRaw = res.Text;
                    var parsed = LlmJson.Parse<LlmPlan>(res.Text) ?? throw new JsonException("empty");
                    var (candidatePlan, errors) = Validate(parsed, dates, mealTypes, byId, targets.Kcal);
                    if (candidatePlan.Count > 0) { plan = candidatePlan; notes = parsed.Notes; aiLabel = $"{res.Provider}/{res.Model}"; }
                    lastErrors = errors;
                    if (errors.Count == 0) break;
                    feedback = string.Join("\n", errors.Take(15));
                }
                catch (JsonException ex)
                {
                    _log.LogWarning(ex, "Planner JSON parse failed");
                    lastErrors = new() { "JSON không hợp lệ" };
                    feedback = "Câu trả lời trước không phải JSON hợp lệ theo schema. Chỉ trả về JSON.";
                }
                catch (AppException ex) when (ex.StatusCode >= 500)
                {
                    notices.Add("AI lỗi: " + ex.Message);
                    break;
                }
            }
            if (plan is not null && lastErrors.Count > 0)
                notices.Add($"AI chưa đạt đủ ràng buộc sau {attempts} lần ({lastErrors.Count} lỗi) — hệ thống đã tự chỉnh khẩu phần/bổ sung món.");
        }
        else notices.Add("Chưa cấu hình API key AI → dùng thuật toán rule-based.");

        var fallbackUsed = plan is null;
        plan ??= new Dictionary<DateOnly, List<PlannedMeal>>();
        FillMissing(plan, dates, mealTypes, candidates, targets.Kcal, ref fallbackUsed);
        foreach (var d in dates) TuneServings(plan[d], targets.Kcal);

        var generatedBy = aiLabel is null ? "rule-based" : fallbackUsed ? $"ai:{aiLabel}+rule-based" : $"ai:{aiLabel}";
        var finalWarnings = notices.Concat(PostCheck(plan, dates, candidates, targets)).ToList();

        var entity = new MealPlan
        {
            UserId = userId,
            StartDate = dates.First(),
            EndDate = dates.Last(),
            HealthGoal = goal,
            Status = "draft",
        };
        foreach (var d in dates)
        {
            foreach (var m in plan[d])
            {
                entity.Items.Add(new MealPlanItem { PlanDate = d, MealType = m.MealType, RecipeId = m.RecipeId, Servings = m.Servings });
            }
        }
        _db.MealPlans.Add(entity);
        await _db.SaveChangesAsync(ct);

        var detail = await BuildDetailAsync(_db, userId, entity.Id, ct);
        return new GeneratedMealPlanDto(detail, generatedBy, notes, attempts, finalWarnings);
    }

    public async Task<GeneratedMealPlanDto> SwapItemAsync(int userId, int planId, int itemId, SwapMealRequest req, CancellationToken ct = default)
    {
        var item = await _db.MealPlanItems.Include(i => i.Recipe).Include(i => i.MealPlan)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId && i.MealPlan!.UserId == userId, ct)
            ?? throw AppException.NotFound("Món trong thực đơn");
        var sameDay = await _db.MealPlanItems.Where(i => i.PlanId == planId && i.PlanDate == item.PlanDate).Select(i => i.RecipeId).ToListAsync(ct);
        var candidates = (await LoadCandidatesAsync(userId, new HashSet<int>(), ct)).Where(c => !sameDay.Contains(c.Id)).ToList();
        if (candidates.Count == 0) throw new AppException("Không còn công thức phù hợp để đổi.");

        var kcalTarget = item.Recipe!.KcalPerServing * item.Servings;
        var warnings = new List<string>();
        string generatedBy = "rule-based";
        string? notes = null;
        Candidate? chosen = null;
        decimal servings = 1;

        if (_llm.IsConfigured)
        {
            try
            {
                var list = RankForMeal(candidates, item.MealType, kcalTarget).Take(40).ToList();
                var sb = new StringBuilder();
                sb.AppendLine($"Người dùng muốn ĐỔI món \"{item.Recipe.Title}\" ({item.MealType}, ~{kcalTarget:0} kcal) trong thực đơn ngày {item.PlanDate:yyyy-MM-dd}.");
                sb.AppendLine($"Lý do / mong muốn: {(string.IsNullOrWhiteSpace(req.Reason) ? "(không nêu)" : req.Reason)}");
                sb.AppendLine("Chọn 1 món thay thế trong danh sách (giữ năng lượng xấp xỉ, ưu tiên đáp ứng mong muốn):");
                AppendCandidates(sb, list, new HashSet<int>());
                sb.AppendLine("Trả về JSON: {\"recipeId\": number, \"servings\": number (0.5-2.5, bước 0.25), \"reason\": \"giải thích ngắn tiếng Việt\"}");
                var res = await _llm.GenerateAsync(new LlmRequest
                {
                    Task = AiModelTypes.MealPlanner,
                    UserId = userId,
                    JsonOutput = true,
                    Temperature = 0.6,
                    SystemPrompt = SystemPromptPlanner,
                    Messages = { LlmMessage.User(sb.ToString()) },
                }, ct);
                var pick = LlmJson.Parse<LlmMeal>(res.Text);
                chosen = list.FirstOrDefault(c => c.Id == pick?.RecipeId);
                if (chosen is not null)
                {
                    servings = ClampServings(pick!.Servings ?? kcalTarget / Math.Max(1, chosen.Kcal));
                    notes = pick.Reason;
                    generatedBy = $"ai:{res.Provider}/{res.Model}";
                }
                else warnings.Add("AI chọn món không hợp lệ → dùng rule-based.");
            }
            catch (AppException ex) { warnings.Add("AI lỗi: " + ex.Message); }
            catch (JsonException) { warnings.Add("AI trả về sai định dạng → dùng rule-based."); }
        }

        if (chosen is null)
        {
            chosen = RankForMeal(candidates, item.MealType, kcalTarget).Skip(Random.Shared.Next(0, 3)).FirstOrDefault()
                     ?? candidates.First();
            servings = ClampServings(kcalTarget / Math.Max(1, chosen.Kcal));
        }

        item.RecipeId = chosen.Id;
        item.Servings = servings;
        await _db.SaveChangesAsync(ct);
        var detail = await BuildDetailAsync(_db, userId, planId, ct);
        return new GeneratedMealPlanDto(detail, generatedBy, notes, 1, warnings);
    }

    public async Task<SuggestedMenuDto?> SuggestDayMenuAsync(int userId, IReadOnlyCollection<int> ingredientIds, string? dishName, CancellationToken ct = default)
    {
        var profile = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        var kcal = profile?.DailyKcalTarget ?? 2000;
        var candidates = await LoadCandidatesAsync(userId, ingredientIds.ToHashSet(), ct);
        if (candidates.Count == 0) return null;

        if (!string.IsNullOrWhiteSpace(dishName))
        {
            var words = dishName.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries).Where(w => w.Length > 2).ToList();
            foreach (var c in candidates)
                c.DishBoost = words.Count(w => c.Title.Contains(w, StringComparison.OrdinalIgnoreCase));
        }

        var types = new List<string> { AiMealTypes.Breakfast, AiMealTypes.Lunch, AiMealTypes.Dinner };
        var day = new List<PlannedMeal>();
        var used = new HashSet<int>();
        foreach (var mt in types)
        {
            var share = MealShare(mt, types);
            var pick = RankForMeal(candidates.Where(c => !used.Contains(c.Id)), mt, kcal * share).FirstOrDefault();
            if (pick is null) continue;
            used.Add(pick.Id);
            day.Add(new PlannedMeal(mt, pick.Id, 1, pick.PreferredOverlap > 0
                ? $"Dùng được {pick.PreferredOverlap} nguyên liệu bạn đang có" : "Cân đối dinh dưỡng trong ngày") { Kcal = pick.Kcal });
        }
        TuneServings(day, kcal);

        var byId = candidates.ToDictionary(c => c.Id);
        var meals = day.Select(m => new SuggestedMenuMealDto(m.MealType, m.RecipeId, byId[m.RecipeId].Title, m.Servings,
            byId[m.RecipeId].Nutrition.Scale(m.Servings).Rounded(), m.Reason)).ToList();
        var total = meals.Aggregate(NutrientAmountsDto.Zero, (a, m) => a.Add(m.Nutrition)).Rounded();
        return new SuggestedMenuDto(meals, total, kcal,
            "Gợi ý 1 ngày dựa trên nguyên liệu nhận diện được.");
    }

    public static async Task<MealPlanDetailDto> BuildDetailAsync(VeggieAIDbContext db, int userId, int planId, CancellationToken ct)
    {
        var plan = await db.MealPlans.AsNoTracking()
            .Include(p => p.Items).ThenInclude(i => i.Recipe)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId, ct)
            ?? throw AppException.NotFound("Thực đơn");
        var profile = await db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        var targets = profile?.Targets() ?? NutrientAmountsDto.Zero;
        var hasList = await db.ShoppingLists.AnyAsync(s => s.PlanId == planId, ct);

        var days = new List<MealPlanDayDto>();
        for (var d = plan.StartDate; d <= plan.EndDate; d = d.AddDays(1))
        {
            var meals = plan.Items.Where(i => i.PlanDate == d)
                .OrderBy(i => Array.IndexOf(AiMealTypes.All, i.MealType)).ThenBy(i => i.Id)
                .Select(i => new MealPlanItemDto(i.Id, i.PlanDate, i.MealType, i.Servings, i.RecipeId, i.Recipe!.Title,
                    i.Recipe.ImageUrl, i.Recipe.PerServing().Scale(i.Servings).Rounded()))
                .ToList();
            var total = meals.Aggregate(NutrientAmountsDto.Zero, (acc, m) => acc.Add(m.Nutrition)).Rounded();
            var dev = targets.Kcal == 0 ? 0 : Math.Round((total.Kcal - targets.Kcal) / targets.Kcal * 100, 1);
            days.Add(new MealPlanDayDto(d, meals, total, targets.Kcal, dev));
        }
        return new MealPlanDetailDto(plan.Id, plan.StartDate, plan.EndDate, plan.HealthGoal, plan.Status, plan.CreatedAt,
            targets, days, hasList);
    }

    private const string SystemPromptPlanner =
        "Bạn là chuyên gia dinh dưỡng cho người ĂN CHAY tại Việt Nam, làm việc trong ứng dụng VeggieAI. " +
        "Bạn lập thực đơn CHỈ từ danh sách công thức được cung cấp (dùng đúng recipeId), không bịa món mới. " +
        "Mục tiêu: tổng năng lượng mỗi ngày sát mục tiêu kcal (±10%), đủ protein, chú ý sắt, B12, canxi, kẽm (vi chất người ăn chay hay thiếu), " +
        "đa dạng món (không lặp 1 món quá 2 lần/tuần, không trùng món trong cùng ngày), phù hợp bữa (món sáng nhẹ, canh/món chính cho trưa-tối). " +
        "Ưu tiên công thức dùng nguyên liệu người dùng đang có (đánh dấu ★). Luôn trả lời bằng JSON hợp lệ đúng schema, không thêm văn bản khác.";

    private static List<LlmMessage> BuildPlannerMessages(HealthProfile p, string goal, NutrientAmountsDto t, List<string> mealTypes,
        List<DateOnly> dates, List<Candidate> candidates, HashSet<int> preferred, string? note, string? feedback, string? lastRaw)
    {
        var sb = new StringBuilder();
        sb.AppendLine("## Hồ sơ người dùng");
        sb.AppendLine($"- Giới tính: {p.Gender}, tuổi: {NutritionCalculator.AgeAt(p.DateOfBirth, AiMappers.TodayVn())}, " +
                      $"cao {p.HeightCm} cm, nặng {p.WeightKg} kg, BMI {p.Bmi}, vận động: {p.ActivityLevel}");
        sb.AppendLine($"- Mục tiêu: {goal} (loss=giảm cân, gain=tăng cân/tăng cơ, maintain=duy trì)");
        sb.AppendLine($"- Mục tiêu MỖI NGÀY: {t.Kcal:0} kcal, protein {t.ProteinG:0} g, carb {t.CarbG:0} g, fat {t.FatG:0} g, " +
                      $"sắt {t.IronMg} mg, B12 {t.B12Mcg} mcg, canxi {t.CalciumMg} mg, kẽm {t.ZincMg} mg");
        sb.AppendLine("- Danh sách đã loại sẵn các món chứa chất gây dị ứng của người dùng.");
        if (!string.IsNullOrWhiteSpace(note)) sb.AppendLine($"- Yêu cầu thêm của người dùng: {note}");
        sb.AppendLine();
        sb.AppendLine("## Yêu cầu");
        sb.AppendLine($"- Lập thực đơn cho các ngày: {string.Join(", ", dates.Select(d => d.ToString("yyyy-MM-dd")))}");
        sb.AppendLine($"- Các bữa mỗi ngày: {string.Join(", ", mealTypes)} (tỉ lệ kcal gợi ý: " +
                      string.Join(", ", mealTypes.Select(m => $"{m} {MealShare(m, mealTypes) * 100:0}%")) + ")");
        sb.AppendLine("- servings: số khẩu phần (0.5–2.5, bước 0.25) — dùng để chỉnh cho đủ kcal.");
        sb.AppendLine();
        sb.AppendLine("## Công thức được phép dùng (dinh dưỡng / 1 khẩu phần)");
        AppendCandidates(sb, candidates, preferred);
        sb.AppendLine();
        sb.AppendLine("## Định dạng đầu ra (JSON)");
        sb.AppendLine("{\"days\":[{\"date\":\"yyyy-MM-dd\",\"meals\":[{\"mealType\":\"breakfast\",\"recipeId\":1,\"servings\":1.0}]}]," +
                      "\"notes\":\"2-4 câu tiếng Việt giải thích cách thực đơn đáp ứng mục tiêu & lưu ý vi chất\"}");

        var messages = new List<LlmMessage> { LlmMessage.User(sb.ToString()) };
        if (feedback is not null && lastRaw is not null)
        {
            messages.Add(LlmMessage.Assistant(lastRaw));
            messages.Add(LlmMessage.User("Thực đơn trên CHƯA đạt ràng buộc:\n" + feedback +
                                         "\nHãy sửa và trả về TOÀN BỘ thực đơn theo đúng schema JSON."));
        }
        return messages;
    }

    private static void AppendCandidates(StringBuilder sb, IEnumerable<Candidate> list, HashSet<int> preferred)
    {
        sb.AppendLine("id | món | loại | kcal | P g | C g | F g | Fe mg | B12 mcg | Ca mg | Zn mg | nguyên liệu chính");
        foreach (var c in list)
            sb.AppendLine($"{c.Id} | {(c.PreferredOverlap > 0 ? "★ " : "")}{c.Title} | {c.Category} | {c.Kcal:0} | {c.Nutrition.ProteinG:0.#} | " +
                          $"{c.Nutrition.CarbG:0.#} | {c.Nutrition.FatG:0.#} | {c.Nutrition.IronMg:0.#} | {c.Nutrition.B12Mcg:0.##} | " +
                          $"{c.Nutrition.CalciumMg:0} | {c.Nutrition.ZincMg:0.#} | {string.Join(", ", c.IngredientNames.Take(5))}");
    }

    private static (Dictionary<DateOnly, List<PlannedMeal>> plan, List<string> errors) Validate(LlmPlan parsed, List<DateOnly> dates,
        List<string> mealTypes, Dictionary<int, Candidate> byId, decimal kcalTarget)
    {
        var errors = new List<string>();
        var plan = new Dictionary<DateOnly, List<PlannedMeal>>();
        foreach (var day in parsed.Days ?? new())
        {
            if (!DateOnly.TryParse(day.Date, out var d) || !dates.Contains(d)) { errors.Add($"Ngày không hợp lệ: {day.Date}"); continue; }
            var meals = new List<PlannedMeal>();
            foreach (var m in day.Meals ?? new())
            {
                var mt = m.MealType?.ToLowerInvariant() ?? "";
                if (!mealTypes.Contains(mt)) { errors.Add($"{d}: bữa '{m.MealType}' không nằm trong yêu cầu."); continue; }
                if (m.RecipeId is null || !byId.ContainsKey(m.RecipeId.Value)) { errors.Add($"{d} {mt}: recipeId {m.RecipeId} không có trong danh sách."); continue; }
                if (meals.Any(x => x.MealType == mt)) { errors.Add($"{d}: bữa {mt} bị lặp."); continue; }
                if (meals.Any(x => x.RecipeId == m.RecipeId)) errors.Add($"{d}: món {m.RecipeId} xuất hiện 2 lần trong ngày.");
                meals.Add(new PlannedMeal(mt, m.RecipeId.Value, ClampServings(m.Servings ?? 1), null));
            }
            foreach (var mt in mealTypes.Where(mt => meals.All(x => x.MealType != mt))) errors.Add($"{d}: thiếu bữa {mt}.");
            plan[d] = meals;
            var kcal = meals.Sum(x => byId[x.RecipeId].Kcal * x.Servings);
            if (kcalTarget > 0 && Math.Abs(kcal - kcalTarget) / kcalTarget > MaxDeviation)
                errors.Add($"Ngày {d}: tổng {kcal:0} kcal lệch {(kcal - kcalTarget) / kcalTarget * 100:0}% so với mục tiêu {kcalTarget:0} kcal (cho phép ±{MaxDeviation * 100:0}%).");
        }
        foreach (var d in dates.Where(d => !plan.ContainsKey(d))) errors.Add($"Thiếu ngày {d:yyyy-MM-dd}.");
        return (plan, errors);
    }

    private static void FillMissing(Dictionary<DateOnly, List<PlannedMeal>> plan, List<DateOnly> dates, List<string> mealTypes,
        List<Candidate> candidates, decimal kcalTarget, ref bool fallbackUsed)
    {
        var weekUse = plan.Values.SelectMany(x => x).GroupBy(x => x.RecipeId).ToDictionary(g => g.Key, g => g.Count());
        foreach (var d in dates)
        {
            if (!plan.TryGetValue(d, out var meals)) plan[d] = meals = new List<PlannedMeal>();
            foreach (var mt in mealTypes.Where(mt => meals.All(x => x.MealType != mt)))
            {
                fallbackUsed = true;
                var pick = RankForMeal(candidates.Where(c => meals.All(x => x.RecipeId != c.Id)), mt, kcalTarget * MealShare(mt, mealTypes),
                        weekUse).FirstOrDefault() ?? candidates.First();
                weekUse[pick.Id] = weekUse.GetValueOrDefault(pick.Id) + 1;
                meals.Add(new PlannedMeal(mt, pick.Id, 1, null));
            }
            meals.Sort((a, b) => Array.IndexOf(AiMealTypes.All, a.MealType).CompareTo(Array.IndexOf(AiMealTypes.All, b.MealType)));
        }
        foreach (var m in plan.Values.SelectMany(x => x)) m.Kcal = candidates.First(c => c.Id == m.RecipeId).Kcal;
    }

    private static void TuneServings(List<PlannedMeal> meals, decimal kcalTarget)
    {
        if (kcalTarget <= 0 || meals.Count == 0) return;
        for (var iter = 0; iter < 3; iter++)
        {
            var total = meals.Sum(m => m.Kcal * m.Servings);
            if (total <= 0) return;
            var dev = (kcalTarget - total) / kcalTarget;
            if (Math.Abs(dev) <= 0.05m) return;
            var factor = kcalTarget / total;
            foreach (var m in meals) m.Servings = ClampServings(m.Servings * factor);
        }
    }

    private static IEnumerable<string> PostCheck(Dictionary<DateOnly, List<PlannedMeal>> plan, List<DateOnly> dates,
        List<Candidate> candidates, NutrientAmountsDto t)
    {
        var byId = candidates.ToDictionary(c => c.Id);
        var totals = dates.Select(d => plan[d].Aggregate(NutrientAmountsDto.Zero, (a, m) => a.Add(byId[m.RecipeId].Nutrition.Scale(m.Servings)))).ToList();
        var avg = totals.Aggregate(NutrientAmountsDto.Zero, (a, x) => a.Add(x)).Scale(1m / Math.Max(1, totals.Count));
        if (t.Kcal > 0 && Math.Abs(avg.Kcal - t.Kcal) / t.Kcal > MaxDeviation)
            yield return $"Năng lượng trung bình {avg.Kcal:0} kcal/ngày vẫn lệch mục tiêu {t.Kcal:0} kcal (thư viện công thức còn hạn chế).";
        if (t.ProteinG > 0 && avg.ProteinG < t.ProteinG * 0.8m)
            yield return $"Protein trung bình {avg.ProteinG:0} g/ngày < 80% mục tiêu {t.ProteinG:0} g — nên thêm đậu phụ/đậu/sữa đậu nành.";
        if (t.B12Mcg > 0 && avg.B12Mcg < t.B12Mcg * 0.5m)
            yield return "Vitamin B12 từ thực đơn thấp — người ăn chay nên dùng thực phẩm tăng cường B12 hoặc viên bổ sung.";
        if (t.IronMg > 0 && avg.IronMg < t.IronMg * 0.6m)
            yield return $"Sắt trung bình {avg.IronMg:0.#} mg/ngày thấp so với {t.IronMg} mg — ăn kèm rau lá xanh + nguồn vitamin C.";
        var repeated = plan.Values.SelectMany(x => x).GroupBy(x => x.RecipeId).Where(g => g.Count() > Math.Max(2, dates.Count / 2)).ToList();
        if (repeated.Count > 0)
            yield return "Một số món lặp lại nhiều lần do thư viện công thức còn ít: " + string.Join(", ", repeated.Select(g => byId[g.Key].Title));
    }

    private async Task<List<Candidate>> LoadCandidatesAsync(int userId, HashSet<int> preferred, CancellationToken ct)
    {
        var bad = await _db.AllergenIngredientIdsAsync(userId, ct);
        var rows = await _db.Recipes.AsNoTracking()
            .Where(r => r.Status == "published" && r.KcalPerServing > 0)
            .Where(r => !r.RecipeIngredients.Any(ri => bad.Contains(ri.IngredientId)))
            .Select(r => new
            {
                r.Id,
                r.Title,
                Category = r.Category != null ? r.Category.Name : "Other",
                R = r,
                Ings = r.RecipeIngredients.OrderByDescending(ri => ri.QuantityG).Select(ri => new { ri.IngredientId, ri.Ingredient!.Name }).ToList(),
            })
            .Take(400).ToListAsync(ct);

        return rows.Select(x => new Candidate
            {
                Id = x.Id,
                Title = x.Title,
                Category = x.Category,
                Kcal = x.R.KcalPerServing,
                Nutrition = x.R.PerServing(),
                IngredientNames = x.Ings.Select(i => i.Name).ToList(),
                PreferredOverlap = x.Ings.Count(i => preferred.Contains(i.IngredientId)),
            })
            .OrderByDescending(c => c.PreferredOverlap).ThenByDescending(c => c.Nutrition.ProteinG / Math.Max(1, c.Kcal))
            .ToList();
    }

    private static IEnumerable<Candidate> RankForMeal(IEnumerable<Candidate> list, string mealType, decimal mealKcal,
        Dictionary<int, int>? used = null) =>
        list.OrderByDescending(c =>
        {
            var suit = Suitability(c.Category, mealType);
            var kcalFit = mealKcal <= 0 ? 0 : 1 - (double)Math.Min(1, Math.Abs(c.Kcal - mealKcal) / mealKcal);
            var protein = (double)Math.Min(1, c.Nutrition.ProteinG / Math.Max(1, c.Kcal) * 20);
            var penalty = used is null ? 0 : used.GetValueOrDefault(c.Id) * 0.6;
            return suit * 1.5 + kcalFit + protein * 0.7 + c.PreferredOverlap * 0.8 + c.DishBoost * 2 - penalty;
        });

    private static double Suitability(string category, string mealType) => (category.ToLowerInvariant(), mealType) switch
    {
        ("breakfast", AiMealTypes.Breakfast) => 1,
        ("breakfast", _) => -0.5,
        ("dessert", AiMealTypes.Snack) => 1,
        ("dessert", _) => -1,
        ("salad", AiMealTypes.Snack) => 0.6,
        ("main dish", AiMealTypes.Lunch or AiMealTypes.Dinner) => 1,
        ("soup", AiMealTypes.Lunch or AiMealTypes.Dinner) => 0.8,
        ("salad", AiMealTypes.Lunch or AiMealTypes.Dinner) => 0.5,
        (_, AiMealTypes.Breakfast) => 0,
        _ => 0.2,
    };

    private static decimal MealShare(string mealType, List<string> chosen)
    {
        var sum = chosen.Sum(m => AiMealTypes.KcalShare[m]);
        return AiMealTypes.KcalShare[mealType] / sum;
    }

    private static decimal ClampServings(decimal s) => Math.Clamp(Math.Round(s * 4, MidpointRounding.AwayFromZero) / 4, 0.5m, 2.5m);

    private static List<string> NormalizeMealTypes(List<string>? input)
    {
        var list = (input ?? new()).Select(x => x.Trim().ToLowerInvariant()).Distinct().ToList();
        if (list.Count == 0) list = new() { AiMealTypes.Breakfast, AiMealTypes.Lunch, AiMealTypes.Dinner };
        var invalid = list.Where(m => !AiMealTypes.All.Contains(m)).ToList();
        if (invalid.Count > 0) throw new AppException("MealTypes không hợp lệ: " + string.Join(", ", invalid));
        return AiMealTypes.All.Where(list.Contains).ToList();
    }

    private async Task<NutrientAmountsDto> TargetsForGoalAsync(HealthProfile p, string goal, CancellationToken ct)
    {
        var t = await NutritionTargetsResolver.ResolveAsync(_db, p.Gender, p.DateOfBirth, p.HeightCm, p.WeightKg,
            p.ActivityLevel, goal, ct);
        return t.ToAmounts();
    }

    private async Task<List<int>> ScanIngredientIdsAsync(int userId, int scanId, CancellationToken ct)
    {
        var json = await _db.IngredientScans.Where(s => s.Id == scanId && s.UserId == userId).Select(s => s.DetectedItems).FirstOrDefaultAsync(ct);
        return ScanJson.Read(json).Items.Where(i => i.IngredientId != null && i.Freshness != "spoiled").Select(i => i.IngredientId!.Value).ToList();
    }

    private sealed class Candidate
    {
        public int Id { get; init; }
        public string Title { get; init; } = "";
        public string Category { get; init; } = "";
        public decimal Kcal { get; init; }
        public NutrientAmountsDto Nutrition { get; init; } = NutrientAmountsDto.Zero;
        public List<string> IngredientNames { get; init; } = new();
        public int PreferredOverlap { get; init; }
        public int DishBoost { get; set; }
    }

    private sealed class PlannedMeal
    {
        public PlannedMeal(string mealType, int recipeId, decimal servings, string? reason)
        { MealType = mealType; RecipeId = recipeId; Servings = servings; Reason = reason; }
        public string MealType { get; }
        public int RecipeId { get; }
        public decimal Servings { get; set; }
        public string? Reason { get; }
        public decimal Kcal { get; set; }
    }

    private sealed class LlmPlan { public List<LlmDay>? Days { get; set; } public string? Notes { get; set; } }
    private sealed class LlmDay { public string? Date { get; set; } public List<LlmMeal>? Meals { get; set; } }
    private sealed class LlmMeal
    {
        public string? MealType { get; set; }
        public int? RecipeId { get; set; }
        public decimal? Servings { get; set; }
        public string? Reason { get; set; }
    }
}
