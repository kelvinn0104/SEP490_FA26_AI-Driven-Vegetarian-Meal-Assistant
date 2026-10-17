using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

/// <summary>🤖 Nhận diện nguyên liệu / món ăn từ ảnh → gợi ý công thức và thực đơn.</summary>
[Route("api/scans"), Authorize]
public class ScansController : ApiControllerBase
{
    private readonly IIngredientScanService _svc;
    public ScansController(IIngredientScanService svc) => _svc = svc;

    public class ScanUploadForm
    {
        /// <summary>Ảnh JPEG/PNG/WEBP/HEIC ≤ 8 MB</summary>
        public IFormFile Image { get; set; } = null!;
    }

    [HttpPost, Consumes("multipart/form-data"), RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<ActionResult<ScanResultDto>> Scan([FromForm] ScanUploadForm form, CancellationToken ct)
    {
        if (form.Image is null || form.Image.Length == 0) throw new AppException("Vui lòng chọn ảnh.");
        if (form.Image.Length > 8 * 1024 * 1024) throw new AppException("Ảnh tối đa 8 MB.");
        await using var stream = form.Image.OpenReadStream();
        return Ok(await _svc.ScanAsync(UserId, stream, form.Image.FileName, form.Image.ContentType, ct));
    }

    /// <summary>Người dùng sửa/xác nhận danh sách nguyên liệu (khi AI nhận sai hoặc không nhận được).</summary>
    [HttpPost("{id:int}/confirm")]
    public async Task<ActionResult<ScanResultDto>> Confirm(int id, ConfirmScanRequest req, CancellationToken ct) =>
        Ok(await _svc.ConfirmAsync(UserId, id, req.IngredientIds, ct));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ScanResultDto>> Get(int id, CancellationToken ct) => Ok(await _svc.GetAsync(UserId, id, ct));

    [HttpGet]
    public async Task<ActionResult<PagedResult<ScanSummaryDto>>> History([FromQuery] PageQuery page, CancellationToken ct) =>
        Ok(await _svc.GetHistoryAsync(UserId, page, ct));
}

/// <summary>🤖 Chatbot dinh dưỡng.</summary>
[Route("api/chat/sessions"), Authorize]
public class ChatController : ApiControllerBase
{
    private readonly IChatService _svc;
    public ChatController(IChatService svc) => _svc = svc;

    [HttpPost]
    public async Task<ActionResult<ChatSessionDto>> Create(CreateChatSessionRequest req, CancellationToken ct) =>
        Ok(await _svc.CreateSessionAsync(UserId, req, ct));

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ChatSessionDto>>> List(CancellationToken ct) => Ok(await _svc.GetSessionsAsync(UserId, ct));

    [HttpGet("{id:int}/messages")]
    public async Task<ActionResult<IReadOnlyList<ChatMessageDto>>> Messages(int id, CancellationToken ct) =>
        Ok(await _svc.GetMessagesAsync(UserId, id, ct));

    [HttpPost("{id:int}/messages")]
    public async Task<ActionResult<ChatReplyDto>> Send(int id, SendChatMessageRequest req, CancellationToken ct) =>
        Ok(await _svc.SendAsync(UserId, id, req.Content, ct));

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        await _svc.DeleteSessionAsync(UserId, id, ct);
        return NoContent();
    }
}
