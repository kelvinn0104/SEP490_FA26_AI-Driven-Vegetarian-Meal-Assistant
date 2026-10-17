using System.ComponentModel.DataAnnotations;
using VeggieAI.Application.Common;

namespace VeggieAI.Application.DTOs;

public class PostQuery : PageQuery
{
    public string? Keyword { get; set; }
    [RegularExpression("^(blog|video)$")] public string? PostType { get; set; }
    /// <summary>newest | top</summary>
    public string? Sort { get; set; }
}

public class CreatePostRequest
{
    [Required, RegularExpression("^(blog|video)$")] public string PostType { get; set; } = "blog";
    [Required, MaxLength(200)] public string Title { get; set; } = "";
    public string? Content { get; set; }
    [MaxLength(500)] public string? MediaUrl { get; set; }
    public int? RecipeId { get; set; }
}

public class CreateCommentRequest
{
    [Required, MaxLength(2000)] public string Content { get; set; } = "";
}

public class VoteRequest
{
    /// <summary>1 = upvote, -1 = downvote, 0 = remove vote</summary>
    [Range(-1, 1)] public short Value { get; set; }
}

public class CreateReportRequest
{
    [Required, RegularExpression("^(post|comment|recipe)$")] public string TargetType { get; set; } = "";
    [Required] public int TargetId { get; set; }
    [Required, RegularExpression("^(spam|offensive|inappropriate|nutrition_misinformation|other)$")]
    public string Category { get; set; } = "";
    [MaxLength(1000)] public string? Reason { get; set; }
}

public record PostSummaryDto(int Id, string PostType, string Title, string? MediaUrl, string AuthorName,
    int? RecipeId, string Status, int Score, int CommentCount, short MyVote, DateTime CreatedAt);

public record CommentDto(int Id, int UserId, string AuthorName, string Content, DateTime CreatedAt);

public record PostDetailDto(int Id, string PostType, string Title, string? Content, string? MediaUrl,
    string? VideoSummary, string AuthorName, int? RecipeId, string? RecipeTitle, string Status,
    int Score, short MyVote, DateTime CreatedAt, IReadOnlyList<CommentDto> Comments);

public record ReportDto(int Id, string TargetType, int TargetId, string Category, string? Reason, string Status, DateTime CreatedAt);
