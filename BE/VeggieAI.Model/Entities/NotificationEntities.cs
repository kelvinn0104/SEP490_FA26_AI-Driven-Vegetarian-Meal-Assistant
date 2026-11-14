using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("broadcast_notifications")]
public class BroadcastNotification
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Message { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Type { get; set; } = "tip"; // tip, challenge, urgent, recipe, event

    [MaxLength(50)]
    public string TargetAudience { get; set; } = "all"; // all, challenge_participants, beginners, fitness

    [MaxLength(30)]
    public string Status { get; set; } = "sent"; // sent, scheduled, draft

    public DateTime? ScheduledAt { get; set; }

    public DateTime? SentAt { get; set; }

    public int RecipientsCount { get; set; } = 3840;

    public decimal OpenRate { get; set; } = 42.5m;

    public int ClickCount { get; set; } = 890;

    [MaxLength(300)]
    public string? ActionUrl { get; set; }

    public int CreatedById { get; set; } = 1;

    [ForeignKey(nameof(CreatedById))]
    public virtual User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

