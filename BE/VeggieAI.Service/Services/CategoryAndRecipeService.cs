using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetCategoriesAsync(string? type = null);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int modId);
    Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int modId);
    Task<bool> DeleteCategoryAsync(int id, int modId);
}

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync(string? type = null)
    {
        var cats = await _unitOfWork.Categories.GetCategoriesWithCountsAsync(type);
        return cats.Select(c =>
        {
            var icon = c.Type == "food_type" ? "nutrition" :
                       c.Name.Contains("kho", StringComparison.OrdinalIgnoreCase) ? "soup_kitchen" :
                       c.Name.Contains("Canh", StringComparison.OrdinalIgnoreCase) || c.Name.Contains("Súp", StringComparison.OrdinalIgnoreCase) ? "ramen_dining" :
                       c.Name.Contains("Bánh", StringComparison.OrdinalIgnoreCase) ? "cake" :
                       c.Name.Contains("Salad", StringComparison.OrdinalIgnoreCase) || c.Name.Contains("Gỏi", StringComparison.OrdinalIgnoreCase) ? "eco" :
                       c.Name.Contains("Sinh tố", StringComparison.OrdinalIgnoreCase) ? "local_cafe" :
                       c.Name.Contains("Protein", StringComparison.OrdinalIgnoreCase) ? "fitness_center" : "restaurant";

            var recipes = c.Recipes?.ToList() ?? new List<Recipe>();
            var avgKcal = recipes.Count > 0
                ? $"{Math.Round(recipes.Average(r => r.KcalPerServing), 0)} kcal / khẩu phần"
                : "Chưa có món";

            var slug = c.Name.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace("&", "")
                .Replace("(", "")
                .Replace(")", "");

            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                RecipeCount = recipes.Count,
                Slug = slug,
                Icon = icon,
                Description = c.Type == "food_type"
                    ? $"Nhóm nguyên liệu thực phẩm: {c.Name}."
                    : $"Chuyên mục công thức món chay: {c.Name}.",
                AvgCalories = avgKcal,
                Featured = recipes.Count > 0,
                DietCompatibility = new List<string> { "Thuần chay" }
            };
        }).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request, int modId)
    {
        var normalizedType = request.Type.Trim().ToLowerInvariant();
        if (normalizedType != "recipe" && normalizedType != "food_type")
        {
            throw new ArgumentException("Loại danh mục chỉ chấp nhận 'recipe' hoặc 'food_type'.");
        }

        var exists = await _unitOfWork.Context.Categories
            .AnyAsync(c => c.Name.ToLower() == request.Name.Trim().ToLower() && c.Type == normalizedType);
        if (exists)
        {
            throw new InvalidOperationException("Danh mục này đã tồn tại trong hệ thống.");
        }

        var cat = new Category
        {
            Name = request.Name.Trim(),
            Type = normalizedType
        };

        await _unitOfWork.Categories.AddAsync(cat);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = "Tạo danh mục",
            Target = cat.Name,
            Details = $"Thêm danh mục '{cat.Name}' ({cat.Type})",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return new CategoryDto
        {
            Id = cat.Id,
            Name = cat.Name,
            Type = cat.Type,
            RecipeCount = 0,
            AvgCalories = "Chưa có món"
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request, int modId)
    {
        var cat = await _unitOfWork.Context.Categories
            .Include(c => c.Recipes)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return null;

        var normalizedType = request.Type.Trim().ToLowerInvariant();
        if (normalizedType != "recipe" && normalizedType != "food_type")
        {
            throw new ArgumentException("Loại danh mục chỉ chấp nhận 'recipe' hoặc 'food_type'.");
        }

        cat.Name = request.Name.Trim();
        cat.Type = normalizedType;

        _unitOfWork.Categories.Update(cat);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = "Cập nhật danh mục",
            Target = cat.Name,
            Details = $"Cập nhật danh mục ID #{id}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return new CategoryDto
        {
            Id = cat.Id,
            Name = cat.Name,
            Type = cat.Type,
            RecipeCount = cat.Recipes?.Count ?? 0
        };
    }

    public async Task<bool> DeleteCategoryAsync(int id, int modId)
    {
        var cat = await _unitOfWork.Context.Categories
            .Include(c => c.Recipes)
            .FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return false;

        if (cat.Recipes != null && cat.Recipes.Count > 0)
        {
            throw new InvalidOperationException($"Không thể xóa danh mục '{cat.Name}' vì đang có {cat.Recipes.Count} công thức liên kết.");
        }

        _unitOfWork.Categories.Delete(cat);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = "Xóa danh mục",
            Target = cat.Name,
            Details = $"Đã xóa danh mục #{id}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();
        return true;
    }
}

public interface IRecipeService
{
    Task<List<RecipeDto>> GetRecipesAsync(string? search = null, string? status = null, int? categoryId = null);
    Task<RecipeDto?> GetRecipeByIdAsync(string id);
    Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int modId);
    Task<RecipeDto?> UpdateRecipeAsync(string id, UpdateRecipeRequest request, int modId);
    Task<bool> UpdateRecipeStatusAsync(string id, string status, int modId);
    Task<bool> DeleteRecipeAsync(string id, int modId);
}

public class RecipeService : IRecipeService
{
    private readonly IUnitOfWork _unitOfWork;

    public RecipeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<RecipeDto>> GetRecipesAsync(string? search = null, string? status = null, int? categoryId = null)
    {
        var query = _unitOfWork.Context.Recipes
            .Include(r => r.Category)
            .Include(r => r.Creator)
            .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.Ingredient)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(s)
                                     || (r.Creator != null && r.Creator.DisplayName.ToLower().Contains(s))
                                     || (r.Category != null && r.Category.Name.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(r => r.Status == status.Trim().ToLower());
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(r => r.CategoryId == categoryId.Value);
        }

        var recipes = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        var mealLogCounts = await _unitOfWork.Context.MealLogs
            .GroupBy(m => m.RecipeId)
            .Select(g => new { RecipeId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.RecipeId, x => x.Count);

        return recipes.Select(r => MapRecipeToDto(r, mealLogCounts.TryGetValue(r.Id, out var c) ? c : 0)).ToList();
    }

    public async Task<RecipeDto?> GetRecipeByIdAsync(string id)
    {
        var intId = ParseRecipeId(id);
        var r = await _unitOfWork.Recipes.GetRecipeDetailAsync(intId);
        if (r == null) return null;

        var usedCount = await _unitOfWork.Context.MealLogs.CountAsync(m => m.RecipeId == r.Id);
        return MapRecipeToDto(r, usedCount);
    }

    public async Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int modId)
    {
        var categoryExists = await _unitOfWork.Context.Categories.AnyAsync(c => c.Id == request.CategoryId);
        if (!categoryExists)
        {
            throw new ArgumentException("Danh mục công thức không hợp lệ.");
        }

        var servings = request.Servings > 0 ? request.Servings : 1;
        var normalizedStatus = NormalizeStatus(request.Status);

        var recipe = new Recipe
        {
            Title = request.Title.Trim(),
            CategoryId = request.CategoryId,
            CreatedBy = modId,
            VerifiedBy = normalizedStatus == "published" ? modId : null,
            VerifiedAt = normalizedStatus == "published" ? DateTime.UtcNow : null,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            Instructions = request.Instructions.Trim(),
            Servings = servings,
            Status = normalizedStatus,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Recipes.AddAsync(recipe);
        await _unitOfWork.CommitAsync();

        await SyncRecipeIngredientsAndNutritionAsync(recipe, request.Ingredients);
        await _unitOfWork.CommitAsync();

        var created = await _unitOfWork.Recipes.GetRecipeDetailAsync(recipe.Id);
        return MapRecipeToDto(created ?? recipe, 0);
    }

    public async Task<RecipeDto?> UpdateRecipeAsync(string id, UpdateRecipeRequest request, int modId)
    {
        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Context.Recipes
            .Include(r => r.RecipeIngredients)
            .FirstOrDefaultAsync(r => r.Id == intId);
        if (recipe == null) return null;

        recipe.Title = request.Title.Trim();
        recipe.CategoryId = request.CategoryId;
        recipe.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        recipe.Instructions = request.Instructions.Trim();
        recipe.Servings = request.Servings > 0 ? request.Servings : 1;
        recipe.Status = NormalizeStatus(request.Status);
        if (recipe.Status == "published")
        {
            recipe.VerifiedBy = modId;
            recipe.VerifiedAt ??= DateTime.UtcNow;
        }
        recipe.UpdatedAt = DateTime.UtcNow;

        if (request.Ingredients != null)
        {
            _unitOfWork.Context.RecipeIngredients.RemoveRange(recipe.RecipeIngredients);
            await _unitOfWork.CommitAsync();
            await SyncRecipeIngredientsAndNutritionAsync(recipe, request.Ingredients);
        }

        _unitOfWork.Recipes.Update(recipe);
        await _unitOfWork.CommitAsync();

        var updated = await _unitOfWork.Recipes.GetRecipeDetailAsync(recipe.Id);
        var usedCount = await _unitOfWork.Context.MealLogs.CountAsync(m => m.RecipeId == recipe.Id);
        return MapRecipeToDto(updated ?? recipe, usedCount);
    }

    public async Task<bool> UpdateRecipeStatusAsync(string id, string status, int modId)
    {
        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Recipes.GetByIdAsync(intId);
        if (recipe == null) return false;

        var normalized = NormalizeStatus(status);
        recipe.Status = normalized;
        recipe.UpdatedAt = DateTime.UtcNow;

        if (normalized == "published")
        {
            recipe.VerifiedBy = modId;
            recipe.VerifiedAt = DateTime.UtcNow;
        }

        _unitOfWork.Recipes.Update(recipe);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> DeleteRecipeAsync(string id, int modId)
    {
        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Recipes.GetByIdAsync(intId);
        if (recipe == null) return false;

        var hasReferences = await _unitOfWork.Context.MealLogs.AnyAsync(m => m.RecipeId == intId)
                            || await _unitOfWork.Context.MealPlanItems.AnyAsync(m => m.RecipeId == intId);

        if (hasReferences)
        {
            recipe.Status = "hidden";
            recipe.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Recipes.Update(recipe);
        }
        else
        {
            var linkedPosts = await _unitOfWork.Context.Posts.Where(p => p.RecipeId == intId).ToListAsync();
            foreach (var p in linkedPosts)
            {
                p.RecipeId = null;
            }
            _unitOfWork.Recipes.Delete(recipe);
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = hasReferences ? "Ẩn công thức (Soft Delete)" : "Xóa công thức",
            Target = recipe.Title,
            Details = $"Xử lý công thức ID #{intId}",
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    private async Task SyncRecipeIngredientsAndNutritionAsync(Recipe recipe, List<RecipeIngredientItemDto>? items)
    {
        if (items == null || items.Count == 0)
        {
            return;
        }

        var validItems = items
            .Where(i => i.IngredientId > 0 && i.QuantityG > 0)
            .GroupBy(i => i.IngredientId)
            .Select(g => new RecipeIngredientItemDto { IngredientId = g.Key, QuantityG = g.Sum(x => x.QuantityG) })
            .ToList();

        if (validItems.Count == 0) return;

        var ingIds = validItems.Select(x => x.IngredientId).ToList();
        var dbIngredients = await _unitOfWork.Context.Ingredients
            .Where(i => ingIds.Contains(i.Id))
            .ToDictionaryAsync(i => i.Id);

        decimal totalKcal = 0, totalProtein = 0, totalCarb = 0, totalFat = 0, totalFiber = 0;
        decimal totalIron = 0, totalB12 = 0, totalCalcium = 0, totalZinc = 0;
        // Fiber is only known when EVERY ingredient has measured Fiber; partial sums would under-report.
        int ingredientCount = 0;
        bool allIngredientsHaveFiber = true;

        foreach (var vi in validItems)
        {
            if (!dbIngredients.TryGetValue(vi.IngredientId, out var ing)) continue;

            await _unitOfWork.Context.RecipeIngredients.AddAsync(new RecipeIngredient
            {
                RecipeId = recipe.Id,
                IngredientId = vi.IngredientId,
                QuantityG = vi.QuantityG
            });

            var factor = vi.QuantityG / 100m;
            ingredientCount++;
            totalKcal += ing.KcalPer100g * factor;
            totalProtein += ing.ProteinPer100g * factor;
            totalCarb += ing.CarbPer100g * factor;
            totalFat += ing.FatPer100g * factor;
            if (ing.FiberPer100g.HasValue)
            {
                totalFiber += ing.FiberPer100g.Value * factor;
            }
            else
            {
                allIngredientsHaveFiber = false;
            }
            totalIron += ing.IronPer100g * factor;
            totalB12 += ing.B12Per100g * factor;
            totalCalcium += ing.CalciumPer100g * factor;
            totalZinc += ing.ZincPer100g * factor;
        }

        var servings = Math.Max(1, recipe.Servings);
        recipe.KcalPerServing = Math.Round(totalKcal / servings, 2);
        recipe.ProteinG = Math.Round(totalProtein / servings, 2);
        recipe.CarbG = Math.Round(totalCarb / servings, 2);
        recipe.FatG = Math.Round(totalFat / servings, 2);
        recipe.FiberG = ingredientCount > 0 && allIngredientsHaveFiber ? Math.Round(totalFiber / servings, 2) : null;
        recipe.IronMg = Math.Round(totalIron / servings, 2);
        recipe.B12Mcg = Math.Round(totalB12 / servings, 2);
        recipe.CalciumMg = Math.Round(totalCalcium / servings, 2);
        recipe.ZincMg = Math.Round(totalZinc / servings, 2);
    }

    private static string NormalizeStatus(string? status)
    {
        var s = (status ?? "published").Trim().ToLowerInvariant();
        return s is "draft" or "pending_verification" or "published" or "hidden" ? s : "published";
    }

    private static RecipeDto MapRecipeToDto(Recipe r, int usageCount)
    {
        return new RecipeDto
        {
            Id = $"r{r.Id}",
            NumericId = r.Id,
            Title = r.Title,
            Author = r.Creator?.DisplayName ?? "Chuyên gia Dinh dưỡng",
            Category = r.Category?.Name ?? "Món chay",
            CategoryId = r.CategoryId,
            PublishedAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            Views = usageCount,
            Status = r.Status,
            ImageUrl = r.ImageUrl,
            Servings = r.Servings,
            KcalPerServing = r.KcalPerServing,
            ProteinG = r.ProteinG,
            CarbG = r.CarbG,
            FatG = r.FatG,
            FiberG = r.FiberG,
            IronMg = r.IronMg,
            B12Mcg = r.B12Mcg,
            CalciumMg = r.CalciumMg,
            ZincMg = r.ZincMg,
            Instructions = r.Instructions,
            Ingredients = r.RecipeIngredients?.Select(ri => new RecipeIngredientDetailDto
            {
                IngredientId = ri.IngredientId,
                IngredientName = ri.Ingredient?.Name ?? $"Nguyên liệu #{ri.IngredientId}",
                QuantityG = ri.QuantityG,
                Kcal = ri.Ingredient != null ? Math.Round(ri.Ingredient.KcalPer100g * ri.QuantityG / 100m, 1) : 0,
                ProteinG = ri.Ingredient != null ? Math.Round(ri.Ingredient.ProteinPer100g * ri.QuantityG / 100m, 1) : 0,
                FiberG = ri.Ingredient?.FiberPer100g != null ? Math.Round(ri.Ingredient.FiberPer100g.Value * ri.QuantityG / 100m, 1) : null
            }).ToList() ?? new List<RecipeIngredientDetailDto>()
        };
    }

    private static int ParseRecipeId(string id)
    {
        if (int.TryParse(id, out var num)) return num;
        if (id.StartsWith("r", StringComparison.OrdinalIgnoreCase) && int.TryParse(id[1..], out var parsedNum))
        {
            return parsedNum;
        }
        return 0;
    }
}
