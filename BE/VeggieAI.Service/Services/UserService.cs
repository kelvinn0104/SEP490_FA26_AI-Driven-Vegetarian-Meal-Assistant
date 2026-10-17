using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IUserService
{
    Task<List<UserDto>> GetUsersAsync(string? search = null, string? diet = null, string? role = null, string? status = null);
    Task<UserDto?> GetUserByIdAsync(string id);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<bool> LockUserAsync(string id);
    Task<bool> UnlockUserAsync(string id);
    Task<bool> UpdateUserRoleAsync(string id, string role);
    Task<bool> DeleteUserAsync(string id);
}

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<UserDto>> GetUsersAsync(string? search = null, string? diet = null, string? role = null, string? status = null)
    {
        var users = await _unitOfWork.Users.GetFilteredUsersAsync(search, role, status);
        var dtos = users.Select(AuthService.MapUserToDto).ToList();

        if (!string.IsNullOrWhiteSpace(diet) && diet != "all")
        {
            dtos = dtos.Where(u => u.DietType.Equals(diet, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return dtos;
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetUserWithDetailsAsync(intId);
        return user == null ? null : AuthService.MapUserToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(CreateUserRequest request)
    {
        var existing = await _unitOfWork.Users.GetByEmailAsync(request.Email);
        if (existing != null)
        {
            throw new InvalidOperationException("Email này đã được sử dụng.");
        }

        var password = string.IsNullOrWhiteSpace(request.Password) ? "Password123!" : request.Password;
        var user = new User
        {
            Email = request.Email.Trim().ToLower(),
            DisplayName = request.Name.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = request.Role.ToLower() switch
            {
                "quản trị viên cao cấp" or "admin" => "admin",
                "chuyên gia dinh dưỡng" or "moderator" => "moderator",
                _ => "user"
            },
            Status = "active",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CommitAsync();

        // Create health profile for diet preference
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
                "lacto-ovo" => "gain",
                _ => "maintain"
            }
        };
        await _unitOfWork.Context.HealthProfiles.AddAsync(hp);

        // System Log
        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = "Tạo tài khoản mới",
                Target = user.DisplayName,
                Details = $"Quản trị viên đã tạo tài khoản {user.Email} với vai trò {user.Role}",
                LogType = "user_management",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch { }

        await _unitOfWork.CommitAsync();

        user.HealthProfile = hp;
        return AuthService.MapUserToDto(user);
    }

    public async Task<bool> LockUserAsync(string id)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        user.Status = "locked";
        _unitOfWork.Users.Update(user);

        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = "Khóa tài khoản",
                Target = user.DisplayName,
                Details = $"Khóa tài khoản người dùng: {user.Email}",
                LogType = "user_management",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch { }

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> UnlockUserAsync(string id)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        user.Status = "active";
        _unitOfWork.Users.Update(user);

        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = "Mở khóa tài khoản",
                Target = user.DisplayName,
                Details = $"Mở khóa tài khoản người dùng: {user.Email}",
                LogType = "user_management",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch { }

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> UpdateUserRoleAsync(string id, string role)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        var oldRole = user.Role;
        user.Role = role.ToLower() switch
        {
            "admin" or "quản trị viên cao cấp" => "admin",
            "moderator" or "chuyên gia dinh dưỡng" => "moderator",
            _ => "user"
        };
        _unitOfWork.Users.Update(user);

        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = user.Id,
                Action = "Cập nhật quyền người dùng",
                Target = user.DisplayName,
                Details = $"Thay đổi vai trò của {user.Email} từ {oldRole} sang {user.Role}",
                LogType = "user_management",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch { }

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> DeleteUserAsync(string id)
    {
        var intId = ParseUserId(id);
        var user = await _unitOfWork.Users.GetByIdAsync(intId);
        if (user == null) return false;

        try
        {
            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                Action = "Xóa người dùng",
                Target = user.DisplayName,
                Details = $"Xóa tài khoản người dùng {user.Email} (ID: {user.Id})",
                LogType = "user_management",
                CreatedAt = DateTime.UtcNow
            });
        }
        catch { }

        _unitOfWork.Users.Delete(user);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public static int ParseUserId(string id)
    {
        if (int.TryParse(id, out var num)) return num;
        if (id.StartsWith("USR-", StringComparison.OrdinalIgnoreCase))
        {
            if (int.TryParse(id[4..], out var parsedNum)) return parsedNum;
        }
        return 0;
    }
}
