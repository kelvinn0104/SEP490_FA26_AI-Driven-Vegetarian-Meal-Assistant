using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VeggieAI.Model.DTOs;

namespace VeggieAI.Service.Services.AI;

/// <summary>
/// Lưu file người dùng tải lên (ảnh scan, ảnh/video bài viết, ảnh đại diện).
/// Chọn bằng Storage:Provider = "local" (mặc định) | "cloudinary".
/// Trên Render ổ đĩa không bền qua redeploy → production nên dùng cloudinary.
/// </summary>
public interface IFileStorage
{
    /// <summary>Lưu file và trả URL công khai (local: /uploads/..., cloudinary: https://res.cloudinary.com/...).</summary>
    Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default);

    /// <summary>Xóa file theo URL đã trả ở SaveAsync. Không ném lỗi nếu file không còn / URL không thuộc storage này.</summary>
    Task DeleteAsync(string? url, CancellationToken ct = default);

    /// <summary>true nếu file được lưu ngoài server (bền qua redeploy).</summary>
    bool IsDurable { get; }
}

internal static class StorageFiles
{
    public static readonly string[] ImageExtensions = { ".jpg", ".jpeg", ".png", ".webp", ".gif", ".heic", ".heif" };
    public static readonly string[] VideoExtensions = { ".mp4", ".webm", ".mov" };

    public static string SafeExtension(string originalFileName)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        return ImageExtensions.Contains(ext) || VideoExtensions.Contains(ext) ? ext : ".jpg";
    }

    public static string SafeFolder(string folder)
    {
        var f = string.Concat(folder.Where(char.IsLetterOrDigit));
        return f.Length == 0 ? "misc" : f;
    }

    public static bool IsVideo(string ext) => VideoExtensions.Contains(ext);
}

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(IConfiguration config)
    {
        _root = config["Storage:LocalRoot"] ?? Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads");
    }

    public bool IsDurable => false;

    public async Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default)
    {
        var ext = StorageFiles.SafeExtension(originalFileName);
        var safeFolder = StorageFiles.SafeFolder(folder);
        var month = DateTime.UtcNow.ToString("yyyyMM");
        var dir = Path.Combine(_root, safeFolder, month);
        Directory.CreateDirectory(dir);
        var name = $"{Guid.NewGuid():N}{ext}";
        await using (var fs = File.Create(Path.Combine(dir, name)))
            await content.CopyToAsync(fs, ct);
        return $"/uploads/{safeFolder}/{month}/{name}";
    }

    public Task DeleteAsync(string? url, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(url) || !url.StartsWith("/uploads/", StringComparison.Ordinal)) return Task.CompletedTask;
        var relative = url["/uploads/".Length..].Replace('/', Path.DirectorySeparatorChar);
        var full = Path.GetFullPath(Path.Combine(_root, relative));
        // Chặn path traversal: chỉ xóa file nằm trong thư mục gốc uploads
        if (!full.StartsWith(Path.GetFullPath(_root), StringComparison.Ordinal)) return Task.CompletedTask;
        try
        {
            if (File.Exists(full)) File.Delete(full);
        }
        catch (IOException) { }
        catch (UnauthorizedAccessException) { }
        return Task.CompletedTask;
    }
}

/// <summary>
/// Lưu file lên Cloudinary qua REST API (signed upload), không cần NuGet package.
/// Cấu hình: Storage__Provider=cloudinary, Storage__Cloudinary__CloudName, Storage__Cloudinary__ApiKey,
/// Storage__Cloudinary__ApiSecret, (tùy chọn) Storage__Cloudinary__Folder (mặc định "veggieai").
/// </summary>
public class CloudinaryFileStorage : IFileStorage
{
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromMinutes(3) };

    private readonly string _cloud;
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly string _baseFolder;
    private readonly ILogger<CloudinaryFileStorage> _log;

    public CloudinaryFileStorage(IConfiguration config, ILogger<CloudinaryFileStorage> log)
    {
        _cloud = config["Storage:Cloudinary:CloudName"] ?? "";
        _apiKey = config["Storage:Cloudinary:ApiKey"] ?? "";
        _apiSecret = config["Storage:Cloudinary:ApiSecret"] ?? "";
        _baseFolder = config["Storage:Cloudinary:Folder"] ?? "veggieai";
        _log = log;
        if (string.IsNullOrWhiteSpace(_cloud) || string.IsNullOrWhiteSpace(_apiKey) || string.IsNullOrWhiteSpace(_apiSecret))
            throw new InvalidOperationException("Thiếu cấu hình Storage:Cloudinary (CloudName, ApiKey, ApiSecret).");
    }

    public static bool IsConfigured(IConfiguration config) =>
        !string.IsNullOrWhiteSpace(config["Storage:Cloudinary:CloudName"]) &&
        !string.IsNullOrWhiteSpace(config["Storage:Cloudinary:ApiKey"]) &&
        !string.IsNullOrWhiteSpace(config["Storage:Cloudinary:ApiSecret"]);

    public bool IsDurable => true;

    public async Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default)
    {
        var ext = StorageFiles.SafeExtension(originalFileName);
        var resourceType = StorageFiles.IsVideo(ext) ? "video" : "image";
        var targetFolder = $"{_baseFolder}/{StorageFiles.SafeFolder(folder)}";
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var signature = Sign($"folder={targetFolder}&timestamp={timestamp}");

        using var form = new MultipartFormDataContent
        {
            { new StreamContent(content), "file", "upload" + ext },
            { new StringContent(_apiKey), "api_key" },
            { new StringContent(timestamp), "timestamp" },
            { new StringContent(targetFolder), "folder" },
            { new StringContent(signature), "signature" },
        };

        using var res = await Http.PostAsync($"https://api.cloudinary.com/v1_1/{_cloud}/{resourceType}/upload", form, ct);
        var body = await res.Content.ReadAsStringAsync(ct);
        if (!res.IsSuccessStatusCode)
        {
            _log.LogError("Cloudinary upload lỗi {Status}: {Body}", (int)res.StatusCode, body.Length > 500 ? body[..500] : body);
            throw new AppException("Không lưu được file, vui lòng thử lại sau.", 502, "STORAGE_UNAVAILABLE");
        }

        using var doc = JsonDocument.Parse(body);
        return doc.RootElement.GetProperty("secure_url").GetString()
               ?? throw new AppException("Không lưu được file, vui lòng thử lại sau.", 502, "STORAGE_UNAVAILABLE");
    }

    public async Task DeleteAsync(string? url, CancellationToken ct = default)
    {
        // https://res.cloudinary.com/{cloud}/{image|video}/upload/v123/{folder}/{id}.{ext}
        if (string.IsNullOrWhiteSpace(url) || !url.Contains($"res.cloudinary.com/{_cloud}/", StringComparison.Ordinal)) return;
        try
        {
            var path = new Uri(url).AbsolutePath.Trim('/').Split('/');
            var uploadIdx = Array.IndexOf(path, "upload");
            if (uploadIdx < 1) return;
            var resourceType = path[uploadIdx - 1];
            var rest = path.Skip(uploadIdx + 1).ToList();
            if (rest.Count > 0 && rest[0].Length > 1 && rest[0][0] == 'v' && rest[0][1..].All(char.IsDigit)) rest.RemoveAt(0);
            var publicId = string.Join('/', rest);
            var dot = publicId.LastIndexOf('.');
            if (dot > 0) publicId = publicId[..dot];

            var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
            using var form = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["public_id"] = publicId,
                ["api_key"] = _apiKey,
                ["timestamp"] = timestamp,
                ["signature"] = Sign($"public_id={publicId}&timestamp={timestamp}"),
            });
            using var res = await Http.PostAsync($"https://api.cloudinary.com/v1_1/{_cloud}/{resourceType}/destroy", form, ct);
            if (!res.IsSuccessStatusCode)
                _log.LogWarning("Cloudinary destroy {PublicId} lỗi {Status}", publicId, (int)res.StatusCode);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            _log.LogWarning(ex, "Không xóa được file {Url} trên Cloudinary", url);
        }
    }

    private string Sign(string payload)
    {
        var hash = SHA1.HashData(Encoding.UTF8.GetBytes(payload + _apiSecret));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
