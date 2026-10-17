using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModerationController : ControllerBase
{
    private readonly IModerationService _moderationService;

    public ModerationController(IModerationService moderationService)
    {
        _moderationService = moderationService;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<ApiResponse<List<ModerationItemDto>>>> GetPending([FromQuery] string? type)
    {
        var result = await _moderationService.GetPendingItemsAsync(type);
        return Ok(ApiResponse<List<ModerationItemDto>>.Ok(result));
    }

    [HttpGet("count")]
    public async Task<ActionResult<ApiResponse<int>>> GetPendingCount()
    {
        var count = await _moderationService.GetPendingCountAsync();
        return Ok(ApiResponse<int>.Ok(count));
    }

    [HttpPost("{id}/approve")]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetCurrentUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "approved" };
        actionRequest.Decision = "approved";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung cần duyệt"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã phê duyệt và xuất bản nội dung thành công!"));
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetCurrentUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "rejected" };
        actionRequest.Decision = "rejected";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối xuất bản nội dung vi phạm!"));
    }

    [HttpPost("{id}/revision")]
    public async Task<ActionResult<ApiResponse<bool>>> RequestRevision(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetCurrentUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "revision" };
        actionRequest.Decision = "revision";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã gửi yêu cầu chỉnh sửa cho tác giả!"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 2; // Default to Moderator
    }
}

[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("health")]
    public ActionResult<ApiResponse<object>> GetHealth()
    {
        return Ok(ApiResponse<object>.Ok(new
        {
            status = "healthy",
            uptime = "99.98%",
            cluster = "Cụm HCM-01",
            memoryUsage = "68%",
            gpuTemperature = "58°C"
        }, "Hệ thống AI đang hoạt động tối ưu"));
    }

    [HttpGet("models")]
    public async Task<ActionResult<ApiResponse<List<AiModelDto>>>> GetModels()
    {
        var result = await _aiService.GetModelsAsync();
        return Ok(ApiResponse<List<AiModelDto>>.Ok(result));
    }

    [HttpPut("models/{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateModelStatus(int id, [FromBody] UpdateAiModelStatusRequest request)
    {
        var ok = await _aiService.UpdateModelStatusAsync(id, request.Status);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy mô hình"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật trạng thái mô hình thành công"));
    }

    [HttpGet("telemetry")]
    public async Task<ActionResult<ApiResponse<List<AiTelemetryLogDto>>>> GetTelemetry()
    {
        var result = await _aiService.GetTelemetryLogsAsync();
        return Ok(ApiResponse<List<AiTelemetryLogDto>>.Ok(result));
    }

    [HttpPost("recipe/parse-macros")]
    public async Task<ActionResult<ApiResponse<NutritionAnalysisResponse>>> ParseMacros([FromBody] NutritionAnalysisRequest request)
    {
        var result = await _aiService.ParseNutritionAsync(request.RecipeText);
        return Ok(ApiResponse<NutritionAnalysisResponse>.Ok(result, "Phân tích dinh dưỡng AI hoàn tất"));
    }
}

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<DashboardOverviewDto>>> GetStats()
    {
        var result = await _dashboardService.GetOverviewStatsAsync();
        return Ok(ApiResponse<DashboardOverviewDto>.Ok(result));
    }

    [HttpGet("diet-distribution")]
    public async Task<ActionResult<ApiResponse<List<DietDistributionItemDto>>>> GetDietDistribution()
    {
        var result = await _dashboardService.GetDietDistributionAsync();
        return Ok(ApiResponse<List<DietDistributionItemDto>>.Ok(result));
    }

    [HttpGet("charts")]
    public async Task<ActionResult<ApiResponse<List<WeeklyChartDayDto>>>> GetCharts()
    {
        var result = await _dashboardService.GetWeeklyChartDataAsync();
        return Ok(ApiResponse<List<WeeklyChartDayDto>>.Ok(result));
    }

    [HttpGet("activities")]
    public async Task<ActionResult<ApiResponse<List<ActivityItemDto>>>> GetActivities()
    {
        var result = await _dashboardService.GetRecentActivitiesAsync();
        return Ok(ApiResponse<List<ActivityItemDto>>.Ok(result));
    }
}

[ApiController]
[Route("api/[controller]")]
public class RolesController : ControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetRoles()
    {
        var result = await _roleService.GetRolesAsync();
        return Ok(ApiResponse<List<RoleDto>>.Ok(result));
    }

    [HttpGet("permissions")]
    public async Task<ActionResult<ApiResponse<List<PermissionDto>>>> GetPermissions()
    {
        var result = await _roleService.GetAllPermissionsAsync();
        return Ok(ApiResponse<List<PermissionDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RoleDto>>> CreateRole([FromBody] SaveRoleRequest request)
    {
        var result = await _roleService.SaveRoleAsync(null, request);
        return Ok(ApiResponse<RoleDto>.Ok(result, "Tạo vai trò thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<RoleDto>>> UpdateRole(string id, [FromBody] SaveRoleRequest request)
    {
        var result = await _roleService.SaveRoleAsync(id, request);
        return Ok(ApiResponse<RoleDto>.Ok(result, "Cập nhật vai trò thành công"));
    }
}
