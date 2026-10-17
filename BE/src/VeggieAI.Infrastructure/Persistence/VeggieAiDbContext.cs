using Microsoft.EntityFrameworkCore;
using VeggieAI.Domain.Entities;

namespace VeggieAI.Infrastructure.Persistence;

/// <summary>Generated (DB-first) from VeggieAI_Database.sql — schema "veggieai".</summary>
public partial class VeggieAiDbContext : DbContext
{
    public VeggieAiDbContext(DbContextOptions<VeggieAiDbContext> options) : base(options) { }

    public virtual DbSet<ActivityData> ActivityData => Set<ActivityData>();
    public virtual DbSet<AiFeedback> AiFeedbacks => Set<AiFeedback>();
    public virtual DbSet<AiModel> AiModels => Set<AiModel>();
    public virtual DbSet<AiModelLog> AiModelLogs => Set<AiModelLog>();
    public virtual DbSet<Allergy> Allergies => Set<Allergy>();
    public virtual DbSet<Category> Categories => Set<Category>();
    public virtual DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public virtual DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public virtual DbSet<Comment> Comments => Set<Comment>();
    public virtual DbSet<Favorite> Favorites => Set<Favorite>();
    public virtual DbSet<GoalStandard> GoalStandards => Set<GoalStandard>();
    public virtual DbSet<HealthProfile> HealthProfiles => Set<HealthProfile>();
    public virtual DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public virtual DbSet<IngredientScan> IngredientScans => Set<IngredientScan>();
    public virtual DbSet<MealLog> MealLogs => Set<MealLog>();
    public virtual DbSet<MealPlan> MealPlans => Set<MealPlan>();
    public virtual DbSet<MealPlanItem> MealPlanItems => Set<MealPlanItem>();
    public virtual DbSet<ModerationLog> ModerationLogs => Set<ModerationLog>();
    public virtual DbSet<Notification> Notifications => Set<Notification>();
    public virtual DbSet<NutrientStandard> NutrientStandards => Set<NutrientStandard>();
    public virtual DbSet<Post> Posts => Set<Post>();
    public virtual DbSet<PostVote> PostVotes => Set<PostVote>();
    public virtual DbSet<Recipe> Recipes => Set<Recipe>();
    public virtual DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public virtual DbSet<Report> Reports => Set<Report>();
    public virtual DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
    public virtual DbSet<ShoppingListItem> ShoppingListItems => Set<ShoppingListItem>();
    public virtual DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public virtual DbSet<User> Users => Set<User>();
    public virtual DbSet<VeganShop> VeganShops => Set<VeganShop>();
    public virtual DbSet<WearableConnection> WearableConnections => Set<WearableConnection>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("veggieai");

        modelBuilder.Entity<ActivityData>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ActivityData_pkey");
            entity.ToTable("ActivityData");
            entity.HasIndex(e => new { e.UserId, e.ActivityDate }, "ActivityData_UserId_ActivityDate_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.KcalBurned).HasPrecision(7, 2);
            entity.Property(e => e.SyncedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.User).WithMany(p => p.ActivityData).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ActivityData_UserId_fkey");
        });

        modelBuilder.Entity<AiFeedback>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AiFeedback_pkey");
            entity.ToTable("AiFeedback");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.TargetType).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.HandledByNavigation).WithMany(p => p.AiFeedbackHandledByNavigations).HasForeignKey(d => d.HandledBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("AiFeedback_HandledBy_fkey");
            entity.HasOne(d => d.Model).WithMany(p => p.AiFeedbacks).HasForeignKey(d => d.ModelId).OnDelete(DeleteBehavior.SetNull).HasConstraintName("AiFeedback_ModelId_fkey");
            entity.HasOne(d => d.ReviewedByNavigation).WithMany(p => p.AiFeedbackReviewedByNavigations).HasForeignKey(d => d.ReviewedBy).OnDelete(DeleteBehavior.Cascade).HasConstraintName("AiFeedback_ReviewedBy_fkey");
        });

        modelBuilder.Entity<AiModel>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AiModel_pkey");
            entity.ToTable("AiModel");
            entity.HasIndex(e => new { e.Name, e.Version }, "AiModel_Name_Version_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(30);
            entity.Property(e => e.Provider).HasMaxLength(50);
            entity.Property(e => e.Version).HasMaxLength(50);
            entity.Property(e => e.Config).HasColumnType("jsonb");
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.AiModels).HasForeignKey(d => d.UpdatedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("AiModel_UpdatedBy_fkey");
        });

        modelBuilder.Entity<AiModelLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AiModelLog_pkey");
            entity.ToTable("AiModelLog");
            entity.HasIndex(e => new { e.ModelId, e.CreatedAt }, "IX_AiModelLog_ModelTime");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.MetricName).HasMaxLength(50);
            entity.Property(e => e.MetricValue).HasPrecision(10, 4);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Model).WithMany(p => p.AiModelLogs).HasForeignKey(d => d.ModelId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("AiModelLog_ModelId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.AiModelLogs).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.SetNull).HasConstraintName("AiModelLog_UserId_fkey");
        });

        modelBuilder.Entity<Allergy>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Allergy_pkey");
            entity.ToTable("Allergy");
            entity.HasIndex(e => e.Name, "Allergy_Name_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.HasMany(d => d.Ingredients).WithMany(p => p.Allergies)
                .UsingEntity<Dictionary<string, object>>("IngredientAllergy",
                    r => r.HasOne<Ingredient>().WithMany().HasForeignKey("IngredientId").OnDelete(DeleteBehavior.Cascade).HasConstraintName("IngredientAllergy_IngredientId_fkey"),
                    l => l.HasOne<Allergy>().WithMany().HasForeignKey("AllergyId").OnDelete(DeleteBehavior.Cascade).HasConstraintName("IngredientAllergy_AllergyId_fkey"),
                    j => { j.HasKey("IngredientId", "AllergyId").HasName("IngredientAllergy_pkey"); j.ToTable("IngredientAllergy"); });
            entity.HasMany(d => d.Users).WithMany(p => p.Allergies)
                .UsingEntity<Dictionary<string, object>>("UserAllergy",
                    r => r.HasOne<User>().WithMany().HasForeignKey("UserId").OnDelete(DeleteBehavior.Cascade).HasConstraintName("UserAllergy_UserId_fkey"),
                    l => l.HasOne<Allergy>().WithMany().HasForeignKey("AllergyId").OnDelete(DeleteBehavior.Cascade).HasConstraintName("UserAllergy_AllergyId_fkey"),
                    j => { j.HasKey("UserId", "AllergyId").HasName("UserAllergy_pkey"); j.ToTable("UserAllergy"); });
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Category_pkey");
            entity.ToTable("Category");
            entity.HasIndex(e => new { e.Name, e.Type }, "Category_Name_Type_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(20);
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ChatMessage_pkey");
            entity.ToTable("ChatMessage");
            entity.HasIndex(e => new { e.SessionId, e.CreatedAt }, "IX_ChatMessage_Session");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Sender).HasMaxLength(10);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Session).WithMany(p => p.ChatMessages).HasForeignKey(d => d.SessionId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ChatMessage_SessionId_fkey");
        });

        modelBuilder.Entity<ChatSession>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ChatSession_pkey");
            entity.ToTable("ChatSession");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Plan).WithMany(p => p.ChatSessions).HasForeignKey(d => d.PlanId).OnDelete(DeleteBehavior.SetNull).HasConstraintName("ChatSession_PlanId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.ChatSessions).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ChatSession_UserId_fkey");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Comment_pkey");
            entity.ToTable("Comment");
            entity.HasIndex(e => e.PostId, "IX_Comment_Post");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Post).WithMany(p => p.Comments).HasForeignKey(d => d.PostId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Comment_PostId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.Comments).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Comment_UserId_fkey");
        });

        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.RecipeId }).HasName("Favorite_pkey");
            entity.ToTable("Favorite");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Recipe).WithMany(p => p.Favorites).HasForeignKey(d => d.RecipeId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Favorite_RecipeId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.Favorites).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Favorite_UserId_fkey");
        });

        modelBuilder.Entity<GoalStandard>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("GoalStandard_pkey");
            entity.ToTable("GoalStandard");
            entity.HasIndex(e => e.HealthGoal, "GoalStandard_HealthGoal_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.HealthGoal).HasMaxLength(20);
            entity.Property(e => e.KcalAdjustmentPercent).HasPrecision(5, 2);
            entity.Property(e => e.ProteinGPerKg).HasPrecision(4, 2);
            entity.Property(e => e.CarbPercent).HasPrecision(5, 2);
            entity.Property(e => e.FatPercent).HasPrecision(5, 2);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.GoalStandards).HasForeignKey(d => d.UpdatedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("GoalStandard_UpdatedBy_fkey");
        });

        modelBuilder.Entity<HealthProfile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("HealthProfile_pkey");
            entity.ToTable("HealthProfile");
            entity.HasIndex(e => e.UpdatedAt, "IX_HealthProfile_Updated");
            entity.HasIndex(e => e.UserId, "HealthProfile_UserId_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.HeightCm).HasPrecision(5, 1);
            entity.Property(e => e.WeightKg).HasPrecision(5, 1);
            entity.Property(e => e.ActivityLevel).HasMaxLength(20);
            entity.Property(e => e.HealthGoal).HasMaxLength(20);
            entity.Property(e => e.Bmi).HasPrecision(5, 2);
            entity.Property(e => e.Bmr).HasPrecision(7, 2);
            entity.Property(e => e.Tdee).HasPrecision(7, 2);
            entity.Property(e => e.DailyKcalTarget).HasPrecision(7, 2);
            entity.Property(e => e.ProteinTargetG).HasPrecision(6, 2);
            entity.Property(e => e.CarbTargetG).HasPrecision(6, 2);
            entity.Property(e => e.FatTargetG).HasPrecision(6, 2);
            entity.Property(e => e.IronTargetMg).HasPrecision(6, 2);
            entity.Property(e => e.B12TargetMcg).HasPrecision(6, 2);
            entity.Property(e => e.CalciumTargetMg).HasPrecision(7, 2);
            entity.Property(e => e.ZincTargetMg).HasPrecision(6, 2);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.User).WithOne(p => p.HealthProfile).HasForeignKey<HealthProfile>(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("HealthProfile_UserId_fkey");
        });

        modelBuilder.Entity<Ingredient>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Ingredient_pkey");
            entity.ToTable("Ingredient");
            entity.HasIndex(e => e.Name, "Ingredient_Name_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Name).HasMaxLength(150);
            entity.Property(e => e.KcalPer100g).HasPrecision(7, 2);
            entity.Property(e => e.ProteinPer100g).HasPrecision(6, 2);
            entity.Property(e => e.CarbPer100g).HasPrecision(6, 2);
            entity.Property(e => e.FatPer100g).HasPrecision(6, 2);
            entity.Property(e => e.IronPer100g).HasPrecision(6, 2);
            entity.Property(e => e.B12Per100g).HasPrecision(6, 2);
            entity.Property(e => e.CalciumPer100g).HasPrecision(7, 2);
            entity.Property(e => e.ZincPer100g).HasPrecision(6, 2);
            entity.Property(e => e.DataSource).HasMaxLength(100);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.Ingredients).HasForeignKey(d => d.UpdatedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("Ingredient_UpdatedBy_fkey");
        });

        modelBuilder.Entity<IngredientScan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("IngredientScan_pkey");
            entity.ToTable("IngredientScan");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.DetectedItems).HasColumnType("jsonb");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.User).WithMany(p => p.IngredientScans).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("IngredientScan_UserId_fkey");
        });

        modelBuilder.Entity<MealLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("MealLog_pkey");
            entity.ToTable("MealLog");
            entity.HasIndex(e => new { e.UserId, e.LogDate }, "IX_MealLog_UserDate");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.MealType).HasMaxLength(20);
            entity.Property(e => e.Servings).HasPrecision(4, 2);
            entity.Property(e => e.KcalConsumed).HasPrecision(7, 2);
            entity.HasOne(d => d.PlanItem).WithMany(p => p.MealLogs).HasForeignKey(d => d.PlanItemId).OnDelete(DeleteBehavior.SetNull).HasConstraintName("MealLog_PlanItemId_fkey");
            entity.HasOne(d => d.Recipe).WithMany(p => p.MealLogs).HasForeignKey(d => d.RecipeId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("MealLog_RecipeId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.MealLogs).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("MealLog_UserId_fkey");
        });

        modelBuilder.Entity<MealPlan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("MealPlan_pkey");
            entity.ToTable("MealPlan");
            entity.HasIndex(e => e.UserId, "IX_MealPlan_User");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.HealthGoal).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.User).WithMany(p => p.MealPlans).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("MealPlan_UserId_fkey");
        });

        modelBuilder.Entity<MealPlanItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("MealPlanItem_pkey");
            entity.ToTable("MealPlanItem");
            entity.HasIndex(e => new { e.PlanId, e.PlanDate }, "IX_MealPlanItem_PlanDate");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.MealType).HasMaxLength(20);
            entity.Property(e => e.Servings).HasPrecision(4, 2);
            entity.HasOne(d => d.Plan).WithMany(p => p.MealPlanItems).HasForeignKey(d => d.PlanId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("MealPlanItem_PlanId_fkey");
            entity.HasOne(d => d.Recipe).WithMany(p => p.MealPlanItems).HasForeignKey(d => d.RecipeId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("MealPlanItem_RecipeId_fkey");
        });

        modelBuilder.Entity<ModerationLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ModerationLog_pkey");
            entity.ToTable("ModerationLog");
            entity.HasIndex(e => e.PostId, "IX_ModerationLog_Post");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.AiLabel).HasMaxLength(50);
            entity.Property(e => e.AiConfidence).HasPrecision(4, 3);
            entity.Property(e => e.RiskLevel).HasMaxLength(10);
            entity.Property(e => e.Decision).HasMaxLength(20);
            entity.Property(e => e.ReviewedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Post).WithMany(p => p.ModerationLogs).HasForeignKey(d => d.PostId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ModerationLog_PostId_fkey");
            entity.HasOne(d => d.ReviewedByNavigation).WithMany(p => p.ModerationLogs).HasForeignKey(d => d.ReviewedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("ModerationLog_ReviewedBy_fkey");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Notification_pkey");
            entity.ToTable("Notification");
            entity.HasIndex(e => new { e.UserId, e.IsRead }, "IX_Notification_UserRead");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Type).HasMaxLength(30);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.User).WithMany(p => p.Notifications).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Notification_UserId_fkey");
        });

        modelBuilder.Entity<NutrientStandard>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("NutrientStandard_pkey");
            entity.ToTable("NutrientStandard");
            entity.HasIndex(e => new { e.Gender, e.AgeFrom, e.AgeTo }, "NutrientStandard_Gender_AgeFrom_AgeTo_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Gender).HasMaxLength(10);
            entity.Property(e => e.IronMg).HasPrecision(6, 2);
            entity.Property(e => e.B12Mcg).HasPrecision(6, 2);
            entity.Property(e => e.CalciumMg).HasPrecision(7, 2);
            entity.Property(e => e.ZincMg).HasPrecision(6, 2);
            entity.Property(e => e.Note).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.NutrientStandards).HasForeignKey(d => d.UpdatedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("NutrientStandard_UpdatedBy_fkey");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Post_pkey");
            entity.ToTable("Post");
            entity.HasIndex(e => new { e.Status, e.CreatedAt }, "IX_Post_Status");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.PostType).HasMaxLength(10);
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.MediaUrl).HasMaxLength(500);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Recipe).WithMany(p => p.Posts).HasForeignKey(d => d.RecipeId).OnDelete(DeleteBehavior.SetNull).HasConstraintName("Post_RecipeId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.Posts).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Post_UserId_fkey");
        });

        modelBuilder.Entity<PostVote>(entity =>
        {
            entity.HasKey(e => new { e.PostId, e.UserId }).HasName("PostVote_pkey");
            entity.ToTable("PostVote");
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Post).WithMany(p => p.PostVotes).HasForeignKey(d => d.PostId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("PostVote_PostId_fkey");
            entity.HasOne(d => d.User).WithMany(p => p.PostVotes).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("PostVote_UserId_fkey");
        });

        modelBuilder.Entity<Recipe>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Recipe_pkey");
            entity.ToTable("Recipe");
            entity.HasIndex(e => e.CategoryId, "IX_Recipe_Category");
            entity.HasIndex(e => e.Status, "IX_Recipe_Status");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);
            entity.Property(e => e.KcalPerServing).HasPrecision(7, 2);
            entity.Property(e => e.ProteinG).HasPrecision(6, 2);
            entity.Property(e => e.CarbG).HasPrecision(6, 2);
            entity.Property(e => e.FatG).HasPrecision(6, 2);
            entity.Property(e => e.IronMg).HasPrecision(6, 2);
            entity.Property(e => e.B12Mcg).HasPrecision(6, 2);
            entity.Property(e => e.CalciumMg).HasPrecision(7, 2);
            entity.Property(e => e.ZincMg).HasPrecision(6, 2);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Category).WithMany(p => p.Recipes).HasForeignKey(d => d.CategoryId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("Recipe_CategoryId_fkey");
            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.RecipeCreatedByNavigations).HasForeignKey(d => d.CreatedBy).OnDelete(DeleteBehavior.Restrict).HasConstraintName("Recipe_CreatedBy_fkey");
            entity.HasOne(d => d.VerifiedByNavigation).WithMany(p => p.RecipeVerifiedByNavigations).HasForeignKey(d => d.VerifiedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("Recipe_VerifiedBy_fkey");
        });

        modelBuilder.Entity<RecipeIngredient>(entity =>
        {
            entity.HasKey(e => new { e.RecipeId, e.IngredientId }).HasName("RecipeIngredient_pkey");
            entity.ToTable("RecipeIngredient");
            entity.HasIndex(e => e.IngredientId, "IX_RecipeIngredient_Ing");
            entity.Property(e => e.QuantityG).HasPrecision(8, 2);
            entity.HasOne(d => d.Ingredient).WithMany(p => p.RecipeIngredients).HasForeignKey(d => d.IngredientId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("RecipeIngredient_IngredientId_fkey");
            entity.HasOne(d => d.Recipe).WithMany(p => p.RecipeIngredients).HasForeignKey(d => d.RecipeId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("RecipeIngredient_RecipeId_fkey");
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Report_pkey");
            entity.ToTable("Report");
            entity.HasIndex(e => e.Status, "IX_Report_Status");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.TargetType).HasMaxLength(10);
            entity.Property(e => e.Category).HasMaxLength(30);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.HandledByNavigation).WithMany(p => p.ReportHandledByNavigations).HasForeignKey(d => d.HandledBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("Report_HandledBy_fkey");
            entity.HasOne(d => d.Reporter).WithMany(p => p.ReportReporters).HasForeignKey(d => d.ReporterId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("Report_ReporterId_fkey");
        });

        modelBuilder.Entity<ShoppingList>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ShoppingList_pkey");
            entity.ToTable("ShoppingList");
            entity.HasIndex(e => e.PlanId, "ShoppingList_PlanId_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.Plan).WithOne(p => p.ShoppingList).HasForeignKey<ShoppingList>(d => d.PlanId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ShoppingList_PlanId_fkey");
        });

        modelBuilder.Entity<ShoppingListItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ShoppingListItem_pkey");
            entity.ToTable("ShoppingListItem");
            entity.HasIndex(e => new { e.ListId, e.IngredientId }, "ShoppingListItem_ListId_IngredientId_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.QuantityG).HasPrecision(8, 2);
            entity.HasOne(d => d.Ingredient).WithMany(p => p.ShoppingListItems).HasForeignKey(d => d.IngredientId).OnDelete(DeleteBehavior.Restrict).HasConstraintName("ShoppingListItem_IngredientId_fkey");
            entity.HasOne(d => d.List).WithMany(p => p.ShoppingListItems).HasForeignKey(d => d.ListId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("ShoppingListItem_ListId_fkey");
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasKey(e => e.Key).HasName("SystemSetting_pkey");
            entity.ToTable("SystemSetting");
            entity.Property(e => e.Key).HasMaxLength(100);
            entity.Property(e => e.Value).HasMaxLength(500);
            entity.Property(e => e.Description).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("now()");
            entity.HasOne(d => d.UpdatedByNavigation).WithMany(p => p.SystemSettings).HasForeignKey(d => d.UpdatedBy).OnDelete(DeleteBehavior.SetNull).HasConstraintName("SystemSetting_UpdatedBy_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("User_pkey");
            entity.ToTable("User");
            entity.HasIndex(e => e.Email, "User_Email_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.DisplayName).HasMaxLength(100);
            entity.Property(e => e.Role).HasMaxLength(20);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        });

        modelBuilder.Entity<VeganShop>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("VeganShop_pkey");
            entity.ToTable("VeganShop");
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Name).HasMaxLength(200);
            entity.Property(e => e.Address).HasMaxLength(300);
            entity.Property(e => e.Latitude).HasPrecision(9, 6);
            entity.Property(e => e.Longitude).HasPrecision(9, 6);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Tags).HasMaxLength(300);
        });

        modelBuilder.Entity<WearableConnection>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("WearableConnection_pkey");
            entity.ToTable("WearableConnection");
            entity.HasIndex(e => new { e.UserId, e.Provider }, "WearableConnection_UserId_Provider_key").IsUnique();
            entity.Property(e => e.Id).UseIdentityByDefaultColumn();
            entity.Property(e => e.Provider).HasMaxLength(30);
            entity.HasOne(d => d.User).WithMany(p => p.WearableConnections).HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade).HasConstraintName("WearableConnection_UserId_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
