using System.Net;
using System.Text.Json;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Exceptions;

namespace VeggieAI.API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            AppException app => app.StatusCode,
            EmailNotVerifiedException => (int)HttpStatusCode.Forbidden,
            TooManyRequestsException => (int)HttpStatusCode.TooManyRequests,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.StatusCode = statusCode;

        // Mã lỗi máy đọc được để FE xử lý (chuyển sang bước OTP, khóa nút gửi lại...)
        var errors = exception switch
        {
            EmailNotVerifiedException => new List<string> { EmailNotVerifiedException.Code },
            TooManyRequestsException tm => new List<string> { TooManyRequestsException.Code, $"retryAfterSeconds={tm.RetryAfterSeconds}" },
            _ => new List<string> { exception.InnerException?.Message ?? exception.Message }
        };
        if (exception is TooManyRequestsException tooMany)
        {
            context.Response.Headers.RetryAfter = tooMany.RetryAfterSeconds.ToString();
        }

        var response = ApiResponse<object>.Fail(exception.Message, errors);

        var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        return context.Response.WriteAsync(json);
    }
}
