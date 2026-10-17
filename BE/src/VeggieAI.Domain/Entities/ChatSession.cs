namespace VeggieAI.Domain.Entities;

public partial class ChatSession
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? PlanId { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual MealPlan? Plan { get; set; }
    public virtual User User { get; set; } = null!;
    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();
}
