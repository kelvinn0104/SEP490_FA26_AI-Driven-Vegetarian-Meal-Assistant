using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("Allergy", Schema = "veggieai")]
public class Allergy
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public virtual ICollection<UserAllergy> UserAllergies { get; set; } = new List<UserAllergy>();
    public virtual ICollection<IngredientAllergy> IngredientAllergies { get; set; } = new List<IngredientAllergy>();
}

[Table("UserAllergy", Schema = "veggieai")]
public class UserAllergy
{
    public int UserId { get; set; }
    public int AllergyId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(AllergyId))]
    public virtual Allergy? Allergy { get; set; }
}

[Table("Ingredient", Schema = "veggieai")]
public class Ingredient
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "numeric(7,2)")]
    public decimal KcalPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal ProteinPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal CarbPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal FatPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal IronPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal B12Per100g { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal CalciumPer100g { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal ZincPer100g { get; set; }

    [MaxLength(100)]
    public string? DataSource { get; set; }

    public int? UpdatedBy { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UpdatedBy))]
    public virtual User? UpdatedByUser { get; set; }

    public virtual ICollection<IngredientAllergy> IngredientAllergies { get; set; } = new List<IngredientAllergy>();
    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
}

[Table("IngredientAllergy", Schema = "veggieai")]
public class IngredientAllergy
{
    public int IngredientId { get; set; }
    public int AllergyId { get; set; }

    [ForeignKey(nameof(IngredientId))]
    public virtual Ingredient? Ingredient { get; set; }

    [ForeignKey(nameof(AllergyId))]
    public virtual Allergy? Allergy { get; set; }
}

[Table("NutrientStandard", Schema = "veggieai")]
public class NutrientStandard
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(10)]
    public string Gender { get; set; } = "female";

    public int AgeFrom { get; set; }
    public int AgeTo { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal IronMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal B12Mcg { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal CalciumMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal ZincMg { get; set; }

    [MaxLength(255)]
    public string? Note { get; set; }

    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UpdatedBy))]
    public virtual User? UpdatedByUser { get; set; }
}

[Table("GoalStandard", Schema = "veggieai")]
public class GoalStandard
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string HealthGoal { get; set; } = "maintain";

    [Column(TypeName = "numeric(5,2)")]
    public decimal KcalAdjustmentPercent { get; set; }

    [Column(TypeName = "numeric(4,2)")]
    public decimal ProteinGPerKg { get; set; }

    [Column(TypeName = "numeric(5,2)")]
    public decimal CarbPercent { get; set; }

    [Column(TypeName = "numeric(5,2)")]
    public decimal FatPercent { get; set; }

    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UpdatedBy))]
    public virtual User? UpdatedByUser { get; set; }
}
