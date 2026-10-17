namespace VeggieAI.Domain.Entities;

public partial class MealPlan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string HealthGoal { get; set; } = null!;
    public string Status { get; set; } = "draft";
    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
    public virtual ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
    public virtual ICollection<MealPlanItem> MealPlanItems { get; set; } = new List<MealPlanItem>();
    public virtual ShoppingList? ShoppingList { get; set; }
}
