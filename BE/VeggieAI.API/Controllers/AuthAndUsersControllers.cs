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

    /// <summary>Bước 1: tạo tài khoản "pending", sinh OTP 6 số và gửi qua email. Không trả JWT.</summary>
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<RegisterPendingResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        var message = result.CodeSent
            ? $"Mã xác thực 6 số đã được gửi tới email {result.Email}"
            : $"Mã xác thực đã được gửi tới email {result.Email} trước đó, vui lòng kiểm tra hộp thư";
        return Ok(ApiResponse<RegisterPendingResponse>.Ok(result, message));
    }

    /// <summary>Bước 2: kiểm tra OTP → kích hoạt tài khoản (active) → trả JWT để đăng nhập luôn.</summary>
    [HttpPost("verify-code")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> VerifyCode([FromBody] VerifyCodeRequest request)
    {
        var result = await _authService.VerifyCodeAsync(request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Xác thực email thành công"));
    }

    /// <summary>Hủy OTP cũ, sinh mã mới và gửi lại (chỉ cho phép sau 60 giây).</summary>
    [HttpPost("resend-code")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<RegisterPendingResponse>>> ResendCode([FromBody] ResendCodeRequest request)
    {
        var result = await _authService.ResendCodeAsync(request);
        return Ok(ApiResponse<RegisterPendingResponse>.Ok(result, $"Đã gửi lại mã xác thực tới email {result.Email}"));
    }

    /// <summary>
    /// Đăng xuất: thu hồi MỌI phiên của tài khoản (access token cũ trả 401 SESSION_REVOKED, refresh token không dùng được nữa).
    /// Body tùy chọn { refreshToken } — dùng khi access token đã hết hạn. Luôn trả 200.
    /// </summary>
    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<string>>> Logout([FromBody] LogoutRequest? request)
    {
        int? userId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;
        await _authService.LogoutAsync(userId, request?.RefreshToken);
        return Ok(ApiResponse<string>.Ok("Logged out", "Đăng xuất thành công"));
    }

    /// <summary>
    /// Đổi refresh token lấy cặp { token, refreshToken } mới. Refresh token cũ hết hiệu lực ngay (rotation).
    /// Lỗi 401 kèm errors[0]: INVALID_REFRESH_TOKEN | REFRESH_TOKEN_EXPIRED | REFRESH_TOKEN_REUSED → FE chuyển về màn đăng nhập.
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Refresh([FromBody] RefreshTokenRequest request)
    {
        var result = await _authService.RefreshAsync(request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Làm mới phiên đăng nhập thành công"));
    }

    /// <summary>Quên mật khẩu bước 1: gửi mã OTP 6 số tới email. Luôn trả 200 (không tiết lộ email có tồn tại hay không).</summary>
    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<ForgotPasswordResponse>>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var result = await _authService.ForgotPasswordAsync(request);
        return Ok(ApiResponse<ForgotPasswordResponse>.Ok(result,
            $"Nếu {result.Email} đã đăng ký, mã đặt lại mật khẩu đã được gửi tới hộp thư."));
    }

    /// <summary>Quên mật khẩu bước 2: { email, otpCode, newPassword }. Thành công → mọi phiên cũ bị thu hồi, người dùng đăng nhập lại.</summary>
    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<bool>>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(ApiResponse<bool>.Ok(true, "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới."));
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

    /// <summary>
    /// Cập nhật hồ sơ: { displayName?, avatarUrl? } — avatarUrl lấy từ POST /api/uploads (purpose = avatar), "" để bỏ ảnh.
    /// </summary>
    [HttpPut("me")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateMe([FromBody] UpdateMeRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(ApiResponse<UserDto>.Fail("Không xác định được danh tính."));

        var user = await _authService.UpdateMeAsync(userId, request);
        return Ok(ApiResponse<UserDto>.Ok(user, "Cập nhật thông tin thành công"));
    }

    /// <summary>
    /// Đổi mật khẩu (yêu cầu mật khẩu hiện tại). Mọi phiên cũ (kể cả token đang dùng) bị thu hồi;
    /// response trả cặp { token, refreshToken } MỚI — FE thay token đang lưu bằng token này.
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return Unauthorized(ApiResponse<AuthResponse>.Fail("Không xác định được danh tính."));

        var result = await _authService.ChangePasswordAsync(userId, request);
        return Ok(ApiResponse<AuthResponse>.Ok(result, "Đổi mật khẩu thành công"));
    }
}

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = AppRoles.Admin)]
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
