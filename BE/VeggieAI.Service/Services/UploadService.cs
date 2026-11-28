using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services.AI;

namespace VeggieAI.Service.Services;

/// <summary>Nhận diện loại file thật từ vài byte đầu (không tin Content-Type/đuôi file do client gửi).</summary>
public static class FileSignatures
{
    public sealed record Kind(string Extension, string MimeType, bool IsImage);

    public static Kind? Detect(ReadOnlySpan<byte> h)
    {
        if (h.Length >= 3 && h[0] == 0xFF && h[1] == 0xD8 && h[2] == 0xFF) return new(".jpg", "image/jpeg", true);
        if (h.Length >= 8 && h[0] == 0x89 && h[1] == 0x50 && h[2] == 0x4E && h[3] == 0x47) return new(".png", "image/png", true);
        if (h.Length >= 6 && h[0] == 'G' && h[1] == 'I' && h[2] == 'F' && h[3] == '8') return new(".gif", "image/gif", true);
        if (h.Length >= 12 && h[0] == 'R' && h[1] == 'I' && h[2] == 'F' && h[3] == 'F' &&
            h[8] == 'W' && h[9] == 'E' && h[10] == 'B' && h[11] == 'P') return new(".webp", "image/webp", true);
        if (h.Length >= 4 && h[0] == 0x1A && h[1] == 0x45 && h[2] == 0xDF && h[3] == 0xA3) return new(".webm", "video/webm", false);
        if (h.Length >= 12 && h[4] == 'f' && h[5] == 't' && h[6] == 'y' && h[7] == 'p')
        {
            var brand = System.Text.Encoding.ASCII.GetString(h.Slice(8, 4));
            if (brand is "heic" or "heix" or "hevc" or "heim" or "heis" or "mif1" or "msf1") return new(".heic", "image/heic", true);
            if (brand == "qt  ") return new(".mov", "video/quicktime", false);
            return new(".mp4", "video/mp4", false);
        }
        return null;
    }
}

public interface IUploadService
{
    /// <summary>
    /// purpose: post (ảnh/video bài viết) | avatar | recipe. Ảnh ≤ 8 MB; video ≤ 50 MB (chỉ với post).
    /// </summary>
    Task<UploadResultDto> UploadAsync(int userId, string purpose, Stream content, long length, CancellationToken ct = default);
}

public class UploadService : IUploadService
{
    public const long MaxImageBytes = 8L * 1024 * 1024;
    public const long MaxVideoBytes = 50L * 1024 * 1024;

    private readonly IFileStorage _storage;

    public UploadService(IFileStorage storage)
    {
        _storage = storage;
    }

    public async Task<UploadResultDto> UploadAsync(int userId, string purpose, Stream content, long length, CancellationToken ct = default)
    {
        var p = (purpose ?? "post").Trim().ToLowerInvariant();
        if (p is not ("post" or "avatar" or "recipe"))
            throw new AppException("purpose phải là post, avatar hoặc recipe.");
        if (length <= 0) throw new AppException("File rỗng.", 400, "INVALID_FILE");
        if (length > MaxVideoBytes) throw new AppException("File tối đa 50 MB.", 400, "FILE_TOO_LARGE");

        using var ms = new MemoryStream();
        await content.CopyToAsync(ms, ct);
        var kind = FileSignatures.Detect(ms.GetBuffer().AsSpan(0, (int)Math.Min(ms.Length, 32)))
                   ?? throw new AppException("Chỉ hỗ trợ ảnh JPEG/PNG/WEBP/GIF/HEIC hoặc video MP4/WEBM/MOV.", 400, "INVALID_FILE");

        if (kind.IsImage && ms.Length > MaxImageBytes) throw new AppException("Ảnh tối đa 8 MB.", 400, "FILE_TOO_LARGE");
        if (!kind.IsImage && p != "post") throw new AppException("Chỉ bài viết mới được đính kèm video.", 400, "INVALID_FILE");

        ms.Position = 0;
        var url = await _storage.SaveAsync(ms, "upload" + kind.Extension, p + "s", ct);
        return new UploadResultDto(url, kind.MimeType, ms.Length, kind.IsImage ? "image" : "video", _storage.IsDurable);
    }
}
