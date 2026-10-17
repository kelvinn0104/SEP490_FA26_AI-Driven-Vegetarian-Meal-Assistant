using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Interfaces;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.API.Controllers;

[ApiController, Route("api/health"), AllowAnonymous]
public class HealthController : ControllerBase
{
    /// <summary>Kiểm tra API, kết nối database và cấu hình AI.</summary>
    [HttpGet]
    public async Task<IActionResult> CheckHealth([FromServices] VeggieAiDbContext db, [FromServices] ILlmClient llm, CancellationToken ct)
    {
        bool dbOk;
        int? recipes = null;
        try
        {
            recipes = await db.Recipes.CountAsync(ct);
            dbOk = true;
        }
        catch { dbOk = false; }

        return Ok(new
        {
            Status = dbOk ? "Healthy" : "Degraded",
            Service = "VeggieAI Core API",
            Database = dbOk ? "connected" : "unreachable",
            Recipes = recipes,
            AiConfigured = llm.IsConfigured,
            Timestamp = DateTime.UtcNow,
        });
    }
}
