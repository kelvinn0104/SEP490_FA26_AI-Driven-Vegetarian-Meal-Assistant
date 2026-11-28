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

    /// <summary>Tải ảnh nhanh lên wwwroot/uploads.</summary>
    [HttpPost("image")]
    public async Task<ActionResult<ApiResponse<UploadResultDto>>> UploadImage(IFormFile? file, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        if (file == null || file.Length == 0) throw new AppException("Vui lòng chọn tệp hình ảnh hợp lệ.", 400, "INVALID_FILE");
        if (file.Length > 5 * 1024 * 1024) throw new AppException("Kích thước ảnh không được vượt quá 5MB.", 400, "FILE_TOO_LARGE");

        var ext = Path.GetExtension(file.FileName);
        var allowed = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp", ".gif" };
        if (string.IsNullOrWhiteSpace(ext) || !allowed.Contains(ext))
            throw new AppException("Chỉ hỗ trợ định dạng ảnh .jpg, .jpeg, .png, .webp hoặc .gif.", 400, "INVALID_EXTENSION");

        var webRoot = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadDir);

        var safeFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadDir, safeFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var publicUrl = $"/uploads/{safeFileName}";
        return Ok(ApiResponse<UploadResultDto>.Ok(new UploadResultDto(publicUrl, file.ContentType ?? "image/jpeg", file.Length, "image", false), "Tải ảnh lên thành công"));
    }
}
