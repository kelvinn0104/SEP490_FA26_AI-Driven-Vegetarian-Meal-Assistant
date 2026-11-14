using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NutritionAnalyticsController : ControllerBase
{
    private readonly INutritionAnalyticsService _analyticsService;

    public NutritionAnalyticsController(INutritionAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<ApiResponse<NutritionOverviewDto>>> GetOverview()
    {
        var data = await _analyticsService.GetOverviewAnalyticsAsync();
        return Ok(ApiResponse<NutritionOverviewDto>.Ok(data));
    }

    [HttpGet("deficits")]
    public async Task<ActionResult<ApiResponse<List<DeficitItemDto>>>> GetDeficits()
    {
        var data = await _analyticsService.GetMicronutrientDeficitsAsync();
        return Ok(ApiResponse<List<DeficitItemDto>>.Ok(data));
    }

    [HttpGet("trends")]
    public async Task<ActionResult<ApiResponse<List<IngredientPopularityDto>>>> GetTrends()
    {
        var data = await _analyticsService.GetTopIngredientsTrendsAsync();
        return Ok(ApiResponse<List<IngredientPopularityDto>>.Ok(data));
    }
}

