using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;

namespace VeggieAI.API.Controllers;

public class UploadResultDto
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
}

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
public class UploadsController : ApiControllerBase
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    };

    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB
    private readonly IWebHostEnvironment _env;

    public UploadsController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("image")]
    public async Task<ActionResult<ApiResponse<UploadResultDto>>> UploadImage(IFormFile? file)
    {
        _ = GetRequiredUserId();

        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<UploadResultDto>.Fail("Vui lòng chọn tệp hình ảnh hợp lệ."));
        }

        if (file.Length > MaxFileSizeBytes)
        {
            return BadRequest(ApiResponse<UploadResultDto>.Fail("Kích thước ảnh không được vượt quá 5MB."));
        }

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
        {
            return BadRequest(ApiResponse<UploadResultDto>.Fail("Chỉ hỗ trợ định dạng ảnh .jpg, .jpeg, .png, .webp hoặc .gif."));
        }

        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadDir);

        var safeFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}_{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadDir, safeFileName);

        await using (var stream = new FileStream(fullPath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var publicUrl = $"/uploads/{safeFileName}";
        return Ok(ApiResponse<UploadResultDto>.Ok(new UploadResultDto
        {
            Url = publicUrl,
            FileName = safeFileName,
            SizeBytes = file.Length
        }, "Tải ảnh lên thành công"));
    }
}
