using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Controllers.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

/// <summary>Nhật ký dinh dưỡng thực tế: ghi bữa đã ăn, tổng theo ngày, xu hướng, vận động.</summary>
[Route("api/nutrition")]
[Authorize]
public class NutritionController : AiApiControllerBase
{
    private readonly INutritionService _svc;

    public NutritionController(INutritionService svc)
    {
        _svc = svc;
    }

    /// <summary>Body: { planItemId } hoặc { recipeId, mealType?, servings?, logDate? }.</summary>
    [HttpPost("logs")]
    public async Task<ActionResult<ApiResponse<MealLogDto>>> Log([FromBody] LogMealRequest req, CancellationToken ct)
    {
        var result = await _svc.LogMealAsync(UserId, req, ct);
        return Ok(ApiResponse<MealLogDto>.Ok(result, "Đã ghi nhận bữa ăn"));
    }

    [HttpDelete("logs/{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteLog(int id, CancellationToken ct)
    {
        await _svc.DeleteLogAsync(UserId, id, ct);
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa nhật ký bữa ăn"));
    }

    /// <summary>Tổng dinh dưỡng 1 ngày (mặc định hôm nay, giờ VN) + cảnh báo thiếu chất.</summary>
    [HttpGet("daily")]
    public async Task<ActionResult<ApiResponse<DailyNutritionDto>>> Daily([FromQuery] DateOnly? date, CancellationToken ct)
    {
        var result = await _svc.GetDailyAsync(UserId, date, ct);
        return Ok(ApiResponse<DailyNutritionDto>.Ok(result));
    }

    /// <summary>Dữ liệu biểu đồ (mặc định 7 ngày gần nhất, tối đa 93 ngày).</summary>
    [HttpGet("trend")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TrendPointDto>>>> Trend([FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var result = await _svc.GetTrendAsync(UserId, from, to, ct);
        return Ok(ApiResponse<IReadOnlyList<TrendPointDto>>.Ok(result));
    }

    [HttpPut("activity")]
    public async Task<ActionResult<ApiResponse<ActivityDataDto>>> Activity([FromBody] UpsertActivityRequest req, CancellationToken ct)
    {
        var result = await _svc.UpsertActivityAsync(UserId, req, ct);
        return Ok(ApiResponse<ActivityDataDto>.Ok(result, "Đã cập nhật vận động"));
    }
}

/// <summary>Cộng đồng: bài viết blog/video, bình luận, vote, báo cáo vi phạm.</summary>
[Route("api/community")]
[Authorize]
public class CommunityController : AiApiControllerBase
{
    private readonly ICommunityService _svc;

    public CommunityController(ICommunityService svc)
    {
        _svc = svc;
    }

    private int? OptionalUserId =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    private bool IsStaff => AppRoles.IsStaff(User.FindFirstValue(ClaimTypes.Role));

    /// <summary>Bài đã duyệt. sort = newest (mặc định) | top.</summary>
    [HttpGet("posts")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PagedResult<PostSummaryDto>>>> List(
        [FromQuery] string? keyword, [FromQuery] string? postType, [FromQuery] string? sort, [FromQuery] PageQuery page, CancellationToken ct)
    {
        var result = await _svc.ListAsync(OptionalUserId, keyword, postType, sort, page, ct);
        return Ok(ApiResponse<PagedResult<PostSummaryDto>>.Ok(result));
    }

    /// <summary>Bài của tôi (mọi trạng thái trừ đã gỡ).</summary>
    [HttpGet("posts/mine")]
    public async Task<ActionResult<ApiResponse<PagedResult<PostSummaryDto>>>> Mine([FromQuery] PageQuery page, CancellationToken ct)
    {
        var result = await _svc.ListMineAsync(UserId, page, ct);
        return Ok(ApiResponse<PagedResult<PostSummaryDto>>.Ok(result));
    }

    [HttpGet("posts/{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<PostDetailDto>>> Get(int id, CancellationToken ct)
    {
        var result = await _svc.GetAsync(OptionalUserId, IsStaff, id, ct);
        return Ok(ApiResponse<PostDetailDto>.Ok(result));
    }

    /// <summary>Bài mới ở trạng thái pending, chờ kiểm duyệt qua /api/Moderation.</summary>
    [HttpPost("posts")]
    public async Task<ActionResult<ApiResponse<PostDetailDto>>> Create([FromBody] CreatePostRequest req, CancellationToken ct)
    {
        var result = await _svc.CreateAsync(UserId, req, ct);
        return Ok(ApiResponse<PostDetailDto>.Ok(result, "Đã gửi bài viết, đang chờ kiểm duyệt"));
    }

    [HttpDelete("posts/{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken ct)
    {
        await _svc.DeletePostAsync(UserId, IsStaff, id, ct);
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa bài viết"));
    }

    [HttpPost("posts/{id:int}/comments")]
    public async Task<ActionResult<ApiResponse<PostCommentDto>>> Comment(int id, [FromBody] AddCommentRequest req, CancellationToken ct)
    {
        var result = await _svc.AddCommentAsync(UserId, id, req.Content, ct);
        return Ok(ApiResponse<PostCommentDto>.Ok(result, "Đã bình luận"));
    }

    [HttpDelete("comments/{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteComment(int id, CancellationToken ct)
    {
        await _svc.DeleteCommentAsync(UserId, IsStaff, id, ct);
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa bình luận"));
    }

    /// <summary>value: 1 | -1 | 0 (bỏ vote). Trả về điểm mới của bài.</summary>
    [HttpPut("posts/{id:int}/vote")]
    [HttpPost("posts/{id:int}/vote")]
    public async Task<ActionResult<ApiResponse<int>>> Vote(int id, [FromBody] VotePostRequest req, CancellationToken ct)
    {
        var score = await _svc.VoteAsync(UserId, id, req.Value, ct);
        return Ok(ApiResponse<int>.Ok(score));
    }

    [HttpPost("reports")]
    public async Task<ActionResult<ApiResponse<ReportDto>>> Report([FromBody] CreateReportRequest req, CancellationToken ct)
    {
        var result = await _svc.ReportAsync(UserId, req, ct);
        return Ok(ApiResponse<ReportDto>.Ok(result, "Đã gửi báo cáo, cảm ơn bạn"));
    }
}
