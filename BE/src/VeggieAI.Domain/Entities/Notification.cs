namespace VeggieAI.Domain.Entities;

public partial class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Type { get; set; } = null!;
    public string Content { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
