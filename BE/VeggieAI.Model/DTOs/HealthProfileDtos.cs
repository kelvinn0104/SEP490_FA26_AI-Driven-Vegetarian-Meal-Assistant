using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

/// <summary>Body cho PUT /api/health-profile và POST /api/health-profile/preview.</summary>
public class HealthProfileRequest
{
    [Required, RegularExpression("^(male|female)$", ErrorMessage = "gender phải là male hoặc female.")]
    public string Gender { get; set; } = "female";

    [Required]
    public DateOnly DateOfBirth { get; set; }

    [Range(50.0, 250.0, ErrorMessage = "Chiều cao phải trong khoảng 50–250 cm.")]
    public decimal HeightCm { get; set; }

    [Range(20.0, 300.0, ErrorMessage = "Cân nặng phải trong khoảng 20–300 kg.")]
    public decimal WeightKg { get; set; }

    [Required, RegularExpression("^(sedentary|light|moderate|active|very_active)$",
        ErrorMessage = "activityLevel phải là sedentary, light, moderate, active hoặc very_active.")]
    public string ActivityLevel { get; set; } = "moderate";

    [Required, RegularExpression("^(loss|gain|maintain)$", ErrorMessage = "healthGoal phải là loss, gain hoặc maintain.")]
    public string HealthGoal { get; set; } = "maintain";

    /// <summary>null = giữ nguyên danh sách dị ứng; [] = xóa hết.</summary>
    public List<int>? AllergyIds { get; set; }
}

public class UpdateAllergiesRequest
{
    [Required]
    public List<int> AllergyIds { get; set; } = new();
}

public record AllergyDto(int Id, string Name);

public record HealthProfileDto(
    int Id, string Gender, DateOnly DateOfBirth, int Age,
    decimal HeightCm, decimal WeightKg, string ActivityLevel, string HealthGoal,
    decimal Bmi, string BmiCategory, decimal Bmr, decimal Tdee,
    NutrientAmountsDto Targets, DateTime UpdatedAt, bool NeedsUpdate,
    IReadOnlyList<AllergyDto> Allergies);

/// <summary>Kết quả xem trước (không lưu DB).</summary>
public record HealthProfilePreviewDto(
    int Age, decimal Bmi, string BmiCategory, decimal Bmr, decimal Tdee, NutrientAmountsDto Targets);
