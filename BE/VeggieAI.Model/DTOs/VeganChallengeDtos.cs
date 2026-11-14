using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class VeganChallengeDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int DurationDays { get; set; } = 7;
    public string Category { get; set; } = "beginner";
    public string CategoryLabel { get; set; } = "Khởi đầu Chay";
    public string Difficulty { get; set; } = "easy";
    public string DifficultyLabel { get; set; } = "Dễ tiếp cận";
    public string BadgeName { get; set; } = "Hiệp Sĩ Thực Dưỡng";
    public string BadgeIcon { get; set; } = "military_tech";
    public string? BannerUrl { get; set; }
    public int ParticipantsCount { get; set; }
    public int CompletedCount { get; set; }
    public int PendingCheckinsCount { get; set; }
    public string Status { get; set; } = "active";
    public string StatusLabel { get; set; } = "Đang diễn ra";
    public List<string> DailyTasks { get; set; } = new();
    public string? NutritionistNote { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? CreatorName { get; set; }
}

public class CreateVeganChallengeRequest
{
    [Required(ErrorMessage = "Tiêu đề thử thách không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(3, 90, ErrorMessage = "Thời lượng thử thách từ 3 đến 90 ngày")]
    public int DurationDays { get; set; } = 7;

    public string Category { get; set; } = "beginner"; // 'beginner', 'detox', 'fitness', 'sugar_free', 'habit'

    public string Difficulty { get; set; } = "easy"; // 'easy', 'medium', 'hard'

    public string BadgeName { get; set; } = "Hiệp Sĩ Thực Dưỡng";

    public string BadgeIcon { get; set; } = "military_tech";

    public string? BannerUrl { get; set; }

    public string Status { get; set; } = "active"; // 'active', 'upcoming', 'completed', 'draft'

    public List<string>? DailyTasks { get; set; }

    public string? NutritionistNote { get; set; }
}

public class UpdateVeganChallengeRequest
{
    [Required(ErrorMessage = "Tiêu đề thử thách không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int DurationDays { get; set; } = 7;

    public string Category { get; set; } = "beginner";

    public string Difficulty { get; set; } = "easy";

    public string BadgeName { get; set; } = "Hiệp Sĩ Thực Dưỡng";

    public string BadgeIcon { get; set; } = "military_tech";

    public string? BannerUrl { get; set; }

    public string Status { get; set; } = "active";

    public List<string>? DailyTasks { get; set; }

    public string? NutritionistNote { get; set; }
}

public class ChallengeCheckinDto
{
    public int Id { get; set; }
    public int ChallengeId { get; set; }
    public string ChallengeTitle { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserAvatar { get; set; } = string.Empty;
    public int DayNumber { get; set; }
    public string MealTitle { get; set; } = string.Empty;
    public string? MediaUrl { get; set; }
    public string? Notes { get; set; }
    public string Status { get; set; } = "pending";
    public string? NutritionistComment { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? ReviewedByName { get; set; }
}

public class ReviewCheckinRequest
{
    [Required]
    public string Decision { get; set; } = "approved"; // "approved" | "rejected"

    public string? NutritionistComment { get; set; }
}

public class ChallengeOverviewStatsDto
{
    public int TotalChallenges { get; set; }
    public int ActiveChallenges { get; set; }
    public int TotalParticipants { get; set; }
    public int PendingCheckins { get; set; }
    public decimal AvgCompletionRate { get; set; }
}

