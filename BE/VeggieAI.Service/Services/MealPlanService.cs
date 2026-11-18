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

    /// <summary>Thêm món thủ công. Món phải published, đủ dữ liệu và không chứa chất người dùng dị ứng.</summary>
    Task<MealPlanDetailDto> AddItemAsync(int userId, int planId, AddMealPlanItemRequest req, CancellationToken ct = default);
    Task<MealPlanDetailDto> UpdateItemAsync(int userId, int planId, int itemId, UpdateMealPlanItemRequest req, CancellationToken ct = default);
    Task<MealPlanDetailDto> DeleteItemAsync(int userId, int planId, int itemId, CancellationToken ct = default);
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
        if (s == "active")
        {
            // SDD 3.15: kích hoạt thực đơn mới thì hủy các thực đơn active khác trùng khoảng ngày
            var overlapping = await _db.MealPlans
                .Where(p => p.UserId == userId && p.Id != plan.Id && p.Status == "active"
                            && p.StartDate <= plan.EndDate && p.EndDate >= plan.StartDate)
                .ToListAsync(ct);
            foreach (var o in overlapping) o.Status = "cancelled";
        }
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
        var ok = await ShoppingListBuilder.RebuildAsync(_db, planId, createIfMissing: true, ct);
        if (!ok) throw new AppException("Thực đơn chưa có món nào có nguyên liệu để lập danh sách đi chợ.");
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

    public async Task<MealPlanDetailDto> AddItemAsync(int userId, int planId, AddMealPlanItemRequest req, CancellationToken ct = default)
    {
        var plan = await OwnPlanAsync(userId, planId, ct);
        EnsureDateInPlan(plan, req.PlanDate);
        var mealType = NormalizeMealType(req.MealType);
        await EnsureEligibleRecipeAsync(userId, req.RecipeId, ct);

        _db.MealPlanItems.Add(new MealPlanItem
        {
            PlanId = planId,
            PlanDate = req.PlanDate,
            MealType = mealType,
            RecipeId = req.RecipeId,
            Servings = AiMealPlanner.ClampManualServings(req.Servings),
        });
        await _db.SaveChangesAsync(ct);
        await ShoppingListBuilder.RebuildAsync(_db, planId, createIfMissing: false, ct);
        return await AiMealPlanner.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task<MealPlanDetailDto> UpdateItemAsync(int userId, int planId, int itemId, UpdateMealPlanItemRequest req, CancellationToken ct = default)
    {
        var plan = await OwnPlanAsync(userId, planId, ct);
        var item = await _db.MealPlanItems.FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId, ct)
                   ?? throw AppException.NotFound("Món trong thực đơn");

        if (req.PlanDate is DateOnly d)
        {
            EnsureDateInPlan(plan, d);
            item.PlanDate = d;
        }
        if (!string.IsNullOrWhiteSpace(req.MealType)) item.MealType = NormalizeMealType(req.MealType);
        if (req.RecipeId is int rid && rid != item.RecipeId)
        {
            await EnsureEligibleRecipeAsync(userId, rid, ct);
            item.RecipeId = rid;
        }
        if (req.Servings is decimal s) item.Servings = AiMealPlanner.ClampManualServings(s);

        await _db.SaveChangesAsync(ct);
        await ShoppingListBuilder.RebuildAsync(_db, planId, createIfMissing: false, ct);
        return await AiMealPlanner.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task<MealPlanDetailDto> DeleteItemAsync(int userId, int planId, int itemId, CancellationToken ct = default)
    {
        await OwnPlanAsync(userId, planId, ct);
        var item = await _db.MealPlanItems.FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId, ct)
                   ?? throw AppException.NotFound("Món trong thực đơn");

        // Bữa đã ghi vào nhật ký vẫn giữ, chỉ bỏ liên kết với dòng thực đơn (giống ON DELETE SET NULL)
        var logs = await _db.MealLogs.Where(l => l.PlanItemId == itemId).ToListAsync(ct);
        foreach (var l in logs) l.PlanItemId = null;

        _db.MealPlanItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        await ShoppingListBuilder.RebuildAsync(_db, planId, createIfMissing: false, ct);
        return await AiMealPlanner.BuildDetailAsync(_db, userId, planId, ct);
    }

    private static void EnsureDateInPlan(MealPlan plan, DateOnly date)
    {
        if (date < plan.StartDate || date > plan.EndDate)
            throw new AppException($"Ngày {date:yyyy-MM-dd} nằm ngoài thực đơn ({plan.StartDate:yyyy-MM-dd} → {plan.EndDate:yyyy-MM-dd}).");
    }

    private static string NormalizeMealType(string mealType)
    {
        var mt = mealType.Trim().ToLowerInvariant();
        if (!AiMealTypes.All.Contains(mt)) throw new AppException("mealType phải là breakfast, lunch, dinner hoặc snack.");
        return mt;
    }

    private async Task EnsureEligibleRecipeAsync(int userId, int recipeId, CancellationToken ct)
    {
        var bad = await _db.AllergenIngredientIdsAsync(userId, ct);
        var ok = await _db.Recipes.AsNoTracking().Where(r => r.Id == recipeId).EligibleForPlan(bad).AnyAsync(ct);
        if (!ok)
            throw new AppException("Món này chưa được xuất bản, thiếu dữ liệu dinh dưỡng/nguyên liệu hoặc chứa chất bạn dị ứng.",
                400, "RECIPE_NOT_ELIGIBLE");
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

/// <summary>
/// Dựng lại danh sách đi chợ từ các món hiện có trong thực đơn. Dùng khi tạo danh sách và sau mỗi lần
/// đổi/thêm/sửa/xóa món để danh sách không giữ nguyên liệu của món cũ. Trạng thái "đã mua" được giữ theo nguyên liệu,
/// Id của các mục còn tồn tại được giữ nguyên (FE đang giữ itemId không bị lệch).
/// </summary>
public static class ShoppingListBuilder
{
    /// <returns>false nếu thực đơn không còn nguyên liệu nào (khi createIfMissing = true thì không tạo danh sách).</returns>
    public static async Task<bool> RebuildAsync(VeggieAIDbContext db, int planId, bool createIfMissing, CancellationToken ct)
    {
        var list = await db.ShoppingLists.Include(s => s.Items).FirstOrDefaultAsync(s => s.PlanId == planId, ct);
        if (list is null && !createIfMissing) return true; // chưa có danh sách → không có gì để đồng bộ

        var rows = await db.MealPlanItems.AsNoTracking()
            .Where(i => i.PlanId == planId)
            .SelectMany(i => i.Recipe!.RecipeIngredients.Select(ri => new
            {
                ri.IngredientId,
                ri.QuantityG,
                i.Servings,
                RecipeServings = i.Recipe!.Servings,
            }))
            .ToListAsync(ct);

        var totals = rows
            .GroupBy(r => r.IngredientId)
            .Select(g => new
            {
                IngredientId = g.Key,
                QuantityG = Math.Round(g.Sum(r => r.QuantityG * r.Servings / Math.Max(1, r.RecipeServings)), 0),
            })
            .Where(x => x.QuantityG > 0)
            .ToDictionary(x => x.IngredientId, x => x.QuantityG);

        if (list is null)
        {
            if (totals.Count == 0) return false;
            list = new ShoppingList { PlanId = planId, CreatedAt = DateTime.UtcNow };
            db.ShoppingLists.Add(list);
        }

        // Bỏ nguyên liệu không còn dùng, cập nhật khối lượng, thêm nguyên liệu mới
        foreach (var item in list.Items.ToList())
        {
            if (totals.TryGetValue(item.IngredientId, out var qty)) item.QuantityG = qty;
            else
            {
                list.Items.Remove(item);
                db.ShoppingListItems.Remove(item);
            }
        }
        var existing = list.Items.Select(i => i.IngredientId).ToHashSet();
        foreach (var (ingredientId, qty) in totals.Where(t => !existing.Contains(t.Key)))
            list.Items.Add(new ShoppingListItem { IngredientId = ingredientId, QuantityG = qty, IsBought = false });

        await db.SaveChangesAsync(ct);
        return totals.Count > 0;
    }
}
