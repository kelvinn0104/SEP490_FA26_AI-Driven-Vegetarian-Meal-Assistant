using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[Route("api/[controller]")]
[Authorize(Policy = RoleConstants.AuthenticatedUserPolicy)]
public class IngredientsController : ApiControllerBase
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
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<IngredientDto>>> CreateIngredient([FromBody] CreateIngredientRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _ingredientService.CreateIngredientAsync(request, modId);
        return CreatedAtAction(nameof(GetIngredientById), new { id = item.Id }, ApiResponse<IngredientDto>.Ok(item, "Thêm nguyên liệu thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<IngredientDto>>> UpdateIngredient(int id, [FromBody] UpdateIngredientRequest request)
    {
        var modId = GetRequiredUserId();
        var item = await _ingredientService.UpdateIngredientAsync(id, request, modId);
        if (item == null) return NotFound(ApiResponse<IngredientDto>.Fail("Không tìm thấy nguyên liệu"));
        return Ok(ApiResponse<IngredientDto>.Ok(item, "Cập nhật thành phần dinh dưỡng thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = RoleConstants.ModOnlyPolicy)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteIngredient(int id)
    {
        var modId = GetRequiredUserId();
        var ok = await _ingredientService.DeleteIngredientAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy nguyên liệu"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa nguyên liệu"));
    }

    [HttpGet("allergies")]
    public async Task<ActionResult<ApiResponse<List<AllergyAdminDto>>>> GetAllergies()
    {
        var items = await _ingredientService.GetAllergiesAsync();
        return Ok(ApiResponse<List<AllergyAdminDto>>.Ok(items));
    }

    [HttpGet("standards")]
    public async Task<ActionResult<ApiResponse<List<NutrientStandardDto>>>> GetNutrientStandards()
    {
        var items = await _ingredientService.GetNutrientStandardsAsync();
        return Ok(ApiResponse<List<NutrientStandardDto>>.Ok(items));
    }
}
