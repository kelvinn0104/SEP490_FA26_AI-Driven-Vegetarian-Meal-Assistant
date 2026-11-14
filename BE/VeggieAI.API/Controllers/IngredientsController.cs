using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientsController : ControllerBase
{
    private readonly IIngredientService _ingredientService;

    public IngredientsController(IIngredientService ingredientService)
    {
        _ingredientService = ingredientService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<IngredientDto>>>> GetIngredients(
        [FromQuery] string? search,
        [FromQuery] int? allergyId,
        [FromQuery] string? sortBy)
    {
        var result = await _ingredientService.GetIngredientsAsync(search, allergyId, sortBy);
        return Ok(ApiResponse<List<IngredientDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<IngredientDto>>> GetIngredientById(int id)
    {
        var item = await _ingredientService.GetIngredientByIdAsync(id);
        if (item == null) return NotFound(ApiResponse<IngredientDto>.Fail("Không tìm thấy nguyên liệu"));
        return Ok(ApiResponse<IngredientDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<IngredientDto>>> CreateIngredient([FromBody] CreateIngredientRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await _ingredientService.CreateIngredientAsync(request, userId);
        return CreatedAtAction(nameof(GetIngredientById), new { id = item.Id }, ApiResponse<IngredientDto>.Ok(item, "Thêm nguyên liệu thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<IngredientDto>>> UpdateIngredient(int id, [FromBody] UpdateIngredientRequest request)
    {
        var userId = GetCurrentUserId();
        var item = await _ingredientService.UpdateIngredientAsync(id, request, userId);
        if (item == null) return NotFound(ApiResponse<IngredientDto>.Fail("Không tìm thấy nguyên liệu"));
        return Ok(ApiResponse<IngredientDto>.Ok(item, "Cập nhật thành phần dinh dưỡng thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIngredient(int id)
    {
        var ok = await _ingredientService.DeleteIngredientAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nguyên liệu"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa nguyên liệu"));
    }

    [HttpGet("allergies")]
    public async Task<ActionResult<ApiResponse<List<AllergyDto>>>> GetAllergies()
    {
        var items = await _ingredientService.GetAllergiesAsync();
        return Ok(ApiResponse<List<AllergyDto>>.Ok(items));
    }

    [HttpGet("standards")]
    public async Task<ActionResult<ApiResponse<List<NutrientStandardDto>>>> GetNutrientStandards()
    {
        var items = await _ingredientService.GetNutrientStandardsAsync();
        return Ok(ApiResponse<List<NutrientStandardDto>>.Ok(items));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 2; // Default to Moderator
    }
}
