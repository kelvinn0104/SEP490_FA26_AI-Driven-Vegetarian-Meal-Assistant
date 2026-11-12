using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class CreatePostRequest
{
    [Required, RegularExpression("^(blog|video)$", ErrorMessage = "postType phải là blog hoặc video.")]
    public string PostType { get; set; } = "blog";

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(20000)]
    public string? Content { get; set; }

    /// <summary>Bắt buộc với postType = video.</summary>
    [MaxLength(500)]
    public string? MediaUrl { get; set; }

    public int? RecipeId { get; set; }
}

public class AddCommentRequest
{
    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}

public class VotePostRequest
{
    /// <summary>1 = thích, -1 = không thích, 0 = bỏ vote.</summary>
    [Range(-1, 1)]
    public int Value { get; set; }
}

public class CreateReportRequest
{
    [Required, RegularExpression("^(post|comment|recipe)$", ErrorMessage = "targetType phải là post, comment hoặc recipe.")]
    public string TargetType { get; set; } = "post";

    public int TargetId { get; set; }

    [Required, RegularExpression("^(spam|offensive|inappropriate|nutrition_misinformation|other)$",
        ErrorMessage = "category không hợp lệ.")]
    public string Category { get; set; } = "other";

    [MaxLength(1000)]
    public string? Reason { get; set; }
}

public record PostSummaryDto(int Id, string PostType, string Title, string? MediaUrl, string AuthorName, int? RecipeId,
    string Status, int Score, int CommentCount, int MyVote, DateTime CreatedAt);

public record PostCommentDto(int Id, int UserId, string AuthorName, string Content, DateTime CreatedAt);

public record PostDetailDto(int Id, string PostType, string Title, string? MediaUrl, string AuthorName, int? RecipeId,
    string Status, int Score, int CommentCount, int MyVote, DateTime CreatedAt,
    string? Content, string? VideoSummary, string? RecipeTitle, IReadOnlyList<PostCommentDto> Comments);

public record ReportDto(int Id, string TargetType, int TargetId, string Category, string? Reason, string Status, DateTime CreatedAt);
