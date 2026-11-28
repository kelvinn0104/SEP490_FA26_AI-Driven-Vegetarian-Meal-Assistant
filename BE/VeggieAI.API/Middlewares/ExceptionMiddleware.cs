using System.Diagnostics;
using System.Net;
using System.Text.Json;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Exceptions;

namespace VeggieAI.API.Middlewares;

/// <summary>
/// Chuyển exception thành ApiResponse thống nhất:
/// { success: false, message, errors: [ERROR_CODE, ...], traceId }.
/// Lỗi nghiệp vụ (AppException, EmailNotVerified, TooManyRequests, InvalidOperation, Unauthorized) giữ message cho người dùng.
/// Lỗi không lường trước (500) chỉ trả message chung + traceId; chi tiết exception nằm trong log BE
/// (môi trường Development mới kèm chi tiết để debug).
/// </summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // Client tự hủy request → không cần ghi lỗi
        }
        catch (Exception ex)
        {
            var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
            var isUnexpected = StatusCodeOf(ex) >= 500 && ex is not AppException;
            if (isUnexpected)
                _logger.LogError(ex, "Unhandled exception (traceId {TraceId}): {Message}", traceId, ex.Message);
            else
                _logger.LogWarning("Request lỗi nghiệp vụ (traceId {TraceId}): {Message}", traceId, ex.Message);

            if (context.Response.HasStarted) throw;
            await HandleExceptionAsync(context, ex, traceId, isUnexpected);
        }
    }

    private static int StatusCodeOf(Exception exception) => exception switch
    {
        AppException app => app.StatusCode,
        EmailNotVerifiedException => (int)HttpStatusCode.Forbidden,
        TooManyRequestsException => (int)HttpStatusCode.TooManyRequests,
        UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
        InvalidOperationException => (int)HttpStatusCode.BadRequest,
        KeyNotFoundException => (int)HttpStatusCode.NotFound,
        _ => (int)HttpStatusCode.InternalServerError
    };

    private Task HandleExceptionAsync(HttpContext context, Exception exception, string traceId, bool isUnexpected)
    {
        context.Response.ContentType = "application/json";
        var statusCode = StatusCodeOf(exception);
        context.Response.StatusCode = statusCode;

        // errors[0] luôn là mã lỗi máy đọc được để FE rẽ nhánh (chuyển sang bước OTP, khóa nút gửi lại, hiện nút thử lại...)
        var errors = exception switch
        {
            EmailNotVerifiedException => new List<string> { EmailNotVerifiedException.Code },
            TooManyRequestsException tm => new List<string> { TooManyRequestsException.Code, $"retryAfterSeconds={tm.RetryAfterSeconds}" },
            AppException app => new List<string> { app.ErrorCode ?? DefaultCode(statusCode) },
            _ when isUnexpected => new List<string> { "INTERNAL_ERROR" },
            _ => new List<string> { DefaultCode(statusCode) }
        };
        if (isUnexpected && _env.IsDevelopment())
        {
            errors.Add(exception.InnerException?.Message ?? exception.Message);
        }
        if (exception is TooManyRequestsException tooMany)
        {
            context.Response.Headers.RetryAfter = tooMany.RetryAfterSeconds.ToString();
        }

        var message = isUnexpected
            ? "Hệ thống đang gặp sự cố, vui lòng thử lại sau."
            : exception.Message;

        var response = new ErrorResponse
        {
            Success = false,
            Message = message,
            Errors = errors,
            TraceId = traceId,
        };

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return context.Response.WriteAsync(json);
    }

    private static string DefaultCode(int statusCode) => statusCode switch
    {
        400 => "BAD_REQUEST",
        401 => "UNAUTHORIZED",
        403 => "FORBIDDEN",
        404 => "NOT_FOUND",
        409 => "CONFLICT",
        429 => "TOO_MANY_REQUESTS",
        503 => "SERVICE_UNAVAILABLE",
        _ => statusCode >= 500 ? "INTERNAL_ERROR" : "ERROR"
    };

    private sealed class ErrorResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public object? Data { get; set; }
        public List<string>? Errors { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? TraceId { get; set; }
    }
}
