using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("vegan_product_scans")]
public class VeganProductScan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string ProductName { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Barcode { get; set; }

    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Category { get; set; } = "beverage"; // beverage, snack, condiment, canned, dairy_alt, supplement, noodle

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [MaxLength(500)]
    public string? LabelImageUrl { get; set; }

    public string IngredientListRaw { get; set; } = string.Empty;

    public string? FlaggedNonVeganIngredients { get; set; } // JSON or comma separated

    [MaxLength(30)]
    public string VeganStatus { get; set; } = "pending_review"; // vegan, vegetarian, non_vegan, pending_review

    [Column(TypeName = "numeric(5,2)")]
    public decimal ConfidenceScore { get; set; } = 95.0m;

    [MaxLength(50)]
    public string? ModeratorVerdict { get; set; } // verified_vegan, verified_vegetarian, rejected_non_vegan

    public string? NutritionistNotes { get; set; }

    public int SubmittedById { get; set; } = 1;

    [ForeignKey(nameof(SubmittedById))]
    public virtual User? SubmittedBy { get; set; }

    public int? ReviewedById { get; set; }

    [ForeignKey(nameof(ReviewedById))]
    public virtual User? ReviewedBy { get; set; }

    public DateTime? ReviewedAt { get; set; }

    public int ScanCount { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

