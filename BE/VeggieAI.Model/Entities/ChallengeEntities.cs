using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("VeganChallenge", Schema = "veggieai")]
public class VeganChallenge
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(220)]
    public string Slug { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DurationDays { get; set; } = 7;

    [MaxLength(50)]
    public string Category { get; set; } = "beginner"; // 'beginner', 'detox', 'fitness', 'sugar_free', 'habit'

    [MaxLength(20)]
    public string Difficulty { get; set; } = "easy"; // 'easy', 'medium', 'hard'

    [MaxLength(100)]
    public string BadgeName { get; set; } = "Hiệp Sĩ Thực Dưỡng";

    [MaxLength(50)]
    public string BadgeIcon { get; set; } = "military_tech";

    [MaxLength(500)]
    public string? BannerUrl { get; set; }

    public int ParticipantsCount { get; set; } = 0;
    public int CompletedCount { get; set; } = 0;

    [MaxLength(20)]
    public string Status { get; set; } = "active"; // 'active', 'upcoming', 'completed', 'draft'

    public string? DailyTasks { get; set; }

    public string? NutritionistNote { get; set; }

    public int? CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(CreatedBy))]
    public virtual User? Creator { get; set; }

    public virtual ICollection<ChallengeCheckin> Checkins { get; set; } = new List<ChallengeCheckin>();
}

[Table("ChallengeCheckin", Schema = "veggieai")]
public class ChallengeCheckin
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int ChallengeId { get; set; }

    [Required]
    public int UserId { get; set; }

    public int DayNumber { get; set; } = 1;

    [MaxLength(200)]
    public string MealTitle { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? MediaUrl { get; set; }

    public string? Notes { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "pending"; // 'pending', 'approved', 'rejected'

    public string? NutritionistComment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? ReviewedBy { get; set; }
    public DateTime? ReviewedAt { get; set; }

    [ForeignKey(nameof(ChallengeId))]
    public virtual VeganChallenge? Challenge { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(ReviewedBy))]
    public virtual User? Reviewer { get; set; }
}

