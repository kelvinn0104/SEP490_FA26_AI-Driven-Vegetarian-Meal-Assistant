using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using VeggieAI.Model.Constants;

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
    [MaxLength(30)]
    public string Role { get; set; } = RoleConstants.User; // 'SuperAdmin', 'Mod', 'User'

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // 'active', 'locked'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>Ảnh đại diện do người dùng tải lên (null → FE dùng avatar chữ cái).</summary>
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Phiên bản phiên đăng nhập. JWT mang claim "tv" = giá trị này; tăng lên khi đăng xuất, đổi/đặt lại mật khẩu
    /// hoặc bị khóa → mọi access token cũ lập tức không còn hợp lệ.
    /// </summary>
    public int TokenVersion { get; set; }

    // Navigation properties
    public virtual HealthProfile? HealthProfile { get; set; }
    public virtual ICollection<UserAllergy> UserAllergies { get; set; } = new List<UserAllergy>();
    public virtual ICollection<Recipe> CreatedRecipes { get; set; } = new List<Recipe>();
    public virtual ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();
    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
