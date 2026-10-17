namespace VeggieAI.Domain.Entities;

public partial class ChatMessage
{
    public int Id { get; set; }
    public int SessionId { get; set; }
    public string Sender { get; set; } = null!;
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public virtual ChatSession Session { get; set; } = null!;
}
