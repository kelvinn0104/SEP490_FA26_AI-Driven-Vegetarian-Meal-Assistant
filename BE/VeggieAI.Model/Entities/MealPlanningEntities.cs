using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("MealPlan", Schema = "veggieai")]
public class MealPlan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string HealthGoal { get; set; } = "maintain";

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "draft"; // 'draft', 'active', 'completed', 'cancelled'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    public virtual ICollection<MealPlanItem> Items { get; set; } = new List<MealPlanItem>();
    public virtual ShoppingList? ShoppingList { get; set; }
}

[Table("MealPlanItem", Schema = "veggieai")]
public class MealPlanItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int PlanId { get; set; }

    [Required]
    public int RecipeId { get; set; }

    [Required]
    public DateOnly PlanDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string MealType { get; set; } = "lunch"; // 'breakfast', 'lunch', 'dinner', 'snack'

    [Column(TypeName = "numeric(4,2)")]
    public decimal Servings { get; set; } = 1;

    [ForeignKey(nameof(PlanId))]
    public virtual MealPlan? MealPlan { get; set; }

    [ForeignKey(nameof(RecipeId))]
    public virtual Recipe? Recipe { get; set; }
}

[Table("ChatSession", Schema = "veggieai")]
public class ChatSession
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    public int? PlanId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(PlanId))]
    public virtual MealPlan? MealPlan { get; set; }

    public virtual ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

[Table("ChatMessage", Schema = "veggieai")]
public class ChatMessage
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int SessionId { get; set; }

    [Required]
    [MaxLength(10)]
    public string Sender { get; set; } = "user"; // 'user', 'ai'

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(SessionId))]
    public virtual ChatSession? Session { get; set; }
}

[Table("ShoppingList", Schema = "veggieai")]
public class ShoppingList
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int PlanId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(PlanId))]
    public virtual MealPlan? MealPlan { get; set; }

    public virtual ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();
}

[Table("ShoppingListItem", Schema = "veggieai")]
public class ShoppingListItem
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int ListId { get; set; }

    [Required]
    public int IngredientId { get; set; }

    [Column(TypeName = "numeric(8,2)")]
    public decimal QuantityG { get; set; }

    public bool IsBought { get; set; } = false;

    [ForeignKey(nameof(ListId))]
    public virtual ShoppingList? ShoppingList { get; set; }

    [ForeignKey(nameof(IngredientId))]
    public virtual Ingredient? Ingredient { get; set; }
}

[Table("IngredientScan", Schema = "veggieai")]
public class IngredientScan
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [Column(TypeName = "jsonb")]
    public string? DetectedItems { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("MealLog", Schema = "veggieai")]
public class MealLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public int RecipeId { get; set; }

    public int? PlanItemId { get; set; }

    [Required]
    public DateOnly LogDate { get; set; }

    [Required]
    [MaxLength(20)]
    public string MealType { get; set; } = "lunch";

    [Column(TypeName = "numeric(4,2)")]
    public decimal Servings { get; set; } = 1;

    [Column(TypeName = "numeric(7,2)")]
    public decimal KcalConsumed { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(RecipeId))]
    public virtual Recipe? Recipe { get; set; }

    [ForeignKey(nameof(PlanItemId))]
    public virtual MealPlanItem? PlanItem { get; set; }
}

[Table("WearableConnection", Schema = "veggieai")]
public class WearableConnection
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(30)]
    public string Provider { get; set; } = "apple_health"; // 'apple_health', 'google_fit'

    [Required]
    public string AccessTokenEnc { get; set; } = string.Empty;

    public DateTime? LastSyncedAt { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

[Table("ActivityData", Schema = "veggieai")]
public class ActivityData
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    public DateOnly ActivityDate { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal KcalBurned { get; set; }

    public int Steps { get; set; }

    public DateTime SyncedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
