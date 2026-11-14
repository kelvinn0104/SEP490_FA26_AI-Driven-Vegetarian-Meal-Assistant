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
