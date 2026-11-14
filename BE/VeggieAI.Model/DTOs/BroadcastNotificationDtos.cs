using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class BroadcastNotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = "tip";
    public string TypeLabel { get; set; } = "Mẹo Dinh Dưỡng";
    public string TargetAudience { get; set; } = "all";
    public string TargetAudienceLabel { get; set; } = "Toàn bộ hội viên (3,840 người)";
    public string Status { get; set; } = "sent";
    public string? ScheduledAt { get; set; }
    public string? SentAt { get; set; }
    public int RecipientsCount { get; set; }
    public decimal OpenRate { get; set; }
    public int ClickCount { get; set; }
    public string? ActionUrl { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
    public string? CreatedByName { get; set; }
}

public class CreateBroadcastNotificationRequest
{
    [Required(ErrorMessage = "Tiêu đề thông báo không được để trống")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nội dung thông báo không được để trống")]
    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = "tip"; // tip, challenge, urgent, recipe, event

    public string TargetAudience { get; set; } = "all"; // all, challenge_participants, beginners, fitness

    public string Status { get; set; } = "sent"; // sent, scheduled, draft

    public DateTime? ScheduledAt { get; set; }

    public string? ActionUrl { get; set; }
}

public class UpdateBroadcastNotificationRequest
{
    [Required(ErrorMessage = "Tiêu đề thông báo không được để trống")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nội dung thông báo không được để trống")]
    public string Message { get; set; } = string.Empty;

    public string Type { get; set; } = "tip";

    public string TargetAudience { get; set; } = "all";

    public string Status { get; set; } = "sent";

    public DateTime? ScheduledAt { get; set; }

    public string? ActionUrl { get; set; }
}

public class BroadcastStatsDto
{
    public int TotalSent { get; set; }
    public int ScheduledCount { get; set; }
    public decimal AvgOpenRate { get; set; }
    public int TotalClicks { get; set; }
}

