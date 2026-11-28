using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Đăng nhập thành công"));
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Đăng ký tài khoản thành công"));
    }

    [HttpPost("logout")]
    [Authorize]
    public ActionResult<ApiResponse<string>> Logout()
    {
        return Ok(ApiResponse<string>.Ok("Logged out", "Đăng xuất thành công"));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        var userId = GetRequiredUserId();
        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return Unauthorized(ApiResponse<UserDto>.Fail("Tài khoản không tồn tại hoặc đã bị khóa."));
        }

        return Ok(ApiResponse<UserDto>.Ok(user));
    }
}

public class LockUserRequest
{
    public string? Reason { get; set; }
}

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
public class UsersController : ApiControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<UserDto>>>> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? diet,
        [FromQuery] string? role,
        [FromQuery] string? status)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var users = await _userService.GetUsersAsync(actorId, actorRole, search, diet, role, status);
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string id)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var user = await _userService.GetUserByIdAsync(id, actorId, actorRole);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.Fail("Không tìm thấy người dùng."));
        }
        return Ok(ApiResponse<UserDto>.Ok(user));
    }

    [HttpPost]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var created = await _userService.CreateUserAsync(request, actorId, actorRole);
        return CreatedAtAction(nameof(GetUserById), new { id = created.Id }, ApiResponse<UserDto>.Ok(created, "Tạo tài khoản thành công"));
    }

    [HttpPut("{id}/lock")]
    public async Task<ActionResult<ApiResponse<bool>>> LockUser(string id, [FromBody] LockUserRequest? request = null)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var ok = await _userService.LockUserAsync(id, actorId, actorRole, request?.Reason);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã khóa tài khoản thành công"));
    }

    [HttpPut("{id}/unlock")]
    public async Task<ActionResult<ApiResponse<bool>>> UnlockUser(string id)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var ok = await _userService.UnlockUserAsync(id, actorId, actorRole);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã mở khóa tài khoản thành công"));
    }

    [HttpPut("{id}/role")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest request)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var ok = await _userService.UpdateUserRoleAsync(id, request.Role, actorId, actorRole);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật phân quyền thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var actorId = GetRequiredUserId();
        var actorRole = GetCurrentUserRole();
        var ok = await _userService.DeleteUserAsync(id, actorId, actorRole);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa người dùng"));
    }
}
