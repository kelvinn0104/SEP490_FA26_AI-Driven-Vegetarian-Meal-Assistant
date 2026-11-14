using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class FeedbackReportDto
{
    public int Id { get; set; }
    public string FeedbackType { get; set; } = "report"; // "report" | "ai_feedback"
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    public string? ReporterAvatar { get; set; }
    public string TargetType { get; set; } = "post"; // "recipe", "post", "comment", "meal_plan", "chat_message"
    public int TargetId { get; set; }
    public string TargetTitle { get; set; } = string.Empty;
    public string Category { get; set; } = "spam";
    public string CategoryLabel { get; set; } = "Nội dung rác";
    public string? Content { get; set; }
    public short? Rating { get; set; }
    public bool? IsAccurate { get; set; }
    public string Status { get; set; } = "open"; // "open", "resolved", "dismissed"
    public string CreatedAt { get; set; } = string.Empty;
    public string? HandledAt { get; set; }
    public string? HandlerName { get; set; }
    public string? ResolutionNote { get; set; }
}

public class ResolveFeedbackRequest
{
    [Required]
    public string Decision { get; set; } = "resolved"; // "resolved" | "dismissed"

    public string? ResolutionNote { get; set; }

    public bool HideTargetContent { get; set; } = false;
}

public class CreateReportRequest
{
    [Required]
    public string TargetType { get; set; } = "recipe"; // 'post', 'comment', 'recipe'

    [Required]
    public int TargetId { get; set; }

    [Required]
    public string Category { get; set; } = "nutrition_misinformation";

    public string? Reason { get; set; }
}

public class CreateAiFeedbackRequest
{
    [Required]
    public string TargetType { get; set; } = "meal_plan"; // 'meal_plan', 'chat_message'

    [Required]
    public int TargetId { get; set; }

    [Range(1, 5)]
    public short Rating { get; set; } = 5;

    public bool IsAccurate { get; set; } = true;

    public string? Comment { get; set; }
}

public class FeedbackOverviewStatsDto
{
    public int TotalReports { get; set; }
    public int OpenReports { get; set; }
    public int ResolvedReports { get; set; }
    public int DismissedReports { get; set; }
    public int NutritionMisinformationCount { get; set; }
    public int SpamPolicyCount { get; set; }
    public decimal AvgAiSatisfaction { get; set; }
}

