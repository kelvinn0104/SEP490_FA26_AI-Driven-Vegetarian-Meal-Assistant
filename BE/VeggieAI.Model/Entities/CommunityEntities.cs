using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("Post", Schema = "veggieai")]
public class Post
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public int? RecipeId { get; set; }

    [Required]
    [MaxLength(10)]
    public string PostType { get; set; } = "blog"; // 'blog', 'video'

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Content { get; set; }

    [MaxLength(500)]
    public string? MediaUrl { get; set; }

    public string? VideoSummary { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "pending"; // 'pending', 'published', 'flagged', 'removed'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(RecipeId))]
    public virtual Recipe? Recipe { get; set; }

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<PostVote> Votes { get; set; } = new List<PostVote>();
    public virtual ICollection<ModerationLog> ModerationLogs { get; set; } = new List<ModerationLog>();
}

[Table("Comment", Schema = "veggieai")]
public class Comment
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int PostId { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "visible"; // 'visible', 'hidden', 'removed'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PostId))]
    public virtual Post? Post { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("PostVote", Schema = "veggieai")]
public class PostVote
{
    public int PostId { get; set; }
    public int UserId { get; set; }
    public short Value { get; set; } // -1 or 1
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PostId))]
    public virtual Post? Post { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("Report", Schema = "veggieai")]
public class Report
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int ReporterId { get; set; }

    [Required]
    [MaxLength(10)]
    public string TargetType { get; set; } = "post"; // 'post', 'comment', 'recipe'

    [Required]
    public int TargetId { get; set; }

    [Required]
    [MaxLength(30)]
    public string Category { get; set; } = "spam"; // 'spam', 'offensive', 'inappropriate', 'nutrition_misinformation', 'other'

    public string? Reason { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "open"; // 'open', 'resolved', 'dismissed'

    public int? HandledBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? HandledAt { get; set; }

    [ForeignKey(nameof(ReporterId))]
    public virtual User? Reporter { get; set; }

    [ForeignKey(nameof(HandledBy))]
    public virtual User? Handler { get; set; }
}

[Table("ModerationLog", Schema = "veggieai")]
public class ModerationLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int PostId { get; set; }

    public int? ReviewedBy { get; set; } // NULL = AI only

    [MaxLength(50)]
    public string? AiLabel { get; set; }

    [Column(TypeName = "numeric(4,3)")]
    public decimal? AiConfidence { get; set; }

    [Required]
    [MaxLength(10)]
    public string RiskLevel { get; set; } = "low"; // 'low', 'medium', 'high'

    [Required]
    [MaxLength(20)]
    public string Decision { get; set; } = "pending"; // 'pending', 'approved', 'rejected'

    public string? Reason { get; set; }
    public DateTime ReviewedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PostId))]
    public virtual Post? Post { get; set; }

    [ForeignKey(nameof(ReviewedBy))]
    public virtual User? Reviewer { get; set; }
}
