using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<CategoryDto>>>> GetCategories([FromQuery] string? type)
    {
        var result = await _categoryService.GetCategoriesAsync(type);
        return Ok(ApiResponse<List<CategoryDto>>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateCategoryAsync(request);
        return Ok(ApiResponse<CategoryDto>.Ok(result, "Tạo danh mục thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, request);
        if (result == null) return NotFound(ApiResponse<CategoryDto>.Fail("Không tìm thấy danh mục"));
        return Ok(ApiResponse<CategoryDto>.Ok(result, "Cập nhật danh mục thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteCategory(int id)
    {
        var ok = await _categoryService.DeleteCategoryAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy danh mục"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa danh mục"));
    }
}

[ApiController]
[Route("api/[controller]")]
public class RecipesController : ControllerBase
{
    private readonly IRecipeService _recipeService;

    public RecipesController(IRecipeService recipeService)
    {
        _recipeService = recipeService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<RecipeDto>>>> GetRecipes(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int? categoryId)
    {
        var result = await _recipeService.GetRecipesAsync(search, status, categoryId);
        return Ok(ApiResponse<List<RecipeDto>>.Ok(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RecipeDto>>> GetRecipeById(string id)
    {
        var result = await _recipeService.GetRecipeByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<RecipeDto>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<RecipeDto>.Ok(result));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<RecipeDto>>> CreateRecipe([FromBody] CreateRecipeRequest request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        int creatorId = int.TryParse(userIdStr, out var id) ? id : 1; // Default to admin/system user

        var result = await _recipeService.CreateRecipeAsync(request, creatorId);
        return CreatedAtAction(nameof(GetRecipeById), new { id = result.Id }, ApiResponse<RecipeDto>.Ok(result, "Tạo công thức thành công"));
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateRecipeStatus(string id, [FromBody] UpdateRecipeStatusRequest request)
    {
        var ok = await _recipeService.UpdateRecipeStatusAsync(id, request.Status);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật trạng thái thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRecipe(string id)
    {
        var ok = await _recipeService.DeleteRecipeAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa công thức thành công"));
    }
}
