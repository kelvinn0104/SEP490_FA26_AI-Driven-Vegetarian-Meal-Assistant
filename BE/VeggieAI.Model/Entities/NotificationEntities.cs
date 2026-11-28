using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("BroadcastNotification", Schema = "veggieai")]
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

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = "tip"; // tip, challenge, urgent, recipe, event

    [Required]
    [MaxLength(50)]
    public string TargetAudience { get; set; } = "all"; // all, challenge_participants, beginners, fitness

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "draft"; // sent, scheduled, draft

    public DateTime? ScheduledAt { get; set; }

    public DateTime? SentAt { get; set; }

    public int RecipientsCount { get; set; } = 0;

    [Column(TypeName = "numeric(5,2)")]
    public decimal OpenRate { get; set; } = 0m;

    public int ClickCount { get; set; } = 0;

    [MaxLength(300)]
    public string? ActionUrl { get; set; }

    public int? CreatedById { get; set; }

    [ForeignKey(nameof(CreatedById))]
    public virtual User? CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
