namespace VeggieAI.Model.Constants;

public static class RoleConstants
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Mod = "Mod";
    public const string User = "User";

    // Authorization Policy Names
    public const string ManagementAccessPolicy = "ManagementAccess";
    public const string SuperAdminOnlyPolicy = "SuperAdminOnly";
    public const string ModOnlyPolicy = "ModOnly";
    public const string AuthenticatedUserPolicy = "AuthenticatedUser";

    public static string Normalize(string? rawRole)
    {
        if (string.IsNullOrWhiteSpace(rawRole))
            return User;

        return rawRole.Trim().ToLowerInvariant() switch
        {
            "superadmin" or "super_admin" or "super admin" or "admin" or "role-1" or "quản trị viên cao cấp" => SuperAdmin,
            "mod" or "moderator" or "role-2" or "chuyên gia dinh dưỡng" or "điều phối viên" => Mod,
            _ => User
        };
    }

    public static bool IsValidRole(string? rawRole)
    {
        if (string.IsNullOrWhiteSpace(rawRole)) return false;
        return rawRole.Trim() is SuperAdmin or Mod or User
            || rawRole.Trim().ToLowerInvariant() is "superadmin" or "super_admin" or "admin" or "mod" or "moderator" or "user";
    }

    public static bool IsManagementRole(string? role)
    {
        var normalized = Normalize(role);
        return normalized == SuperAdmin || normalized == Mod;
    }

    public static string GetDisplayName(string? role) => Normalize(role) switch
    {
        SuperAdmin => "Super Admin",
        Mod => "Điều phối viên (Mod)",
        _ => "Người dùng"
    };
}

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string message = "Bạn không có quyền thực hiện thao tác này.") : base(message)
    {
    }
}
