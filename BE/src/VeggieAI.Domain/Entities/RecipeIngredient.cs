namespace VeggieAI.Domain.Entities;

public partial class RecipeIngredient
{
    public int RecipeId { get; set; }
    public int IngredientId { get; set; }
    public decimal QuantityG { get; set; }

    public virtual Ingredient Ingredient { get; set; } = null!;
    public virtual Recipe Recipe { get; set; } = null!;
}
