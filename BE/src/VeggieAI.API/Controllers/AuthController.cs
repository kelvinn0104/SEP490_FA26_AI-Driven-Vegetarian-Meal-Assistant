using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Đăng ký tài khoản (role = user).</summary>
    [HttpPost("register"), AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req, CancellationToken ct) =>
        Ok(await _auth.RegisterAsync(req, ct));

    /// <summary>Đăng nhập → JWT (dán vào nút Authorize của Swagger: chỉ cần token).</summary>
    [HttpPost("login"), AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req, CancellationToken ct) =>
        Ok(await _auth.LoginAsync(req, ct));

    [HttpGet("me"), Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct) => Ok(await _auth.GetMeAsync(UserId, ct));

    [HttpPut("me"), Authorize]
    public async Task<ActionResult<UserDto>> UpdateMe(UpdateMeRequest req, CancellationToken ct) =>
        Ok(await _auth.UpdateMeAsync(UserId, req, ct));

    [HttpPost("change-password"), Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest req, CancellationToken ct)
    {
        await _auth.ChangePasswordAsync(UserId, req, ct);
        return NoContent();
    }
}
