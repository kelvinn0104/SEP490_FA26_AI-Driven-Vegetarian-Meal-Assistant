using Microsoft.AspNetCore.Mvc;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult CheckHealth()
    {
        return Ok(new
        {
            Status = "Healthy",
            Service = "VeggieAI Core API",
            Timestamp = DateTime.UtcNow
        });
    }
}
