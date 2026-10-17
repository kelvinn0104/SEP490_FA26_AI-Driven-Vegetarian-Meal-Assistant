using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("Role", Schema = "veggieai")]
public class Role
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }
    public bool IsSystem { get; set; } = false;

    [MaxLength(30)]
    public string Theme { get; set; } = "surface";

    [MaxLength(50)]
    public string Icon { get; set; } = "shield_person";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

[Table("Permission", Schema = "veggieai")]
public class Permission
{
    [Key]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Label { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string GroupName { get; set; } = string.Empty;

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

[Table("RolePermission", Schema = "veggieai")]
public class RolePermission
{
    [MaxLength(50)]
    public string RoleId { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PermissionId { get; set; } = string.Empty;

    [ForeignKey(nameof(RoleId))]
    public virtual Role? Role { get; set; }

    [ForeignKey(nameof(PermissionId))]
    public virtual Permission? Permission { get; set; }
}

[Table("SystemLog", Schema = "veggieai")]
public class SystemLog
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public long Id { get; set; }

    public int? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Target { get; set; }

    public string? Details { get; set; }

    [Required]
    [MaxLength(30)]
    public string LogType { get; set; } = "system"; // 'system', 'auth', 'user_management', 'role_management', 'moderation'

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
