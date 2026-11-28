namespace VeggieAI.Model.DTOs;

public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public List<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, List<string>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / Math.Max(1, PageSize));
}

/// <summary>Kết quả POST /api/uploads. kind: image | video. durable = false khi đang lưu trên ổ đĩa server (mất khi redeploy).</summary>
public record UploadResultDto(string Url, string ContentType, long Size, string Kind, bool Durable)
{
    public string FileName => System.IO.Path.GetFileName(Url);
    public long SizeBytes => Size;
}

/// <summary>Kết quả GET /api/ingredients — dùng để chọn nguyên liệu khi xác nhận scan, tạo công thức.</summary>
public record IngredientLookupDto(int Id, string Name, decimal KcalPer100g, decimal ProteinPer100g);
