using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;
using VeggieAI.Service.Services.AI;

namespace VeggieAI.Service.Services;

public interface IMealPlanService
{
    Task<MealPlanDetailDto?> GetCurrentAsync(int userId, CancellationToken ct = default);
    Task<PagedResult<MealPlanSummaryDto>> ListAsync(int userId, string? status, PageQuery page, CancellationToken ct = default);
    Task<MealPlanDetailDto> GetAsync(int userId, int planId, CancellationToken ct = default);
    Task<MealPlanDetailDto> UpdateStatusAsync(int userId, int planId, string status, CancellationToken ct = default);
    Task DeleteAsync(int userId, int planId, CancellationToken ct = default);
    Task<ShoppingListDto> GenerateShoppingListAsync(int userId, int planId, CancellationToken ct = default);
    Task<ShoppingListDto?> GetShoppingListAsync(int userId, int planId, CancellationToken ct = default);
    Task<ShoppingListItemDto> SetItemBoughtAsync(int userId, int planId, int itemId, bool isBought, CancellationToken ct = default);
}

/// <summary>Quản lý thực đơn đã lưu (xem, kích hoạt, xóa) và danh sách đi chợ. Việc tạo/đổi món do AiMealPlanner xử lý.</summary>
public class MealPlanService : IMealPlanService
{
    private static readonly string[] Statuses = { "draft", "active", "completed", "cancelled" };

    private readonly VeggieAIDbContext _db;

    public MealPlanService(VeggieAIDbContext db)
    {
        _db = db;
    }

    /// <summary>Thực đơn "active" đang chạy hôm nay; nếu không có thì thực đơn active sắp tới gần nhất; không có → null.</summary>
    public async Task<MealPlanDetailDto?> GetCurrentAsync(int userId, CancellationToken ct = default)
    {
        var today = AiMappers.TodayVn();
        var active = _db.MealPlans.AsNoTracking().Where(p => p.UserId == userId && p.Status == "active");

        var planId = await active
            .Where(p => p.StartDate <= today && p.EndDate >= today)
            .OrderByDescending(p => p.StartDate).ThenByDescending(p => p.Id)
            .Select(p => (int?)p.Id)
            .FirstOrDefaultAsync(ct);

        planId ??= await active
            .Where(p => p.StartDate > today)
            .OrderBy(p => p.StartDate).ThenByDescending(p => p.Id)
            .Select(p => (int?)p.Id)
            .FirstOrDefaultAsync(ct);

        return planId is null ? null : await AiMealPlanner.BuildDetailAsync(_db, userId, planId.Value, ct);
    }

    public async Task<PagedResult<MealPlanSummaryDto>> ListAsync(int userId, string? status, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.MealPlans.AsNoTracking().Where(p => p.UserId == userId);
        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            var s = status.Trim().ToLowerInvariant();
            q = q.Where(p => p.Status == s);
        }

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.StartDate).ThenByDescending(p => p.Id)
            .Skip(page.Skip).Take(page.PageSize)
            .Select(p => new MealPlanSummaryDto(p.Id, p.StartDate, p.EndDate, p.HealthGoal, p.Status, p.CreatedAt, p.Items.Count))
            .ToListAsync(ct);

        return new PagedResult<MealPlanSummaryDto> { Items = items, TotalCount = total, Page = page.Page, PageSize = page.PageSize };
    }

    public Task<MealPlanDetailDto> GetAsync(int userId, int planId, CancellationToken ct = default) =>
        AiMealPlanner.BuildDetailAsync(_db, userId, planId, ct);

    public async Task<MealPlanDetailDto> UpdateStatusAsync(int userId, int planId, string status, CancellationToken ct = default)
    {
        var s = (status ?? string.Empty).Trim().ToLowerInvariant();
        if (!Statuses.Contains(s)) throw new AppException("Trạng thái không hợp lệ. Cho phép: " + string.Join(", ", Statuses));

        var plan = await OwnPlanAsync(userId, planId, ct);
        plan.Status = s;
        await _db.SaveChangesAsync(ct);
        return await AiMealPlanner.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task DeleteAsync(int userId, int planId, CancellationToken ct = default)
    {
        var plan = await OwnPlanAsync(userId, planId, ct);
        // MealPlanItem, ShoppingList(+Item) xóa theo ON DELETE CASCADE; ChatSession.PlanId và MealLog.PlanItemId → SET NULL
        _db.MealPlans.Remove(plan);
        await _db.SaveChangesAsync(ct);
    }

    /// <summary>
    /// Tạo (hoặc làm mới) danh sách đi chợ: cộng dồn nguyên liệu của mọi món trong thực đơn,
    /// khối lượng = QuantityG của công thức × (khẩu phần trong thực đơn / số khẩu phần của công thức).
    /// Nguyên liệu đã đánh dấu "đã mua" ở danh sách cũ được giữ trạng thái.
    /// </summary>
    public async Task<ShoppingListDto> GenerateShoppingListAsync(int userId, int planId, CancellationToken ct = default)
    {
        await OwnPlanAsync(userId, planId, ct);

        var rows = await _db.MealPlanItems.AsNoTracking()
            .Where(i => i.PlanId == planId)
            .SelectMany(i => i.Recipe!.RecipeIngredients.Select(ri => new
            {
                ri.IngredientId,
                ri.QuantityG,
                i.Servings,
                RecipeServings = i.Recipe!.Servings,
            }))
            .ToListAsync(ct);

        if (rows.Count == 0) throw new AppException("Thực đơn chưa có món nào có nguyên liệu để lập danh sách đi chợ.");

        var totals = rows
            .GroupBy(r => r.IngredientId)
            .Select(g => new
            {
                IngredientId = g.Key,
                QuantityG = Math.Round(g.Sum(r => r.QuantityG * r.Servings / Math.Max(1, r.RecipeServings)), 0),
            })
            .Where(x => x.QuantityG > 0)
            .ToList();

        var old = await _db.ShoppingLists.Include(s => s.Items).FirstOrDefaultAsync(s => s.PlanId == planId, ct);
        var bought = old?.Items.Where(i => i.IsBought).Select(i => i.IngredientId).ToHashSet() ?? new HashSet<int>();
        if (old is not null)
        {
            _db.ShoppingListItems.RemoveRange(old.Items);
            _db.ShoppingLists.Remove(old);
            await _db.SaveChangesAsync(ct); // ShoppingList.PlanId là UNIQUE → xóa trước khi tạo mới
        }

        var list = new ShoppingList { PlanId = planId, CreatedAt = DateTime.UtcNow };
        foreach (var t in totals)
        {
            list.Items.Add(new ShoppingListItem
            {
                IngredientId = t.IngredientId,
                QuantityG = t.QuantityG,
                IsBought = bought.Contains(t.IngredientId),
            });
        }
        _db.ShoppingLists.Add(list);
        await _db.SaveChangesAsync(ct);

        return (await GetShoppingListAsync(userId, planId, ct))!;
    }

    public async Task<ShoppingListDto?> GetShoppingListAsync(int userId, int planId, CancellationToken ct = default)
    {
        await OwnPlanAsync(userId, planId, ct, tracking: false);
        var list = await _db.ShoppingLists.AsNoTracking()
            .Include(s => s.Items).ThenInclude(i => i.Ingredient)
            .FirstOrDefaultAsync(s => s.PlanId == planId, ct);
        if (list is null) return null;

        var items = list.Items
            .OrderBy(i => i.IsBought).ThenBy(i => i.Ingredient?.Name)
            .Select(ToItemDto)
            .ToList();
        return new ShoppingListDto(list.Id, list.PlanId, list.CreatedAt, items.Count(i => i.IsBought), items.Count, items);
    }

    public async Task<ShoppingListItemDto> SetItemBoughtAsync(int userId, int planId, int itemId, bool isBought, CancellationToken ct = default)
    {
        await OwnPlanAsync(userId, planId, ct, tracking: false);
        var item = await _db.ShoppingListItems
            .Include(i => i.Ingredient)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ShoppingList!.PlanId == planId, ct)
            ?? throw AppException.NotFound("Mục trong danh sách đi chợ");

        item.IsBought = isBought;
        await _db.SaveChangesAsync(ct);
        return ToItemDto(item);
    }

    private async Task<MealPlan> OwnPlanAsync(int userId, int planId, CancellationToken ct, bool tracking = true)
    {
        var q = tracking ? _db.MealPlans : _db.MealPlans.AsNoTracking();
        return await q.FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId, ct)
               ?? throw AppException.NotFound("Thực đơn");
    }

    private static ShoppingListItemDto ToItemDto(ShoppingListItem i) =>
        new(i.Id, i.IngredientId, i.Ingredient?.Name ?? string.Empty, i.QuantityG, i.IsBought);
}
