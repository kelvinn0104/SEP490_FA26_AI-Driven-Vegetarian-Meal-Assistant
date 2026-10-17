using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.API.Infrastructure;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;

namespace VeggieAI.API.Controllers;

[Route("api/meal-plans"), Authorize]
public class MealPlansController : ApiControllerBase
{
    private readonly IMealPlanService _plans;
    private readonly IAiMealPlanner _ai;
    private readonly IShoppingListService _shopping;

    public MealPlansController(IMealPlanService plans, IAiMealPlanner ai, IShoppingListService shopping)
    {
        _plans = plans; _ai = ai; _shopping = shopping;
    }

    /// <summary>🤖 AI lập thực đơn cá nhân hóa (theo hồ sơ, dị ứng, nguyên liệu sẵn có / ảnh đã quét).</summary>
    [HttpPost("generate")]
    public async Task<ActionResult<GeneratedMealPlanDto>> Generate(GenerateMealPlanRequest req, CancellationToken ct) =>
        Ok(await _ai.GenerateAsync(UserId, req, ct));

    /// <summary>🤖 Đổi 1 món trong thực đơn (AI chọn món thay thế giữ cân bằng dinh dưỡng).</summary>
    [HttpPost("{planId:int}/items/{itemId:int}/swap")]
    public async Task<ActionResult<GeneratedMealPlanDto>> Swap(int planId, int itemId, SwapMealRequest req, CancellationToken ct) =>
        Ok(await _ai.SwapItemAsync(UserId, planId, itemId, req, ct));

    /// <param name="status">draft | active | completed | cancelled</param>
    [HttpGet]
    public async Task<ActionResult<PagedResult<MealPlanSummaryDto>>> List([FromQuery] string? status, [FromQuery] PageQuery page, CancellationToken ct) =>
        Ok(await _plans.GetMyPlansAsync(UserId, status, page, ct));

    /// <summary>Thực đơn đang áp dụng cho hôm nay.</summary>
    [HttpGet("current")]
    public async Task<ActionResult<MealPlanDetailDto>> Current(CancellationToken ct) =>
        await _plans.GetCurrentAsync(UserId, ct) is { } p ? Ok(p) : NoContent();

    [HttpGet("{planId:int}")]
    public async Task<ActionResult<MealPlanDetailDto>> Get(int planId, CancellationToken ct) => Ok(await _plans.GetAsync(UserId, planId, ct));

    /// <summary>Tự tạo thực đơn thủ công.</summary>
    [HttpPost]
    public async Task<ActionResult<MealPlanDetailDto>> Create(CreateMealPlanRequest req, CancellationToken ct) =>
        Ok(await _plans.CreateManualAsync(UserId, req, ct));

    [HttpPatch("{planId:int}/status")]
    public async Task<ActionResult<MealPlanDetailDto>> UpdateStatus(int planId, UpdatePlanStatusRequest req, CancellationToken ct) =>
        Ok(await _plans.UpdateStatusAsync(UserId, planId, req.Status, ct));

    [HttpDelete("{planId:int}")]
    public async Task<IActionResult> Delete(int planId, CancellationToken ct)
    {
        await _plans.DeleteAsync(UserId, planId, ct);
        return NoContent();
    }

    [HttpPost("{planId:int}/items")]
    public async Task<ActionResult<MealPlanDetailDto>> AddItem(int planId, MealPlanItemRequest req, CancellationToken ct) =>
        Ok(await _plans.AddItemAsync(UserId, planId, req, ct));

    [HttpPut("{planId:int}/items/{itemId:int}")]
    public async Task<ActionResult<MealPlanDetailDto>> UpdateItem(int planId, int itemId, UpdateMealPlanItemRequest req, CancellationToken ct) =>
        Ok(await _plans.UpdateItemAsync(UserId, planId, itemId, req, ct));

    [HttpDelete("{planId:int}/items/{itemId:int}")]
    public async Task<ActionResult<MealPlanDetailDto>> RemoveItem(int planId, int itemId, CancellationToken ct) =>
        Ok(await _plans.RemoveItemAsync(UserId, planId, itemId, ct));

    // ---------------- shopping list ----------------

    /// <summary>Tự sinh / làm mới danh sách đi chợ (gộp nguyên liệu của mọi món trong thực đơn).</summary>
    [HttpPost("{planId:int}/shopping-list")]
    public async Task<ActionResult<ShoppingListDto>> GenerateShoppingList(int planId, CancellationToken ct) =>
        Ok(await _shopping.GenerateAsync(UserId, planId, ct));

    [HttpGet("{planId:int}/shopping-list")]
    public async Task<ActionResult<ShoppingListDto>> GetShoppingList(int planId, CancellationToken ct) =>
        Ok(await _shopping.GetAsync(UserId, planId, ct));

    [HttpPatch("{planId:int}/shopping-list/items/{itemId:int}")]
    public async Task<ActionResult<ShoppingListItemDto>> ToggleBought(int planId, int itemId, ToggleBoughtRequest req, CancellationToken ct) =>
        Ok(await _shopping.SetBoughtAsync(UserId, planId, itemId, req.IsBought, ct));
}
