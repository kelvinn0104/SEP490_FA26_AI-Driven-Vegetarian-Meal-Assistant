using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
public class LogsController : ApiControllerBase
{
    private readonly ISystemLogService _logService;

    public LogsController(ISystemLogService logService)
    {
        _logService = logService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SystemLogDto>>>> GetLogs(
        [FromQuery] string? type,
        [FromQuery] string? search,
        [FromQuery] int limit = 100)
    {
        var logs = await _logService.GetLogsAsync(type, search, limit);
        return Ok(ApiResponse<List<SystemLogDto>>.Ok(logs));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SystemLogDto>>> CreateLog([FromBody] CreateSystemLogRequest request)
    {
        var userId = GetRequiredUserId();
        var result = await _logService.CreateLogAsync(request, userId);
        return Ok(ApiResponse<SystemLogDto>.Ok(result, "Ghi nhận log hệ thống thành công"));
    }
}
