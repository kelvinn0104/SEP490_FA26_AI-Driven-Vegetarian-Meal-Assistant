using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChallengesController : ControllerBase
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
    public async Task<ActionResult<ApiResponse<VeganChallengeDto>>> CreateChallenge([FromBody] CreateVeganChallengeRequest request)
    {
        var modId = GetCurrentUserId();
        var item = await _challengeService.CreateChallengeAsync(request, modId);
        return CreatedAtAction(nameof(GetChallenge), new { id = item.Id }, ApiResponse<VeganChallengeDto>.Ok(item, "Tạo thử thách lối sống chay thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<VeganChallengeDto>>> UpdateChallenge(int id, [FromBody] UpdateVeganChallengeRequest request)
    {
        var modId = GetCurrentUserId();
        var item = await _challengeService.UpdateChallengeAsync(id, request, modId);
        if (item == null) return NotFound(ApiResponse<VeganChallengeDto>.Fail("Không tìm thấy thử thách cần cập nhật"));
        return Ok(ApiResponse<VeganChallengeDto>.Ok(item, "Cập nhật thử thách thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteChallenge(int id)
    {
        var ok = await _challengeService.DeleteChallengeAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thử thách cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá thử thách thành công"));
    }

    [HttpGet("checkins")]
    public async Task<ActionResult<ApiResponse<List<ChallengeCheckinDto>>>> GetCheckins(
        [FromQuery] int? challengeId,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var list = await _challengeService.GetCheckinsQueueAsync(challengeId, status, search);
        return Ok(ApiResponse<List<ChallengeCheckinDto>>.Ok(list));
    }

    [HttpPost("checkins/{id}/review")]
    public async Task<ActionResult<ApiResponse<bool>>> ReviewCheckin(int id, [FromBody] ReviewCheckinRequest request)
    {
        var reviewerId = GetCurrentUserId();
        var ok = await _challengeService.ReviewCheckinAsync(id, request, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy lượt điểm danh check-in"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã duyệt và gửi nhận xét dinh dưỡng thành công"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 1;
    }
}

