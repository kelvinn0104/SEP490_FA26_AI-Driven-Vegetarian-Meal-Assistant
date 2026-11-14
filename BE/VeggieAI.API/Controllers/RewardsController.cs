using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RewardsController : ControllerBase
{
    private readonly IRewardService _rewardService;

    public RewardsController(IRewardService rewardService)
    {
        _rewardService = rewardService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<EcoRewardDto>>>> GetRewards(
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var list = await _rewardService.GetRewardsAsync(category, status, search);
        return Ok(ApiResponse<List<EcoRewardDto>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<RewardOverviewStatsDto>>> GetStats()
    {
        var stats = await _rewardService.GetStatsAsync();
        return Ok(ApiResponse<RewardOverviewStatsDto>.Ok(stats));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EcoRewardDto>>> CreateReward([FromBody] CreateEcoRewardRequest request)
    {
        var item = await _rewardService.CreateRewardAsync(request);
        return Ok(ApiResponse<EcoRewardDto>.Ok(item, "Tạo phần thưởng đổi điểm thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EcoRewardDto>>> UpdateReward(int id, [FromBody] UpdateEcoRewardRequest request)
    {
        var item = await _rewardService.UpdateRewardAsync(id, request);
        if (item == null) return NotFound(ApiResponse<EcoRewardDto>.Fail("Không tìm thấy phần thưởng cần cập nhật"));
        return Ok(ApiResponse<EcoRewardDto>.Ok(item, "Cập nhật phần thưởng thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteReward(int id)
    {
        var ok = await _rewardService.DeleteRewardAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy phần thưởng cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá phần thưởng thành công"));
    }

    [HttpGet("claims")]
    public async Task<ActionResult<ApiResponse<List<RewardClaimDto>>>> GetClaims(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var list = await _rewardService.GetClaimsAsync(status, search);
        return Ok(ApiResponse<List<RewardClaimDto>>.Ok(list));
    }

    [HttpPost("claims/{id}/process")]
    public async Task<ActionResult<ApiResponse<bool>>> ProcessClaim(int id, [FromBody] ProcessClaimRequest request)
    {
        var handlerId = GetCurrentUserId();
        var ok = await _rewardService.ProcessClaimAsync(id, request, handlerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu đổi thưởng"));
        return Ok(ApiResponse<bool>.Ok(true, "Xử lý duyệt yêu cầu đổi thưởng thành công"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 1;
    }
}

