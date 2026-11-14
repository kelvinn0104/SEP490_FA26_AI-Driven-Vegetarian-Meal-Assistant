using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class VeganProductScanDto
{
    public int Id { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? Barcode { get; set; }
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = "beverage";
    public string CategoryLabel { get; set; } = "Đồ Uống";
    public string? ImageUrl { get; set; }
    public string? LabelImageUrl { get; set; }
    public string IngredientListRaw { get; set; } = string.Empty;
    public List<string> FlaggedNonVeganIngredients { get; set; } = new();
    public string VeganStatus { get; set; } = "pending_review";
    public string VeganStatusLabel { get; set; } = "Chờ Thẩm Định";
    public decimal ConfidenceScore { get; set; }
    public string? ModeratorVerdict { get; set; }
    public string? NutritionistNotes { get; set; }
    public int SubmittedById { get; set; }
    public string SubmittedByName { get; set; } = string.Empty;
    public string? ReviewedByName { get; set; }
    public string? ReviewedAt { get; set; }
    public int ScanCount { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateVeganProductRequest
{
    [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
    public string ProductName { get; set; } = string.Empty;

    public string? Barcode { get; set; }

    public string Brand { get; set; } = string.Empty;

    public string Category { get; set; } = "beverage";

    public string? ImageUrl { get; set; }

    public string? LabelImageUrl { get; set; }

    public string IngredientListRaw { get; set; } = string.Empty;

    public List<string>? FlaggedNonVeganIngredients { get; set; }

    public string VeganStatus { get; set; } = "vegan";

    public string? NutritionistNotes { get; set; }
}

public class UpdateVeganProductRequest
{
    [Required(ErrorMessage = "Tên sản phẩm không được để trống")]
    public string ProductName { get; set; } = string.Empty;

    public string? Barcode { get; set; }

    public string Brand { get; set; } = string.Empty;

    public string Category { get; set; } = "beverage";

    public string? ImageUrl { get; set; }

    public string? LabelImageUrl { get; set; }

    public string IngredientListRaw { get; set; } = string.Empty;

    public List<string>? FlaggedNonVeganIngredients { get; set; }

    public string VeganStatus { get; set; } = "vegan";

    public string? NutritionistNotes { get; set; }
}

public class ReviewProductScanRequest
{
    [Required]
    public string Verdict { get; set; } = "vegan"; // vegan, vegetarian, non_vegan

    public string? NutritionistNotes { get; set; }

    public List<string>? FlaggedIngredients { get; set; }
}

public class ProductScanStatsDto
{
    public int TotalProducts { get; set; }
    public int VerifiedVeganCount { get; set; }
    public int VerifiedVegetarianCount { get; set; }
    public int FlaggedNonVeganCount { get; set; }
    public int PendingReviewCount { get; set; }
    public int TotalScansRecorded { get; set; }
}

