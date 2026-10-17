using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services.AI;

namespace VeggieAI.API.Controllers.AI;

[ApiController]
public abstract class AiApiControllerBase : ControllerBase
{
    protected int UserId =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw AppException.Unauthorized("Bạn cần đăng nhập.");
}

/// <summary>🤖 Nhận diện nguyên liệu / món ăn từ ảnh → gợi ý công thức và thực đơn.</summary>
[Route("api/scans")]
[Authorize]
public class ScansController : AiApiControllerBase
{
    private readonly IIngredientScanService _svc;

    public ScansController(IIngredientScanService svc)
    {
        _svc = svc;
    }

    public class ScanUploadForm
    {
        /// <summary>Ảnh JPEG/PNG/WEBP/HEIC ≤ 8 MB</summary>
        public IFormFile Image { get; set; } = null!;
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<ScanResultDto>>> Scan([FromForm] ScanUploadForm form, CancellationToken ct)
    {
        if (form.Image is null || form.Image.Length == 0) throw new AppException("Vui lòng chọn ảnh.");
        if (form.Image.Length > 8 * 1024 * 1024) throw new AppException("Ảnh tối đa 8 MB.");
        await using var stream = form.Image.OpenReadStream();
        var result = await _svc.ScanAsync(UserId, stream, form.Image.FileName, form.Image.ContentType, ct);
        return Ok(ApiResponse<ScanResultDto>.Ok(result, "Nhận diện thành công"));
    }

    /// <summary>Người dùng sửa/xác nhận danh sách nguyên liệu (khi AI nhận sai hoặc không nhận được).</summary>
    [HttpPost("{id:int}/confirm")]
    public async Task<ActionResult<ApiResponse<ScanResultDto>>> Confirm(int id, [FromBody] ConfirmScanRequest req, CancellationToken ct)
    {
        var result = await _svc.ConfirmAsync(UserId, id, req.IngredientIds, ct);
        return Ok(ApiResponse<ScanResultDto>.Ok(result, "Cập nhật nguyên liệu thành công"));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ScanResultDto>>> Get(int id, CancellationToken ct)
    {
        var result = await _svc.GetAsync(UserId, id, ct);
        return Ok(ApiResponse<ScanResultDto>.Ok(result));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ScanSummaryDto>>>> History([FromQuery] PageQuery page, CancellationToken ct)
    {
        var result = await _svc.GetHistoryAsync(UserId, page, ct);
        return Ok(ApiResponse<PagedResult<ScanSummaryDto>>.Ok(result));
    }
}

/// <summary>🤖 Chatbot dinh dưỡng thông minh.</summary>
[Route("api/chat/sessions")]
[Authorize]
public class ChatController : AiApiControllerBase
{
    private readonly IChatService _svc;

    public ChatController(IChatService svc)
    {
        _svc = svc;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ChatSessionDto>>> Create([FromBody] CreateChatSessionRequest req, CancellationToken ct)
    {
        var result = await _svc.CreateSessionAsync(UserId, req, ct);
        return Ok(ApiResponse<ChatSessionDto>.Ok(result, "Tạo phiên chat thành công"));
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ChatSessionDto>>>> List(CancellationToken ct)
    {
        var result = await _svc.GetSessionsAsync(UserId, ct);
        return Ok(ApiResponse<IReadOnlyList<ChatSessionDto>>.Ok(result));
    }

    [HttpGet("{id:int}/messages")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ChatMessageDto>>>> Messages(int id, CancellationToken ct)
    {
        var result = await _svc.GetMessagesAsync(UserId, id, ct);
        return Ok(ApiResponse<IReadOnlyList<ChatMessageDto>>.Ok(result));
    }

    [HttpPost("{id:int}/messages")]
    public async Task<ActionResult<ApiResponse<ChatReplyDto>>> Send(int id, [FromBody] SendChatMessageRequest req, CancellationToken ct)
    {
        var result = await _svc.SendAsync(UserId, id, req.Content, ct);
        return Ok(ApiResponse<ChatReplyDto>.Ok(result));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<string>>> Delete(int id, CancellationToken ct)
    {
        await _svc.DeleteSessionAsync(UserId, id, ct);
        return Ok(ApiResponse<string>.Ok("Deleted", "Đã xóa phiên chat"));
    }
}

/// <summary>🤖 AI lập thực đơn và đổi món thông minh.</summary>
[Route("api/meal-plans/ai")]
[Authorize]
public class AiMealPlanController : AiApiControllerBase
{
    private readonly IAiMealPlanner _planner;

    public AiMealPlanController(IAiMealPlanner planner)
    {
        _planner = planner;
    }

    [HttpPost("generate")]
    public async Task<ActionResult<ApiResponse<GeneratedMealPlanDto>>> Generate([FromBody] GenerateMealPlanRequest req, CancellationToken ct)
    {
        var result = await _planner.GenerateAsync(UserId, req, ct);
        return Ok(ApiResponse<GeneratedMealPlanDto>.Ok(result, "Tạo thực đơn AI thành công"));
    }

    [HttpPost("{planId:int}/items/{itemId:int}/swap")]
    public async Task<ActionResult<ApiResponse<GeneratedMealPlanDto>>> Swap(int planId, int itemId, [FromBody] SwapMealRequest req, CancellationToken ct)
    {
        var result = await _planner.SwapItemAsync(UserId, planId, itemId, req, ct);
        return Ok(ApiResponse<GeneratedMealPlanDto>.Ok(result, "Đổi món thành công"));
    }
}
