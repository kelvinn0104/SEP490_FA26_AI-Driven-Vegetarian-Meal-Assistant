using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("Category", Schema = "veggieai")]
public class Category
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "recipe"; // 'food_type', 'recipe'

    public virtual ICollection<Recipe> Recipes { get; set; } = new List<Recipe>();
}

[Table("Recipe", Schema = "veggieai")]
public class Recipe
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int CategoryId { get; set; }

    [Required]
    public int CreatedBy { get; set; }

    public int? VerifiedBy { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [Required]
    public string Instructions { get; set; } = string.Empty;

    public int Servings { get; set; } = 1;

    [Column(TypeName = "numeric(7,2)")]
    public decimal KcalPerServing { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal ProteinG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal CarbG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal FatG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal IronMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal B12Mcg { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal CalciumMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal ZincMg { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "draft"; // 'draft', 'pending_verification', 'published', 'hidden'

    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CategoryId))]
    public virtual Category? Category { get; set; }

    [ForeignKey(nameof(CreatedBy))]
    public virtual User? Creator { get; set; }

    [ForeignKey(nameof(VerifiedBy))]
    public virtual User? Verifier { get; set; }

    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
}

[Table("RecipeIngredient", Schema = "veggieai")]
public class RecipeIngredient
{
    public int RecipeId { get; set; }
    public int IngredientId { get; set; }

    [Column(TypeName = "numeric(8,2)")]
    public decimal QuantityG { get; set; }

    [ForeignKey(nameof(RecipeId))]
    public virtual Recipe? Recipe { get; set; }

    [ForeignKey(nameof(IngredientId))]
    public virtual Ingredient? Ingredient { get; set; }
}

[Table("Favorite", Schema = "veggieai")]
public class Favorite
{
    public int UserId { get; set; }
    public int RecipeId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(RecipeId))]
    public virtual Recipe? Recipe { get; set; }
}
