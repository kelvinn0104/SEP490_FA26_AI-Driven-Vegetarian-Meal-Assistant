namespace VeggieAI.Domain.Entities;

public partial class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = null!;
    public string Status { get; set; } = "visible";
    public DateTime CreatedAt { get; set; }

    public virtual Post Post { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
