using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

/// <summary>Nhật ký ăn uống, tổng hợp dinh dưỡng theo ngày, xu hướng, dữ liệu vận động.</summary>
[Route("api/nutrition"), Authorize]
public class NutritionController : ApiControllerBase
{
    private readonly ITrackingService _svc;
    public NutritionController(ITrackingService svc) => _svc = svc;

    /// <summary>Ghi nhận đã ăn 1 món (từ thực đơn qua PlanItemId hoặc tự chọn RecipeId).</summary>
    [HttpPost("logs")]
    public async Task<ActionResult<MealLogDto>> Log(CreateMealLogRequest req, CancellationToken ct) => Ok(await _svc.LogMealAsync(UserId, req, ct));

    [HttpDelete("logs/{id:int}")]
    public async Task<IActionResult> DeleteLog(int id, CancellationToken ct)
    {
        await _svc.DeleteLogAsync(UserId, id, ct);
        return NoContent();
    }

    /// <summary>Tổng hợp 1 ngày: đã nạp vs mục tiêu, calo tiêu hao, cảnh báo thiếu vi chất.</summary>
    [HttpGet("daily")]
    public async Task<ActionResult<DailyNutritionDto>> Daily([FromQuery] DateOnly? date, CancellationToken ct) =>
        Ok(await _svc.GetDailyAsync(UserId, date ?? DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7)), ct));

    [HttpGet("trend")]
    public async Task<ActionResult<IReadOnlyList<NutritionTrendPointDto>>> Trend([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var t = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddHours(7));
        return Ok(await _svc.GetTrendAsync(UserId, from ?? t.AddDays(-6), t, ct));
    }

    /// <summary>Nhập tay / đồng bộ calo tiêu hao, số bước (từ wearable).</summary>
    [HttpPut("activity")]
    public async Task<ActionResult<ActivityDataDto>> Activity(ActivityDataRequest req, CancellationToken ct) =>
        Ok(await _svc.UpsertActivityAsync(UserId, req, ct));
}

[Route("api/notifications"), Authorize]
public class NotificationsController : ApiControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc) => _svc = svc;

    [HttpGet]
    public async Task<ActionResult<PagedResult<NotificationDto>>> List([FromQuery] bool? unreadOnly, [FromQuery] PageQuery page, CancellationToken ct) =>
        Ok(await _svc.GetAsync(UserId, unreadOnly, page, ct));

    [HttpGet("unread-count")]
    public async Task<ActionResult<int>> UnreadCount(CancellationToken ct) => Ok(await _svc.CountUnreadAsync(UserId, ct));

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, CancellationToken ct)
    {
        await _svc.MarkReadAsync(UserId, id, ct);
        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken ct)
    {
        await _svc.MarkAllReadAsync(UserId, ct);
        return NoContent();
    }
}

[Route("api/vegan-shops"), AllowAnonymous]
public class VeganShopsController : ApiControllerBase
{
    private readonly IVeganShopService _svc;
    public VeganShopsController(IVeganShopService svc) => _svc = svc;

    /// <summary>Tìm quán/cửa hàng chay (gần vị trí nếu truyền lat/lng).</summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<VeganShopDto>>> Search([FromQuery] decimal? lat, [FromQuery] decimal? lng,
        [FromQuery] double radiusKm = 5, [FromQuery] string? keyword = null, CancellationToken ct = default) =>
        Ok(await _svc.SearchAsync(lat, lng, Math.Clamp(radiusKm, 0.1, 50), keyword, ct));
}

/// <summary>Cộng đồng: bài viết blog/video, bình luận, vote, báo cáo.</summary>
[Route("api/community")]
public class CommunityController : ApiControllerBase
{
    private readonly ICommunityService _svc;
    public CommunityController(ICommunityService svc) => _svc = svc;

    [HttpGet("posts"), AllowAnonymous]
    public async Task<ActionResult<PagedResult<PostSummaryDto>>> Posts([FromQuery] PostQuery q, CancellationToken ct) =>
        Ok(await _svc.GetPostsAsync(q, OptionalUserId, ct));

    [HttpGet("posts/mine"), Authorize]
    public async Task<ActionResult<PagedResult<PostSummaryDto>>> MyPosts([FromQuery] PageQuery page, CancellationToken ct) =>
        Ok(await _svc.GetMyPostsAsync(UserId, page, ct));

    [HttpGet("posts/{id:int}"), AllowAnonymous]
    public async Task<ActionResult<PostDetailDto>> Post(int id, CancellationToken ct) => Ok(await _svc.GetPostAsync(id, OptionalUserId, ct));

    /// <summary>Đăng bài (trạng thái pending → chờ kiểm duyệt).</summary>
    [HttpPost("posts"), Authorize]
    public async Task<ActionResult<PostDetailDto>> CreatePost(CreatePostRequest req, CancellationToken ct) =>
        Ok(await _svc.CreatePostAsync(UserId, req, ct));

    [HttpDelete("posts/{id:int}"), Authorize]
    public async Task<IActionResult> DeletePost(int id, CancellationToken ct)
    {
        await _svc.DeletePostAsync(UserId, id, ct);
        return NoContent();
    }

    [HttpPost("posts/{id:int}/comments"), Authorize]
    public async Task<ActionResult<CommentDto>> Comment(int id, CreateCommentRequest req, CancellationToken ct) =>
        Ok(await _svc.AddCommentAsync(UserId, id, req.Content, ct));

    [HttpDelete("comments/{id:int}"), Authorize]
    public async Task<IActionResult> DeleteComment(int id, CancellationToken ct)
    {
        await _svc.DeleteCommentAsync(UserId, id, ct);
        return NoContent();
    }

    /// <returns>Điểm vote mới của bài viết</returns>
    [HttpPut("posts/{id:int}/vote"), Authorize]
    public async Task<ActionResult<int>> Vote(int id, VoteRequest req, CancellationToken ct) => Ok(await _svc.VoteAsync(UserId, id, req.Value, ct));

    [HttpPost("reports"), Authorize]
    public async Task<ActionResult<ReportDto>> Report(CreateReportRequest req, CancellationToken ct) => Ok(await _svc.ReportAsync(UserId, req, ct));
}
