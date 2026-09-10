namespace VeggieAI.Domain.Entities;

public enum PostType
{
    Blog,
    CookingVideo
}

public class CommunityPost
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public PostType Type { get; set; } = PostType.Blog;
    public string? MediaUrl { get; set; }
    public string? AutoSummarizedSteps { get; set; } // Generated via Speech-To-Text / AI
    
    public ModerationStatus Status { get; set; } = ModerationStatus.Pending;
    public string? RejectionReason { get; set; }
    
    public Guid AuthorId { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    
    public int LikesCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
