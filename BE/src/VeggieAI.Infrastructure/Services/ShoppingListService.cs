using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class ShoppingListService : IShoppingListService
{
    private readonly VeggieAiDbContext _db;
    public ShoppingListService(VeggieAiDbContext db) => _db = db;

    /// <summary>
    /// Aggregates ingredients of every meal in the plan:
    /// quantity = RecipeIngredient.QuantityG * item.Servings / recipe.Servings, merged per ingredient.
    /// Re-generating keeps the "bought" flag of ingredients that are still needed.
    /// </summary>
    public async Task<ShoppingListDto> GenerateAsync(int userId, int planId, CancellationToken ct = default)
    {
        var plan = await _db.MealPlans
            .Include(p => p.MealPlanItems).ThenInclude(i => i.Recipe).ThenInclude(r => r.RecipeIngredients)
            .FirstOrDefaultAsync(p => p.Id == planId && p.UserId == userId, ct)
            ?? throw AppException.NotFound("Thực đơn");
        if (plan.MealPlanItems.Count == 0) throw new AppException("Thực đơn chưa có món nào.");

        var needed = plan.MealPlanItems
            .SelectMany(i => i.Recipe.RecipeIngredients.Select(ri => new
            {
                ri.IngredientId,
                Qty = ri.QuantityG * i.Servings / Math.Max(1, i.Recipe.Servings),
            }))
            .GroupBy(x => x.IngredientId)
            .ToDictionary(g => g.Key, g => Math.Round(g.Sum(x => x.Qty), 0));

        var list = await _db.ShoppingLists.Include(s => s.ShoppingListItems).FirstOrDefaultAsync(s => s.PlanId == planId, ct);
        if (list is null)
        {
            list = new ShoppingList { PlanId = planId };
            _db.ShoppingLists.Add(list);
        }

        foreach (var old in list.ShoppingListItems.Where(i => !needed.ContainsKey(i.IngredientId)).ToList())
            _db.ShoppingListItems.Remove(old);
        foreach (var (ingId, qty) in needed)
        {
            var existing = list.ShoppingListItems.FirstOrDefault(i => i.IngredientId == ingId);
            if (existing is null) list.ShoppingListItems.Add(new ShoppingListItem { IngredientId = ingId, QuantityG = Math.Max(1, qty) });
            else existing.QuantityG = Math.Max(1, qty);
        }
        await _db.SaveChangesAsync(ct);
        return await GetAsync(userId, planId, ct);
    }

    public async Task<ShoppingListDto> GetAsync(int userId, int planId, CancellationToken ct = default)
    {
        var list = await _db.ShoppingLists.AsNoTracking()
            .Include(s => s.ShoppingListItems).ThenInclude(i => i.Ingredient)
            .FirstOrDefaultAsync(s => s.PlanId == planId && s.Plan.UserId == userId, ct)
            ?? throw AppException.NotFound("Danh sách đi chợ (hãy gọi POST .../shopping-list để tạo)");
        var items = list.ShoppingListItems.OrderBy(i => i.IsBought).ThenBy(i => i.Ingredient.Name)
            .Select(i => new ShoppingListItemDto(i.Id, i.IngredientId, i.Ingredient.Name, i.QuantityG, i.IsBought)).ToList();
        return new ShoppingListDto(list.Id, list.PlanId, list.CreatedAt, items, items.Count(i => i.IsBought), items.Count);
    }

    public async Task<ShoppingListItemDto> SetBoughtAsync(int userId, int planId, int itemId, bool isBought, CancellationToken ct = default)
    {
        var item = await _db.ShoppingListItems.Include(i => i.Ingredient)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.List.PlanId == planId && i.List.Plan.UserId == userId, ct)
            ?? throw AppException.NotFound("Mục trong danh sách đi chợ");
        item.IsBought = isBought;
        await _db.SaveChangesAsync(ct);
        return new ShoppingListItemDto(item.Id, item.IngredientId, item.Ingredient.Name, item.QuantityG, item.IsBought);
    }
}
