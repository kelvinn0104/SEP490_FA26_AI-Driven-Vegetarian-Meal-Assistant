using Microsoft.AspNetCore.Mvc;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VisionController : ControllerBase
{
    [HttpPost("detect")]
    public IActionResult DetectIngredients()
    {
        return Ok(new
        {
            Status = "Success",
            DetectedItems = new[]
            {
                new { Name = "Tofu", Confidence = 0.95, Freshness = "Fresh" },
                new { Name = "Broccoli", Confidence = 0.89, Freshness = "Fresh" },
                new { Name = "Mushroom", Confidence = 0.92, Freshness = "Use Soon" }
            },
            SuggestedRecipes = new[] { "Tofu Broccoli Stir Fry", "Mushroom Soup" }
        });
    }
}
