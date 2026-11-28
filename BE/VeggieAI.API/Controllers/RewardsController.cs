using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
public class RewardsController : ApiControllerBase
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
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<RewardOverviewStatsDto>>> GetStats()
    {
        var stats = await _rewardService.GetStatsAsync();
        return Ok(ApiResponse<RewardOverviewStatsDto>.Ok(stats));
    }

    [HttpPost]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<EcoRewardDto>>> CreateReward([FromBody] CreateEcoRewardRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _rewardService.CreateRewardAsync(request, modId);
        return Ok(ApiResponse<EcoRewardDto>.Ok(item, "Tạo phần thưởng đổi điểm thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<EcoRewardDto>>> UpdateReward(int id, [FromBody] UpdateEcoRewardRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _rewardService.UpdateRewardAsync(id, request, modId);
        if (item == null) return NotFound(ApiResponse<EcoRewardDto>.Fail("Không tìm thấy phần thưởng cần cập nhật"));
        return Ok(ApiResponse<EcoRewardDto>.Ok(item, "Cập nhật phần thưởng thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteReward(int id)
    {
        var modId = GetRequiredUserId();
        var ok = await _rewardService.DeleteRewardAsync(id, modId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy phần thưởng cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá phần thưởng thành công"));
    }

    [HttpPost("{id}/claims")]
    [Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
    public async Task<ActionResult<ApiResponse<RewardClaimDto>>> CreateClaim(int id, [FromBody] CreateRewardClaimRequest? request)
    {
        var userId = GetRequiredUserId();
        var claim = await _rewardService.CreateClaimAsync(id, request ?? new CreateRewardClaimRequest(), userId);
        if (claim == null) return BadRequest(ApiResponse<RewardClaimDto>.Fail("Phần thưởng không khả dụng hoặc đã hết tồn kho"));
        return Ok(ApiResponse<RewardClaimDto>.Ok(claim, "Gửi yêu cầu đổi thưởng thành công"));
    }

    [HttpGet("claims")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<List<RewardClaimDto>>>> GetClaims(
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var list = await _rewardService.GetClaimsAsync(status, search);
        return Ok(ApiResponse<List<RewardClaimDto>>.Ok(list));
    }

    [HttpPost("claims/{id}/process")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> ProcessClaim(int id, [FromBody] ProcessClaimRequest request)
    {
        var handlerId = GetRequiredUserId();
        var ok = await _rewardService.ProcessClaimAsync(id, request, handlerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy yêu cầu đổi thưởng"));
        return Ok(ApiResponse<bool>.Ok(true, "Xử lý duyệt yêu cầu đổi thưởng thành công"));
    }
}
