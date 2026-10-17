namespace VeggieAI.Domain.Entities;

public partial class PostVote
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public short Value { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Post Post { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
