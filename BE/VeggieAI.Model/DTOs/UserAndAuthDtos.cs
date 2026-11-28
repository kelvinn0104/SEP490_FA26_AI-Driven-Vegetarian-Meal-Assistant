using System.ComponentModel.DataAnnotations;
using VeggieAI.Model.Constants;

namespace VeggieAI.Model.DTOs;

public class LoginRequest
{
    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    public string Password { get; set; } = string.Empty;

    public bool PortalOnly { get; set; } = false;
}

public class RegisterRequest
{
    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu không được để trống")]
    [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên hiển thị không được để trống")]
    public string DisplayName { get; set; } = string.Empty;

    public string Role { get; set; } = RoleConstants.User; // 'SuperAdmin', 'Mod', 'User'
    public string? InviteCode { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public int NumericId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string DietType { get; set; } = "vegan";
    public string Role { get; set; } = RoleConstants.User; // Canonical: 'SuperAdmin', 'Mod', 'User'
    public string RoleDisplayName { get; set; } = "Người dùng";
    public string Status { get; set; } = "active";
    public string JoinedDate { get; set; } = string.Empty;
    public int RecipesCount { get; set; }
    public int AiQueriesCount { get; set; }
    public string? Bio { get; set; }
    public List<string> Allergies { get; set; } = new();
    public List<string> Permissions { get; set; } = new();
}

public class CreateUserRequest
{
    [Required(ErrorMessage = "Tên người dùng không được để trống")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email không được để trống")]
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu khởi tạo là bắt buộc")]
    [MinLength(6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")]
    public string Password { get; set; } = string.Empty;

    public string DietType { get; set; } = "vegan";
    public string Role { get; set; } = RoleConstants.User;
}

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = RoleConstants.User;
}
