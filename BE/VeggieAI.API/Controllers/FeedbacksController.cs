using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbacksController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbacksController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<FeedbackReportDto>>>> GetFeedbacks(
        [FromQuery] string? type,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] string? search)
    {
        var result = await _feedbackService.GetFeedbacksAsync(type, category, status, search);
        return Ok(ApiResponse<List<FeedbackReportDto>>.Ok(result));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<FeedbackOverviewStatsDto>>> GetStats()
    {
        var stats = await _feedbackService.GetFeedbackStatsAsync();
        return Ok(ApiResponse<FeedbackOverviewStatsDto>.Ok(stats));
    }

    [HttpPost("{id}/resolve")]
    public async Task<ActionResult<ApiResponse<bool>>> ResolveFeedback(
        int id,
        [FromBody] ResolveFeedbackRequest request,
        [FromQuery] string feedbackType = "report")
    {
        var handlerId = GetCurrentUserId();
        var ok = await _feedbackService.ResolveFeedbackAsync(id, request, handlerId, feedbackType);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy phản hồi cần xử lý"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã cập nhật trạng thái xử lý phản hồi thành công"));
    }

    [HttpPost("report")]
    public async Task<ActionResult<ApiResponse<FeedbackReportDto>>> CreateReport([FromBody] CreateReportRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await _feedbackService.CreateReportAsync(request, userId);
        return Ok(ApiResponse<FeedbackReportDto>.Ok(item, "Gửi báo cáo thành công"));
    }

    [HttpPost("ai")]
    public async Task<ActionResult<ApiResponse<FeedbackReportDto>>> SubmitAiFeedback([FromBody] CreateAiFeedbackRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await _feedbackService.SubmitAiFeedbackAsync(request, userId);
        return Ok(ApiResponse<FeedbackReportDto>.Ok(item, "Đã ghi nhận đánh giá AI từ chuyên gia"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 1; // Default to Admin/Mod
    }
}

