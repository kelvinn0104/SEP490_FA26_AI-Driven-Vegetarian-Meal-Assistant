using Microsoft.AspNetCore.Mvc;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModerationController : ControllerBase
{
    [HttpGet("pending-posts")]
    public IActionResult GetPendingPosts()
    {
        var posts = new[]
        {
            new { Id = Guid.NewGuid(), Title = "Công thức Đậu hũ sốt Cà chua chuẩn vị", Author = "NguyenVanA", Type = "Blog", Status = "Pending" },
            new { Id = Guid.NewGuid(), Title = "Video: Hướng dẫn làm Sữa Hạt Sen tại nhà", Author = "TranThiB", Type = "CookingVideo", Status = "Pending" }
        };
        return Ok(posts);
    }

    [HttpPost("approve/{id}")]
    public IActionResult ApprovePost(Guid id)
    {
        return Ok(new { Message = $"Post {id} has been approved by Moderator." });
    }

    [HttpPost("reject/{id}")]
    public IActionResult RejectPost(Guid id, [FromBody] string reason)
    {
        return Ok(new { Message = $"Post {id} has been rejected.", Reason = reason });
    }
}
