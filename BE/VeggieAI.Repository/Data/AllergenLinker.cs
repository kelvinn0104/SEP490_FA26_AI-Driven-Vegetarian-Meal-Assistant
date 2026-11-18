using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Entities;

namespace VeggieAI.Repository.Data;

/// <summary>
/// Gắn nguyên liệu với nhóm dị ứng theo từ khóa trong tên (VI/EN). Dữ liệu seed trước đây không có liên kết nào
/// nên bộ lọc dị ứng khi tạo thực đơn không loại được món chứa đậu nành, đậu phộng, hạt, gluten, mè, nấm.
/// Idempotent: chỉ thêm liên kết còn thiếu, không xóa/sửa liên kết admin đã đặt.
/// </summary>
public static class AllergenLinker
{
    private static readonly string[] DefaultAllergies =
    {
        "Đậu nành (Soy)", "Gluten (Lúa mì / Lúa mạch)", "Đậu phộng (Peanuts)",
        "Hạt cây (Hạt điều, óc chó, hạnh nhân)", "Mè / Vừng (Sesame)", "Nấm (Mushroom allergy)",
    };

    // (từ khóa nhận diện nhóm dị ứng trong tên Allergy, từ khóa trong tên nguyên liệu)
    private static readonly (string[] AllergyKeys, string[] IngredientKeys)[] Rules =
    {
        (new[] { "soy", "đậu nành" },
         new[] { "tofu", "đậu hũ", "đậu phụ", "đậu nành", "soy", "tempeh", "miso", "edamame", "tương", "váng đậu", "yuba" }),
        (new[] { "gluten" },
         new[] { "seitan", "mì căn", "lúa mì", "bột mì", "wheat", "barley", "lúa mạch", "bread", "bánh mì", "pasta", "noodles, wheat", "wheat flour" }),
        (new[] { "peanut", "đậu phộng" },
         new[] { "peanut", "đậu phộng", "lạc rang", "đậu lạc" }),
        (new[] { "hạt cây", "tree" },
         new[] { "cashew", "hạt điều", "walnut", "óc chó", "almond", "hạnh nhân", "macadamia", "pistachio", "hazelnut", "hạt phỉ", "pecan" }),
        (new[] { "mè", "vừng", "sesame" },
         new[] { "sesame", "mè", "vừng", "tahini" }),
        (new[] { "nấm", "mushroom" },
         new[] { "mushroom", "nấm" }),
    };

    /// <summary>Bảng GoalStandard trước đây không được seed nên mục tiêu giảm/tăng cân không đổi kcal. Chỉ thêm khi bảng trống.</summary>
    public static async Task EnsureGoalStandardsAsync(VeggieAIDbContext context)
    {
        if (await context.GoalStandards.AnyAsync()) return;
        context.GoalStandards.AddRange(
            new GoalStandard { HealthGoal = "loss", KcalAdjustmentPercent = -15m, ProteinGPerKg = 1.2m, CarbPercent = 45m, FatPercent = 30m },
            new GoalStandard { HealthGoal = "maintain", KcalAdjustmentPercent = 0m, ProteinGPerKg = 1.0m, CarbPercent = 50m, FatPercent = 30m },
            new GoalStandard { HealthGoal = "gain", KcalAdjustmentPercent = 15m, ProteinGPerKg = 1.4m, CarbPercent = 50m, FatPercent = 28m });
        await context.SaveChangesAsync();
    }

    public static async Task EnsureAsync(VeggieAIDbContext context)
    {
        await EnsureGoalStandardsAsync(context);
        if (!await context.Allergies.AnyAsync())
        {
            context.Allergies.AddRange(DefaultAllergies.Select(n => new Allergy { Name = n }));
            await context.SaveChangesAsync();
        }

        var allergies = await context.Allergies.AsNoTracking().ToListAsync();
        var ingredients = await context.Ingredients.AsNoTracking().Select(i => new { i.Id, i.Name }).ToListAsync();
        var existing = (await context.IngredientAllergies.AsNoTracking()
            .Select(x => new { x.IngredientId, x.AllergyId }).ToListAsync())
            .Select(x => (x.IngredientId, x.AllergyId)).ToHashSet();

        var added = false;
        foreach (var (allergyKeys, ingredientKeys) in Rules)
        {
            var allergy = allergies.FirstOrDefault(a => allergyKeys.Any(k => a.Name.Contains(k, StringComparison.OrdinalIgnoreCase)));
            if (allergy == null) continue;
            foreach (var ing in ingredients)
            {
                var name = ing.Name ?? string.Empty;
                if (!ingredientKeys.Any(k => name.Contains(k, StringComparison.OrdinalIgnoreCase))) continue;
                if (!existing.Add((ing.Id, allergy.Id))) continue;
                context.IngredientAllergies.Add(new IngredientAllergy { IngredientId = ing.Id, AllergyId = allergy.Id });
                added = true;
            }
        }
        if (added) await context.SaveChangesAsync();
    }
}
