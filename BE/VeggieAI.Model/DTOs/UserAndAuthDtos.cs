using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string DisplayName { get; set; } = string.Empty;

    public string Role { get; set; } = "user"; // 'admin', 'moderator', 'user'
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
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Avatar { get; set; } = string.Empty;
    public string DietType { get; set; } = "vegan";
    public string Role { get; set; } = "user";
    public string Status { get; set; } = "active";
    public string JoinedDate { get; set; } = string.Empty;
    public int RecipesCount { get; set; }
    public int AiQueriesCount { get; set; }
    public string? Bio { get; set; }
    public List<string> Allergies { get; set; } = new();
}

public class CreateUserRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public string? Password { get; set; }
    public string DietType { get; set; } = "vegan";
    public string Role { get; set; } = "user";
}

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;
}
