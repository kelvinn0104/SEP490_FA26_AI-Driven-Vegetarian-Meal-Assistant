using VeggieAI.API;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Controllers.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

/// <summary>Thực đơn đã lưu của người dùng + danh sách đi chợ. Tạo/đổi món bằng AI: xem AiMealPlanController.</summary>
[Route("api/meal-plans")]
[Authorize]
public class MealPlansController : AiApiControllerBase
{
    private readonly IMealPlanService _svc;

    public MealPlansController(IMealPlanService svc)
    {
        _svc = svc;
    }

    /// <summary>Thực đơn đang áp dụng (status = active). 204 nếu chưa có.</summary>
    [HttpGet("current")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> Current(CancellationToken ct)
    {
        var result = await _svc.GetCurrentAsync(UserId, ct);
        if (result is null) return NoContent();
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result));
    }

    /// <summary>Lịch sử thực đơn: ?status=all|draft|active|completed|cancelled&amp;page=1&amp;pageSize=20.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<MealPlanSummaryDto>>>> List(
        [FromQuery] string? status, [FromQuery] int? page, [FromQuery] int? pageSize, CancellationToken ct)
    {
        var result = await _svc.ListAsync(UserId, status, this.Paging(page, pageSize), ct);
        return Ok(ApiResponse<PagedResult<MealPlanSummaryDto>>.Ok(result));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> Get(int id, CancellationToken ct)
    {
        var result = await _svc.GetAsync(UserId, id, ct);
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result));
    }

    /// <summary>Đổi trạng thái: draft | active | completed | cancelled.</summary>
    [HttpPatch("{id:int}/status")]
    [HttpPut("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> UpdateStatus(int id, [FromBody] UpdateMealPlanStatusRequest req, CancellationToken ct)
    {
        var result = await _svc.UpdateStatusAsync(UserId, id, req.Status, ct);
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result, "Đã cập nhật trạng thái thực đơn"));
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id, CancellationToken ct)
    {
        await _svc.DeleteAsync(UserId, id, ct);
        return Ok(ApiResponse<bool>.Ok(true, "Đã xóa thực đơn"));
    }

    /// <summary>
    /// Thêm món thủ công: { planDate, mealType, recipeId, servings }. Món phải published, đủ nguyên liệu và không chứa chất dị ứng.
    /// Danh sách đi chợ (nếu có) tự cập nhật. Trả về chi tiết thực đơn mới.
    /// </summary>
    [HttpPost("{planId:int}/items")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> AddItem(int planId, [FromBody] AddMealPlanItemRequest req, CancellationToken ct)
    {
        var result = await _svc.AddItemAsync(UserId, planId, req, ct);
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result, "Đã thêm món vào thực đơn"));
    }

    /// <summary>Sửa món: { servings?, mealType?, planDate?, recipeId? } — chỉ gửi trường cần đổi.</summary>
    [HttpPatch("{planId:int}/items/{itemId:int}")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> UpdateItem(int planId, int itemId, [FromBody] UpdateMealPlanItemRequest req, CancellationToken ct)
    {
        var result = await _svc.UpdateItemAsync(UserId, planId, itemId, req, ct);
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result, "Đã cập nhật món"));
    }

    /// <summary>Bỏ một món khỏi thực đơn. Nhật ký bữa đã ghi từ món này vẫn được giữ.</summary>
    [HttpDelete("{planId:int}/items/{itemId:int}")]
    public async Task<ActionResult<ApiResponse<MealPlanDetailDto>>> DeleteItem(int planId, int itemId, CancellationToken ct)
    {
        var result = await _svc.DeleteItemAsync(UserId, planId, itemId, ct);
        return Ok(ApiResponse<MealPlanDetailDto>.Ok(result, "Đã bỏ món khỏi thực đơn"));
    }

    /// <summary>
    /// Tạo hoặc làm mới danh sách đi chợ từ các món trong thực đơn (giữ trạng thái đã mua theo nguyên liệu).
    /// Sau khi đổi/thêm/sửa/xóa món, danh sách đã có được BE tự đồng bộ — FE chỉ cần GET lại.
    /// </summary>
    [HttpPost("{planId:int}/shopping-list")]
    public async Task<ActionResult<ApiResponse<ShoppingListDto>>> CreateShoppingList(int planId, CancellationToken ct)
    {
        var result = await _svc.GenerateShoppingListAsync(UserId, planId, ct);
        return Ok(ApiResponse<ShoppingListDto>.Ok(result, "Đã tạo danh sách đi chợ"));
    }

    /// <summary>404 nếu chưa tạo danh sách.</summary>
    [HttpGet("{planId:int}/shopping-list")]
    public async Task<ActionResult<ApiResponse<ShoppingListDto>>> GetShoppingList(int planId, CancellationToken ct)
    {
        var result = await _svc.GetShoppingListAsync(UserId, planId, ct);
        if (result is null) return NotFound(ApiResponse<ShoppingListDto>.Fail("Thực đơn chưa có danh sách đi chợ."));
        return Ok(ApiResponse<ShoppingListDto>.Ok(result));
    }

    [HttpPatch("{planId:int}/shopping-list/items/{itemId:int}")]
    public async Task<ActionResult<ApiResponse<ShoppingListItemDto>>> SetItemBought(int planId, int itemId, [FromBody] ToggleShoppingItemRequest req, CancellationToken ct)
    {
        var result = await _svc.SetItemBoughtAsync(UserId, planId, itemId, req.IsBought, ct);
        return Ok(ApiResponse<ShoppingListItemDto>.Ok(result));
    }
}
