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
    Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int creatorId);
    Task<bool> UpdateRecipeStatusAsync(string id, string status);
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

    public async Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int creatorId)
    {
        var recipe = new Recipe
        {
            Title = request.Title.Trim(),
            CategoryId = request.CategoryId,
            CreatedBy = creatorId,
            ImageUrl = request.ImageUrl,
            Instructions = request.Instructions,
            Servings = request.Servings > 0 ? request.Servings : 1,
            Status = "published", // Direct publish by admin/mod
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            KcalPerServing = 320,
            ProteinG = 18.5m,
            CarbG = 42.0m,
            FatG = 7.5m
        };

        await _unitOfWork.Recipes.AddAsync(recipe);
        await _unitOfWork.CommitAsync();

        var created = await _unitOfWork.Recipes.GetRecipeDetailAsync(recipe.Id);
        return MapRecipeToDto(created ?? recipe);
    }

    public async Task<bool> UpdateRecipeStatusAsync(string id, string status)
    {
        var intId = ParseRecipeId(id);
        var recipe = await _unitOfWork.Recipes.GetByIdAsync(intId);
        if (recipe == null) return false;

        var normalized = status.Trim().ToLower();
        recipe.Status = normalized;
        recipe.UpdatedAt = DateTime.UtcNow;

        if (normalized == "published")
        {
            recipe.VerifiedBy ??= 2; // Moderator default
            recipe.VerifiedAt ??= DateTime.UtcNow;
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
