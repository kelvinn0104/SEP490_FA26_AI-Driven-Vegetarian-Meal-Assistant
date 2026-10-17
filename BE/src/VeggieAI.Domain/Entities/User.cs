namespace VeggieAI.Domain.Entities;

public partial class User
{
    public int Id { get; set; }
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string DisplayName { get; set; } = null!;
    public string Role { get; set; } = "user";
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }

    public virtual ICollection<ActivityData> ActivityData { get; set; } = new List<ActivityData>();
    public virtual ICollection<AiFeedback> AiFeedbackHandledByNavigations { get; set; } = new List<AiFeedback>();
    public virtual ICollection<AiFeedback> AiFeedbackReviewedByNavigations { get; set; } = new List<AiFeedback>();
    public virtual ICollection<AiModelLog> AiModelLogs { get; set; } = new List<AiModelLog>();
    public virtual ICollection<AiModel> AiModels { get; set; } = new List<AiModel>();
    public virtual ICollection<ChatSession> ChatSessions { get; set; } = new List<ChatSession>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public virtual ICollection<GoalStandard> GoalStandards { get; set; } = new List<GoalStandard>();
    public virtual HealthProfile? HealthProfile { get; set; }
    public virtual ICollection<IngredientScan> IngredientScans { get; set; } = new List<IngredientScan>();
    public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    public virtual ICollection<MealLog> MealLogs { get; set; } = new List<MealLog>();
    public virtual ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();
    public virtual ICollection<ModerationLog> ModerationLogs { get; set; } = new List<ModerationLog>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<NutrientStandard> NutrientStandards { get; set; } = new List<NutrientStandard>();
    public virtual ICollection<PostVote> PostVotes { get; set; } = new List<PostVote>();
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Recipe> RecipeCreatedByNavigations { get; set; } = new List<Recipe>();
    public virtual ICollection<Recipe> RecipeVerifiedByNavigations { get; set; } = new List<Recipe>();
    public virtual ICollection<Report> ReportHandledByNavigations { get; set; } = new List<Report>();
    public virtual ICollection<Report> ReportReporters { get; set; } = new List<Report>();
    public virtual ICollection<SystemSetting> SystemSettings { get; set; } = new List<SystemSetting>();
    public virtual ICollection<WearableConnection> WearableConnections { get; set; } = new List<WearableConnection>();
    public virtual ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
}
