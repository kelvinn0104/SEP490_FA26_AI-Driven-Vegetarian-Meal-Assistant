using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
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
    public ActionResult<ApiResponse<string>> Logout()
    {
        return Ok(ApiResponse<string>.Ok("Logged out", "Đăng xuất thành công"));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetMe()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId))
        {
            return Unauthorized(ApiResponse<UserDto>.Fail("Không xác định được danh tính."));
        }

        var user = await _authService.GetCurrentUserAsync(userId);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.Fail("Người dùng không tồn tại."));
        }

        return Ok(ApiResponse<UserDto>.Ok(user));
    }
}

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
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
        var users = await _userService.GetUsersAsync(search, diet, role, status);
        return Ok(ApiResponse<List<UserDto>>.Ok(users));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(string id)
    {
        var user = await _userService.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<UserDto>.Fail("Không tìm thấy người dùng."));
        }
        return Ok(ApiResponse<UserDto>.Ok(user));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserRequest request)
    {
        var created = await _userService.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUserById), new { id = created.Id }, ApiResponse<UserDto>.Ok(created, "Tạo tài khoản thành công"));
    }

    [HttpPut("{id}/lock")]
    public async Task<ActionResult<ApiResponse<bool>>> LockUser(string id)
    {
        var ok = await _userService.LockUserAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã khóa tài khoản thành công"));
    }

    [HttpPut("{id}/unlock")]
    public async Task<ActionResult<ApiResponse<bool>>> UnlockUser(string id)
    {
        var ok = await _userService.UnlockUserAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã mở khóa tài khoản thành công"));
    }

    [HttpPut("{id}/role")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateUserRole(string id, [FromBody] UpdateUserRoleRequest request)
    {
        var ok = await _userService.UpdateUserRoleAsync(id, request.Role);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật phân quyền thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteUser(string id)
    {
        var ok = await _userService.DeleteUserAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy người dùng"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa người dùng"));
    }
}
