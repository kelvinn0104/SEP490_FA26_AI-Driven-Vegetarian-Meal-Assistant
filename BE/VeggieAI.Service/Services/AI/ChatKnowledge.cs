using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

/// <summary>Một đoạn tri thức được truy xuất cho câu hỏi (RAG).</summary>
public record KnowledgeHit(string Type, int Id, string Title, string Snippet, double Score);

/// <summary>
/// RAG nhẹ cho chat (SDD 3.19): truy xuất top-k từ kho công thức đã duyệt (loại món chứa chất người dùng dị ứng)
/// và bảng dinh dưỡng nguyên liệu, chấm điểm theo từ khóa (bỏ dấu, bỏ stop-word). Không cần vector DB.
/// </summary>
public static class ChatKnowledge
{
    public const int TopK = 12;
    private const double MinScore = 3.0;

    private static readonly HashSet<string> Stop = new(StringComparer.Ordinal)
    {
        "toi","ban","la","va","co","khong","nen","an","gi","the","nao","cho","cua","voi","mot","nhung","cac","nay","do","thi",
        "bi","duoc","can","muon","hay","khi","nao","bao","nhieu","nhu","de","tu","trong","ve","la","em","anh","chi","minh",
        "cach","lam","nau","cong","thuc","mon","chay","thuan","xin","giup",
    };

    public static string Fold(string s)
    {
        var d = (s ?? "").ToLowerInvariant().Replace('đ', 'd').Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(d.Length);
        foreach (var c in d)
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark) sb.Append(c);
        return sb.ToString();
    }

    public static List<string> Tokens(string text) =>
        Fold(text).Split(new[] { ' ', ',', '.', '?', '!', ';', ':', '(', ')', '/', '-', '"', '\n' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(t => t.Length >= 2 && !Stop.Contains(t)).Distinct().ToList();

    // Thư viện nguyên liệu dùng tên tiếng Anh → mở rộng từ khóa tiếng Việt sang tiếng Anh tương ứng
    private static readonly (string Vi, string[] En)[] Synonyms =
    {
        ("dau hu", new[]{"tofu"}), ("dau phu", new[]{"tofu"}), ("dau nanh", new[]{"soy","tofu","tempeh"}), ("nam", new[]{"mushroom"}),
        ("dau phong", new[]{"peanut"}), ("hat dieu", new[]{"cashew"}), ("ca rot", new[]{"carrot"}), ("khoai lang", new[]{"sweet","potato"}),
        ("bi do", new[]{"pumpkin"}), ("dau xanh", new[]{"mung"}), ("dau ga", new[]{"chickpea"}), ("xoai", new[]{"mango"}),
        ("dua", new[]{"coconut"}), ("gia do", new[]{"sprouts"}), ("dua leo", new[]{"cucumber"}), ("ca chua", new[]{"tomato"}),
        ("gao lut", new[]{"brown","rice"}), ("bap cai", new[]{"cabbage"}), ("tuong", new[]{"soy","sauce"}), ("bun", new[]{"noodles"}),
        ("hat chia", new[]{"chia"}), ("canxi", new[]{"calcium"}), ("dam", new[]{"protein"}),
    };

    private static string[] Words(string folded) =>
        folded.Split(new[] { ' ', ',', '.', '?', '!', ';', ':', '(', ')', '/', '-', '"', '\n' }, StringSplitOptions.RemoveEmptyEntries);

    private static bool Matches(string[] words, string t) =>
        words.Any(w => w == t || (t.Length >= 4 && w.Contains(t, StringComparison.Ordinal)));

    public static bool MatchesNamedRecipe(string question, string title)
    {
        var query = Fold(question).Replace("dau phu", "dau hu").Replace("dau hu non", "dau hu mem");
        var words = Words(Fold(title).Replace("dau phu", "dau hu").Replace("dau hu non", "dau hu mem"));
        var nameWords = Tokens(query);
        return nameWords.Count > 0 && nameWords.All(word => words.Contains(word, StringComparer.Ordinal));
    }

    internal static double Score(List<string> q, string title, string body)
    {
        var wt = Words(Fold(title)); var wb = Words(Fold(body));
        double s = 0;
        foreach (var t in q)
        {
            if (Matches(wt, t)) s += 3;
            else if (Matches(wb, t)) s += 1;
        }
        return s;
    }

    private static List<string> Expand(string question, List<string> tokens)
    {
        var folded = " " + string.Join(" ", Words(Fold(question))) + " ";
        var all = new List<string>(tokens);
        foreach (var (vi, en) in Synonyms)
            if (folded.Contains(" " + vi + " ", StringComparison.Ordinal)) all.AddRange(en);
        return all.Distinct().ToList();
    }

    public static async Task<List<KnowledgeHit>> RetrieveAsync(VeggieAIDbContext db, int userId, string question, int? planId, CancellationToken ct)
    {
        var q = Expand(question, Tokens(question));
        if (q.Count == 0 && planId is null) return new();
        var folded = Fold(question);
        var wantsIdeas = folded.Contains("goi y") || folded.Contains("an gi") || folded.Contains("mon gi");
        var wantsProtein = wantsIdeas && (folded.Contains("giau dam") || folded.Contains("nhieu dam") || folded.Contains("protein"));

        var allergenIds = await db.AllergenIngredientIdsAsync(userId, ct);
        var catalog = db.Recipes.AsNoTracking().EligibleForPlan(allergenIds);
        var recipes = await catalog
            .Select(r => new
            {
                r.Id, r.Title, r.KcalPerServing, r.ProteinG, r.IronMg, r.Servings,
                Category = r.Category != null ? r.Category.Name : "",
                InPlan = planId != null && db.MealPlanItems.Any(i => i.PlanId == planId && i.RecipeId == r.Id),
                Ing = r.RecipeIngredients.Select(ri => ri.Ingredient!.Name).ToList(),
            })
            .ToListAsync(ct);

        var hits = new List<KnowledgeHit>();
        foreach (var r in recipes)
        {
            var body = string.Join(" ", r.Ing);
            var s = Score(q, r.Title, body) + (r.InPlan ? MinScore : 0);
            if (folded.Contains(Fold(r.Title), StringComparison.Ordinal)) s += 100;
            if (wantsIdeas) s += MinScore + (wantsProtein ? Math.Min(10, (double)r.ProteinG / 4) : 0);
            if (s < MinScore) continue;
            hits.Add(new("recipe", r.Id, r.Title,
                $"Món \"{r.Title}\" ({r.Category}): {r.KcalPerServing:0} kcal, đạm {r.ProteinG:0.#} g, sắt {r.IronMg:0.#} mg / khẩu phần; nguyên liệu: {string.Join(", ", r.Ing)}.", s));
        }

        var catalogIngredients = catalog.SelectMany(r => r.RecipeIngredients).Select(ri => ri.IngredientId);
        var ings = await db.Ingredients.AsNoTracking()
            .Where(i => catalogIngredients.Contains(i.Id))
            .Select(i => new { i.Id, i.Name, i.KcalPer100g, i.ProteinPer100g, i.IronPer100g, i.B12Per100g, i.CalciumPer100g, i.ZincPer100g })
            .ToListAsync(ct);
        foreach (var i in ings)
        {
            var s = Score(q, i.Name, "") + 1.5;
            if (s < MinScore + 1.5) continue;
            hits.Add(new("ingredient", i.Id, i.Name,
                $"{i.Name} (100 g): {i.KcalPer100g:0} kcal, đạm {i.ProteinPer100g:0.#} g, sắt {i.IronPer100g:0.#} mg, B12 {i.B12Per100g:0.##} mcg, canxi {i.CalciumPer100g:0} mg, kẽm {i.ZincPer100g:0.#} mg.", s));
        }

        return hits.OrderByDescending(h => h.Score).ThenBy(h => h.Title).Take(TopK).ToList();
    }

    public static string ToPromptBlock(IReadOnlyList<KnowledgeHit> hits)
    {
        if (hits.Count == 0) return "";
        var sb = new StringBuilder();
        sb.AppendLine("Dữ liệu để chọn nguồn:");
        for (var n = 0; n < hits.Count; n++) sb.AppendLine($"[{n + 1}] ({hits[n].Type}) {hits[n].Snippet}");
        return sb.ToString();
    }

    public static List<ChatCitationDto> ToCitations(IReadOnlyList<KnowledgeHit> hits) =>
        hits.Select((h, n) => new ChatCitationDto(n + 1, h.Type, h.Id, h.Title)).ToList();

    public static string ToFooter(IReadOnlyList<ChatCitationDto> cites) =>
        cites.Count == 0 ? "" : "\n\n**Nguồn tham khảo:**\n" +
            string.Join("\n", cites.Select(c => $"- [{c.Index}] {(c.Type == "recipe" ? "Công thức" : "Nguyên liệu")}: {c.Title}"));
}
