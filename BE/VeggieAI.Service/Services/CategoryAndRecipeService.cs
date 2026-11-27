using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;
using VeggieAI.Service.Services.AI;

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
    Task<List<RecipeDto>> GetRecipesAsync(string? search = null, string? status = null, int? categoryId = null, string? sort = null, bool publicOnly = false);
    Task<PagedResult<RecipeDto>> GetRecipesPagedAsync(RecipeQuery query, PageQuery page, bool publicOnly = false);

    /// <summary>
    /// Chi tiết công thức. Công thức chưa published chỉ tác giả hoặc staff xem được (người khác nhận null → 404).
    /// viewerId != null → điền IsFavorite. Công thức published được tăng ViewCount.
    /// </summary>
    Task<RecipeDto?> GetRecipeByIdAsync(string id, int? viewerId = null, bool viewerIsStaff = false);
    Task<RecipeDto> CreateRecipeAsync(CreateRecipeRequest request, int creatorId, string? creatorRole);
    Task<bool> UpdateRecipeStatusAsync(string id, string status, int verifierId);
    Task<bool> DeleteRecipeAsync(string id);
    Task<PagedResult<RecipeDto>> GetFavoritesAsync(int userId, int page, int pageSize);
    Task AddFavoriteAsync(int userId, string recipeId);
    Task RemoveFavoriteAsync(int userId, string recipeId);
}

public class RecipeService : IRecipeService
{
    private readonly IUnitOfWork _unitOfWork;

    public RecipeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<RecipeDto>> GetRecipesAsync(string? search = null, string? status = null, int? categoryId = null, string? sort = null, bool publicOnly = false)
    {
        if (publicOnly)
        {
            var query = new RecipeQuery { Search = search, Status = status, CategoryId = categoryId, Sort = sort };
            var rows = await ApplySort(BuildQuery(query, publicOnly), sort).ToListAsync();
            return rows.Select(MapRecipeToDto).ToList();
        }
        var recipes = await _unitOfWork.Recipes.GetRecipesWithCategoryAsync(search, status, categoryId);
        return ApplySort(recipes.AsQueryable(), sort).Select(MapRecipeToDto).ToList();
    }

    public async Task<PagedResult<RecipeDto>> GetRecipesPagedAsync(RecipeQuery query, PageQuery page, bool publicOnly = false)
    {
        var q = BuildQuery(query, publicOnly);
        var total = await q.CountAsync();
        var rows = await ApplySort(q, query.Sort).Skip(page.Skip).Take(page.PageSize).ToListAsync();
        return new PagedResult<RecipeDto>
        {
            Items = rows.Select(MapRecipeToDto).ToList(),
            TotalCount = total,
            Page = page.Page,
            PageSize = page.PageSize
        };
    }

    private IQueryable<Recipe> BuildQuery(RecipeQuery query, bool publicOnly)
    {
        var q = _unitOfWork.Context.Recipes.AsNoTracking()
            .Include(r => r.Category)
            .Include(r => r.Creator)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            q = q.Where(r => r.Title.ToLower().Contains(s) || (r.Creator != null && r.Creator.DisplayName.ToLower().Contains(s)));
        }
        if (publicOnly)
            q = q.FromApprovedCatalog();
        else if (!string.IsNullOrWhiteSpace(query.Status) && query.Status != "all")
            q = q.Where(r => r.Status == query.Status);
        if (query.CategoryId is > 0)
            q = q.Where(r => r.CategoryId == query.CategoryId.Value);

        return q;
    }

    private static IQueryable<Recipe> ApplySort(IQueryable<Recipe> q, string? sort) =>
        (sort ?? "newest").Trim().ToLowerInvariant() switch
        {
            "oldest" => q.OrderBy(r => r.CreatedAt).ThenBy(r => r.Id),
            "popular" or "views" => q.OrderByDescending(r => r.ViewCount).ThenByDescending(r => r.CreatedAt),
            "protein" => q.OrderByDescending(r => r.ProteinG).ThenBy(r => r.KcalPerServing),
            "kcal_asc" or "kcal" => q.OrderBy(r => r.KcalPerServing).ThenByDescending(r => r.ProteinG),
            "kcal_desc" => q.OrderByDescending(r => r.KcalPerServing),
            "title" => q.OrderBy(r => r.Title),
            _ => q.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id),
        };

    public async Task<RecipeDto?> GetRecipeByIdAsync(string id, int? viewerId = null, bool viewerIsStaff = false)
    {
        var intId = ParseRecipeId(id);
        var r = await _unitOfWork.Recipes.GetRecipeDetailAsync(intId);
        if (r == null) return null;

        // Công thức nháp / chờ duyệt / đã ẩn: chỉ tác giả hoặc admin/moderator được xem
        if (!viewerIsStaff && (r.Status == "published" || r.CreatedBy != viewerId) &&
            !await _unitOfWork.Context.Recipes.FromApprovedCatalog().AnyAsync(x => x.Id == intId)) return null;

        if (r.Status == "published")
        {
            r.ViewCount++;
            try { await _unitOfWork.CommitAsync(); }
            catch (DbUpdateException) { /* đếm lượt xem không được làm hỏng request đọc */ }
        }

        var dto = MapRecipeToDto(r, includeIngredients: true);
        if (viewerId is int uid)
            dto.IsFavorite = await _unitOfWork.Context.Favorites.AnyAsync(f => f.UserId == uid && f.RecipeId == r.Id);
        return dto;
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

        // Công thức không có nguyên liệu thì không tính được dinh dưỡng và lọt bộ lọc dị ứng:
        // user thường bắt buộc nhập nguyên liệu, staff được lưu nháp (draft) rồi bổ sung sau.
        if (items.Count == 0 && !isStaff)
            throw new InvalidOperationException("Công thức cần ít nhất 1 nguyên liệu.");
        var publishNow = isStaff && !string.IsNullOrWhiteSpace(request.Instructions) &&
            Math.Round(items.Sum(it => ingredients[it.IngredientId].KcalPer100g * it.QuantityG / 100m / servings), 2) > 0;

        var recipe = new Recipe
        {
            Title = title,
            CategoryId = request.CategoryId,
            CreatedBy = creatorId,
            ImageUrl = request.ImageUrl,
            Instructions = request.Instructions,
            Servings = servings,
            Status = publishNow ? "published" : isStaff ? "draft" : "pending_verification",
            VerifiedBy = publishNow ? creatorId : null,
            VerifiedAt = publishNow ? now : null,
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
        return MapRecipeToDto(created ?? recipe, includeIngredients: true);
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
            await EnsurePublishableAsync(recipe);
            recipe.VerifiedBy = verifierId;
            recipe.VerifiedAt = DateTime.UtcNow;
        }

        var previous = _unitOfWork.Context.Entry(recipe).Property(r => r.Status).OriginalValue;
        if (previous != normalized && recipe.CreatedBy != verifierId && normalized is "published" or "hidden")
        {
            Notifier.Queue(_unitOfWork.Context, recipe.CreatedBy, NotificationTypes.PostReview, normalized == "published"
                ? $"Công thức {Notifier.Quote(recipe.Title)} của bạn đã được duyệt và xuất bản."
                : $"Công thức {Notifier.Quote(recipe.Title)} của bạn đã bị ẩn khỏi danh mục.");
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

    /// <summary>Chỉ cho publish công thức đã có nguyên liệu và dinh dưỡng (để bộ lọc dị ứng và tính kcal hoạt động đúng).</summary>
    private async Task EnsurePublishableAsync(Recipe recipe)
    {
        if (string.IsNullOrWhiteSpace(recipe.Instructions) || recipe.Servings < 1)
            throw new AppException("Bổ sung hướng dẫn và khẩu phần trước khi xuất bản.", 400, "RECIPE_MISSING_INSTRUCTIONS");
        var hasIngredients = await _unitOfWork.Context.RecipeIngredients.AnyAsync(ri => ri.RecipeId == recipe.Id);
        if (!hasIngredients)
            throw new AppException("Công thức chưa có nguyên liệu nên chưa thể xuất bản.", 400, "RECIPE_MISSING_INGREDIENTS");
        if (recipe.KcalPerServing <= 0)
            throw new AppException("Công thức chưa có dữ liệu dinh dưỡng nên chưa thể xuất bản.", 400, "RECIPE_MISSING_NUTRITION");
    }

    // ---------------- Favorites ----------------

    public async Task<PagedResult<RecipeDto>> GetFavoritesAsync(int userId, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = pageSize is < 1 or > 100 ? 20 : pageSize;
        var db = _unitOfWork.Context;

        var approved = db.Recipes.FromApprovedCatalog();
        var baseQuery = db.Favorites.AsNoTracking()
            .Where(f => f.UserId == userId && approved.Any(r => r.Id == f.RecipeId));
        var total = await baseQuery.CountAsync();
        var ids = await baseQuery
            .OrderByDescending(f => f.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(f => f.RecipeId)
            .ToListAsync();

        var recipes = await approved.AsNoTracking()
            .Include(r => r.Category)
            .Include(r => r.Creator)
            .Where(r => ids.Contains(r.Id))
            .ToListAsync();

        return new PagedResult<RecipeDto>
        {
            Items = ids.Select(id => recipes.FirstOrDefault(r => r.Id == id))
                .Where(r => r != null && r.Status == "published")
                .Select(r =>
                {
                    var dto = MapRecipeToDto(r!);
                    dto.IsFavorite = true;
                    return dto;
                })
                .ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task AddFavoriteAsync(int userId, string recipeId)
    {
        var id = ParseRecipeId(recipeId);
        var db = _unitOfWork.Context;
        if (!await db.Recipes.FromApprovedCatalog().AnyAsync(r => r.Id == id))
            throw AppException.NotFound("Công thức");
        if (await db.Favorites.AnyAsync(f => f.UserId == userId && f.RecipeId == id)) return; // idempotent

        db.Favorites.Add(new Favorite { UserId = userId, RecipeId = id, CreatedAt = DateTime.UtcNow });
        await _unitOfWork.CommitAsync();
    }

    public async Task RemoveFavoriteAsync(int userId, string recipeId)
    {
        var id = ParseRecipeId(recipeId);
        var db = _unitOfWork.Context;
        var fav = await db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.RecipeId == id);
        if (fav == null) return; // idempotent
        db.Favorites.Remove(fav);
        await _unitOfWork.CommitAsync();
    }

    private static RecipeDto MapRecipeToDto(Recipe r) => MapRecipeToDto(r, includeIngredients: false);

    private static RecipeDto MapRecipeToDto(Recipe r, bool includeIngredients)
    {
        return new RecipeDto
        {
            Id = $"r{r.Id}",
            Title = r.Title,
            Author = r.Creator?.DisplayName ?? "VeggieAI Chef",
            Category = r.Category?.Name ?? "Món chay",
            CategoryId = r.CategoryId,
            PublishedAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            Views = r.ViewCount,
            Status = r.Status,
            ImageUrl = r.ImageUrl,
            Servings = r.Servings,
            KcalPerServing = r.KcalPerServing,
            ProteinG = r.ProteinG,
            CarbG = r.CarbG,
            FatG = r.FatG,
            IronMg = r.IronMg,
            B12Mcg = r.B12Mcg,
            CalciumMg = r.CalciumMg,
            ZincMg = r.ZincMg,
            Instructions = r.Instructions,
            Ingredients = includeIngredients
                ? r.RecipeIngredients
                    .OrderByDescending(ri => ri.QuantityG)
                    .Select(ri => new RecipeIngredientDto
                    {
                        IngredientId = ri.IngredientId,
                        Name = ri.Ingredient?.Name ?? string.Empty,
                        DataSource = ri.Ingredient?.DataSource,
                        QuantityG = ri.QuantityG
                    })
                    .ToList()
                : null
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
