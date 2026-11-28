using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VeggieAI.Model.DTOs;

public class CreatePostRequest
{
    [Required, RegularExpression("^(blog|video)$", ErrorMessage = "postType phải là blog hoặc video.")]
    public string PostType { get; set; } = "blog";

    [MaxLength(200)]
    public string? Title { get; set; }

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

/// <summary>Sửa bài (chỉ tác giả). Bài sửa xong quay về trạng thái pending để kiểm duyệt lại.</summary>
public class UpdatePostRequest
{
    [MaxLength(200)]
    public string? Title { get; set; }

    [RegularExpression("^(blog|video)$", ErrorMessage = "postType phải là blog hoặc video.")]
    public string? PostType { get; set; }

    [MaxLength(20000)]
    public string? Content { get; set; }

    [MaxLength(500)]
    public string? MediaUrl { get; set; }

    public int? RecipeId { get; set; }
}

public class UpdateCommentRequest
{
    [Required, MaxLength(2000)]
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Thông tin kiểm duyệt gần nhất — chỉ trả cho tác giả và staff.
/// decision: pending | approved | rejected | revision.
/// </summary>
public record PostModerationDto(string Decision, string? Note, DateTime ReviewedAt);

/// <summary>
/// excerpt: ~200 ký tự đầu của nội dung để FE hiển thị preview.
/// canEdit/canDelete: quyền của người đang xem. moderation: chỉ có với tác giả/staff.
/// </summary>
public record PostSummaryDto(int Id, string PostType, string Title, string? MediaUrl, string AuthorName, int? RecipeId,
    string Status, int Score, int CommentCount, int MyVote, DateTime CreatedAt,
    int AuthorId = 0, string? Excerpt = null, DateTime? UpdatedAt = null,
    bool CanEdit = false, bool CanDelete = false, PostModerationDto? Moderation = null, int LikeCount = 0,
    string? RecipeTitle = null);

public record PostCommentDto(int Id, int UserId, string AuthorName, string Content, DateTime CreatedAt,
    DateTime? UpdatedAt = null, bool CanEdit = false, bool CanDelete = false);

public record PostDetailDto(int Id, string PostType, string Title, string? MediaUrl, string AuthorName, int? RecipeId,
    string Status, int Score, int CommentCount, int MyVote, DateTime CreatedAt,
    string? Content, string? VideoSummary, string? RecipeTitle, IReadOnlyList<PostCommentDto> Comments,
    int AuthorId = 0, DateTime? UpdatedAt = null, bool CanEdit = false, bool CanDelete = false, PostModerationDto? Moderation = null,
    int LikeCount = 0);

public record PostLikeDto(int LikeCount, bool Liked);
public record PostLikeRequest([property: JsonRequired] bool Liked);

public record ReportDto(int Id, string TargetType, int TargetId, string Category, string? Reason, string Status, DateTime CreatedAt,
    DateTime? HandledAt = null, string? TargetPreview = null);
