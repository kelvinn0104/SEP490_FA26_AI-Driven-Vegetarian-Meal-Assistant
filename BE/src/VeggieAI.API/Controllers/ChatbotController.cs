using Microsoft.AspNetCore.Mvc;

namespace VeggieAI.API.Controllers;

public class ChatQueryDto
{
    public string Query { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    [HttpPost("ask")]
    public IActionResult AskNutrition([FromBody] ChatQueryDto request)
    {
        return Ok(new
        {
            Answer = $"VeggieAI RAG Assistant: Đối với câu hỏi '{request.Query}', người ăn chay nên bổ sung Vitamin B12 từ thực phẩm tăng cường hoặc men dinh dưỡng (nutritional yeast) và kết hợp Vitamin C để tăng hấp thu Sắt.",
            Timestamp = DateTime.UtcNow
        });
    }
}
