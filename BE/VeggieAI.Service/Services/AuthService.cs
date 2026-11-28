using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Model.Exceptions;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<RegisterPendingResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> VerifyCodeAsync(VerifyCodeRequest request);
    Task<RegisterPendingResponse> ResendCodeAsync(ResendCodeRequest request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
    Task<UserDto> UpdateMeAsync(int userId, UpdateMeRequest request);

    /// <summary>Đổi mật khẩu → thu hồi mọi phiên cũ và trả cặp token mới cho thiết bị hiện tại.</summary>
    Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request);

    /// <summary>Đổi refresh token lấy cặp token mới (rotation).</summary>
    Task<AuthResponse> RefreshAsync(RefreshTokenRequest request);

    /// <summary>Đăng xuất: thu hồi mọi access token + refresh token của tài khoản.</summary>
    Task LogoutAsync(int? userId, string? refreshToken);

    Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;
    private readonly IOtpService _otp;
    private readonly IEmailService _email;
    private readonly OtpOptions _otpOptions;
    private readonly ILogger<AuthService> _log;

    public const string StatusPending = "pending";
    public const string StatusActive = "active";
    public const string StatusLocked = "locked";

    public AuthService(
        IUnitOfWork unitOfWork,
        IConfiguration config,
        IOtpService otp,
        IEmailService email,
        IOptions<OtpOptions> otpOptions,
        ILogger<AuthService> log)
    {
        _unitOfWork = unitOfWork;
        _config = config;
        _otp = otp;
        _email = email;
        _otpOptions = otpOptions.Value;
        _log = log;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        if (user.Status == StatusLocked)
        {
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
        }

        if (!VerifyPassword(user, request.Password))
        {
            throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Chỉ báo "chưa xác thực" SAU khi mật khẩu đúng (tránh lộ thông tin tài khoản)
        if (user.Status == StatusPending)
        {
            throw new EmailNotVerifiedException(user.Email,
                "Tài khoản chưa xác thực email. Vui lòng nhập mã OTP đã gửi tới email hoặc bấm \"Gửi lại mã\".");
        }

        // System Log
        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = "Đăng nhập hệ thống",
                Target = user.DisplayName,
                Details = $"Đăng nhập thành công với vai trò: {user.Role}",
                LogType = "auth",
                CreatedAt = DateTime.UtcNow
            });
            await _unitOfWork.CommitAsync();
        }
        catch { }

        return await IssueTokensAsync(user);
    }

    /// <summary>
    /// Bước 1: tạo user ở trạng thái "pending" + sinh OTP 6 số + gửi email. KHÔNG trả JWT ở bước này.
    /// Nếu email đã đăng ký nhưng vẫn "pending" (bỏ dở lần trước) → cập nhật lại thông tin và gửi mã mới.
    /// </summary>
    public async Task<RegisterPendingResponse> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var existing = await _unitOfWork.Users.GetByEmailAsync(email);
        if (existing != null && existing.Status != StatusPending)
        {
            throw new InvalidOperationException("Email này đã được sử dụng trên hệ thống.");
        }

        var allowedRole = ResolveRegisterRole(request.Role, request.InviteCode);

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        User user;
        if (existing == null)
        {
            user = new User
            {
                Email = email,
                DisplayName = request.DisplayName.Trim(),
                PasswordHash = passwordHash,
                Role = allowedRole,
                Status = StatusPending,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Users.AddAsync(user);
        }
        else
        {
            user = existing;
            user.DisplayName = request.DisplayName.Trim();
            user.PasswordHash = passwordHash;
            user.Role = allowedRole;
        }
        await _unitOfWork.CommitAsync();

        await WriteLogAsync(user, "Đăng ký tài khoản",
            $"Tạo tài khoản {user.Email} vai trò {user.Role} — chờ xác thực email");

        // Đăng ký lại khi mã cũ vẫn đang trong thời gian chờ → không gửi thêm, FE tiếp tục bước nhập OTP
        var cooldown = await _otp.GetResendRemainingSecondsAsync(user.Email);
        if (existing != null && cooldown > 0)
        {
            return new RegisterPendingResponse
            {
                Email = user.Email,
                CodeSent = false,
                ExpiresInSeconds = await _otp.GetCodeRemainingSecondsAsync(user.Email),
                ResendAfterSeconds = cooldown
            };
        }

        return await IssueAndSendOtpAsync(user);
    }

    /// <summary>
    /// Vai trò khi tự đăng ký: mặc định "user". Muốn đăng ký admin/moderator phải nhập đúng mã mời
    /// cấu hình qua biến môi trường Auth__AdminInviteCodes / Auth__ModeratorInviteCodes (nhiều mã cách nhau dấu phẩy).
    /// Không cấu hình mã → không cho tự đăng ký vai trò đó (admin tạo tài khoản qua /api/Users).
    /// </summary>
    private string ResolveRegisterRole(string? requestedRole, string? inviteCode)
    {
        var role = (requestedRole ?? AppRoles.User).Trim().ToLowerInvariant();
        if (role == "mod") role = AppRoles.Moderator;
        if (role != AppRoles.Admin && role != AppRoles.Moderator) return AppRoles.User;

        var key = role == AppRoles.Admin ? "Auth:AdminInviteCodes" : "Auth:ModeratorInviteCodes";
        var codes = (_config[key] ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var code = inviteCode?.Trim();
        if (string.IsNullOrEmpty(code) || !codes.Contains(code, StringComparer.Ordinal))
        {
            throw AppException.Forbidden(role == AppRoles.Admin
                ? "Mã mời Admin không hợp lệ."
                : "Mã mời Moderator không hợp lệ.");
        }
        return role;
    }

    /// <summary>
    /// Bước 2: kiểm tra OTP (còn mã? hết hạn? sai quá số lần? khớp?) → kích hoạt tài khoản → trả JWT.
    /// </summary>
    public async Task<AuthResponse> VerifyCodeAsync(VerifyCodeRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy yêu cầu xác thực cho email này. Vui lòng đăng ký lại.");
        }
        if (user.Status == StatusLocked)
        {
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
        }
        if (user.Status == StatusActive)
        {
            throw new InvalidOperationException("Tài khoản đã được xác thực trước đó. Vui lòng đăng nhập.");
        }

        var result = await _otp.VerifyAsync(email, request.OtpCode);
        switch (result.Status)
        {
            case OtpVerifyStatus.NotFound:
                throw new InvalidOperationException("Không có mã OTP nào đang chờ cho email này. Vui lòng bấm \"Gửi lại mã\".");
            case OtpVerifyStatus.Expired:
                throw new InvalidOperationException("Mã OTP đã hết hạn, vui lòng lấy mã mới.");
            case OtpVerifyStatus.TooManyAttempts:
                throw new InvalidOperationException(
                    $"Bạn đã nhập sai quá {_otpOptions.MaxAttempts} lần. Mã OTP đã bị hủy, vui lòng lấy mã mới.");
            case OtpVerifyStatus.Invalid:
                throw new InvalidOperationException($"Mã OTP không chính xác. Bạn còn {result.RemainingAttempts} lần thử.");
        }

        // Hợp lệ → kích hoạt tài khoản (mã OTP đã được xóa trong OtpService.Verify)
        user.Status = StatusActive;
        await _unitOfWork.CommitAsync();

        await WriteLogAsync(user, "Xác thực email", $"Tài khoản {user.Email} đã xác thực email bằng OTP và được kích hoạt");

        return await IssueTokensAsync(user);
    }

    /// <summary>Hủy OTP cũ, sinh mã mới và gửi lại (chỉ khi đã hết 60s chờ).</summary>
    public async Task<RegisterPendingResponse> ResendCodeAsync(ResendCodeRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy tài khoản đang chờ xác thực với email này.");
        }
        if (user.Status == StatusActive)
        {
            throw new InvalidOperationException("Tài khoản đã được xác thực. Vui lòng đăng nhập.");
        }
        if (user.Status == StatusLocked)
        {
            throw new InvalidOperationException("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
        }

        return await IssueAndSendOtpAsync(user);
    }

    private async Task<RegisterPendingResponse> IssueAndSendOtpAsync(User user)
    {
        var issued = await SendOtpAsync(user, OtpPurposes.Register);
        return new RegisterPendingResponse
        {
            Email = user.Email,
            CodeSent = true,
            ExpiresInSeconds = issued.ExpiresInSeconds,
            ResendAfterSeconds = issued.ResendAfterSeconds,
            ExpiresAt = issued.ExpiresAt,
            DevOtp = _otpOptions.ExposeOtpInResponse ? issued.Code : null
        };
    }

    /// <summary>
    /// Sinh OTP + gửi email. Email chưa cấu hình mà không ở chế độ dev (Otp:ExposeOtpInResponse) → lỗi 503,
    /// KHÔNG trả "đã gửi" khi thực tế không gửi được.
    /// </summary>
    private async Task<OtpIssueResult> SendOtpAsync(User user, string purpose)
    {
        if (!_email.IsEnabled && !_otpOptions.ExposeOtpInResponse)
        {
            _log.LogError("[OTP] Email chưa được cấu hình (Email:Enabled=false) nên không gửi được mã cho {Email}", user.Email);
            throw new AppException("Hệ thống chưa gửi được email lúc này. Vui lòng thử lại sau hoặc liên hệ quản trị viên.",
                503, "EMAIL_NOT_CONFIGURED");
        }

        // Ném TooManyRequestsException (HTTP 429) nếu chưa hết thời gian chờ
        var issued = await _otp.IssueAsync(user.Email, purpose);
        try
        {
            await _email.SendOtpAsync(user.Email, user.DisplayName, issued.Code, _otpOptions.ExpiryMinutes, default, purpose);
        }
        catch (Exception ex)
        {
            await _otp.RollbackIssueAsync(user.Email, purpose); // cho phép người dùng bấm gửi lại ngay
            _log.LogError(ex, "[OTP] Gửi email OTP ({Purpose}) tới {Email} thất bại", purpose, user.Email);
            throw new AppException("Không gửi được email. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.",
                502, "EMAIL_SEND_FAILED");
        }
        return issued;
    }

    // ---------------- Refresh / Logout / Quên mật khẩu ----------------

    public async Task<AuthResponse> RefreshAsync(RefreshTokenRequest request)
    {
        var db = _unitOfWork.Context;
        var raw = (request.RefreshToken ?? string.Empty).Trim();
        if (raw.Length == 0) throw new AppException("Thiếu refresh token.", 401, "INVALID_REFRESH_TOKEN");

        var hash = HashToken(raw);
        var stored = await db.RefreshTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.TokenHash == hash);
        if (stored?.User is null)
            throw new AppException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.", 401, "INVALID_REFRESH_TOKEN");

        var now = DateTime.UtcNow;
        if (stored.RevokedAt is DateTime revokedAt)
        {
            // Token đã đổi rồi mà bị dùng lại sau 60 giây → nghi bị lộ: thu hồi toàn bộ phiên của tài khoản.
            // (Trong 60 giây đầu coi như FE gọi refresh trùng nhau, chỉ báo token không hợp lệ.)
            if (stored.ReplacedByHash != null && now - revokedAt > TimeSpan.FromSeconds(60))
            {
                await RevokeAllSessionsAsync(stored.User);
                await _unitOfWork.CommitAsync();
                _log.LogWarning("[Auth] Refresh token đã thu hồi bị dùng lại — thu hồi mọi phiên của user {UserId}", stored.UserId);
                throw new AppException("Phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại.", 401, "REFRESH_TOKEN_REUSED");
            }
            throw new AppException("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.", 401, "INVALID_REFRESH_TOKEN");
        }
        if (stored.ExpiresAt <= now)
            throw new AppException("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.", 401, "REFRESH_TOKEN_EXPIRED");

        var user = stored.User;
        if (user.Status == StatusLocked)
            throw new AppException("Tài khoản của bạn đã bị khóa bởi Quản trị viên.", 403, "ACCOUNT_LOCKED");
        if (user.Status != StatusActive)
            throw new AppException("Tài khoản chưa được kích hoạt.", 403, "EMAIL_NOT_VERIFIED");

        var (newRaw, newEntity) = NewRefreshToken(user.Id);
        stored.RevokedAt = now;
        stored.ReplacedByHash = newEntity.TokenHash;
        db.RefreshTokens.Add(newEntity);
        await _unitOfWork.CommitAsync();

        var detailed = await _unitOfWork.Users.GetUserWithDetailsAsync(user.Id) ?? user;
        return BuildAuthResponse(detailed, newRaw, newEntity.ExpiresAt);
    }

    public async Task LogoutAsync(int? userId, string? refreshToken)
    {
        var db = _unitOfWork.Context;
        User? user = null;
        if (userId is int uid) user = await db.Users.FirstOrDefaultAsync(u => u.Id == uid);

        if (user is null && !string.IsNullOrWhiteSpace(refreshToken))
        {
            // Access token đã hết hạn nhưng FE vẫn gửi refresh token → xác định tài khoản qua refresh token
            var hash = HashToken(refreshToken.Trim());
            var stored = await db.RefreshTokens.Include(t => t.User).FirstOrDefaultAsync(t => t.TokenHash == hash);
            user = stored?.User;
        }
        if (user is null) return; // không có phiên nào để thu hồi → coi như đã đăng xuất

        await RevokeAllSessionsAsync(user);
        await _unitOfWork.CommitAsync();
        await WriteLogAsync(user, "Đăng xuất", $"Tài khoản {user.Email} đăng xuất, thu hồi mọi phiên đăng nhập");
    }

    public async Task<ForgotPasswordResponse> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var response = new ForgotPasswordResponse
        {
            Email = email,
            ExpiresInSeconds = _otpOptions.ExpiryMinutes * 60,
            ResendAfterSeconds = _otpOptions.ResendCooldownSeconds,
        };

        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        // Email không tồn tại / bị khóa → vẫn trả 200 giống hệt để không lộ tài khoản nào đã đăng ký
        if (user == null || user.Status == StatusLocked) return response;

        var issued = await SendOtpAsync(user, OtpPurposes.ResetPassword);
        response.ExpiresInSeconds = issued.ExpiresInSeconds;
        response.ResendAfterSeconds = issued.ResendAfterSeconds;
        response.DevOtp = _otpOptions.ExposeOtpInResponse ? issued.Code : null;
        await WriteLogAsync(user, "Quên mật khẩu", $"Gửi mã đặt lại mật khẩu tới {user.Email}");
        return response;
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            throw new AppException("Mật khẩu mới phải có ít nhất 8 ký tự.");

        var user = await _unitOfWork.Users.GetByEmailAsync(email);
        if (user == null || user.Status == StatusLocked)
            throw new AppException("Mã OTP không chính xác hoặc đã hết hạn.", 400, "OTP_INVALID");

        var result = await _otp.VerifyAsync(email, request.OtpCode, OtpPurposes.ResetPassword);
        switch (result.Status)
        {
            case OtpVerifyStatus.NotFound:
                throw new AppException("Không có mã đặt lại mật khẩu nào đang chờ. Vui lòng yêu cầu mã mới.", 400, "OTP_NOT_FOUND");
            case OtpVerifyStatus.Expired:
                throw new AppException("Mã OTP đã hết hạn, vui lòng lấy mã mới.", 400, "OTP_EXPIRED");
            case OtpVerifyStatus.TooManyAttempts:
                throw new AppException($"Bạn đã nhập sai quá {_otpOptions.MaxAttempts} lần. Mã OTP đã bị hủy, vui lòng lấy mã mới.",
                    400, "OTP_TOO_MANY_ATTEMPTS");
            case OtpVerifyStatus.Invalid:
                throw new AppException($"Mã OTP không chính xác. Bạn còn {result.RemainingAttempts} lần thử.", 400, "OTP_INVALID");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        if (user.Status == StatusPending) user.Status = StatusActive; // đã chứng minh sở hữu email
        await RevokeAllSessionsAsync(user);
        await _unitOfWork.CommitAsync();
        await WriteLogAsync(user, "Đặt lại mật khẩu", $"Tài khoản {user.Email} đặt lại mật khẩu bằng OTP");
    }

    /// <summary>Tăng TokenVersion (vô hiệu mọi JWT đang dùng) và thu hồi mọi refresh token còn hiệu lực. Caller tự commit.</summary>
    private async Task RevokeAllSessionsAsync(User user)
    {
        user.TokenVersion++;
        var now = DateTime.UtcNow;
        var active = await _unitOfWork.Context.RefreshTokens
            .Where(t => t.UserId == user.Id && t.RevokedAt == null)
            .ToListAsync();
        foreach (var t in active) t.RevokedAt = now;
    }

    private async Task WriteLogAsync(User user, string action, string details)
    {
        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = action,
                Target = user.DisplayName,
                Details = details,
                LogType = "auth",
                CreatedAt = DateTime.UtcNow
            });
            await _unitOfWork.CommitAsync();
        }
        catch (Exception ex)
        {
            _log.LogWarning(ex, "Không ghi được SystemLog cho {Action}", action);
        }
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetUserWithDetailsAsync(userId);
        if (user == null) return null;
        var dto = MapUserToDto(user);
        dto.AiQueriesCount = await CountAiQueriesAsync(userId);
        return dto;
    }

    public async Task<UserDto> UpdateMeAsync(int userId, UpdateMeRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId) ?? throw AppException.NotFound("Người dùng");

        if (request.DisplayName is not null)
        {
            var name = request.DisplayName.Trim();
            if (name.Length < 2) throw new AppException("Tên hiển thị phải có ít nhất 2 ký tự.");
            user.DisplayName = name;
        }
        if (request.AvatarUrl is not null)
        {
            var url = request.AvatarUrl.Trim();
            if (url.Length == 0) user.AvatarUrl = null;
            else if (url.StartsWith("/uploads/", StringComparison.Ordinal) ||
                     (Uri.TryCreate(url, UriKind.Absolute, out var u) && u.Scheme == Uri.UriSchemeHttps))
                user.AvatarUrl = url;
            else
                throw new AppException("avatarUrl phải là URL https hoặc đường dẫn /uploads/ trả về từ POST /api/uploads.");
        }

        _unitOfWork.Users.Update(user);
        await _unitOfWork.CommitAsync();

        var detailed = await _unitOfWork.Users.GetUserWithDetailsAsync(userId);
        var dto = MapUserToDto(detailed ?? user);
        dto.AiQueriesCount = await CountAiQueriesAsync(userId);
        return dto;
    }

    private Task<int> CountAiQueriesAsync(int userId) =>
        _unitOfWork.Context.ChatMessages.CountAsync(m => m.Sender == "user" && m.Session != null && m.Session.UserId == userId);

    public async Task<AuthResponse> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId) ?? throw AppException.NotFound("Người dùng");
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            throw new AppException("Mật khẩu mới phải có ít nhất 8 ký tự.");
        if (request.NewPassword == request.CurrentPassword)
            throw new AppException("Mật khẩu mới phải khác mật khẩu hiện tại.");

        if (!VerifyPassword(user, request.CurrentPassword)) throw new AppException("Mật khẩu hiện tại không chính xác.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await RevokeAllSessionsAsync(user); // đăng xuất mọi thiết bị khác
        _unitOfWork.Users.Update(user);
        await _unitOfWork.CommitAsync();
        await WriteLogAsync(user, "Đổi mật khẩu", $"Tài khoản {user.Email} đổi mật khẩu, thu hồi các phiên cũ");

        var detailed = await _unitOfWork.Users.GetUserWithDetailsAsync(userId) ?? user;
        return await IssueTokensAsync(detailed);
    }

    /// <summary>
    /// Kiểm tra mật khẩu bằng BCrypt. Tài khoản seed cũ lưu mật khẩu dạng thô: chỉ chấp nhận khi khớp đúng chuỗi đó
    /// và lập tức băm lại bằng BCrypt. (Bỏ fallback "Password123!" cũ — trước đây đăng nhập được MỌI tài khoản có hash không hợp lệ.)
    /// </summary>
    private bool VerifyPassword(User user, string password)
    {
        if (string.IsNullOrEmpty(password) || string.IsNullOrEmpty(user.PasswordHash)) return false;
        if (user.PasswordHash.StartsWith("$2", StringComparison.Ordinal))
        {
            try { return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash); }
            catch (BCrypt.Net.SaltParseException) { return false; }
        }

        var legacyMatch = CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(password), Encoding.UTF8.GetBytes(user.PasswordHash));
        if (legacyMatch)
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
            _log.LogInformation("[Auth] Đã băm lại mật khẩu dạng thô của user {UserId} sang BCrypt", user.Id);
        }
        return legacyMatch;
    }

    // ---------------- Token ----------------

    private int AccessTokenDays => Math.Clamp(int.TryParse(_config["Jwt:ExpiryDays"], out var d) ? d : 7, 1, 30);
    private int RefreshTokenDays => Math.Clamp(int.TryParse(_config["Jwt:RefreshTokenDays"], out var d) ? d : 30, 1, 180);

    /// <summary>Phát access token + refresh token mới (lưu hash refresh token vào DB).</summary>
    private async Task<AuthResponse> IssueTokensAsync(User user)
    {
        var (raw, entity) = NewRefreshToken(user.Id);
        _unitOfWork.Context.RefreshTokens.Add(entity);

        // Dọn refresh token đã hết hạn/thu hồi quá 30 ngày của user này
        var cutoff = DateTime.UtcNow.AddDays(-30);
        var stale = await _unitOfWork.Context.RefreshTokens
            .Where(t => t.UserId == user.Id && (t.ExpiresAt < cutoff || (t.RevokedAt != null && t.RevokedAt < cutoff)))
            .ToListAsync();
        _unitOfWork.Context.RefreshTokens.RemoveRange(stale);

        await _unitOfWork.CommitAsync();
        return BuildAuthResponse(user, raw, entity.ExpiresAt);
    }

    private AuthResponse BuildAuthResponse(User user, string refreshToken, DateTime refreshExpiresAt)
    {
        var expiresAt = DateTime.UtcNow.AddDays(AccessTokenDays);
        return new AuthResponse
        {
            Token = GenerateJwtToken(user, expiresAt),
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            RefreshTokenExpiresAt = refreshExpiresAt,
            User = MapUserToDto(user)
        };
    }

    private (string Raw, RefreshToken Entity) NewRefreshToken(int userId)
    {
        var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        return (raw, new RefreshToken
        {
            UserId = userId,
            TokenHash = HashToken(raw),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays),
        });
    }

    private static string HashToken(string raw) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw))).ToLowerInvariant();

    /// <summary>Tên claim chứa User.TokenVersion — Program.cs đối chiếu ở mỗi request.</summary>
    public const string TokenVersionClaim = "tv";

    private string GenerateJwtToken(User user, DateTime expiresAt)
    {
        var secret = _config["Jwt:Key"] ?? "VeggieAI_Super_Secret_Key_2026_Enterprise_Edition_Must_Be_Long_Enough!";
        var issuer = _config["Jwt:Issuer"] ?? "VeggieAI";
        var audience = _config["Jwt:Audience"] ?? "VeggieAIClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName),
            new(ClaimTypes.Role, user.Role),
            new("status", user.Status),
            new(TokenVersionClaim, user.TokenVersion.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public static UserDto MapUserToDto(User user)
    {
        var allergies = user.UserAllergies?
            .Select(ua => ua.Allergy?.Name ?? "")
            .Where(n => !string.IsNullOrEmpty(n))
            .ToList() ?? new List<string>();

        if (allergies.Count == 0) allergies.Add("Không");

        var diet = "vegan";
        if (user.HealthProfile != null)
        {
            diet = user.HealthProfile.HealthGoal switch
            {
                "loss" => "vegan",
                "gain" => "lacto-ovo",
                _ => "flexitarian"
            };
        }

        return new UserDto
        {
            Id = $"USR-{user.Id:D4}",
            Name = user.DisplayName,
            Email = user.Email,
            Avatar = string.IsNullOrWhiteSpace(user.AvatarUrl)
                ? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(user.DisplayName)}&background=006948&color=ffffff&bold=true"
                : user.AvatarUrl,
            HasCustomAvatar = !string.IsNullOrWhiteSpace(user.AvatarUrl),
            DietType = diet,
            Role = user.Role,
            Status = user.Status,
            JoinedDate = user.CreatedAt.ToString("yyyy-MM-dd"),
            RecipesCount = user.CreatedRecipes?.Count ?? 0,
            AiQueriesCount = 0, // GetCurrentUserAsync điền số thật
            Bio = $"Thành viên {user.Role} hệ thống VeggieAI.",
            Allergies = allergies,
            HasHealthProfile = user.HealthProfile != null
        };
    }
}
