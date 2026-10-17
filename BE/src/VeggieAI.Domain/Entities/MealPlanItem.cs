namespace VeggieAI.Domain.Entities;

public partial class MealPlanItem
{
    public int Id { get; set; }
    public int PlanId { get; set; }
    public int RecipeId { get; set; }
    public DateOnly PlanDate { get; set; }
    public string MealType { get; set; } = null!;
    public decimal Servings { get; set; } = 1m;

    public virtual MealPlan Plan { get; set; } = null!;
    public virtual Recipe Recipe { get; set; } = null!;
    public virtual ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
}
