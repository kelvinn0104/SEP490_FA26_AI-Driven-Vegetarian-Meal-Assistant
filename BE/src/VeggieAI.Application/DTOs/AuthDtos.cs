using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Application.DTOs;

public class RegisterRequest
{
    [Required, EmailAddress, MaxLength(255)] public string Email { get; set; } = "";
    [Required, MinLength(6), MaxLength(100)] public string Password { get; set; } = "";
    [Required, MaxLength(100)] public string DisplayName { get; set; } = "";
}

public class LoginRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
}

public class ChangePasswordRequest
{
    [Required] public string CurrentPassword { get; set; } = "";
    [Required, MinLength(6), MaxLength(100)] public string NewPassword { get; set; } = "";
}

public class UpdateMeRequest
{
    [Required, MaxLength(100)] public string DisplayName { get; set; } = "";
}

public record UserDto(int Id, string Email, string DisplayName, string Role, string Status, DateTime CreatedAt, bool HasHealthProfile);

public record AuthResponse(string AccessToken, DateTime ExpiresAt, UserDto User);
