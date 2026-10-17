using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Constants;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Common;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class MealPlanService : IMealPlanService
{
    private readonly VeggieAiDbContext _db;
    public MealPlanService(VeggieAiDbContext db) => _db = db;

    public async Task<PagedResult<MealPlanSummaryDto>> GetMyPlansAsync(int userId, string? status, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.MealPlans.AsNoTracking().Where(p => p.UserId == userId && (status == null || p.Status == status));
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(p => p.StartDate).ThenByDescending(p => p.Id).Skip(page.Skip).Take(page.PageSize)
            .Select(p => new MealPlanSummaryDto(p.Id, p.StartDate, p.EndDate, p.HealthGoal, p.Status, p.CreatedAt, p.MealPlanItems.Count))
            .ToListAsync(ct);
        return new PagedResult<MealPlanSummaryDto> { Items = items, Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }

    public Task<MealPlanDetailDto> GetAsync(int userId, int planId, CancellationToken ct = default) =>
        MealPlanReader.BuildDetailAsync(_db, userId, planId, ct);

    public async Task<MealPlanDetailDto?> GetCurrentAsync(int userId, CancellationToken ct = default)
    {
        var today = Mappers.TodayVn();
        var id = await _db.MealPlans.Where(p => p.UserId == userId && p.Status != MealPlanStatuses.Cancelled
                                                 && p.StartDate <= today && p.EndDate >= today)
            .OrderByDescending(p => p.Status == MealPlanStatuses.Active).ThenByDescending(p => p.CreatedAt)
            .Select(p => (int?)p.Id).FirstOrDefaultAsync(ct);
        return id is null ? null : await MealPlanReader.BuildDetailAsync(_db, userId, id.Value, ct);
    }

    public async Task<MealPlanDetailDto> CreateManualAsync(int userId, CreateMealPlanRequest req, CancellationToken ct = default)
    {
        if (req.EndDate < req.StartDate) throw new AppException("Ngày kết thúc phải sau ngày bắt đầu.");
        if (req.EndDate.DayNumber - req.StartDate.DayNumber > 30) throw new AppException("Thực đơn tối đa 31 ngày.");
        var goal = req.HealthGoal ?? await _db.HealthProfiles.Where(h => h.UserId == userId).Select(h => h.HealthGoal).FirstOrDefaultAsync(ct)
                   ?? HealthGoals.Maintain;
        var plan = new MealPlan { UserId = userId, StartDate = req.StartDate, EndDate = req.EndDate, HealthGoal = goal, Status = MealPlanStatuses.Draft };
        foreach (var it in req.Items)
        {
            await EnsureItemValidAsync(it, plan, ct);
            plan.MealPlanItems.Add(new MealPlanItem { RecipeId = it.RecipeId, PlanDate = it.PlanDate, MealType = it.MealType, Servings = it.Servings });
        }
        _db.MealPlans.Add(plan);
        await _db.SaveChangesAsync(ct);
        return await MealPlanReader.BuildDetailAsync(_db, userId, plan.Id, ct);
    }

    public async Task<MealPlanDetailDto> AddItemAsync(int userId, int planId, MealPlanItemRequest req, CancellationToken ct = default)
    {
        var plan = await LoadOwnedAsync(userId, planId, ct);
        await EnsureItemValidAsync(req, plan, ct);
        _db.MealPlanItems.Add(new MealPlanItem { PlanId = planId, RecipeId = req.RecipeId, PlanDate = req.PlanDate, MealType = req.MealType, Servings = req.Servings });
        await _db.SaveChangesAsync(ct);
        return await MealPlanReader.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task<MealPlanDetailDto> UpdateItemAsync(int userId, int planId, int itemId, UpdateMealPlanItemRequest req, CancellationToken ct = default)
    {
        await LoadOwnedAsync(userId, planId, ct);
        var item = await _db.MealPlanItems.FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId, ct)
                   ?? throw AppException.NotFound("Món trong thực đơn");
        if (req.RecipeId is not null)
        {
            if (!await _db.Recipes.AnyAsync(r => r.Id == req.RecipeId && r.Status == RecipeStatuses.Published, ct))
                throw AppException.NotFound("Công thức");
            item.RecipeId = req.RecipeId.Value;
        }
        if (req.Servings is not null) item.Servings = req.Servings.Value;
        await _db.SaveChangesAsync(ct);
        return await MealPlanReader.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task<MealPlanDetailDto> RemoveItemAsync(int userId, int planId, int itemId, CancellationToken ct = default)
    {
        await LoadOwnedAsync(userId, planId, ct);
        var item = await _db.MealPlanItems.FirstOrDefaultAsync(i => i.Id == itemId && i.PlanId == planId, ct)
                   ?? throw AppException.NotFound("Món trong thực đơn");
        _db.MealPlanItems.Remove(item);
        await _db.SaveChangesAsync(ct);
        return await MealPlanReader.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task<MealPlanDetailDto> UpdateStatusAsync(int userId, int planId, string status, CancellationToken ct = default)
    {
        var plan = await LoadOwnedAsync(userId, planId, ct);
        if (status == MealPlanStatuses.Active)
        {
            // only one active plan overlapping the same period
            var overlapping = await _db.MealPlans.Where(p => p.UserId == userId && p.Id != planId && p.Status == MealPlanStatuses.Active
                                                            && p.StartDate <= plan.EndDate && p.EndDate >= plan.StartDate).ToListAsync(ct);
            foreach (var o in overlapping) o.Status = MealPlanStatuses.Cancelled;
        }
        plan.Status = status;
        await _db.SaveChangesAsync(ct);
        return await MealPlanReader.BuildDetailAsync(_db, userId, planId, ct);
    }

    public async Task DeleteAsync(int userId, int planId, CancellationToken ct = default)
    {
        var plan = await LoadOwnedAsync(userId, planId, ct);
        _db.MealPlans.Remove(plan);
        await _db.SaveChangesAsync(ct);
    }

    private async Task<MealPlan> LoadOwnedAsync(int userId, int planId, CancellationToken ct) =>
        await _db.MealPlans.FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId, ct)
        ?? throw AppException.NotFound("Thực đơn");

    private async Task EnsureItemValidAsync(MealPlanItemRequest it, MealPlan plan, CancellationToken ct)
    {
        if (it.PlanDate < plan.StartDate || it.PlanDate > plan.EndDate)
            throw new AppException($"Ngày {it.PlanDate} nằm ngoài khoảng thời gian của thực đơn.");
        if (!await _db.Recipes.AnyAsync(r => r.Id == it.RecipeId && r.Status == RecipeStatuses.Published, ct))
            throw AppException.NotFound($"Công thức #{it.RecipeId}");
    }
}

/// <summary>Builds the plan detail DTO (per-day totals vs. targets). Shared with the AI planner.</summary>
public static class MealPlanReader
{
    public static async Task<MealPlanDetailDto> BuildDetailAsync(VeggieAiDbContext db, int userId, int planId, CancellationToken ct)
    {
        var plan = await db.MealPlans.AsNoTracking()
            .Include(p => p.MealPlanItems).ThenInclude(i => i.Recipe)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId, ct)
            ?? throw AppException.NotFound("Thực đơn");
        var profile = await db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        var targets = profile?.Targets() ?? NutrientAmountsDto.Zero;
        var hasList = await db.ShoppingLists.AnyAsync(s => s.PlanId == planId, ct);

        var days = new List<MealPlanDayDto>();
        for (var d = plan.StartDate; d <= plan.EndDate; d = d.AddDays(1))
        {
            var meals = plan.MealPlanItems.Where(i => i.PlanDate == d)
                .OrderBy(i => Array.IndexOf(MealTypes.All, i.MealType)).ThenBy(i => i.Id)
                .Select(i => new MealPlanItemDto(i.Id, i.PlanDate, i.MealType, i.Servings, i.RecipeId, i.Recipe.Title,
                    i.Recipe.ImageUrl, i.Recipe.PerServing().Scale(i.Servings).Rounded()))
                .ToList();
            var total = meals.Aggregate(NutrientAmountsDto.Zero, (acc, m) => acc.Add(m.Nutrition)).Rounded();
            var dev = targets.Kcal == 0 ? 0 : Math.Round((total.Kcal - targets.Kcal) / targets.Kcal * 100, 1);
            days.Add(new MealPlanDayDto(d, meals, total, targets.Kcal, dev));
        }
        return new MealPlanDetailDto(plan.Id, plan.StartDate, plan.EndDate, plan.HealthGoal, plan.Status, plan.CreatedAt,
            targets, days, hasList);
    }
}
