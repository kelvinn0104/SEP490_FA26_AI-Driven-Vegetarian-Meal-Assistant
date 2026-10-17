namespace VeggieAI.Domain.Entities;

public partial class Ingredient
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public decimal KcalPer100g { get; set; } = 0m;
    public decimal ProteinPer100g { get; set; } = 0m;
    public decimal CarbPer100g { get; set; } = 0m;
    public decimal FatPer100g { get; set; } = 0m;
    public decimal IronPer100g { get; set; } = 0m;
    public decimal B12Per100g { get; set; } = 0m;
    public decimal CalciumPer100g { get; set; } = 0m;
    public decimal ZincPer100g { get; set; } = 0m;
    public string? DataSource { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
    public virtual ICollection<RecipeIngredient> RecipeIngredients { get; set; } = new List<RecipeIngredient>();
    public virtual ICollection<ShoppingListItem> ShoppingListItems { get; set; } = new List<ShoppingListItem>();
    public virtual ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
}
