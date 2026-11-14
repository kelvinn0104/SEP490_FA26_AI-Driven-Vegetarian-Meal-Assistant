using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("User", Schema = "veggieai")]
public class User
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string DisplayName { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Role { get; set; } = "user"; // 'admin', 'moderator', 'user'

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // 'pending' (chờ xác thực email), 'active', 'locked'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual HealthProfile? HealthProfile { get; set; }
    public virtual ICollection<UserAllergy> UserAllergies { get; set; } = new List<UserAllergy>();
    public virtual ICollection<Recipe> CreatedRecipes { get; set; } = new List<Recipe>();
    public virtual ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
