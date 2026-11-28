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
    public string Status { get; set; } = "pending";
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
    public string? ReviewedBy { get; set; }
    public string? ReviewedAt { get; set; }
    public string? Decision { get; set; }
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
    public string Type { get; set; } = "info";
}

public class NutritionAnalysisRequest
{
    [Required(ErrorMessage = "Vui lòng nhập danh sách nguyên liệu cần phân tích.")]
    public string RecipeText { get; set; } = string.Empty;
}

public class NutritionAnalysisResponse
{
    public bool Analyzed { get; set; } = true;
    public string Source { get; set; } = "database"; // 'gemini' | 'database'
    public int Calories { get; set; }
    public string Protein { get; set; } = string.Empty;
    public string Carbs { get; set; } = string.Empty;
    public string Fat { get; set; } = string.Empty;
    public string B12Percent { get; set; } = string.Empty;
    public string IronPercent { get; set; } = string.Empty;
    public string AbsorptionRating { get; set; } = string.Empty;
    public string VeganPurity { get; set; } = string.Empty;
    public string AllergenAlert { get; set; } = string.Empty;
    public List<string> MatchedIngredients { get; set; } = new();
}

public class UpdateAiModelStatusRequest
{
    [Required]
    public string Status { get; set; } = "active";
}

// DASHBOARD
public class DashboardOverviewDto
{
    public int TotalUsers { get; set; }
    public int TotalMods { get; set; }
    public int TotalRoles { get; set; }
    public decimal UserGrowth { get; set; }
    public int TotalRecipes { get; set; }
    public int TotalCategories { get; set; }
    public int TotalIngredients { get; set; }
    public int TotalBlogs { get; set; }
    public decimal BlogGrowth { get; set; }
    public int TotalVideos { get; set; }
    public decimal VideoGrowth { get; set; }
    public int PendingModeration { get; set; }
    public int OpenFeedbacks { get; set; }
    public int ActiveChallenges { get; set; }
    public int PendingProductScans { get; set; }
    public int TotalAiQueries { get; set; }
    public int SystemErrorsCount { get; set; }
    public string AiAccuracy { get; set; } = "0%";
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
    public string Date { get; set; } = string.Empty;
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
    public string Status { get; set; } = "Hoàn tất";
    public string StatusBgClass { get; set; } = "bg-secondary-container";
    public string StatusTextClass { get; set; } = "text-on-secondary-container";
    public string Avatar { get; set; } = string.Empty;
}

// ROLES & PERMISSIONS
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

// SYSTEM SETTINGS
public class SystemSettingDto
{
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? UpdatedByName { get; set; }
    public string UpdatedAt { get; set; } = string.Empty;
}

public class SaveSystemSettingRequest
{
    [Required(ErrorMessage = "Khóa cấu hình không được để trống")]
    public string Key { get; set; } = string.Empty;

    [Required(ErrorMessage = "Giá trị cấu hình không được để trống")]
    public string Value { get; set; } = string.Empty;

    public string? Description { get; set; }
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
