using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Application.Common;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Infrastructure;

public class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _http;
    public CurrentUser(IHttpContextAccessor http) => _http = http;

    public int? UserId =>
        int.TryParse(_http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : null;

    public int RequiredUserId => UserId ?? throw AppException.Unauthorized("Bạn cần đăng nhập.");
    public string? Role => _http.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
}

/// <summary>Converts AppException (and unexpected errors) into RFC 7807 problem+json.</summary>
public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _log;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> log, IHostEnvironment env)
    {
        _next = next; _log = log; _env = env;
    }

    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await _next(ctx); }
        catch (AppException ex)
        {
            await Write(ctx, ex.StatusCode, ex.Message);
        }
        catch (Microsoft.EntityFrameworkCore.DbUpdateException ex)
        {
            _log.LogWarning(ex, "DB update failed");
            await Write(ctx, 409, "Dữ liệu vi phạm ràng buộc của cơ sở dữ liệu: " + (ex.InnerException?.Message ?? ex.Message));
        }
        catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested) { }
        catch (Exception ex)
        {
            _log.LogError(ex, "Unhandled error");
            await Write(ctx, 500, _env.IsDevelopment() ? ex.ToString() : "Đã có lỗi xảy ra.");
        }
    }

    private static Task Write(HttpContext ctx, int status, string detail)
    {
        if (ctx.Response.HasStarted) return Task.CompletedTask;
        ctx.Response.Clear();
        ctx.Response.StatusCode = status;
        return ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = Title(status), Detail = detail },
            options: null, contentType: "application/problem+json");
    }

    private static string Title(int s) => s switch
    {
        400 => "Bad Request", 401 => "Unauthorized", 403 => "Forbidden", 404 => "Not Found", 409 => "Conflict",
        502 => "Bad Gateway", 503 => "Service Unavailable", _ => "Error",
    };
}

[ApiController]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    protected int UserId => HttpContext.RequestServices.GetRequiredService<ICurrentUser>().RequiredUserId;
    protected int? OptionalUserId => HttpContext.RequestServices.GetRequiredService<ICurrentUser>().UserId;
}
