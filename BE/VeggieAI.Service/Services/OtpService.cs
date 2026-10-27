using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Exceptions;

namespace VeggieAI.Service.Services;

public enum OtpVerifyStatus
{
    Valid,
    NotFound,
    Expired,
    TooManyAttempts,
    Invalid
}

public record OtpVerifyResult(OtpVerifyStatus Status, int RemainingAttempts = 0);

public record OtpIssueResult(string Code, DateTime ExpiresAt, int ExpiresInSeconds, int ResendAfterSeconds);

public interface IOtpService
{
    /// <summary>Hủy mã cũ (nếu có), sinh mã 6 số mới. Ném TooManyRequestsException nếu đang trong thời gian chờ.</summary>
    OtpIssueResult Issue(string email);

    /// <summary>Kiểm tra mã: còn mã không, hết hạn chưa, sai quá số lần chưa, có khớp không. Mã đúng sẽ bị xóa ngay.</summary>
    OtpVerifyResult Verify(string email, string code);

    /// <summary>Hoàn tác lần phát mã vừa rồi (dùng khi gửi email thất bại để người dùng gửi lại ngay được).</summary>
    void RollbackIssue(string email);

    /// <summary>Số giây còn lại trước khi được phép gửi lại mã (0 = gửi được ngay).</summary>
    int GetResendRemainingSeconds(string email);

    /// <summary>Số giây còn lại của mã hiện tại (0 = không có mã / đã hết hạn).</summary>
    int GetCodeRemainingSeconds(string email);
}

/// <summary>
/// Lưu OTP bằng IMemoryCache (không cần bảng DB). Key: otp_{email}.
/// - Chỉ lưu HASH của mã (SHA-256), không lưu mã gốc.
/// - So sánh bằng FixedTimeEquals để tránh timing attack.
/// - Lưu ý: dữ liệu nằm trong RAM của tiến trình API → restart server thì mã cũ mất, người dùng bấm "Gửi lại mã".
/// </summary>
public class OtpService : IOtpService
{
    private readonly IMemoryCache _cache;
    private readonly OtpOptions _opt;
    private readonly object _sync = new();

    public OtpService(IMemoryCache cache, IOptions<OtpOptions> options)
    {
        _cache = cache;
        _opt = options.Value;
    }

    private sealed class OtpEntry
    {
        public byte[] CodeHash { get; init; } = Array.Empty<byte>();
        public DateTime CreatedAt { get; init; }
        public DateTime ExpiresAt { get; init; }
        public int FailedAttempts { get; set; }
    }

    private sealed class SendWindow
    {
        public DateTime WindowEndsAt { get; init; }
        public int Count { get; set; }
    }

    private static string Norm(string email) => email.Trim().ToLowerInvariant();
    private static string CodeKey(string email) => $"otp_{Norm(email)}";
    private static string CooldownKey(string email) => $"otp_cooldown_{Norm(email)}";
    private static string WindowKey(string email) => $"otp_window_{Norm(email)}";

    private static byte[] Hash(string email, string code) =>
        SHA256.HashData(Encoding.UTF8.GetBytes($"{Norm(email)}:{code.Trim()}"));

    public OtpIssueResult Issue(string email)
    {
        var now = DateTime.UtcNow;
        lock (_sync)
        {
            // 1. Chống spam: phải chờ hết cooldown (60s)
            if (_cache.TryGetValue(CooldownKey(email), out DateTime availableAt) && availableAt > now)
            {
                var wait = (int)Math.Ceiling((availableAt - now).TotalSeconds);
                throw new TooManyRequestsException($"Vui lòng chờ {wait} giây trước khi yêu cầu mã mới.", wait);
            }

            // 2. Giới hạn số lần gửi trong 1 giờ
            var window = _cache.Get<SendWindow>(WindowKey(email));
            if (window == null || window.WindowEndsAt <= now)
            {
                window = new SendWindow { WindowEndsAt = now.AddHours(1), Count = 0 };
                _cache.Set(WindowKey(email), window, new DateTimeOffset(window.WindowEndsAt));
            }
            if (window.Count >= _opt.MaxSendsPerHour)
            {
                var wait = (int)Math.Ceiling((window.WindowEndsAt - now).TotalSeconds);
                throw new TooManyRequestsException(
                    $"Bạn đã yêu cầu mã quá {_opt.MaxSendsPerHour} lần trong 1 giờ. Vui lòng thử lại sau {Math.Ceiling(wait / 60.0)} phút.", wait);
            }
            window.Count++;

            // 3. Sinh mã 6 số ngẫu nhiên an toàn (CSPRNG) và ghi đè (= hủy) mã cũ
            var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
            var expiresAt = now.AddMinutes(_opt.ExpiryMinutes);
            var entry = new OtpEntry
            {
                CodeHash = Hash(email, code),
                CreatedAt = now,
                ExpiresAt = expiresAt
            };
            // Giữ entry lâu hơn hạn thật 30 phút để còn phân biệt được "hết hạn" với "không có mã"
            _cache.Set(CodeKey(email), entry, new DateTimeOffset(expiresAt.AddMinutes(30)));

            var cooldownUntil = now.AddSeconds(_opt.ResendCooldownSeconds);
            _cache.Set(CooldownKey(email), cooldownUntil, new DateTimeOffset(cooldownUntil));

            return new OtpIssueResult(code, expiresAt, _opt.ExpiryMinutes * 60, _opt.ResendCooldownSeconds);
        }
    }

    public OtpVerifyResult Verify(string email, string code)
    {
        var now = DateTime.UtcNow;
        lock (_sync)
        {
            // (1) Có mã nào đang chờ không?
            if (!_cache.TryGetValue(CodeKey(email), out OtpEntry? entry) || entry == null)
                return new OtpVerifyResult(OtpVerifyStatus.NotFound);

            // (2) Đã quá hạn chưa?
            if (now > entry.ExpiresAt)
            {
                _cache.Remove(CodeKey(email));
                return new OtpVerifyResult(OtpVerifyStatus.Expired);
            }

            // (3) Đã sai quá số lần cho phép chưa?
            if (entry.FailedAttempts >= _opt.MaxAttempts)
            {
                _cache.Remove(CodeKey(email));
                return new OtpVerifyResult(OtpVerifyStatus.TooManyAttempts);
            }

            // (4) Mã có khớp không?
            var input = (code ?? string.Empty).Trim();
            var matched = input.Length == 6
                          && input.All(char.IsAsciiDigit)
                          && CryptographicOperations.FixedTimeEquals(entry.CodeHash, Hash(email, input));

            if (matched)
            {
                _cache.Remove(CodeKey(email)); // Xóa mã đã dùng (one-time)
                return new OtpVerifyResult(OtpVerifyStatus.Valid);
            }

            entry.FailedAttempts++;
            var remaining = _opt.MaxAttempts - entry.FailedAttempts;
            if (remaining <= 0)
            {
                _cache.Remove(CodeKey(email)); // Hủy mã khi sai đủ số lần
                return new OtpVerifyResult(OtpVerifyStatus.TooManyAttempts);
            }
            return new OtpVerifyResult(OtpVerifyStatus.Invalid, remaining);
        }
    }

    public void RollbackIssue(string email)
    {
        lock (_sync)
        {
            _cache.Remove(CodeKey(email));
            _cache.Remove(CooldownKey(email));
            var window = _cache.Get<SendWindow>(WindowKey(email));
            if (window != null && window.Count > 0) window.Count--;
        }
    }

    public int GetResendRemainingSeconds(string email)
    {
        var now = DateTime.UtcNow;
        return _cache.TryGetValue(CooldownKey(email), out DateTime availableAt) && availableAt > now
            ? (int)Math.Ceiling((availableAt - now).TotalSeconds)
            : 0;
    }

    public int GetCodeRemainingSeconds(string email)
    {
        var now = DateTime.UtcNow;
        return _cache.TryGetValue(CodeKey(email), out OtpEntry? entry) && entry != null && entry.ExpiresAt > now
            ? (int)Math.Floor((entry.ExpiresAt - now).TotalSeconds)
            : 0;
    }
}
