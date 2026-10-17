using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

// MODERATION
public class ModerationItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string AuthorAvatar { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string SubmittedAt { get; set; } = string.Empty;
    public string Type { get; set; } = "recipe"; // 'recipe', 'blog', 'video'
    public string Status { get; set; } = "pending"; // 'pending', 'approved', 'rejected'
    public int AiScore { get; set; }
    public int NutritionalScore { get; set; }
    public int PlantBasedScore { get; set; }
    public string? FlagReason { get; set; }
    public int Calories { get; set; }
    public string Protein { get; set; } = string.Empty;
    public string Carbs { get; set; } = string.Empty;
    public string Fat { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? MediaUrl { get; set; }
}

public class ModerationActionRequest
{
    [Required]
    public string Decision { get; set; } = "approved"; // 'approved', 'rejected', 'revision'

    public string? Reason { get; set; }
}

// AI
public class AiModelDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? Provider { get; set; }
    public string Version { get; set; } = string.Empty;
    public string Status { get; set; } = "active";
    public decimal Accuracy { get; set; }
    public int AvgLatencyMs { get; set; }
    public int TotalCalls { get; set; }
}

public class AiTelemetryLogDto
{
    public string Id { get; set; } = string.Empty;
    public string Timestamp { get; set; } = string.Empty;
    public string Tag { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public int LatencyMs { get; set; }
    public string Type { get; set; } = "info"; // 'success', 'info', 'accent', 'warn', 'error'
}

public class NutritionAnalysisRequest
{
    [Required]
    public string RecipeText { get; set; } = string.Empty;
}

public class NutritionAnalysisResponse
{
    public int Calories { get; set; }
    public string Protein { get; set; } = string.Empty;
    public string B12Percent { get; set; } = string.Empty;
    public string IronPercent { get; set; } = string.Empty;
    public string AbsorptionRating { get; set; } = string.Empty;
    public string VeganPurity { get; set; } = string.Empty;
    public string AllergenAlert { get; set; } = string.Empty;
}

public class UpdateAiModelStatusRequest
{
    public string Status { get; set; } = "active";
}

// DASHBOARD
public class DashboardOverviewDto
{
    public int TotalUsers { get; set; }
    public decimal UserGrowth { get; set; }
    public int TotalBlogs { get; set; }
    public decimal BlogGrowth { get; set; }
    public int TotalVideos { get; set; }
    public decimal VideoGrowth { get; set; }
    public int PendingModeration { get; set; }
    public string Cluster { get; set; } = "Cụm HCM-01";
    public string RamUsage { get; set; } = "340GB / 500GB";
    public int RamPercent { get; set; } = 68;
    public string GpuLoad { get; set; } = "34.2% ổn định";
    public string AiAccuracy { get; set; } = "94.6%";
}

public class DietDistributionItemDto
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Count { get; set; }
    public decimal Percent { get; set; }
    public string Color { get; set; } = string.Empty;
    public string Subtext { get; set; } = string.Empty;
}

public class WeeklyChartDayDto
{
    public string Day { get; set; } = string.Empty;
    public int Recipes { get; set; }
    public int Queries { get; set; }
    public int Users { get; set; }
    public int NewUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int Height { get; set; }
    public int Y { get; set; }
    public bool IsPeak { get; set; }
}

public class ActivityItemDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string TypeIcon { get; set; } = "event_note";
    public string TypeBgClass { get; set; } = "bg-primary-fixed";
    public string TypeTextClass { get; set; } = "text-on-primary-fixed-variant";
    public string User { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string Target { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public string Status { get; set; } = "Thành công";
    public string StatusBgClass { get; set; } = "bg-secondary-container";
    public string StatusTextClass { get; set; } = "text-on-secondary-container";
    public string Avatar { get; set; } = string.Empty;
}

// ROLES
public class PermissionDto
{
    public string Id { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string Group { get; set; } = string.Empty;
}

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public List<string> Permissions { get; set; } = new();
    public bool IsSystem { get; set; }
    public string Theme { get; set; } = "surface";
    public string Icon { get; set; } = "person";
}

public class SaveRoleRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
    public List<string> Permissions { get; set; } = new();
}

// SYSTEM LOGS
public class SystemLogDto
{
    public long Id { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Target { get; set; }
    public string? Details { get; set; }
    public string LogType { get; set; } = "system";
    public string CreatedAt { get; set; } = string.Empty;
    public string TimeAgo { get; set; } = string.Empty;
}

public class CreateSystemLogRequest
{
    [Required]
    public string Action { get; set; } = string.Empty;
    public string? Target { get; set; }
    public string? Details { get; set; }
    public string LogType { get; set; } = "system";
}
