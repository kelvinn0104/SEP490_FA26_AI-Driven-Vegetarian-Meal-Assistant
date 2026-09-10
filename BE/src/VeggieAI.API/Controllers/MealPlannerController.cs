using Microsoft.AspNetCore.Mvc;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MealPlannerController : ControllerBase
{
    private readonly IMealPlannerService _mealPlannerService;

    public MealPlannerController(IMealPlannerService mealPlannerService)
    {
        _mealPlannerService = mealPlannerService;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GeneratePlan([FromBody] List<string> ingredients)
    {
        var dummyUserId = Guid.NewGuid();
        var plan = await _mealPlannerService.GenerateWeeklyPlanAsync(dummyUserId, ingredients);
        return Ok(plan);
    }
}
