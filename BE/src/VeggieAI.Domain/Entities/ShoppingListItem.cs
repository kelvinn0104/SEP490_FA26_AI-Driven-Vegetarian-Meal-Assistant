namespace VeggieAI.Domain.Entities;

public partial class ShoppingListItem
{
    public int Id { get; set; }
    public int ListId { get; set; }
    public int IngredientId { get; set; }
    public decimal QuantityG { get; set; }
    public bool IsBought { get; set; } = false;

    public virtual Ingredient Ingredient { get; set; } = null!;
    public virtual ShoppingList List { get; set; } = null!;
}
