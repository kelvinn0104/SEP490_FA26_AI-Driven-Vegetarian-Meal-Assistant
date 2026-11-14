using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BroadcastsController : ControllerBase
{
    private readonly IBroadcastNotificationService _broadcastService;

    public BroadcastsController(IBroadcastNotificationService broadcastService)
    {
        _broadcastService = broadcastService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BroadcastNotificationDto>>>> GetBroadcasts(
        [FromQuery] string? status,
        [FromQuery] string? type,
        [FromQuery] string? search)
    {
        var list = await _broadcastService.GetBroadcastsAsync(status, type, search);
        return Ok(ApiResponse<List<BroadcastNotificationDto>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<BroadcastStatsDto>>> GetStats()
    {
        var stats = await _broadcastService.GetStatsAsync();
        return Ok(ApiResponse<BroadcastStatsDto>.Ok(stats));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BroadcastNotificationDto>>> CreateBroadcast([FromBody] CreateBroadcastNotificationRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await _broadcastService.CreateBroadcastAsync(request, userId);
        return Ok(ApiResponse<BroadcastNotificationDto>.Ok(item, "Tạo thông báo phát sóng thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<BroadcastNotificationDto>>> UpdateBroadcast(int id, [FromBody] UpdateBroadcastNotificationRequest request)
    {
        var item = await _broadcastService.UpdateBroadcastAsync(id, request);
        if (item == null) return NotFound(ApiResponse<BroadcastNotificationDto>.Fail("Không tìm thấy thông báo cần sửa"));
        return Ok(ApiResponse<BroadcastNotificationDto>.Ok(item, "Cập nhật thông báo thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteBroadcast(int id)
    {
        var ok = await _broadcastService.DeleteBroadcastAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thông báo cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá thông báo thành công"));
    }

    [HttpPost("{id}/send-now")]
    public async Task<ActionResult<ApiResponse<bool>>> SendNow(int id)
    {
        var ok = await _broadcastService.SendNowAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy thông báo cần gửi ngay"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã phát sóng thông báo đẩy đến cộng đồng ngay lập tức!"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 1;
    }
}

