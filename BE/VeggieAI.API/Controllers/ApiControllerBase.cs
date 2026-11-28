using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;

namespace VeggieAI.API.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected int GetRequiredUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(idStr, out var userId) || userId <= 0)
        {
            throw new UnauthorizedAccessException("Phiên đăng nhập không hợp lệ hoặc thiếu định danh người dùng.");
        }

        return userId;
    }

    protected string GetCurrentUserRole()
    {
        var rawRole = User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrWhiteSpace(rawRole))
        {
            throw new UnauthorizedAccessException("Không xác định được vai trò người dùng từ phiên đăng nhập.");
        }

        return RoleConstants.Normalize(rawRole);
    }

    protected bool IsSuperAdmin => GetCurrentUserRole() == RoleConstants.SuperAdmin;
    protected bool IsMod => GetCurrentUserRole() == RoleConstants.Mod;
}
