using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
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

        // Verify password
        bool validPassword = false;
        try
        {
            validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            // Fallback for seed testing if raw match
            validPassword = request.Password == "Password123!" || request.Password == user.PasswordHash;
        }

        if (!validPassword)
        {
            throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // Chỉ báo "chưa xác thực" SAU khi mật khẩu đúng (tránh lộ thông tin tài khoản)
        if (user.Status == StatusPending)
        {
            throw new EmailNotVerifiedException(user.Email,
                "Tài khoản chưa xác thực email. Vui lòng nhập mã OTP đã gửi tới email hoặc bấm \"Gửi lại mã\".");
        }

        var token = GenerateJwtToken(user);
        var expiresAt = DateTime.UtcNow.AddDays(7);

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

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString("N"),
            ExpiresAt = expiresAt,
            User = MapUserToDto(user)
        };
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

        var allowedRole = (request.Role ?? "user").ToLower() switch
        {
            "admin" when request.InviteCode == "VEGGIE2026" || request.InviteCode == "VEGGIE_ADMIN_2026" => "admin",
            "moderator" or "mod" => "moderator",
            _ => "user"
        };

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
        var cooldown = _otp.GetResendRemainingSeconds(user.Email);
        if (existing != null && cooldown > 0)
        {
            return new RegisterPendingResponse
            {
                Email = user.Email,
                CodeSent = false,
                ExpiresInSeconds = _otp.GetCodeRemainingSeconds(user.Email),
                ResendAfterSeconds = cooldown
            };
        }

        return await IssueAndSendOtpAsync(user);
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

        var result = _otp.Verify(email, request.OtpCode);
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

        return new AuthResponse
        {
            Token = GenerateJwtToken(user),
            RefreshToken = Guid.NewGuid().ToString("N"),
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            User = MapUserToDto(user)
        };
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
        // Ném TooManyRequestsException (HTTP 429) nếu chưa hết thời gian chờ
        var issued = _otp.Issue(user.Email);
        try
        {
            await _email.SendOtpAsync(user.Email, user.DisplayName, issued.Code, _otpOptions.ExpiryMinutes);
        }
        catch (Exception ex)
        {
            _otp.RollbackIssue(user.Email); // cho phép người dùng bấm gửi lại ngay
            _log.LogError(ex, "[OTP] Gửi email OTP tới {Email} thất bại", user.Email);
            throw new InvalidOperationException("Không gửi được email xác thực. Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau.");
        }

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
        return user == null ? null : MapUserToDto(user);
    }

    private string GenerateJwtToken(User user)
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
            new("status", user.Status)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
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
            Avatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(user.DisplayName)}&background=006948&color=ffffff&bold=true",
            DietType = diet,
            Role = user.Role,
            Status = user.Status,
            JoinedDate = user.CreatedAt.ToString("yyyy-MM-dd"),
            RecipesCount = user.CreatedRecipes?.Count ?? 0,
            AiQueriesCount = 12,
            Bio = $"Thành viên {user.Role} hệ thống VeggieAI.",
            Allergies = allergies
        };
    }
}
