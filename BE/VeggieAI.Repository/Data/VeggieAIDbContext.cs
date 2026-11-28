using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Entities;

namespace VeggieAI.Repository.Data;

public class VeggieAIDbContext : DbContext
{
    public VeggieAIDbContext(DbContextOptions<VeggieAIDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<HealthProfile> HealthProfiles => Set<HealthProfile>();
    public DbSet<Allergy> Allergies => Set<Allergy>();
    public DbSet<UserAllergy> UserAllergies => Set<UserAllergy>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<IngredientAllergy> IngredientAllergies => Set<IngredientAllergy>();
    public DbSet<NutrientStandard> NutrientStandards => Set<NutrientStandard>();
    public DbSet<GoalStandard> GoalStandards => Set<GoalStandard>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<RecipeIngredient> RecipeIngredients => Set<RecipeIngredient>();
    public DbSet<Favorite> Favorites => Set<Favorite>();
    public DbSet<MealPlan> MealPlans => Set<MealPlan>();
    public DbSet<MealPlanItem> MealPlanItems => Set<MealPlanItem>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<ShoppingList> ShoppingLists => Set<ShoppingList>();
    public DbSet<ShoppingListItem> ShoppingListItems => Set<ShoppingListItem>();
    public DbSet<IngredientScan> IngredientScans => Set<IngredientScan>();
    public DbSet<MealLog> MealLogs => Set<MealLog>();
    public DbSet<WearableConnection> WearableConnections => Set<WearableConnection>();
    public DbSet<ActivityData> ActivityDataRecords => Set<ActivityData>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<PostVote> PostVotes => Set<PostVote>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<ModerationLog> ModerationLogs => Set<ModerationLog>();
    public DbSet<AiModel> AiModels => Set<AiModel>();
    public DbSet<AiModelLog> AiModelLogs => Set<AiModelLog>();
    public DbSet<AiFeedback> AiFeedbacks => Set<AiFeedback>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<VeganShop> VeganShops => Set<VeganShop>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<SystemLog> SystemLogs => Set<SystemLog>();
    public DbSet<VeganChallenge> VeganChallenges => Set<VeganChallenge>();
    public DbSet<ChallengeCheckin> ChallengeCheckins => Set<ChallengeCheckin>();
    public DbSet<BroadcastNotification> BroadcastNotifications => Set<BroadcastNotification>();
    public DbSet<EcoReward> EcoRewards => Set<EcoReward>();
    public DbSet<RewardClaim> RewardClaims => Set<RewardClaim>();
    public DbSet<VeganProductScan> VeganProductScans => Set<VeganProductScan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.HasDefaultSchema("veggieai");

        // Composite keys
        modelBuilder.Entity<UserAllergy>()
            .HasKey(ua => new { ua.UserId, ua.AllergyId });

        modelBuilder.Entity<IngredientAllergy>()
            .HasKey(ia => new { ia.IngredientId, ia.AllergyId });

        modelBuilder.Entity<RecipeIngredient>()
            .HasKey(ri => new { ri.RecipeId, ri.IngredientId });

        modelBuilder.Entity<Favorite>()
            .HasKey(f => new { f.UserId, f.RecipeId });

        modelBuilder.Entity<PostVote>()
            .HasKey(pv => new { pv.PostId, pv.UserId });

        modelBuilder.Entity<RolePermission>()
            .HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // Check constraints
        modelBuilder.Entity<User>()
            .ToTable(t =>
            {
                t.HasCheckConstraint("CK_User_Role", "\"Role\" IN ('SuperAdmin', 'Mod', 'User')");
                t.HasCheckConstraint("CK_User_Status", "\"Status\" IN ('active', 'locked')");
            });

        // Unique indexes
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Role>()
            .HasIndex(r => r.Name)
            .IsUnique();

        modelBuilder.Entity<Category>()
            .HasIndex(c => new { c.Name, c.Type })
            .IsUnique();

        modelBuilder.Entity<Allergy>()
            .HasIndex(a => a.Name)
            .IsUnique();

        modelBuilder.Entity<Ingredient>()
            .HasIndex(i => i.Name)
            .IsUnique();

        modelBuilder.Entity<NutrientStandard>()
            .HasIndex(ns => new { ns.Gender, ns.AgeFrom, ns.AgeTo })
            .IsUnique();

        modelBuilder.Entity<GoalStandard>()
            .HasIndex(gs => gs.HealthGoal)
            .IsUnique();

        modelBuilder.Entity<AiModel>()
            .HasIndex(am => new { am.Name, am.Version })
            .IsUnique();

        modelBuilder.Entity<WearableConnection>()
            .HasIndex(wc => new { wc.UserId, wc.Provider })
            .IsUnique();

        modelBuilder.Entity<ActivityData>()
            .HasIndex(ad => new { ad.UserId, ad.ActivityDate })
            .IsUnique();

        modelBuilder.Entity<ShoppingListItem>()
            .HasIndex(sli => new { sli.ListId, sli.IngredientId })
            .IsUnique();

        modelBuilder.Entity<VeganProductScan>()
            .HasIndex(vp => vp.Barcode);

        // Foreign keys & delete behaviors
        modelBuilder.Entity<HealthProfile>()
            .HasOne(hp => hp.User)
            .WithOne(u => u.HealthProfile)
            .HasForeignKey<HealthProfile>(hp => hp.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.Creator)
            .WithMany(u => u.CreatedRecipes)
            .HasForeignKey(r => r.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.Verifier)
            .WithMany()
            .HasForeignKey(r => r.VerifiedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Report>()
            .HasOne(r => r.Reporter)
            .WithMany()
            .HasForeignKey(r => r.ReporterId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Report>()
            .HasOne(r => r.Handler)
            .WithMany()
            .HasForeignKey(r => r.HandledBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<AiFeedback>()
            .HasOne(af => af.Reviewer)
            .WithMany()
            .HasForeignKey(af => af.ReviewedBy)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AiFeedback>()
            .HasOne(af => af.Handler)
            .WithMany()
            .HasForeignKey(af => af.HandledBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VeganChallenge>()
            .HasOne(vc => vc.Creator)
            .WithMany()
            .HasForeignKey(vc => vc.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<ChallengeCheckin>()
            .HasOne(cc => cc.Challenge)
            .WithMany(vc => vc.Checkins)
            .HasForeignKey(cc => cc.ChallengeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChallengeCheckin>()
            .HasOne(cc => cc.User)
            .WithMany()
            .HasForeignKey(cc => cc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ChallengeCheckin>()
            .HasOne(cc => cc.Reviewer)
            .WithMany()
            .HasForeignKey(cc => cc.ReviewedBy)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<BroadcastNotification>()
            .HasOne(bn => bn.CreatedBy)
            .WithMany()
            .HasForeignKey(bn => bn.CreatedById)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<RewardClaim>()
            .HasOne(rc => rc.Reward)
            .WithMany(er => er.Claims)
            .HasForeignKey(rc => rc.RewardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RewardClaim>()
            .HasOne(rc => rc.User)
            .WithMany()
            .HasForeignKey(rc => rc.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RewardClaim>()
            .HasOne(rc => rc.Handler)
            .WithMany()
            .HasForeignKey(rc => rc.HandledById)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VeganProductScan>()
            .HasOne(vp => vp.SubmittedBy)
            .WithMany()
            .HasForeignKey(vp => vp.SubmittedById)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<VeganProductScan>()
            .HasOne(vp => vp.ReviewedBy)
            .WithMany()
            .HasForeignKey(vp => vp.ReviewedById)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
