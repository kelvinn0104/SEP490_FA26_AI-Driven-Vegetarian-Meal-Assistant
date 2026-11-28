using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<UserDto?> GetCurrentUserAsync(int userId);
}

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public AuthService(IUnitOfWork unitOfWork, IConfiguration config)
    {
        _unitOfWork = unitOfWork;
        _config = config;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (user == null)
        {
            throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        if (user.Status == "locked")
        {
            throw new ForbiddenAccessException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.");
        }

        bool validPassword;
        try
        {
            validPassword = !string.IsNullOrWhiteSpace(user.PasswordHash)
                            && BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        }
        catch
        {
            validPassword = false;
        }

        if (!validPassword)
        {
            throw new UnauthorizedAccessException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        var normalizedRole = RoleConstants.Normalize(user.Role);
        if (user.Role != normalizedRole)
        {
            user.Role = normalizedRole;
            _unitOfWork.Users.Update(user);
            await _unitOfWork.CommitAsync();
        }

        if (request.PortalOnly && !RoleConstants.IsManagementRole(normalizedRole))
        {
            throw new ForbiddenAccessException("Tài khoản người dùng thông thường không có quyền truy cập cổng quản trị Web.");
        }

        var expiryDays = int.TryParse(_config["Jwt:ExpiryDays"], out var parsedDays) && parsedDays > 0 ? parsedDays : 7;
        var expiresAt = DateTime.UtcNow.AddDays(expiryDays);
        var token = GenerateJwtToken(user, expiresAt);
        var permissions = await GetRolePermissionsAsync(normalizedRole);
        var aiCount = await _unitOfWork.Context.AiModelLogs.CountAsync(l => l.UserId == user.Id);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = user.Id,
            Action = "Đăng nhập hệ thống",
            Target = user.Email,
            Details = $"Đăng nhập thành công với vai trò: {normalizedRole}",
            LogType = "auth",
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.CommitAsync();

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString("N"),
            ExpiresAt = expiresAt,
            User = MapUserToDto(user, permissions, aiCount)
        };
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existing != null)
        {
            throw new InvalidOperationException("Email này đã được sử dụng trên hệ thống.");
        }

        var requestedRole = RoleConstants.Normalize(request.Role);
        if (requestedRole == RoleConstants.SuperAdmin || requestedRole == RoleConstants.Mod)
        {
            var allowInvite = bool.TryParse(_config["Auth:AllowInviteRegistration"], out var parsedAllow) && parsedAllow;
            if (!allowInvite)
            {
                throw new ForbiddenAccessException("Chức năng tự đăng ký tài khoản quản trị đang tắt. Vui lòng liên hệ SuperAdmin cấp tài khoản.");
            }

            var expectedCode = requestedRole == RoleConstants.SuperAdmin
                ? _config["Auth:SuperAdminInviteCode"]
                : _config["Auth:ModInviteCode"];

            if (string.IsNullOrWhiteSpace(expectedCode)
                || string.IsNullOrWhiteSpace(request.InviteCode)
                || !string.Equals(request.InviteCode.Trim(), expectedCode.Trim(), StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Mã mời xác thực vai trò quản trị không hợp lệ.");
            }
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            DisplayName = request.DisplayName.Trim(),
            PasswordHash = passwordHash,
            Role = requestedRole,
            Status = "active",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CommitAsync();

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = user.Id,
            Action = "Đăng ký tài khoản",
            Target = user.Email,
            Details = $"Tạo mới tài khoản {user.Email} với vai trò {user.Role}",
            LogType = "auth",
            CreatedAt = DateTime.UtcNow
        });
        await _unitOfWork.CommitAsync();

        var expiryDays = int.TryParse(_config["Jwt:ExpiryDays"], out var parsedDays) && parsedDays > 0 ? parsedDays : 7;
        var expiresAt = DateTime.UtcNow.AddDays(expiryDays);
        var token = GenerateJwtToken(user, expiresAt);
        var permissions = await GetRolePermissionsAsync(user.Role);

        return new AuthResponse
        {
            Token = token,
            RefreshToken = Guid.NewGuid().ToString("N"),
            ExpiresAt = expiresAt,
            User = MapUserToDto(user, permissions, 0)
        };
    }

    public async Task<UserDto?> GetCurrentUserAsync(int userId)
    {
        var user = await _unitOfWork.Users.GetUserWithDetailsAsync(userId);
        if (user == null || user.Status == "locked")
        {
            return null;
        }

        var normalizedRole = RoleConstants.Normalize(user.Role);
        var permissions = await GetRolePermissionsAsync(normalizedRole);
        var aiCount = await _unitOfWork.Context.AiModelLogs.CountAsync(l => l.UserId == user.Id);
        return MapUserToDto(user, permissions, aiCount);
    }

    private async Task<List<string>> GetRolePermissionsAsync(string normalizedRole)
    {
        var perms = await _unitOfWork.Context.RolePermissions
            .Where(rp => rp.RoleId == normalizedRole)
            .Select(rp => rp.PermissionId)
            .ToListAsync();

        if (perms.Count == 0)
        {
            if (normalizedRole == RoleConstants.SuperAdmin)
            {
                return new List<string> { "usr_read", "usr_write", "usr_role", "nutri_read", "sys_log", "sys_ai" };
            }
            if (normalizedRole == RoleConstants.Mod)
            {
                return new List<string> { "usr_read", "nutri_read", "nutri_write", "content_approve", "content_delete", "ops_manage" };
            }
        }

        return perms;
    }

    private string GenerateJwtToken(User user, DateTime expiresAt)
    {
        var secret = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"];
        var audience = _config["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(secret) || Encoding.UTF8.GetByteCount(secret) < 32)
        {
            throw new InvalidOperationException("Chưa cấu hình khóa bí mật JWT hợp lệ.");
        }

        if (string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("Chưa cấu hình Jwt:Issuer hoặc Jwt:Audience.");
        }

        var normalizedRole = RoleConstants.Normalize(user.Role);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.DisplayName),
            new(ClaimTypes.Role, normalizedRole),
            new("status", user.Status)
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

    public static UserDto MapUserToDto(User user, List<string>? permissions = null, int aiQueriesCount = 0)
    {
        var normalizedRole = RoleConstants.Normalize(user.Role);
        var allergies = user.UserAllergies?
            .Select(ua => ua.Allergy?.Name ?? "")
            .Where(n => !string.IsNullOrEmpty(n))
            .ToList() ?? new List<string>();

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
            NumericId = user.Id,
            Name = user.DisplayName,
            Email = user.Email,
            Avatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(user.DisplayName)}&background=006948&color=ffffff&bold=true",
            DietType = diet,
            Role = normalizedRole,
            RoleDisplayName = RoleConstants.GetDisplayName(normalizedRole),
            Status = user.Status,
            JoinedDate = user.CreatedAt.ToString("yyyy-MM-dd"),
            RecipesCount = user.CreatedRecipes?.Count ?? 0,
            AiQueriesCount = aiQueriesCount,
            Bio = $"Tài khoản {RoleConstants.GetDisplayName(normalizedRole)} trên nền tảng VeggieAI.",
            Allergies = allergies,
            Permissions = permissions ?? new List<string>()
        };
    }
}
