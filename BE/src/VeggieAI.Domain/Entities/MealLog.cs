namespace VeggieAI.Domain.Entities;

public partial class MealLog
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int RecipeId { get; set; }
    public int? PlanItemId { get; set; }
    public DateOnly LogDate { get; set; }
    public string MealType { get; set; } = null!;
    public decimal Servings { get; set; } = 1m;
    public decimal KcalConsumed { get; set; } = 0m;

    public virtual MealPlanItem? PlanItem { get; set; }
    public virtual Recipe Recipe { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
