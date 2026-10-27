using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetCategoriesAsync(string? type = null);
    Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request);
    Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request);
    Task<bool> DeleteCategoryAsync(int id);
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
            var icon = c.Name.Contains("kho") ? "soup_kitchen" :
                       c.Name.Contains("Canh") || c.Name.Contains("Súp") ? "ramen_dining" :
                       c.Name.Contains("Bánh") ? "cake" :
                       c.Name.Contains("Salad") || c.Name.Contains("Gỏi") ? "eco" :
                       c.Name.Contains("xào") || c.Name.Contains("chiên") ? "skillet" :
                       c.Name.Contains("Sinh tố") || c.Name.Contains("Nước ép") ? "local_cafe" :
                       c.Name.Contains("Protein") || c.Name.Contains("Gymer") ? "fitness_center" :
                       c.Name.Contains("nước") ? "soup_kitchen" : "restaurant";

            var calories = c.Name.Contains("Canh") ? "120 - 180 kcal" :
                           c.Name.Contains("Bánh") ? "280 - 410 kcal" :
                           c.Name.Contains("Salad") ? "160 - 240 kcal" :
                           c.Name.Contains("Protein") ? "450 - 680 kcal" :
                           c.Name.Contains("Sinh tố") ? "90 - 150 kcal" : "210 - 320 kcal";

            var desc = c.Name.Contains("kho") ? "Các món kho truyền thống từ nấm đông cô, củ sen, mít non và đậu hũ non rim tương." :
                       c.Name.Contains("Canh") ? "Thanh lọc cơ thể với nước hầm rau củ tự nhiên, rong biển kỷ tử và nấm tuyết bồi bổ." :
                       c.Name.Contains("Bánh") ? "Bánh không nướng, không đường tinh luyện, sử dụng chà là, hạt macca và bơ hạt điều." :
                       c.Name.Contains("Salad") ? "Rau xanh hữu cơ kết hợp sốt mè rang, sốt chanh leo và hạt óc chó giòn rụm." :
                       c.Name.Contains("Protein") ? "Chế độ bổ sung đạm thực vật từ tempeh, đậu gà chickpea, đậu lăng và hạt gai dầu." :
                       $"Danh mục thực đơn món chay dinh dưỡng thuộc nhóm {c.Name}.";

            var slug = c.Name.ToLower()
                .Replace(" ", "-")
                .Replace("&", "")
                .Replace("(", "")
                .Replace(")", "");

            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Type = c.Type,
                RecipeCount = c.Recipes?.Count ?? 0,
                Slug = slug,
                Icon = icon,
                Description = desc,
                AvgCalories = calories,
                Featured = (c.Recipes?.Count ?? 0) > 0 || c.Name.Contains("kho") || c.Name.Contains("Canh") || c.Name.Contains("Salad"),
                DietCompatibility = new List<string> { "Thuần chay", "Không Gluten" }
            };
        }).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CreateCategoryRequest request)
    {
        var cat = new Category
        {
            Name = request.Name.Trim(),
            Type = request.Type.Trim().ToLower()
        };

        await _unitOfWork.Categories.AddAsync(cat);
        await _unitOfWork.CommitAsync();

        return new CategoryDto
        {
            Id = cat.Id,
            Name = cat.Name,
            Type = cat.Type,
            RecipeCount = 0
        };
    }

    public async Task<CategoryDto?> UpdateCategoryAsync(int id, UpdateCategoryRequest request)
    {
        var cat = await _unitOfWork.Categories.GetByIdAsync(id);
        if (cat == null) return null;

        cat.Name = request.Name.Trim();
        cat.Type = request.Type.Trim().ToLower();

        _unitOfWork.Categories.Update(cat);
        await _unitOfWork.CommitAsync();

        return new CategoryDto
        {
            Id = cat.Id,
            Name = cat.Name,
            Type = cat.Type,
            RecipeCount = cat.Recipes?.Count ?? 0
        };
    }

    public async Task<bool> DeleteCategoryAsync(int id)
    {
        var cat = await _unitOfWork.Categories.GetByIdAsync(id);
        if (cat == null) return false;

        _unitOfWork.Categories.Delete(cat);
        await _unitOfWork.CommitAsync();
        return true;
    }
}

public interface IRecipeService
{
    Task<List<RecipeDto>> GetRecipesAsync(string? search = null, string? status = null, int? categoryId = null);
    Task<RecipeDto?> GetRecipeByIdAsync(string id);
    Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int creatorId, string? creatorRole);
    Task<bool> UpdateRecipeStatusAsync(string id, string status, int verifierId);
    Task<bool> DeleteRecipeAsync(string id);
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
        var recipes = await _unitOfWork.Recipes.GetRecipesWithCategoryAsync(search, status, categoryId);
        return recipes.Select(MapRecipeToDto).ToList();
    }

    public async Task<RecipeDto?> GetRecipeByIdAsync(string id)
    {
        var intId = ParseRecipeId(id);
        var r = await _unitOfWork.Recipes.GetRecipeDetailAsync(intId);
        return r == null ? null : MapRecipeToDto(r);
    }

    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.Ordinal)
    {
        "draft", "pending_verification", "published", "hidden"
    };

    public async Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int creatorId, string? creatorRole)
    {
        var db = _unitOfWork.Context;

        var title = request.Title?.Trim() ?? string.Empty;
        if (title.Length == 0) throw new InvalidOperationException("Tên công thức không được để trống.");

        if (!await db.Categories.AnyAsync(c => c.Id == request.CategoryId))
            throw new InvalidOperationException("Danh mục không tồn tại.");

        var servings = request.Servings > 0 ? request.Servings : 1;

        // Gộp nguyên liệu trùng, kiểm tra số lượng và sự tồn tại trong thư viện
        var items = (request.Ingredients ?? new List<RecipeIngredientItemDto>())
            .GroupBy(i => i.IngredientId)
            .Select(g => new { IngredientId = g.Key, QuantityG = g.Sum(x => x.QuantityG) })
            .ToList();
        if (items.Any(i => i.QuantityG <= 0))
            throw new InvalidOperationException("Khối lượng nguyên liệu phải lớn hơn 0 gram.");

        var ids = items.Select(i => i.IngredientId).ToList();
        var ingredients = await db.Ingredients.Where(i => ids.Contains(i.Id)).ToDictionaryAsync(i => i.Id);
        var missing = ids.Where(id => !ingredients.ContainsKey(id)).ToList();
        if (missing.Count > 0)
            throw new InvalidOperationException("Nguyên liệu không tồn tại: " + string.Join(", ", missing));

        // Admin/Moderator tạo → đăng ngay và chính họ là người duyệt (thỏa CHECK "Recipe_check").
        // User thường → chờ kiểm duyệt.
        var isStaff = AppRoles.IsStaff(creatorRole);
        var now = DateTime.UtcNow;

        var recipe = new Recipe
        {
            Title = title,
            CategoryId = request.CategoryId,
            CreatedBy = creatorId,
            ImageUrl = request.ImageUrl,
            Instructions = request.Instructions,
            Servings = servings,
            Status = isStaff ? "published" : "pending_verification",
            VerifiedBy = isStaff ? creatorId : null,
            VerifiedAt = isStaff ? now : null,
            CreatedAt = now,
            UpdatedAt = now,
        };

        // Dinh dưỡng / 1 khẩu phần = Σ(giá trị per100g × khối lượng / 100) / số khẩu phần
        foreach (var it in items)
        {
            var ing = ingredients[it.IngredientId];
            var f = it.QuantityG / 100m / servings;
            recipe.KcalPerServing += ing.KcalPer100g * f;
            recipe.ProteinG += ing.ProteinPer100g * f;
            recipe.CarbG += ing.CarbPer100g * f;
            recipe.FatG += ing.FatPer100g * f;
            recipe.IronMg += ing.IronPer100g * f;
            recipe.B12Mcg += ing.B12Per100g * f;
            recipe.CalciumMg += ing.CalciumPer100g * f;
            recipe.ZincMg += ing.ZincPer100g * f;
            recipe.RecipeIngredients.Add(new RecipeIngredient { IngredientId = it.IngredientId, QuantityG = it.QuantityG });
        }
        recipe.KcalPerServing = Math.Round(recipe.KcalPerServing, 2);
        recipe.ProteinG = Math.Round(recipe.ProteinG, 2);
        recipe.CarbG = Math.Round(recipe.CarbG, 2);
        recipe.FatG = Math.Round(recipe.FatG, 2);
        recipe.IronMg = Math.Round(recipe.IronMg, 2);
        recipe.B12Mcg = Math.Round(recipe.B12Mcg, 2);
        recipe.CalciumMg = Math.Round(recipe.CalciumMg, 2);
        recipe.ZincMg = Math.Round(recipe.ZincMg, 2);

        await _unitOfWork.Recipes.AddAsync(recipe);
        await _unitOfWork.CommitAsync();

        var created = await _unitOfWork.Recipes.GetRecipeDetailAsync(recipe.Id);
        return MapRecipeToDto(created ?? recipe);
    }

    public async Task<bool> UpdateRecipeStatusAsync(string id, string status, int verifierId)
    {
        var normalized = (status ?? string.Empty).Trim().ToLowerInvariant();
        if (!AllowedStatuses.Contains(normalized))
            throw new InvalidOperationException("Trạng thái không hợp lệ. Cho phép: " + string.Join(", ", AllowedStatuses));

        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Recipes.GetByIdAsync(intId);
        if (recipe == null) return false;

        recipe.Status = normalized;
        recipe.UpdatedAt = DateTime.UtcNow;

        if (normalized == "published")
        {
            if (verifierId <= 0) throw new UnauthorizedAccessException("Không xác định được người duyệt.");
            recipe.VerifiedBy = verifierId;
            recipe.VerifiedAt = DateTime.UtcNow;
        }

        _unitOfWork.Recipes.Update(recipe);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> DeleteRecipeAsync(string id)
    {
        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Recipes.GetByIdAsync(intId);
        if (recipe == null) return false;

        try
        {
            _unitOfWork.Recipes.Delete(recipe);
            await _unitOfWork.CommitAsync();
            return true;
        }
        catch
        {
            // Soft delete fallback to preserve referential integrity
            recipe.Status = "hidden";
            recipe.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Recipes.Update(recipe);
            await _unitOfWork.CommitAsync();
            return true;
        }
    }

    private static RecipeDto MapRecipeToDto(Recipe r)
    {
        return new RecipeDto
        {
            Id = $"r{r.Id}",
            Title = r.Title,
            Author = r.Creator?.DisplayName ?? "VeggieAI Chef",
            Category = r.Category?.Name ?? "Món chay",
            CategoryId = r.CategoryId,
            PublishedAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            Views = 850 + r.Id * 120,
            Status = r.Status,
            ImageUrl = r.ImageUrl,
            Servings = r.Servings,
            KcalPerServing = r.KcalPerServing,
            ProteinG = r.ProteinG,
            CarbG = r.CarbG,
            FatG = r.FatG,
            Instructions = r.Instructions
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
