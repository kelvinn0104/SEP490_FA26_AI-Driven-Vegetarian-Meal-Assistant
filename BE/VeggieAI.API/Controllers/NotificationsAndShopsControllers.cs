using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Controllers.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

/// <summary>Thông báo của người dùng (Navbar gọi trên mọi trang).</summary>
[Route("api/notifications")]
[Authorize]
public class NotificationsController : AiApiControllerBase
{
    private readonly INotificationService _svc;

    public NotificationsController(INotificationService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationDto>>>> List([FromQuery] bool unreadOnly, [FromQuery] PageQuery page, CancellationToken ct)
    {
        var result = await _svc.GetAsync(UserId, unreadOnly, page, ct);
        return Ok(ApiResponse<PagedResult<NotificationDto>>.Ok(result));
    }

    [HttpGet("unread-count")]
    public async Task<ActionResult<ApiResponse<UnreadCountDto>>> UnreadCount(CancellationToken ct)
    {
        var count = await _svc.GetUnreadCountAsync(UserId, ct);
        return Ok(ApiResponse<UnreadCountDto>.Ok(new UnreadCountDto(count)));
    }

    [HttpPatch("{id:int}/read")]
    [HttpPut("{id:int}/read")]
    public async Task<ActionResult<ApiResponse<bool>>> MarkRead(int id, CancellationToken ct)
    {
        await _svc.MarkAsReadAsync(UserId, id, ct);
        return Ok(ApiResponse<bool>.Ok(true, "Đã đánh dấu đã đọc"));
    }

    [HttpPatch("read-all")]
    [HttpPut("read-all")]
    public async Task<ActionResult<ApiResponse<int>>> MarkAllRead(CancellationToken ct)
    {
        var updated = await _svc.MarkAllAsReadAsync(UserId, ct);
        return Ok(ApiResponse<int>.Ok(updated, "Đã đánh dấu tất cả là đã đọc"));
    }
}

/// <summary>Tìm quán chay / nhà hàng thuần chay (công khai).</summary>
[ApiController]
[Route("api/vegan-shops")]
[AllowAnonymous]
public class VeganShopsController : ControllerBase
{
    private readonly IVeganShopService _svc;

    public VeganShopsController(IVeganShopService svc)
    {
        _svc = svc;
    }

    /// <param name="lat">Vĩ độ người dùng (tùy chọn)</param>
    /// <param name="lng">Kinh độ người dùng (tùy chọn)</param>
    /// <param name="radiusKm">Bán kính tìm kiếm, mặc định 10 km khi có tọa độ</param>
    /// <param name="keyword">Tìm theo tên / địa chỉ / tag</param>
    /// <param name="take">Số kết quả tối đa (1–100)</param>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<VeganShopDto>>>> Search(
        [FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double? radiusKm,
        [FromQuery] string? keyword, [FromQuery] int take = 50, CancellationToken ct = default)
    {
        var result = await _svc.SearchAsync(lat, lng, radiusKm, keyword, take, ct);
        return Ok(ApiResponse<IReadOnlyList<VeganShopDto>>.Ok(result));
    }
}
