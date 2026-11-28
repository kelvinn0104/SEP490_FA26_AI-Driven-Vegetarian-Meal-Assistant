using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
public class ModerationController : ApiControllerBase
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

    [HttpGet("history")]
    public async Task<ActionResult<ApiResponse<List<ModerationItemDto>>>> GetHistory([FromQuery] int limit = 30)
    {
        var result = await _moderationService.GetModerationHistoryAsync(limit);
        return Ok(ApiResponse<List<ModerationItemDto>>.Ok(result));
    }

    [HttpGet("count")]
    public async Task<ActionResult<ApiResponse<int>>> GetPendingCount()
    {
        var count = await _moderationService.GetPendingCountAsync();
        return Ok(ApiResponse<int>.Ok(count));
    }

    [HttpPost("{id}/approve")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> Approve(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetRequiredUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "approved" };
        actionRequest.Decision = "approved";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung cần duyệt"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã phê duyệt và xuất bản nội dung thành công!"));
    }

    [HttpPost("{id}/reject")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> Reject(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetRequiredUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "rejected" };
        actionRequest.Decision = "rejected";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã từ chối xuất bản nội dung vi phạm!"));
    }

    [HttpPost("{id}/revision")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> RequestRevision(string id, [FromBody] ModerationActionRequest? request)
    {
        var reviewerId = GetRequiredUserId();
        var actionRequest = request ?? new ModerationActionRequest { Decision = "revision" };
        actionRequest.Decision = "revision";

        var ok = await _moderationService.ModerateAsync(id, actionRequest, reviewerId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nội dung"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã gửi yêu cầu chỉnh sửa cho tác giả!"));
    }
}

[Route("api/[controller]")]
[Authorize]
public class AiController : ApiControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("health")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<object>>> GetHealth()
    {
        var models = await _aiService.GetModelsAsync();
        var activeCount = models.Count(m => m.Status == "active");
        var role = GetCurrentUserRole();
        var canConfigureModels = role == RoleConstants.SuperAdmin;

        return Ok(ApiResponse<object>.Ok(new
        {
            status = activeCount > 0 ? "healthy" : "degraded",
            activeModels = activeCount,
            totalModels = models.Count,
            accessScope = canConfigureModels ? "system_supervision_and_config" : "operational_read_only",
            canConfigureModels
        }, "Trạng thái dịch vụ AI"));
    }

    [HttpGet("models")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<List<AiModelDto>>>> GetModels()
    {
        var result = await _aiService.GetModelsAsync();
        return Ok(ApiResponse<List<AiModelDto>>.Ok(result));
    }

    [HttpPut("models/{id}/status")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateModelStatus(int id, [FromBody] UpdateAiModelStatusRequest request)
    {
        var adminId = GetRequiredUserId();
        var ok = await _aiService.UpdateModelStatusAsync(id, request.Status, adminId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy mô hình"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật trạng thái mô hình thành công"));
    }

    [HttpGet("telemetry")]
    [Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
    public async Task<ActionResult<ApiResponse<List<AiTelemetryLogDto>>>> GetTelemetry([FromQuery] int limit = 30)
    {
        var result = await _aiService.GetTelemetryLogsAsync(limit);
        return Ok(ApiResponse<List<AiTelemetryLogDto>>.Ok(result));
    }

    [HttpPost("recipe/parse-macros")]
    [Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
    public async Task<ActionResult<ApiResponse<NutritionAnalysisResponse>>> ParseMacros([FromBody] NutritionAnalysisRequest request)
    {
        var userId = GetRequiredUserId();
        var result = await _aiService.ParseNutritionAsync(request.RecipeText, userId);
        return Ok(ApiResponse<NutritionAnalysisResponse>.Ok(result, result.Analyzed
            ? "Phân tích dinh dưỡng hoàn tất"
            : "Không tìm thấy nguyên liệu tương ứng để phân tích"));
    }
}

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
public class DashboardController : ApiControllerBase
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
    public async Task<ActionResult<ApiResponse<List<WeeklyChartDayDto>>>> GetCharts([FromQuery] int days = 7)
    {
        var result = await _dashboardService.GetWeeklyChartDataAsync(days);
        return Ok(ApiResponse<List<WeeklyChartDayDto>>.Ok(result));
    }

    [HttpGet("activities")]
    public async Task<ActionResult<ApiResponse<List<ActivityItemDto>>>> GetActivities()
    {
        var result = await _dashboardService.GetRecentActivitiesAsync();
        return Ok(ApiResponse<List<ActivityItemDto>>.Ok(result));
    }
}

/// <summary>
/// Note: Class-level [Authorize] only requires authentication so action-level policies
/// do NOT stack SuperAdminOnly onto GET /api/roles/my-permissions (allowing Mod to fetch own permissions).
/// </summary>
[Route("api/[controller]")]
[Authorize]
public class RolesController : ApiControllerBase
{
    private readonly IRoleService _roleService;

    public RolesController(IRoleService roleService)
    {
        _roleService = roleService;
    }

    [HttpGet]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<List<RoleDto>>>> GetRoles()
    {
        var result = await _roleService.GetRolesAsync();
        return Ok(ApiResponse<List<RoleDto>>.Ok(result));
    }

    [HttpGet("permissions")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<List<PermissionDto>>>> GetPermissions()
    {
        var result = await _roleService.GetAllPermissionsAsync();
        return Ok(ApiResponse<List<PermissionDto>>.Ok(result));
    }

    [HttpGet("my-permissions")]
    [Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
    public async Task<ActionResult<ApiResponse<List<string>>>> GetMyPermissions()
    {
        var role = GetCurrentUserRole();
        var result = await _roleService.GetPermissionsByRoleAsync(role);
        return Ok(ApiResponse<List<string>>.Ok(result));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<RoleDto>>> UpdateRole(string id, [FromBody] SaveRoleRequest request)
    {
        var adminId = GetRequiredUserId();
        var result = await _roleService.SaveRoleAsync(id, request, adminId);
        return Ok(ApiResponse<RoleDto>.Ok(result, "Cập nhật phân quyền thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRole(string id)
    {
        var adminId = GetRequiredUserId();
        var ok = await _roleService.DeleteRoleAsync(id, adminId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy vai trò cần xóa"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa vai trò"));
    }
}

[Route("api/system-settings")]
[Authorize(Policy = RoleConstants.SuperAdminOnlyPolicy)]
public class SystemSettingsController : ApiControllerBase
{
    private readonly ISystemSettingService _settingService;

    public SystemSettingsController(ISystemSettingService settingService)
    {
        _settingService = settingService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<SystemSettingDto>>>> GetSettings([FromQuery] string? search)
    {
        var result = await _settingService.GetSettingsAsync(search);
        return Ok(ApiResponse<List<SystemSettingDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SystemSettingDto>>> SaveSetting([FromBody] SaveSystemSettingRequest request)
    {
        var adminId = GetRequiredUserId();
        var result = await _settingService.SaveSettingAsync(request, adminId);
        return Ok(ApiResponse<SystemSettingDto>.Ok(result, "Lưu cấu hình hệ thống thành công"));
    }

    [HttpDelete("{key}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteSetting(string key)
    {
        var adminId = GetRequiredUserId();
        var ok = await _settingService.DeleteSettingAsync(Uri.UnescapeDataString(key), adminId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy khóa cấu hình"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa cấu hình hệ thống"));
    }
}
