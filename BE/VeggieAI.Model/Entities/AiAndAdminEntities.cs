using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("AiModel", Schema = "veggieai")]
public class AiModel
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    public string Type { get; set; } = "meal_planner"; // 'meal_planner', 'chatbot', 'recommendation', 'moderation', 'vision', 'speech_to_text'

    [MaxLength(50)]
    public string? Provider { get; set; }

    [Required]
    [MaxLength(50)]
    public string Version { get; set; } = "1.0";

    [Column(TypeName = "jsonb")]
    public string? Config { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // 'active', 'inactive', 'retraining'

    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UpdatedBy))]
    public virtual User? UpdatedByUser { get; set; }

    public virtual ICollection<AiModelLog> Logs { get; set; } = new List<AiModelLog>();
    public virtual ICollection<AiFeedback> Feedbacks { get; set; } = new List<AiFeedback>();
}

[Table("AiModelLog", Schema = "veggieai")]
public class AiModelLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    [Required]
    public int ModelId { get; set; }

    public int? UserId { get; set; }
    public int? LatencyMs { get; set; }
    public int? TokensUsed { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }

    [MaxLength(50)]
    public string? MetricName { get; set; }

    [Column(TypeName = "numeric(10,4)")]
    public decimal? MetricValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ModelId))]
    public virtual AiModel? Model { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("AiFeedback", Schema = "veggieai")]
public class AiFeedback
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int ReviewedBy { get; set; } // moderator

    public int? ModelId { get; set; }

    [Required]
    [MaxLength(20)]
    public string TargetType { get; set; } = "meal_plan"; // 'meal_plan', 'chat_message'

    [Required]
    public int TargetId { get; set; }

    public short Rating { get; set; } = 5; // 1-5
    public bool IsAccurate { get; set; } = true;
    public string? Comment { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "open"; // 'open', 'acknowledged', 'resolved'

    public int? HandledBy { get; set; } // admin
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(ReviewedBy))]
    public virtual User? Reviewer { get; set; }

    [ForeignKey(nameof(ModelId))]
    public virtual AiModel? Model { get; set; }

    [ForeignKey(nameof(HandledBy))]
    public virtual User? Handler { get; set; }
}

[Table("SystemSetting", Schema = "veggieai")]
public class SystemSetting
{
    [Key]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Value { get; set; } = string.Empty;

    [MaxLength(255)]
    public string? Description { get; set; }

    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UpdatedBy))]
    public virtual User? UpdatedByUser { get; set; }
}

[Table("Notification", Schema = "veggieai")]
public class Notification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(30)]
    public string Type { get; set; } = "system"; // 'profile_reminder', 'post_review', 'nutrition_alert', 'report_result', 'system'

    [Required]
    public string Content { get; set; } = string.Empty;

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("VeganShop", Schema = "veggieai")]
public class VeganShop
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    [Column(TypeName = "numeric(9,6)")]
    public decimal Latitude { get; set; }

    [Column(TypeName = "numeric(9,6)")]
    public decimal Longitude { get; set; }

    [MaxLength(20)]
    public string? Phone { get; set; }

    [MaxLength(300)]
    public string? Tags { get; set; }

    public bool IsActive { get; set; } = true;
}
