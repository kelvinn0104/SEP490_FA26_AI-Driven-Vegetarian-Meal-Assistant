namespace VeggieAI.Domain.Entities;

public partial class ShoppingList
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual MealPlan Plan { get; set; } = null!;
    public virtual ICollection<ShoppingListItem> ShoppingListItems { get; set; } = new List<ShoppingListItem>();
}
