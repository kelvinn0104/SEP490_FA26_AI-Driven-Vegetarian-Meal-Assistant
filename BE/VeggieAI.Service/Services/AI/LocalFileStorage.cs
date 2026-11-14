using Microsoft.Extensions.Configuration;

namespace VeggieAI.Service.Services.AI;

public interface IFileStorage
{
    Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default);
}

public class LocalFileStorage : IFileStorage
{
    private readonly string _root;

    public LocalFileStorage(IConfiguration config)
    {
        _root = config["Storage:LocalRoot"] ?? Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads");
    }

    public async Task<string> SaveAsync(Stream content, string originalFileName, string folder, CancellationToken ct = default)
    {
        var ext = Path.GetExtension(originalFileName).ToLowerInvariant();
        if (ext is not (".jpg" or ".jpeg" or ".png" or ".webp" or ".heic" or ".heif")) ext = ".jpg";
        var safeFolder = string.Concat(folder.Where(char.IsLetterOrDigit));
        var dir = Path.Combine(_root, safeFolder, DateTime.UtcNow.ToString("yyyyMM"));
        Directory.CreateDirectory(dir);
        var name = $"{Guid.NewGuid():N}{ext}";
        await using (var fs = File.Create(Path.Combine(dir, name)))
            await content.CopyToAsync(fs, ct);
        return $"/uploads/{safeFolder}/{DateTime.UtcNow:yyyyMM}/{name}";
    }
}
