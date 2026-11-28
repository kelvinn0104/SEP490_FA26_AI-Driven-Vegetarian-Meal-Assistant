namespace VeggieAI.Model.DTOs;

/// <summary>Tên vai trò dùng trong claim JWT (ClaimTypes.Role) và [Authorize(Roles = ...)].</summary>
public static class AppRoles
{
    public const string Admin = "admin";
    public const string Moderator = "moderator";
    public const string User = "user";

    public const string SuperAdmin = "SuperAdmin";
    public const string Mod = "Mod";

    /// <summary>Admin hoặc Moderator (dùng cho [Authorize(Roles = AppRoles.Staff)]). Hỗ trợ cả SuperAdmin và Mod.</summary>
    public const string Staff = Admin + "," + Moderator + "," + SuperAdmin + "," + Mod;

    public static bool IsStaff(string? role) =>
        string.Equals(role, Admin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, Moderator, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, SuperAdmin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, Mod, StringComparison.OrdinalIgnoreCase);

    public static bool IsAdmin(string? role) =>
        string.Equals(role, Admin, StringComparison.OrdinalIgnoreCase) ||
        string.Equals(role, SuperAdmin, StringComparison.OrdinalIgnoreCase);
}
