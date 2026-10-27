using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LogsController : ControllerBase
{
    private readonly ISystemLogService _logService;

    public LogsController(ISystemLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<ApiResponse<List<SystemLogDto>>>> GetLogs(
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int limit = 50)
    {
        var logs = await _logService.GetLogsAsync(type, search, limit);
        return Ok(ApiResponse<List<SystemLogDto>>.Ok(logs));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SystemLogDto>>> CreateLog([FromBody] CreateSystemLogRequest request)
    {
        int? userId = null;
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(idStr, out var parsedId))
        {
            userId = parsedId;
        }

        var result = await _logService.CreateLogAsync(request, userId);
        return Ok(ApiResponse<SystemLogDto>.Ok(result, "Ghi nhận log hệ thống thành công"));
    }
}
