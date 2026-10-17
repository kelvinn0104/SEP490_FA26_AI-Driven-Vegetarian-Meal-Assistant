namespace VeggieAI.Application.Common;

/// <summary>Business error that is translated to an HTTP status code by the API middleware.</summary>
public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message) => StatusCode = statusCode;

    public static AppException NotFound(string what) => new($"{what} không tồn tại.", 404);
    public static AppException Forbidden(string message = "Bạn không có quyền thực hiện thao tác này.") => new(message, 403);
    public static AppException Conflict(string message) => new(message, 409);
    public static AppException Unauthorized(string message) => new(message, 401);
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize == 0 ? 0 : (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class PageQuery
{
    private int _page = 1, _pageSize = 20;
    public int Page { get => _page; set => _page = value < 1 ? 1 : value; }
    public int PageSize { get => _pageSize; set => _pageSize = value is < 1 or > 100 ? 20 : value; }
    public int Skip => (Page - 1) * PageSize;
}
