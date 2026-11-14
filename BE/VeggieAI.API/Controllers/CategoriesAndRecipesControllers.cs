using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory([FromBody] CreateCategoryRequest request)
    {
        var result = await _categoryService.CreateCategoryAsync(request);
        return Ok(ApiResponse<CategoryDto>.Ok(result, "Tạo danh mục thành công"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
    {
        var result = await _categoryService.UpdateCategoryAsync(id, request);
        if (result == null) return NotFound(ApiResponse<CategoryDto>.Fail("Không tìm thấy danh mục"));
        return Ok(ApiResponse<CategoryDto>.Ok(result, "Cập nhật danh mục thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
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
        // Khách/người dùng thường chỉ xem công thức đã duyệt; admin/mod xem được mọi trạng thái
        if (!AppRoles.IsStaff(User.FindFirstValue(ClaimTypes.Role))) status = "published";
        var result = await _recipeService.GetRecipesAsync(search, status, categoryId);
        return Ok(ApiResponse<List<RecipeDto>>.Ok(result));
    }

    /// <summary>Danh sách công thức người dùng đã lưu yêu thích.</summary>
    [HttpGet("favorites")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<PagedResult<RecipeDto>>>> GetFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _recipeService.GetFavoritesAsync(CurrentUserId(), page, pageSize);
        return Ok(ApiResponse<PagedResult<RecipeDto>>.Ok(result));
    }

    [HttpPost("{id}/favorite")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> AddFavorite(string id)
    {
        await _recipeService.AddFavoriteAsync(CurrentUserId(), id);
        return Ok(ApiResponse<bool>.Ok(true, "Đã thêm vào yêu thích"));
    }

    [HttpDelete("{id}/favorite")]
    [Authorize]
    public async Task<ActionResult<ApiResponse<bool>>> RemoveFavorite(string id)
    {
        await _recipeService.RemoveFavoriteAsync(CurrentUserId(), id);
        return Ok(ApiResponse<bool>.Ok(true, "Đã bỏ khỏi yêu thích"));
    }

    private int CurrentUserId() =>
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw AppException.Unauthorized("Bạn cần đăng nhập.");

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<RecipeDto>>> GetRecipeById(string id)
    {
        var result = await _recipeService.GetRecipeByIdAsync(id);
        if (result == null) return NotFound(ApiResponse<RecipeDto>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<RecipeDto>.Ok(result));
    }

    /// <summary>
    /// Tạo công thức. Admin/Moderator → đăng ngay (published, người duyệt = chính họ);
    /// User → chờ duyệt (pending_verification). Dinh dưỡng được tính từ danh sách nguyên liệu.
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ApiResponse<RecipeDto>>> CreateRecipe([FromBody] CreateRecipeRequest request)
    {
        if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var creatorId))
        {
            return Unauthorized(ApiResponse<RecipeDto>.Fail("Bạn cần đăng nhập."));
        }
        var role = User.FindFirstValue(ClaimTypes.Role);

        var result = await _recipeService.CreateRecipeAsync(request, creatorId, role);
        var message = result.Status == "published" ? "Tạo công thức thành công" : "Đã gửi công thức, đang chờ kiểm duyệt";
        return CreatedAtAction(nameof(GetRecipeById), new { id = result.Id }, ApiResponse<RecipeDto>.Ok(result, message));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ApiResponse<bool>>> UpdateRecipeStatus(string id, [FromBody] UpdateRecipeStatusRequest request)
    {
        int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var verifierId);
        var ok = await _recipeService.UpdateRecipeStatusAsync(id, request.Status, verifierId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<bool>.Ok(true, "Cập nhật trạng thái thành công"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteRecipe(string id)
    {
        var ok = await _recipeService.DeleteRecipeAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy công thức"));
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa công thức thành công"));
    }
}
