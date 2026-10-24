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

/// <summary>Bước 2: xác thực OTP — POST /api/auth/verify-code</summary>
public class VerifyCodeRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Mã OTP phải gồm đúng 6 chữ số.")]
    public string OtpCode { get; set; } = string.Empty;
}

/// <summary>Gửi lại mã — POST /api/auth/resend-code</summary>
public class ResendCodeRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Kết quả của /register và /resend-code: tài khoản đang ở trạng thái "pending", chờ nhập OTP.
/// FE dùng ExpiresInSeconds / ResendAfterSeconds để hiển thị đồng hồ đếm ngược.
/// </summary>
public class RegisterPendingResponse
{
    public string Email { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public bool RequiresVerification { get; set; } = true;
    public bool CodeSent { get; set; } = true;
    public int ExpiresInSeconds { get; set; }
    public int ResendAfterSeconds { get; set; }
    public DateTime? ExpiresAt { get; set; }

    /// <summary>Chỉ có giá trị khi Otp:ExposeOtpInResponse = true (môi trường Dev).</summary>
    public string? DevOtp { get; set; }
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
