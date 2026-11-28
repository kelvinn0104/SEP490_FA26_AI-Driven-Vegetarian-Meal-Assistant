namespace VeggieAI.Model.DTOs;

/// <summary>
/// Cấu hình SMTP gửi email (section "Email" trong appsettings).
/// Gmail: Host=smtp.gmail.com, Port=587, EnableSsl=true, Password = App Password 16 ký tự.
/// Khi Enabled=false (mặc định ở môi trường Dev) email KHÔNG được gửi thật mà mã OTP được in ra console.
/// </summary>
public class EmailOptions
{
    public const string Section = "Email";

    public bool Enabled { get; set; } = false;

    /// <summary>
    /// "smtp" (mặc định) | "brevo" | "resend". Brevo/Resend gửi qua HTTPS API (cổng 443) — dùng khi host
    /// (vd. Render gói free) chặn cổng SMTP 25/465/587. Cần ApiKey + FromEmail đã xác minh ở nhà cung cấp.
    /// </summary>
    public string Provider { get; set; } = "smtp";

    /// <summary>API key của Brevo/Resend (biến môi trường Email__ApiKey).</summary>
    public string? ApiKey { get; set; }

    public string Host { get; set; } = "smtp.gmail.com";
    public int Port { get; set; } = 587;
    public bool EnableSsl { get; set; } = true;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "VeggieAI";
    public int TimeoutSeconds { get; set; } = 20;
}

/// <summary>
/// Cấu hình mã OTP xác thực email (section "Otp" trong appsettings).
/// </summary>
public class OtpOptions
{
    public const string Section = "Otp";

    /// <summary>Thời gian hiệu lực của mã (phút).</summary>
    public int ExpiryMinutes { get; set; } = 5;

    /// <summary>Số lần nhập sai tối đa trước khi mã bị hủy (chống brute-force).</summary>
    public int MaxAttempts { get; set; } = 5;

    /// <summary>Thời gian chờ giữa 2 lần gửi mã (giây) — khớp countdown 60s ở Frontend.</summary>
    public int ResendCooldownSeconds { get; set; } = 60;

    /// <summary>Số lần gửi mã tối đa cho 1 email trong 1 giờ (chống spam hộp thư).</summary>
    public int MaxSendsPerHour { get; set; } = 5;

    /// <summary>
    /// CHỈ bật ở Development: trả luôn mã OTP trong response (field devOtp) để FE hiển thị modal gợi ý khi test.
    /// </summary>
    public bool ExposeOtpInResponse { get; set; } = false;
}
