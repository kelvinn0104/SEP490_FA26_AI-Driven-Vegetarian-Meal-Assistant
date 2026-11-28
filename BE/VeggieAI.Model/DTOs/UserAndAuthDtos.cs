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
    /// <summary>Access token (JWT) gửi trong header Authorization: Bearer.</summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>Refresh token — gọi POST /api/Auth/refresh để lấy cặp token mới. Mỗi token chỉ dùng được một lần.</summary>
    public string RefreshToken { get; set; } = string.Empty;

    /// <summary>Thời điểm access token hết hạn (UTC).</summary>
    public DateTime ExpiresAt { get; set; }

    /// <summary>Thời điểm refresh token hết hạn (UTC).</summary>
    public DateTime RefreshTokenExpiresAt { get; set; }

    public UserDto User { get; set; } = null!;
}

public class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

public class LogoutRequest
{
    /// <summary>Refresh token của thiết bị hiện tại (để thu hồi khi access token đã hết hạn).</summary>
    public string? RefreshToken { get; set; }
}

/// <summary>Quên mật khẩu bước 1 — POST /api/Auth/forgot-password</summary>
public class ForgotPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

/// <summary>Quên mật khẩu bước 2 — POST /api/Auth/reset-password</summary>
public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{6}$", ErrorMessage = "Mã OTP phải gồm đúng 6 chữ số.")]
    public string OtpCode { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự.")]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>
/// Kết quả forgot-password: luôn trả 200 dù email có tồn tại hay không (tránh dò tài khoản).
/// </summary>
public class ForgotPasswordResponse
{
    public string Email { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; }
    public int ResendAfterSeconds { get; set; }

    /// <summary>Chỉ có giá trị khi Otp:ExposeOtpInResponse = true (môi trường Dev).</summary>
    public string? DevOtp { get; set; }
}

public class UserDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    /// <summary>Ảnh đại diện người dùng tải lên; nếu chưa có thì là avatar chữ cái (ui-avatars).</summary>
    public string Avatar { get; set; } = string.Empty;

    /// <summary>true nếu Avatar là ảnh người dùng tự tải lên.</summary>
    public bool HasCustomAvatar { get; set; }
    public string DietType { get; set; } = "vegan";
    public string Role { get; set; } = "user";
    public string Status { get; set; } = "active";
    public string JoinedDate { get; set; } = string.Empty;
    public int RecipesCount { get; set; }
    /// <summary>Số câu hỏi người dùng đã gửi cho trợ lý AI (đếm thật từ ChatMessage).</summary>
    public int AiQueriesCount { get; set; }
    public string? Bio { get; set; }
    public List<string> Allergies { get; set; } = new();

    /// <summary>false → FE chuyển người dùng tới màn hình nhập hồ sơ sức khỏe.</summary>
    public bool HasHealthProfile { get; set; }
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

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự.")]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>Cập nhật hồ sơ — chỉ gửi trường cần đổi.</summary>
public class UpdateMeRequest
{
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Tên hiển thị phải từ 2 đến 100 ký tự.")]
    public string? DisplayName { get; set; }

    /// <summary>URL ảnh lấy từ POST /api/uploads (purpose = avatar). Chuỗi rỗng "" = bỏ ảnh đại diện.</summary>
    [MaxLength(500)]
    public string? AvatarUrl { get; set; }
}
