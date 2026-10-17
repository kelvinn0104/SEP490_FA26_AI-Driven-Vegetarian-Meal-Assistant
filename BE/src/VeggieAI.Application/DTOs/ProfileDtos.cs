using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Application.DTOs;

public class HealthProfileRequest
{
    [Required, RegularExpression("^(male|female)$")] public string Gender { get; set; } = "";
    [Required] public DateOnly DateOfBirth { get; set; }
    [Range(50, 250)] public decimal HeightCm { get; set; }
    [Range(20, 300)] public decimal WeightKg { get; set; }
    [Required, RegularExpression("^(sedentary|light|moderate|active|very_active)$")] public string ActivityLevel { get; set; } = "";
    [Required, RegularExpression("^(loss|gain|maintain)$")] public string HealthGoal { get; set; } = "";
    /// <summary>Optional: replace the user's allergy list at the same time.</summary>
    public List<int>? AllergyIds { get; set; }
}

public record HealthProfileDto(
    int Id, string Gender, DateOnly DateOfBirth, int Age, decimal HeightCm, decimal WeightKg,
    string ActivityLevel, string HealthGoal,
    decimal? Bmi, string? BmiCategory, decimal? Bmr, decimal? Tdee,
    NutrientAmountsDto Targets, DateTime UpdatedAt, bool NeedsUpdate,
    IReadOnlyList<AllergyDto> Allergies);

public record NutrientAmountsDto(
    decimal Kcal, decimal ProteinG, decimal CarbG, decimal FatG,
    decimal IronMg, decimal B12Mcg, decimal CalciumMg, decimal ZincMg)
{
    public static readonly NutrientAmountsDto Zero = new(0, 0, 0, 0, 0, 0, 0, 0);
    public NutrientAmountsDto Add(NutrientAmountsDto o) => new(Kcal + o.Kcal, ProteinG + o.ProteinG, CarbG + o.CarbG,
        FatG + o.FatG, IronMg + o.IronMg, B12Mcg + o.B12Mcg, CalciumMg + o.CalciumMg, ZincMg + o.ZincMg);
    public NutrientAmountsDto Scale(decimal f) => new(Kcal * f, ProteinG * f, CarbG * f, FatG * f,
        IronMg * f, B12Mcg * f, CalciumMg * f, ZincMg * f);
    public NutrientAmountsDto Rounded() => new(Math.Round(Kcal, 1), Math.Round(ProteinG, 1), Math.Round(CarbG, 1),
        Math.Round(FatG, 1), Math.Round(IronMg, 2), Math.Round(B12Mcg, 2), Math.Round(CalciumMg, 1), Math.Round(ZincMg, 2));
}

public record AllergyDto(int Id, string Name);

public class SetAllergiesRequest
{
    [Required] public List<int> AllergyIds { get; set; } = new();
}

public record CategoryDto(int Id, string Name, string Type);

public record IngredientDto(int Id, string Name, decimal KcalPer100g, decimal ProteinPer100g, decimal CarbPer100g,
    decimal FatPer100g, decimal IronPer100g, decimal B12Per100g, decimal CalciumPer100g, decimal ZincPer100g,
    string? DataSource, IReadOnlyList<string> Allergens);

public record NotificationDto(int Id, string Type, string Content, bool IsRead, DateTime CreatedAt);

public record VeganShopDto(int Id, string Name, string Address, decimal Latitude, decimal Longitude,
    string? Phone, string? Tags, double? DistanceKm);
