namespace VeggieAI.Domain.Entities;

public partial class Recipe
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public int CreatedBy { get; set; }
    public int? VerifiedBy { get; set; }
    public string Title { get; set; } = null!;
    public string? ImageUrl { get; set; }
    public string Instructions { get; set; } = null!;
    public int Servings { get; set; } = 1;
    public decimal KcalPerServing { get; set; } = 0m;
    public decimal ProteinG { get; set; } = 0m;
    public decimal CarbG { get; set; } = 0m;
    public decimal FatG { get; set; } = 0m;
    public decimal IronMg { get; set; } = 0m;
    public decimal B12Mcg { get; set; } = 0m;
    public decimal CalciumMg { get; set; } = 0m;
    public decimal ZincMg { get; set; } = 0m;
    public string Status { get; set; } = "draft";
    public DateTime? VerifiedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual Category Category { get; set; } = null!;
    public virtual User CreatedByNavigation { get; set; } = null!;
    public virtual User? VerifiedByNavigation { get; set; }
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public virtual ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
    public virtual ICollection<MealPlanItem> MealPlanItems { get; set; } = new List<MealPlanItem>();
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
}
