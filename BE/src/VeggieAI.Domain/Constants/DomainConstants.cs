namespace VeggieAI.Domain.Constants;

/// <summary>String values allowed by the CHECK constraints in VeggieAI_Database.sql.</summary>
public static class Roles
{
    public const string Admin = "admin";
    public const string Moderator = "moderator";
    public const string User = "user";
}

public static class UserStatuses
{
    public const string Active = "active";
    public const string Locked = "locked";
}

public static class Genders
{
    public const string Male = "male";
    public const string Female = "female";
    public static readonly string[] All = { Male, Female };
}

public static class ActivityLevels
{
    public static readonly IReadOnlyDictionary<string, decimal> Factors = new Dictionary<string, decimal>
    {
        ["sedentary"] = 1.2m,
        ["light"] = 1.375m,
        ["moderate"] = 1.55m,
        ["active"] = 1.725m,
        ["very_active"] = 1.9m,
    };
}

public static class HealthGoals
{
    public const string Loss = "loss";
    public const string Gain = "gain";
    public const string Maintain = "maintain";
    public static readonly string[] All = { Loss, Gain, Maintain };
}

public static class MealTypes
{
    public const string Breakfast = "breakfast";
    public const string Lunch = "lunch";
    public const string Dinner = "dinner";
    public const string Snack = "snack";
    public static readonly string[] All = { Breakfast, Lunch, Dinner, Snack };

    /// <summary>Share of daily kcal for each meal (used by the planner & validator).</summary>
    public static readonly IReadOnlyDictionary<string, decimal> KcalShare = new Dictionary<string, decimal>
    {
        [Breakfast] = 0.25m, [Lunch] = 0.35m, [Dinner] = 0.30m, [Snack] = 0.10m,
    };
}

public static class RecipeStatuses
{
    public const string Draft = "draft";
    public const string PendingVerification = "pending_verification";
    public const string Published = "published";
    public const string Hidden = "hidden";
}

public static class MealPlanStatuses
{
    public const string Draft = "draft";
    public const string Active = "active";
    public const string Completed = "completed";
    public const string Cancelled = "cancelled";
    public static readonly string[] All = { Draft, Active, Completed, Cancelled };
}

public static class PostStatuses
{
    public const string Pending = "pending";
    public const string Published = "published";
    public const string Flagged = "flagged";
    public const string Removed = "removed";
}

public static class AiModelTypes
{
    public const string MealPlanner = "meal_planner";
    public const string Chatbot = "chatbot";
    public const string Vision = "vision";
}

public static class NotificationTypes
{
    public const string ProfileReminder = "profile_reminder";
    public const string NutritionAlert = "nutrition_alert";
    public const string System = "system";
}
