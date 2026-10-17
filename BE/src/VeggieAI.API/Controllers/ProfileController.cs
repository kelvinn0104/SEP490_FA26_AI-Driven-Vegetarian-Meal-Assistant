using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

[Route("api/health-profile"), Authorize]
public class HealthProfileController : ApiControllerBase
{
    private readonly IHealthProfileService _svc;
    public HealthProfileController(IHealthProfileService svc) => _svc = svc;

    /// <summary>Hồ sơ sức khỏe + BMI/BMR/TDEE + mục tiêu dinh dưỡng đã tính.</summary>
    [HttpGet]
    public async Task<ActionResult<HealthProfileDto>> Get(CancellationToken ct) =>
        await _svc.GetAsync(UserId, ct) is { } p ? Ok(p) : NotFound(new ProblemDetails { Status = 404, Detail = "Chưa có hồ sơ sức khỏe." });

    /// <summary>Tạo mới / cập nhật hồ sơ (tự tính lại BMI, calo, macro, vi chất).</summary>
    [HttpPut]
    public async Task<ActionResult<HealthProfileDto>> Upsert(HealthProfileRequest req, CancellationToken ct) =>
        Ok(await _svc.UpsertAsync(UserId, req, ct));

    /// <summary>Xem trước mục tiêu dinh dưỡng (không lưu).</summary>
    [HttpPost("preview"), AllowAnonymous]
    public async Task<ActionResult<NutrientAmountsDto>> Preview(HealthProfileRequest req, CancellationToken ct) =>
        Ok(await _svc.PreviewAsync(req, ct));

    [HttpGet("allergies")]
    public async Task<ActionResult<IReadOnlyList<AllergyDto>>> MyAllergies(CancellationToken ct) =>
        Ok(await _svc.GetMyAllergiesAsync(UserId, ct));

    /// <summary>Thay toàn bộ danh sách dị ứng của tôi.</summary>
    [HttpPut("allergies")]
    public async Task<ActionResult<IReadOnlyList<AllergyDto>>> SetAllergies(SetAllergiesRequest req, CancellationToken ct) =>
        Ok(await _svc.SetMyAllergiesAsync(UserId, req.AllergyIds, ct));
}

/// <summary>Danh mục dùng chung (không cần đăng nhập).</summary>
[Route("api"), AllowAnonymous]
public class CatalogController : ApiControllerBase
{
    private readonly ICatalogService _svc;
    public CatalogController(ICatalogService svc) => _svc = svc;

    [HttpGet("allergies")]
    public async Task<ActionResult<IReadOnlyList<AllergyDto>>> Allergies(CancellationToken ct) => Ok(await _svc.GetAllergiesAsync(ct));

    /// <param name="type">food_type | recipe</param>
    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> Categories([FromQuery] string? type, CancellationToken ct) =>
        Ok(await _svc.GetCategoriesAsync(type, ct));

    [HttpGet("ingredients")]
    public async Task<IActionResult> Ingredients([FromQuery] string? keyword, [FromQuery] Application.Common.PageQuery page, CancellationToken ct) =>
        Ok(await _svc.GetIngredientsAsync(keyword, page, ct));

    [HttpGet("ingredients/{id:int}")]
    public async Task<ActionResult<IngredientDto>> Ingredient(int id, CancellationToken ct) => Ok(await _svc.GetIngredientAsync(id, ct));
}
