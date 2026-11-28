using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize]
public class BroadcastsController : ApiControllerBase
{
    private readonly IBroadcastNotificationService _broadcastService;

    public BroadcastsController(IBroadcastNotificationService broadcastService)
    {
        _broadcastService = broadcastService;
    }

    [HttpGet]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<List<BroadcastNotificationDto>>>> GetBroadcasts(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search)
    {
        var list = await _broadcastService.GetBroadcastsAsync(status, type, search);
        return Ok(ApiResponse<List<BroadcastNotificationDto>>.Ok(list));
    }

    [HttpGet("stats")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<BroadcastStatsDto>>> GetStats()
    {
        var stats = await _broadcastService.GetStatsAsync();
        return Ok(ApiResponse<BroadcastStatsDto>.Ok(stats));
    }

    [HttpGet("my-notifications")]
    [Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
    public async Task<ActionResult<ApiResponse<List<UserNotificationDto>>>> GetMyNotifications()
    {
        var userId = GetRequiredUserId();
        var list = await _broadcastService.GetUserNotificationsAsync(userId);
        return Ok(ApiResponse<List<UserNotificationDto>>.Ok(list));
    }

    [HttpPost]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<BroadcastNotificationDto>>> CreateBroadcast([FromBody] CreateBroadcastNotificationRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _broadcastService.CreateBroadcastAsync(request, modId);
        return Ok(ApiResponse<BroadcastNotificationDto>.Ok(item, "Tạo thông báo phát sóng thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<BroadcastNotificationDto>>> UpdateBroadcast(int id, [FromBody] UpdateBroadcastNotificationRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _broadcastService.UpdateBroadcastAsync(id, request, modId);
        if (item == null) return NotFound(ApiResponse<BroadcastNotificationDto>.Fail("Không tìm thấy thông báo cần sửa"));
        return Ok(ApiResponse<BroadcastNotificationDto>.Ok(item, "Cập nhật thông báo thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBroadcast(int id)
    {
        var modId = GetRequiredUserId();
        var ok = await _broadcastService.DeleteBroadcastAsync(id, modId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thông báo cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá thông báo thành công"));
    }

    [HttpPost("{id}/send-now")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> SendNow(int id)
    {
        var modId = GetRequiredUserId();
        var ok = await _broadcastService.SendNowAsync(id, modId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thông báo cần gửi ngay"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã phát sóng thông báo đẩy đến người dùng!"));
    }
}
