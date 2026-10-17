using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Constants;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Auth;

public class AuthService : IAuthService
{
    private readonly VeggieAiDbContext _db;
    private readonly JwtTokenService _jwt;
    private readonly IPasswordHasher<User> _hasher;

    public AuthService(VeggieAiDbContext db, JwtTokenService jwt, IPasswordHasher<User> hasher)
    {
        _db = db; _jwt = jwt; _hasher = hasher;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct = default)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email, ct))
            throw AppException.Conflict("Email đã được sử dụng.");

        var user = new User
        {
            Email = email,
            DisplayName = req.DisplayName.Trim(),
            Role = Roles.User,
            Status = UserStatuses.Active,
        };
        user.PasswordHash = _hasher.HashPassword(user, req.Password);
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return Issue(user, false);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, CancellationToken ct = default)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email, ct)
                   ?? throw AppException.Unauthorized("Email hoặc mật khẩu không đúng.");

        PasswordVerificationResult result;
        try { result = _hasher.VerifyHashedPassword(user, user.PasswordHash, req.Password); }
        catch (FormatException) { result = PasswordVerificationResult.Failed; }   // seed/system accounts
        if (result == PasswordVerificationResult.Failed)
            throw AppException.Unauthorized("Email hoặc mật khẩu không đúng.");
        if (user.Status == UserStatuses.Locked)
            throw AppException.Forbidden("Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.");

        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _hasher.HashPassword(user, req.Password);
            await _db.SaveChangesAsync(ct);
        }
        var hasProfile = await _db.HealthProfiles.AnyAsync(h => h.UserId == user.Id, ct);
        return Issue(user, hasProfile);
    }

    public async Task<UserDto> GetMeAsync(int userId, CancellationToken ct = default)
    {
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct)
                   ?? throw AppException.NotFound("Người dùng");
        return ToDto(user, await _db.HealthProfiles.AnyAsync(h => h.UserId == userId, ct));
    }

    public async Task<UserDto> UpdateMeAsync(int userId, UpdateMeRequest req, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct) ?? throw AppException.NotFound("Người dùng");
        user.DisplayName = req.DisplayName.Trim();
        await _db.SaveChangesAsync(ct);
        return ToDto(user, await _db.HealthProfiles.AnyAsync(h => h.UserId == userId, ct));
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest req, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct) ?? throw AppException.NotFound("Người dùng");
        if (_hasher.VerifyHashedPassword(user, user.PasswordHash, req.CurrentPassword) == PasswordVerificationResult.Failed)
            throw new AppException("Mật khẩu hiện tại không đúng.");
        user.PasswordHash = _hasher.HashPassword(user, req.NewPassword);
        await _db.SaveChangesAsync(ct);
    }

    private AuthResponse Issue(User user, bool hasProfile)
    {
        var (token, exp) = _jwt.Create(user);
        return new AuthResponse(token, exp, ToDto(user, hasProfile));
    }

    private static UserDto ToDto(User u, bool hasProfile) =>
        new(u.Id, u.Email, u.DisplayName, u.Role, u.Status, u.CreatedAt, hasProfile);
}
