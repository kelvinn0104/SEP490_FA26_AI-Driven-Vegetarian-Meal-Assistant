using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Model.Exceptions;
using VeggieAI.Repository.Data;

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

/// <summary>Mục đích của mã OTP — mỗi mục đích có mã, cooldown và giới hạn riêng.</summary>
public static class OtpPurposes
{
    public const string Register = "register";
    public const string ResetPassword = "reset_password";
}

public interface IOtpService
{
    /// <summary>Hủy mã cũ (nếu có), sinh mã 6 số mới. Ném TooManyRequestsException nếu đang trong thời gian chờ.</summary>
    Task<OtpIssueResult> IssueAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default);

    /// <summary>Kiểm tra mã: còn mã không, hết hạn chưa, sai quá số lần chưa, có khớp không. Mã đúng sẽ bị xóa ngay.</summary>
    Task<OtpVerifyResult> VerifyAsync(string email, string code, string purpose = OtpPurposes.Register, CancellationToken ct = default);

    /// <summary>Hoàn tác lần phát mã vừa rồi (dùng khi gửi email thất bại để người dùng gửi lại ngay được).</summary>
    Task RollbackIssueAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default);

    /// <summary>Số giây còn lại trước khi được phép gửi lại mã (0 = gửi được ngay).</summary>
    Task<int> GetResendRemainingSecondsAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default);

    /// <summary>Số giây còn lại của mã hiện tại (0 = không có mã / đã hết hạn).</summary>
    Task<int> GetCodeRemainingSecondsAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default);
}

/// <summary>
/// Lưu OTP trong bảng EmailOtp (khóa = email + mục đích) để không mất khi server restart/redeploy
/// và dùng chung được khi chạy nhiều instance.
/// - Chỉ lưu HASH của mã (SHA-256), không lưu mã gốc.
/// - So sánh bằng FixedTimeEquals để tránh timing attack.
/// - Chống spam: cooldown giữa 2 lần gửi + giới hạn số lần gửi trong 1 giờ.
/// </summary>
public class OtpService : IOtpService
{
    private readonly VeggieAIDbContext _db;
    private readonly OtpOptions _opt;

    public OtpService(VeggieAIDbContext db, IOptions<OtpOptions> options)
    {
        _db = db;
        _opt = options.Value;
    }

    private static string Norm(string email) => email.Trim().ToLowerInvariant();

    private static string Hash(string email, string purpose, string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{Norm(email)}:{purpose}:{code.Trim()}"))).ToLowerInvariant();

    private Task<EmailOtp?> FindAsync(string email, string purpose, CancellationToken ct)
    {
        var e = Norm(email);
        return _db.EmailOtps.FirstOrDefaultAsync(o => o.Email == e && o.Purpose == purpose, ct);
    }

    public async Task<OtpIssueResult> IssueAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var row = await FindAsync(email, purpose, ct);
        if (row is null)
        {
            row = new EmailOtp { Email = Norm(email), Purpose = purpose };
            _db.EmailOtps.Add(row);
        }

        // 1. Chống spam: phải chờ hết cooldown (60s)
        if (row.ResendAvailableAt is DateTime availableAt && availableAt > now)
        {
            var wait = (int)Math.Ceiling((availableAt - now).TotalSeconds);
            throw new TooManyRequestsException($"Vui lòng chờ {wait} giây trước khi yêu cầu mã mới.", wait);
        }

        // 2. Giới hạn số lần gửi trong 1 giờ
        if (row.SendWindowEndsAt is null || row.SendWindowEndsAt <= now)
        {
            row.SendWindowEndsAt = now.AddHours(1);
            row.SendCount = 0;
        }
        if (row.SendCount >= _opt.MaxSendsPerHour)
        {
            var wait = (int)Math.Ceiling((row.SendWindowEndsAt.Value - now).TotalSeconds);
            throw new TooManyRequestsException(
                $"Bạn đã yêu cầu mã quá {_opt.MaxSendsPerHour} lần trong 1 giờ. Vui lòng thử lại sau {Math.Ceiling(wait / 60.0)} phút.", wait);
        }
        row.SendCount++;

        // 3. Sinh mã 6 số ngẫu nhiên an toàn (CSPRNG) và ghi đè (= hủy) mã cũ
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        var expiresAt = now.AddMinutes(_opt.ExpiryMinutes);
        row.CodeHash = Hash(email, purpose, code);
        row.ExpiresAt = expiresAt;
        row.FailedAttempts = 0;
        row.ResendAvailableAt = now.AddSeconds(_opt.ResendCooldownSeconds);
        row.UpdatedAt = now;
        await _db.SaveChangesAsync(ct);

        return new OtpIssueResult(code, expiresAt, _opt.ExpiryMinutes * 60, _opt.ResendCooldownSeconds);
    }

    public async Task<OtpVerifyResult> VerifyAsync(string email, string code, string purpose = OtpPurposes.Register, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var row = await FindAsync(email, purpose, ct);

        // (1) Có mã nào đang chờ không?
        if (row?.CodeHash is null || row.ExpiresAt is null)
            return new OtpVerifyResult(OtpVerifyStatus.NotFound);

        // (2) Đã quá hạn chưa?
        if (now > row.ExpiresAt)
        {
            ClearCode(row, now);
            await _db.SaveChangesAsync(ct);
            return new OtpVerifyResult(OtpVerifyStatus.Expired);
        }

        // (3) Đã sai quá số lần cho phép chưa?
        if (row.FailedAttempts >= _opt.MaxAttempts)
        {
            ClearCode(row, now);
            await _db.SaveChangesAsync(ct);
            return new OtpVerifyResult(OtpVerifyStatus.TooManyAttempts);
        }

        // (4) Mã có khớp không?
        var input = (code ?? string.Empty).Trim();
        var matched = input.Length == 6
                      && input.All(char.IsAsciiDigit)
                      && CryptographicOperations.FixedTimeEquals(
                          Encoding.ASCII.GetBytes(row.CodeHash), Encoding.ASCII.GetBytes(Hash(email, purpose, input)));

        if (matched)
        {
            ClearCode(row, now); // mã dùng một lần
            await _db.SaveChangesAsync(ct);
            return new OtpVerifyResult(OtpVerifyStatus.Valid);
        }

        row.FailedAttempts++;
        row.UpdatedAt = now;
        var remaining = _opt.MaxAttempts - row.FailedAttempts;
        if (remaining <= 0)
        {
            ClearCode(row, now); // hủy mã khi sai đủ số lần
            await _db.SaveChangesAsync(ct);
            return new OtpVerifyResult(OtpVerifyStatus.TooManyAttempts);
        }
        await _db.SaveChangesAsync(ct);
        return new OtpVerifyResult(OtpVerifyStatus.Invalid, remaining);
    }

    public async Task RollbackIssueAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default)
    {
        var row = await FindAsync(email, purpose, ct);
        if (row is null) return;
        ClearCode(row, DateTime.UtcNow);
        row.ResendAvailableAt = null;
        if (row.SendCount > 0) row.SendCount--;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> GetResendRemainingSecondsAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var row = await FindAsync(email, purpose, ct);
        return row?.ResendAvailableAt is DateTime at && at > now ? (int)Math.Ceiling((at - now).TotalSeconds) : 0;
    }

    public async Task<int> GetCodeRemainingSecondsAsync(string email, string purpose = OtpPurposes.Register, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var row = await FindAsync(email, purpose, ct);
        return row?.CodeHash is not null && row.ExpiresAt is DateTime exp && exp > now
            ? (int)Math.Floor((exp - now).TotalSeconds)
            : 0;
    }

    private static void ClearCode(EmailOtp row, DateTime now)
    {
        row.CodeHash = null;
        row.ExpiresAt = null;
        row.FailedAttempts = 0;
        row.UpdatedAt = now;
    }
}
