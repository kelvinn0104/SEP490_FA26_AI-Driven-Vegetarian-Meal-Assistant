using System.Net;
using System.Net.Mail;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VeggieAI.Model.DTOs;

namespace VeggieAI.Service.Services;

public interface IEmailService
{
    /// <summary>true nếu đã cấu hình SMTP và bật gửi thật (Email:Enabled = true).</summary>
    bool IsEnabled { get; }

    Task SendAsync(string toEmail, string subject, string htmlBody, string? textBody = null, CancellationToken ct = default);

    Task SendOtpAsync(string toEmail, string displayName, string otpCode, int expiryMinutes, CancellationToken ct = default);
}

/// <summary>
/// Gửi email qua SMTP (Gmail / Brevo / SendGrid SMTP relay) bằng System.Net.Mail — không cần thêm NuGet package.
/// Dev/Test: khi Email:Enabled = false, mã OTP được in ra console của Backend thay vì gửi email.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly EmailOptions _opt;
    private readonly ILogger<SmtpEmailService> _log;

    public SmtpEmailService(IOptions<EmailOptions> options, ILogger<SmtpEmailService> log)
    {
        _opt = options.Value;
        _log = log;
    }

    public bool IsEnabled =>
        _opt.Enabled && !string.IsNullOrWhiteSpace(_opt.Host) &&
        (!string.IsNullOrWhiteSpace(_opt.FromEmail) || !string.IsNullOrWhiteSpace(_opt.Username));

    public async Task SendAsync(string toEmail, string subject, string htmlBody, string? textBody = null, CancellationToken ct = default)
    {
        if (!IsEnabled)
        {
            _log.LogWarning("[Email DEV] Email chưa được bật (Email:Enabled=false). Bỏ qua gửi tới {To} — tiêu đề: {Subject}", toEmail, subject);
            return;
        }

        var from = string.IsNullOrWhiteSpace(_opt.FromEmail) ? _opt.Username! : _opt.FromEmail;

        using var message = new MailMessage
        {
            From = new MailAddress(from, _opt.FromName, Encoding.UTF8),
            Subject = subject,
            SubjectEncoding = Encoding.UTF8,
            BodyEncoding = Encoding.UTF8,
            IsBodyHtml = true,
            Body = htmlBody
        };
        message.To.Add(new MailAddress(toEmail));
        if (!string.IsNullOrWhiteSpace(textBody))
        {
            // multipart/alternative: text/plain trước, text/html sau (client ưu tiên phần cuối)
            message.IsBodyHtml = false;
            message.Body = textBody;
            message.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(htmlBody, Encoding.UTF8, "text/html"));
        }

        using var client = new SmtpClient(_opt.Host, _opt.Port)
        {
            EnableSsl = _opt.EnableSsl,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false,
            Timeout = _opt.TimeoutSeconds * 1000
        };
        if (!string.IsNullOrWhiteSpace(_opt.Username))
        {
            client.Credentials = new NetworkCredential(_opt.Username, _opt.Password);
        }

        await client.SendMailAsync(message, ct);
        _log.LogInformation("[Email] Đã gửi email '{Subject}' tới {To}", subject, toEmail);
    }

    public async Task SendOtpAsync(string toEmail, string displayName, string otpCode, int expiryMinutes, CancellationToken ct = default)
    {
        if (!IsEnabled)
        {
            // Chế độ Dev: in OTP ra console để test nhanh, không phụ thuộc hộp thư
            var prev = Console.ForegroundColor;
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================");
            Console.WriteLine($"[OTP DEV] Email : {toEmail}");
            Console.WriteLine($"[OTP DEV] Mã OTP: {otpCode}  (hết hạn sau {expiryMinutes} phút)");
            Console.WriteLine("==================================================");
            Console.ForegroundColor = prev;
            return;
        }

        var subject = $"[VeggieAI] Mã xác thực tài khoản của bạn: {otpCode}";
        var html = BuildOtpHtml(displayName, otpCode, expiryMinutes);
        var text = $"Xin chào {displayName},\n\nMã xác thực VeggieAI của bạn là: {otpCode}\n" +
                   $"Mã có hiệu lực trong {expiryMinutes} phút. Không chia sẻ mã này cho bất kỳ ai.\n\n" +
                   "Nếu bạn không đăng ký tài khoản VeggieAI, hãy bỏ qua email này.";

        await SendAsync(toEmail, subject, html, text, ct);
    }

    private static string BuildOtpHtml(string displayName, string code, int expiryMinutes)
    {
        var name = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(displayName) ? "bạn" : displayName);
        var digits = string.Concat(code.Select(c =>
            $"<td style=\"width:44px;height:52px;border:1px solid #cfe5da;border-radius:10px;background:#f2faf6;" +
            $"font-size:26px;font-weight:700;color:#006948;text-align:center;font-family:Consolas,monospace\">{c}</td>" +
            "<td style=\"width:8px\"></td>"));

        return $@"<!DOCTYPE html>
<html lang=""vi"">
<head><meta charset=""utf-8""><meta name=""viewport"" content=""width=device-width,initial-scale=1""></head>
<body style=""margin:0;padding:0;background:#f4f7f5;font-family:Segoe UI,Arial,sans-serif;color:#1f2d27"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""padding:32px 12px"">
    <tr><td align=""center"">
      <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.06)"">
        <tr><td style=""background:#006948;padding:24px 28px;color:#ffffff"">
          <div style=""font-size:22px;font-weight:700"">🌿 VeggieAI</div>
          <div style=""font-size:13px;opacity:.85;margin-top:4px"">Trợ lý dinh dưỡng thuần chay của bạn</div>
        </td></tr>
        <tr><td style=""padding:28px"">
          <p style=""margin:0 0 12px;font-size:16px"">Xin chào <b>{name}</b>,</p>
          <p style=""margin:0 0 20px;font-size:14px;line-height:1.6"">
            Chào mừng bạn đến với VeggieAI! Vui lòng nhập mã xác thực dưới đây để kích hoạt tài khoản:
          </p>
          <table role=""presentation"" cellpadding=""0"" cellspacing=""0"" align=""center"" style=""margin:0 auto 20px""><tr>{digits}</tr></table>
          <p style=""margin:0 0 8px;font-size:13px;color:#4b5a53;text-align:center"">
            Mã có hiệu lực trong <b>{expiryMinutes} phút</b>. Không chia sẻ mã này cho bất kỳ ai.
          </p>
          <hr style=""border:none;border-top:1px solid #e6ece9;margin:24px 0"">
          <p style=""margin:0;font-size:12px;color:#7a8a83;line-height:1.6"">
            Nếu bạn không đăng ký tài khoản VeggieAI, hãy bỏ qua email này — tài khoản sẽ không được kích hoạt.
          </p>
        </td></tr>
        <tr><td style=""background:#f2faf6;padding:14px 28px;font-size:11px;color:#7a8a83;text-align:center"">
          © {DateTime.UtcNow.Year} VeggieAI — Đồ án tốt nghiệp FPT University
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
    }
}
