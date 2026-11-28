using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.ManagementAccessPolicy)]
public class NutritionAnalyticsController : ApiControllerBase
{
    private readonly INutritionAnalyticsService _analyticsService;

    public NutritionAnalyticsController(INutritionAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    /// <summary>Returns a validation error message, or null when the query parameters are valid.</summary>
    private static string? ValidateQuery(int periodDays, string? averagingMode)
    {
        if (periodDays < NutritionAnalyticsService.MinPeriodDays || periodDays > NutritionAnalyticsService.MaxPeriodDays)
        {
            return $"periodDays phải nằm trong khoảng {NutritionAnalyticsService.MinPeriodDays}–{NutritionAnalyticsService.MaxPeriodDays} ngày.";
        }

        if (averagingMode != null && !NutritionAnalyticsService.IsSupportedMode(averagingMode))
        {
            return $"averagingMode không hợp lệ. Giá trị hỗ trợ: {string.Join(", ", NutritionAnalyticsService.SupportedModes)}.";
        }

        return null;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<NutritionOverviewDto>>> GetOverview(
        [FromQuery] int periodDays = 30,
        [FromQuery] string averagingMode = NutritionAnalyticsService.ModePerLoggedDay)
    {
        var error = ValidateQuery(periodDays, averagingMode);
        if (error != null) return BadRequest(ApiResponse<NutritionOverviewDto>.Fail(error));

        var data = await _analyticsService.GetOverviewAnalyticsAsync(periodDays, averagingMode);
        return Ok(ApiResponse<NutritionOverviewDto>.Ok(data));
    }

    [HttpGet("deficits")]
    public async Task<ActionResult<ApiResponse<List<DeficitItemDto>>>> GetDeficits(
        [FromQuery] int periodDays = 30,
        [FromQuery] string averagingMode = NutritionAnalyticsService.ModePerLoggedDay)
    {
        var error = ValidateQuery(periodDays, averagingMode);
        if (error != null) return BadRequest(ApiResponse<List<DeficitItemDto>>.Fail(error));

        var data = await _analyticsService.GetMicronutrientDeficitsAsync(periodDays, averagingMode);
        return Ok(ApiResponse<List<DeficitItemDto>>.Ok(data));
    }

    [HttpGet("trends")]
    public async Task<ActionResult<ApiResponse<List<IngredientPopularityDto>>>> GetTrends([FromQuery] int periodDays = 30)
    {
        var error = ValidateQuery(periodDays, null);
        if (error != null) return BadRequest(ApiResponse<List<IngredientPopularityDto>>.Fail(error));

        var data = await _analyticsService.GetTopIngredientsTrendsAsync(periodDays);
        return Ok(ApiResponse<List<IngredientPopularityDto>>.Ok(data));
    }
}
