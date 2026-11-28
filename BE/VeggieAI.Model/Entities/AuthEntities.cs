using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

/// <summary>
/// Refresh token của một phiên đăng nhập. Chỉ lưu SHA-256 của token, token gốc chỉ trả về cho client một lần.
/// Mỗi lần /api/Auth/refresh token cũ bị thu hồi và thay bằng token mới (rotation).
/// </summary>
[Table("RefreshToken", Schema = "veggieai")]
public class RefreshToken
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    /// <summary>SHA-256 (hex) của refresh token.</summary>
    [Required]
    [MaxLength(64)]
    public string TokenHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }

    /// <summary>Hash của token thay thế (khi rotation) — dùng để phát hiện token cũ bị dùng lại.</summary>
    [MaxLength(64)]
    public string? ReplacedByHash { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}

/// <summary>
/// Mã OTP gửi qua email, lưu trong DB để không mất khi server restart/redeploy.
/// Khóa chính = (Email, Purpose). Purpose: 'register' (xác thực email) | 'reset_password' (quên mật khẩu).
/// </summary>
[Table("EmailOtp", Schema = "veggieai")]
public class EmailOtp
{
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Purpose { get; set; } = "register";

    /// <summary>SHA-256 (hex) của "email:purpose:code". Null = chưa có mã (chỉ còn thông tin chống spam).</summary>
    [MaxLength(64)]
    public string? CodeHash { get; set; }

    public DateTime? ExpiresAt { get; set; }
    public int FailedAttempts { get; set; }

    /// <summary>Không được gửi mã mới trước thời điểm này.</summary>
    public DateTime? ResendAvailableAt { get; set; }

    /// <summary>Cửa sổ đếm số lần gửi trong 1 giờ.</summary>
    public DateTime? SendWindowEndsAt { get; set; }
    public int SendCount { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
