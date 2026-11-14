namespace VeggieAI.Model.DTOs;

/// <summary>Tên vai trò dùng trong claim JWT (ClaimTypes.Role) và [Authorize(Roles = ...)].</summary>
public static class AppRoles
{
    public const string Admin = "admin";
    public const string Moderator = "moderator";
    public const string User = "user";

    /// <summary>Admin hoặc Moderator (dùng cho [Authorize(Roles = AppRoles.Staff)]).</summary>
    public const string Staff = Admin + "," + Moderator;

    public static bool IsStaff(string? role) =>
        string.Equals(role, Admin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, Moderator, StringComparison.OrdinalIgnoreCase);
}
