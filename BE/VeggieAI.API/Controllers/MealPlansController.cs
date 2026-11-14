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

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<MealPlanSummaryDto>>>> List([FromQuery] string? status, [FromQuery] PageQuery page, CancellationToken ct)
    {
        var result = await _svc.ListAsync(UserId, status, page, ct);
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

    /// <summary>Tạo hoặc làm mới danh sách đi chợ từ các món trong thực đơn.</summary>
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
