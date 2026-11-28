using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsersAsync(int actorId, string actorRole, string? search = null, string? diet = null, string? role = null, string? status = null);
    Task<UserDto?> GetUserByIdAsync(string id, int actorId, string actorRole);
    Task<UserDto> CreateUserAsync(CreateUserRequest request, int actorId, string actorRole);
    Task<bool> LockUserAsync(string id, int actorId, string actorRole, string? reason = null);
    Task<bool> UnlockUserAsync(string id, int actorId, string actorRole);
    Task<bool> UpdateUserRoleAsync(string id, string role, int actorId, string actorRole);
    Task<bool> DeleteUserAsync(string id, int actorId, string actorRole);
}

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    private async Task<bool> HasModPermissionAsync(string permissionId)
    {
        return await _unitOfWork.Context.RolePermissions
            .AnyAsync(rp => rp.RoleId == RoleConstants.Mod && rp.PermissionId == permissionId);
    }

    public async Task<List<UserDto>> GetUsersAsync(int actorId, string actorRole, string? search = null, string? diet = null, string? role = null, string? status = null)
    {
        var normalizedActor = RoleConstants.Normalize(actorRole);
        if (normalizedActor == RoleConstants.Mod)
        {
            if (!await HasModPermissionAsync("usr_read"))
            {
                throw new ForbiddenAccessException("Tài khoản Mod chưa được cấp quyền xem danh sách tài khoản (usr_read).");
            }
        }
        else if (normalizedActor != RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException();
        }

        string? normalizedFilterRole = null;
        if (!string.IsNullOrWhiteSpace(role) && role != "all")
        {
            normalizedFilterRole = RoleConstants.Normalize(role);
        }

        var users = await _unitOfWork.Users.GetFilteredUsersAsync(search, normalizedFilterRole, status);

        // Mod only views standard User accounts (cannot inspect/manage SuperAdmin or Mod)
        if (normalizedActor == RoleConstants.Mod)
        {
            users = users.Where(u => RoleConstants.Normalize(u.Role) == RoleConstants.User).ToList();
        }

        var aiLogCounts = await _unitOfWork.Context.AiModelLogs
            .Where(l => l.UserId != null)
            .GroupBy(l => l.UserId!.Value)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count);

        var dtos = users.Select(u =>
        {
            var aiCount = aiLogCounts.TryGetValue(u.Id, out var c) ? c : 0;
            return AuthService.MapUserToDto(u, null, aiCount);
        }).ToList();

        if (!string.IsNullOrWhiteSpace(diet) && diet != "all")
        {
            var targetDiet = diet == "ovo-lacto" ? "lacto-ovo" : diet;
            dtos = dtos.Where(u => u.DietType.Equals(targetDiet, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return dtos;
    }

    public async Task<UserDto?> GetUserByIdAsync(string id, int actorId, string actorRole)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetUserWithDetailsAsync(intId);
        if (user == null) return null;

        var normalizedActor = RoleConstants.Normalize(actorRole);
        if (normalizedActor == RoleConstants.Mod)
        {
            if (!await HasModPermissionAsync("usr_read") || RoleConstants.Normalize(user.Role) != RoleConstants.User)
            {
                throw new ForbiddenAccessException("Mod chỉ được xem thông tin tài khoản người dùng thông thường khi được cấp quyền.");
            }
        }

        var aiCount = await _unitOfWork.Context.AiModelLogs.CountAsync(l => l.UserId == user.Id);
        return AuthService.MapUserToDto(user, null, aiCount);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request, int actorId, string actorRole)
    {
        var normalizedActor = RoleConstants.Normalize(actorRole);
        var targetRole = RoleConstants.Normalize(request.Role);

        if (normalizedActor != RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException("Chỉ SuperAdmin mới có quyền tạo mới tài khoản hoặc cấp tài khoản Mod.");
        }

        var existing = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existing != null)
        {
            throw new InvalidOperationException("Email này đã được sử dụng trên hệ thống.");
        }

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
        {
            throw new ArgumentException("Mật khẩu khởi tạo phải có tối thiểu 6 ký tự.");
        }

        var user = new User
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            DisplayName = request.Name.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = targetRole,
            Status = "active",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CommitAsync();

        var hp = new HealthProfile
        {
            UserId = user.Id,
            Gender = "female",
            DateOfBirth = new DateOnly(2000, 1, 1),
            HeightCm = 165m,
            WeightKg = 55m,
            ActivityLevel = "moderate",
            HealthGoal = request.DietType switch
            {
                "vegan" => "loss",
                "lacto-ovo" or "ovo-lacto" => "gain",
                _ => "maintain"
            }
        };
        await _unitOfWork.Context.HealthProfiles.AddAsync(hp);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = actorId,
            Action = targetRole == RoleConstants.Mod ? "Tạo tài khoản Mod" : "Tạo tài khoản mới",
            Target = user.Email,
            Details = $"Tạo tài khoản {user.Email} với vai trò {targetRole}",
            LogType = "user_management",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CommitAsync();

        user.HealthProfile = hp;
        return AuthService.MapUserToDto(user, null, 0);
    }

    public async Task<bool> LockUserAsync(string id, int actorId, string actorRole, string? reason = null)
    {
        var intId = ParseUserId(id);
        if (intId == actorId)
        {
            throw new InvalidOperationException("Không thể tự khóa tài khoản đang đăng nhập của chính bạn.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        var normalizedActor = RoleConstants.Normalize(actorRole);
        var targetRole = RoleConstants.Normalize(user.Role);

        if (targetRole == RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException("Không được phép khóa tài khoản SuperAdmin.");
        }

        if (normalizedActor == RoleConstants.Mod)
        {
            if (targetRole != RoleConstants.User)
            {
                throw new ForbiddenAccessException("Mod không có quyền khóa tài khoản quản trị hoặc Mod khác.");
            }
            if (!await HasModPermissionAsync("usr_write"))
            {
                throw new ForbiddenAccessException("Tài khoản Mod chưa được cấp quyền khóa tài khoản (usr_write).");
            }
        }

        user.Status = "locked";
        _unitOfWork.Users.Update(user);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = actorId,
            Action = "Khóa tài khoản",
            Target = user.Email,
            Details = string.IsNullOrWhiteSpace(reason)
                ? $"Khóa tài khoản {user.Email} ({targetRole})"
                : $"Khóa tài khoản {user.Email} ({targetRole}) - Lý do: {reason}",
            LogType = "user_management",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> UnlockUserAsync(string id, int actorId, string actorRole)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        var normalizedActor = RoleConstants.Normalize(actorRole);
        var targetRole = RoleConstants.Normalize(user.Role);

        if (normalizedActor == RoleConstants.Mod)
        {
            if (targetRole != RoleConstants.User || !await HasModPermissionAsync("usr_write"))
            {
                throw new ForbiddenAccessException("Mod không đủ quyền mở khóa tài khoản này.");
            }
        }

        user.Status = "active";
        _unitOfWork.Users.Update(user);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = actorId,
            Action = "Mở khóa tài khoản",
            Target = user.Email,
            Details = $"Mở khóa tài khoản {user.Email}",
            LogType = "user_management",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> UpdateUserRoleAsync(string id, string role, int actorId, string actorRole)
    {
        var normalizedActor = RoleConstants.Normalize(actorRole);
        if (normalizedActor != RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException("Chỉ SuperAdmin mới có quyền thay đổi vai trò tài khoản.");
        }

        var intId = ParseUserId(id);
        if (intId == actorId)
        {
            throw new InvalidOperationException("Không thể tự thay đổi vai trò của tài khoản SuperAdmin đang đăng nhập.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        var oldRole = RoleConstants.Normalize(user.Role);
        var newRole = RoleConstants.Normalize(role);

        if (oldRole == RoleConstants.SuperAdmin && newRole != RoleConstants.SuperAdmin)
        {
            var adminCount = await _unitOfWork.Context.Users.CountAsync(u => u.Role == RoleConstants.SuperAdmin && u.Status == "active");
            if (adminCount <= 1)
            {
                throw new InvalidOperationException("Hệ thống phải giữ tối thiểu 1 tài khoản SuperAdmin hoạt động.");
            }
        }

        user.Role = newRole;
        _unitOfWork.Users.Update(user);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = actorId,
            Action = "Cập nhật vai trò",
            Target = user.Email,
            Details = $"Chuyển vai trò của {user.Email} từ {oldRole} sang {newRole}",
            LogType = "role_management",
            CreatedAt = DateTime.UtcNow
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(string id, int actorId, string actorRole)
    {
        if (RoleConstants.Normalize(actorRole) != RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException("Chỉ SuperAdmin mới có quyền xóa tài khoản.");
        }

        var intId = ParseUserId(id);
        if (intId == actorId)
        {
            throw new InvalidOperationException("Không thể tự xóa tài khoản đang đăng nhập.");
        }

        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        if (RoleConstants.Normalize(user.Role) == RoleConstants.SuperAdmin)
        {
            throw new ForbiddenAccessException("Không được phép xóa tài khoản SuperAdmin.");
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = actorId,
            Action = "Xóa tài khoản",
            Target = user.Email,
            Details = $"Đã xóa tài khoản {user.Email} (Vai trò: {user.Role})",
            LogType = "user_management",
            CreatedAt = DateTime.UtcNow
        });

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public static int ParseUserId(string id)
    {
        if (int.TryParse(id, out var num)) return num;
        if (id.StartsWith("USR-", StringComparison.OrdinalIgnoreCase) && int.TryParse(id[4..], out var parsedNum))
        {
            return parsedNum;
        }
        return 0;
    }
}
