using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class IngredientDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal KcalPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbPer100g { get; set; }
    public decimal FatPer100g { get; set; }
    public decimal IronPer100g { get; set; }
    public decimal B12Per100g { get; set; }
    public decimal CalciumPer100g { get; set; }
    public decimal ZincPer100g { get; set; }
    public string? DataSource { get; set; }
    public string UpdatedAt { get; set; } = string.Empty;
    public string? UpdatedByName { get; set; }
    public List<string> Allergies { get; set; } = new();
    public List<int> AllergyIds { get; set; } = new();
}

public class CreateIngredientRequest
{
    [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Range(0, 2000, ErrorMessage = "Calo phải nằm trong khoảng 0 - 2000 kcal")]
    public decimal KcalPer100g { get; set; }

    [Range(0, 100, ErrorMessage = "Đạm phải nằm trong khoảng 0 - 100g")]
    public decimal ProteinPer100g { get; set; }

    [Range(0, 100, ErrorMessage = "Carb phải nằm trong khoảng 0 - 100g")]
    public decimal CarbPer100g { get; set; }

    [Range(0, 100, ErrorMessage = "Chất béo phải nằm trong khoảng 0 - 100g")]
    public decimal FatPer100g { get; set; }

    [Range(0, 500, ErrorMessage = "Sắt phải từ 0 - 500mg")]
    public decimal IronPer100g { get; set; }

    [Range(0, 500, ErrorMessage = "Vitamin B12 phải từ 0 - 500mcg")]
    public decimal B12Per100g { get; set; }

    [Range(0, 5000, ErrorMessage = "Canxi phải từ 0 - 5000mg")]
    public decimal CalciumPer100g { get; set; }

    [Range(0, 500, ErrorMessage = "Kẽm phải từ 0 - 500mg")]
    public decimal ZincPer100g { get; set; }

    public string? DataSource { get; set; } = "USDA FoodData Central";

    public List<int>? AllergyIds { get; set; }
}

public class UpdateIngredientRequest
{
    [Required(ErrorMessage = "Tên nguyên liệu không được để trống")]
    public string Name { get; set; } = string.Empty;

    public decimal KcalPer100g { get; set; }
    public decimal ProteinPer100g { get; set; }
    public decimal CarbPer100g { get; set; }
    public decimal FatPer100g { get; set; }
    public decimal IronPer100g { get; set; }
    public decimal B12Per100g { get; set; }
    public decimal CalciumPer100g { get; set; }
    public decimal ZincPer100g { get; set; }
    public string? DataSource { get; set; }
    public List<int>? AllergyIds { get; set; }
}

public class AllergyDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int IngredientCount { get; set; }
}

public class NutrientStandardDto
{
    public int Id { get; set; }
    public string Gender { get; set; } = "male";
    public int AgeFrom { get; set; }
    public int AgeTo { get; set; }
    public decimal IronMg { get; set; }
    public decimal B12Mcg { get; set; }
    public decimal CalciumMg { get; set; }
    public decimal ZincMg { get; set; }
    public string? Note { get; set; }
}

/// <summary>Ghi nhận bữa đã ăn: gửi PlanItemId (món trong thực đơn) hoặc RecipeId (+ mealType, servings, logDate).</summary>
public class LogMealRequest
{
    public int? PlanItemId { get; set; }
    public int? RecipeId { get; set; }

    [RegularExpression("^(breakfast|lunch|dinner|snack)$", ErrorMessage = "mealType phải là breakfast, lunch, dinner hoặc snack.")]
    public string? MealType { get; set; }

    [Range(0.25, 10.0, ErrorMessage = "servings phải trong khoảng 0.25–10.")]
    public decimal? Servings { get; set; }

    public DateOnly? LogDate { get; set; }
}

public class UpsertActivityRequest
{
    public DateOnly? ActivityDate { get; set; }

    [Range(0.0, 10000.0, ErrorMessage = "kcalBurned phải trong khoảng 0–10000.")]
    public decimal KcalBurned { get; set; }

    [Range(0, 200000, ErrorMessage = "steps phải trong khoảng 0–200000.")]
    public int Steps { get; set; }
}

public record MealLogDto(int Id, DateOnly LogDate, string MealType, int RecipeId, string RecipeTitle,
    decimal Servings, decimal KcalConsumed, int? PlanItemId, NutrientAmountsDto Nutrition);

/// <summary>level: medium (&lt;75% mục tiêu) | high (&lt;50%).</summary>
public record NutritionAlertDto(string Nutrient, decimal Consumed, decimal Target, int Percent, string Level, string Message);

public record DailyNutritionDto(DateOnly Date, NutrientAmountsDto Consumed, NutrientAmountsDto Target,
    decimal KcalBurned, int Steps, decimal NetKcal, IReadOnlyList<MealLogDto> Logs, IReadOnlyList<NutritionAlertDto> Alerts);

public record TrendPointDto(DateOnly Date, decimal Kcal, decimal ProteinG, decimal IronMg, decimal B12Mcg,
    decimal KcalTarget, decimal KcalBurned);

public record ActivityDataDto(int Id, DateOnly ActivityDate, decimal KcalBurned, int Steps, DateTime SyncedAt);
