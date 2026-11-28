using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
public class ChallengesController : ApiControllerBase
{
    private readonly IVeganChallengeService _challengeService;

    public ChallengesController(IVeganChallengeService challengeService)
    {
        _challengeService = challengeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<VeganChallengeDto>>>> GetChallenges(
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] string? difficulty,
        [FromQuery] string? search)
    {
        var result = await _challengeService.GetChallengesAsync(status, category, difficulty, search);
        return Ok(ApiResponse<List<VeganChallengeDto>>.Ok(result));
    }

    [HttpGet("stats")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<ChallengeOverviewStatsDto>>> GetStats()
    {
        var stats = await _challengeService.GetStatsAsync();
        return Ok(ApiResponse<ChallengeOverviewStatsDto>.Ok(stats));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<VeganChallengeDto>>> GetChallenge(int id)
    {
        var item = await _challengeService.GetChallengeByIdAsync(id);
        if (item == null) return NotFound(ApiResponse<VeganChallengeDto>.Fail("Không tìm thấy thử thách"));
        return Ok(ApiResponse<VeganChallengeDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<VeganChallengeDto>>> CreateChallenge([FromBody] CreateVeganChallengeRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _challengeService.CreateChallengeAsync(request, modId);
        return CreatedAtAction(nameof(GetChallenge), new { id = item.Id }, ApiResponse<VeganChallengeDto>.Ok(item, "Tạo thử thách lối sống chay thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<VeganChallengeDto>>> UpdateChallenge(int id, [FromBody] UpdateVeganChallengeRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _challengeService.UpdateChallengeAsync(id, request, modId);
        if (item == null) return NotFound(ApiResponse<VeganChallengeDto>.Fail("Không tìm thấy thử thách cần cập nhật"));
        return Ok(ApiResponse<VeganChallengeDto>.Ok(item, "Cập nhật thử thách thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteChallenge(int id)
    {
        var modId = GetRequiredUserId();
        var ok = await _challengeService.DeleteChallengeAsync(id, modId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thử thách cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá thử thách thành công"));
    }

    [HttpPost("{id}/checkins")]
    [Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
    public async Task<ActionResult<ApiResponse<ChallengeCheckinDto>>> SubmitCheckin(int id, [FromBody] CreateChallengeCheckinRequest request)
    {
        var userId = GetRequiredUserId();
        var item = await _challengeService.SubmitCheckinAsync(id, request, userId);
        if (item == null) return NotFound(ApiResponse<ChallengeCheckinDto>.Fail("Không tìm thấy thử thách hoặc thử thách chưa mở"));
        return Ok(ApiResponse<ChallengeCheckinDto>.Ok(item, "Điểm danh thử thách thành công, đang chờ chuyên gia duyệt"));
    }

    [HttpGet("checkins")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<List<ChallengeCheckinDto>>>> GetCheckins(
        [FromQuery] int? challengeId,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var list = await _challengeService.GetCheckinsQueueAsync(challengeId, status, search);
        return Ok(ApiResponse<List<ChallengeCheckinDto>>.Ok(list));
    }

    [HttpPost("checkins/{id}/review")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> ReviewCheckin(int id, [FromBody] ReviewCheckinRequest request)
    {
        var reviewerId = GetRequiredUserId();
        var ok = await _challengeService.ReviewCheckinAsync(id, request, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy lượt điểm danh check-in"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt và gửi nhận xét dinh dưỡng thành công"));
    }
}
