using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Controllers.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

/// <summary>Tải ảnh/video lên storage, trả URL để gắn vào bài viết, công thức hoặc ảnh đại diện.</summary>
[Route("api/uploads")]
[Authorize]
public class UploadsController : AiApiControllerBase
{
    private readonly IUploadService _svc;

    public UploadsController(IUploadService svc)
    {
        _svc = svc;
    }

    public class UploadForm
    {
        /// <summary>Ảnh JPEG/PNG/WEBP/GIF/HEIC ≤ 8 MB, hoặc video MP4/WEBM/MOV ≤ 50 MB (chỉ purpose = post).</summary>
        public IFormFile File { get; set; } = null!;

        /// <summary>post | avatar | recipe</summary>
        public string Purpose { get; set; } = "post";
    }

    /// <summary>multipart/form-data: file, purpose. Trả { url, contentType, size, kind, durable }.</summary>
    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(55 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 55 * 1024 * 1024)]
    public async Task<ActionResult<ApiResponse<UploadResultDto>>> Upload([FromForm] UploadForm form, CancellationToken ct)
    {
        if (form.File is null || form.File.Length == 0) throw new AppException("Vui lòng chọn file.", 400, "INVALID_FILE");
        await using var stream = form.File.OpenReadStream();
        var result = await _svc.UploadAsync(UserId, form.Purpose, stream, form.File.Length, ct);
        return Ok(ApiResponse<UploadResultDto>.Ok(result, "Tải file thành công"));
    }
}
