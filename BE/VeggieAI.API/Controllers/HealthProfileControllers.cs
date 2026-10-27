using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Controllers.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

/// <summary>Hồ sơ sức khỏe của người dùng đang đăng nhập (chỉ số cơ thể, mục tiêu, dị ứng).</summary>
[Route("api/health-profile")]
[Authorize]
public class HealthProfileController : AiApiControllerBase
{
    private readonly IHealthProfileService _svc;

    public HealthProfileController(IHealthProfileService svc)
    {
        _svc = svc;
    }

    /// <summary>404 nếu người dùng chưa tạo hồ sơ.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<HealthProfileDto>>> Get(CancellationToken ct)
    {
        var result = await _svc.GetAsync(UserId, ct);
        if (result is null) return NotFound(ApiResponse<HealthProfileDto>.Fail("Bạn chưa tạo hồ sơ sức khỏe."));
        return Ok(ApiResponse<HealthProfileDto>.Ok(result));
    }

    /// <summary>Tạo mới hoặc cập nhật hồ sơ; tự tính lại BMI, TDEE và mục tiêu dinh dưỡng/ngày.</summary>
    [HttpPut]
    public async Task<ActionResult<ApiResponse<HealthProfileDto>>> Upsert([FromBody] HealthProfileRequest req, CancellationToken ct)
    {
        var result = await _svc.UpsertAsync(UserId, req, ct);
        return Ok(ApiResponse<HealthProfileDto>.Ok(result, "Đã lưu hồ sơ sức khỏe"));
    }

    /// <summary>Tính thử BMI/TDEE/mục tiêu mà không lưu (dùng cho form đăng ký).</summary>
    [HttpPost("preview")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<HealthProfilePreviewDto>>> Preview([FromBody] HealthProfileRequest req, CancellationToken ct)
    {
        var result = await _svc.PreviewAsync(req, ct);
        return Ok(ApiResponse<HealthProfilePreviewDto>.Ok(result));
    }

    [HttpGet("allergies")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AllergyDto>>>> GetAllergies(CancellationToken ct)
    {
        var result = await _svc.GetUserAllergiesAsync(UserId, ct);
        return Ok(ApiResponse<IReadOnlyList<AllergyDto>>.Ok(result));
    }

    [HttpPut("allergies")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AllergyDto>>>> SetAllergies([FromBody] UpdateAllergiesRequest req, CancellationToken ct)
    {
        var result = await _svc.SetUserAllergiesAsync(UserId, req.AllergyIds, ct);
        return Ok(ApiResponse<IReadOnlyList<AllergyDto>>.Ok(result, "Đã cập nhật danh sách dị ứng"));
    }
}

/// <summary>Danh mục dị ứng dùng chung.</summary>
[ApiController]
[Route("api/allergies")]
public class AllergiesController : ControllerBase
{
    private readonly IHealthProfileService _svc;

    public AllergiesController(IHealthProfileService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<AllergyDto>>>> GetAll(CancellationToken ct)
    {
        var result = await _svc.GetAllAllergiesAsync(ct);
        return Ok(ApiResponse<IReadOnlyList<AllergyDto>>.Ok(result));
    }
}
