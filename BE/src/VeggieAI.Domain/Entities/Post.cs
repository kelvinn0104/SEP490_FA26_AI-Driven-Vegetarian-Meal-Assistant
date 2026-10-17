namespace VeggieAI.Domain.Entities;

public partial class Post
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int? RecipeId { get; set; }
    public string PostType { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
    public string? VideoSummary { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; }

    public virtual Recipe? Recipe { get; set; }
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<ModerationLog> ModerationLogs { get; set; } = new List<ModerationLog>();
    public virtual ICollection<PostVote> PostVotes { get; set; } = new List<PostVote>();
}
