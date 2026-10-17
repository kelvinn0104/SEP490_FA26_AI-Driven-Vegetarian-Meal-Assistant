using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Repository.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetUserWithDetailsAsync(int id);
    Task<List<User>> GetFilteredUsersAsync(string? search, string? role, string? status);
}

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(VeggieAIDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.HealthProfile)
            .Include(u => u.UserAllergies)
                .ThenInclude(ua => ua.Allergy)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.Trim().ToLower());
    }

    public async Task<User?> GetUserWithDetailsAsync(int id)
    {
        return await _context.Users
            .Include(u => u.HealthProfile)
            .Include(u => u.UserAllergies)
                .ThenInclude(ua => ua.Allergy)
            .Include(u => u.CreatedRecipes)
            .FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<List<User>> GetFilteredUsersAsync(string? search, string? role, string? status)
    {
        var query = _context.Users
            .Include(u => u.HealthProfile)
            .Include(u => u.CreatedRecipes)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(u =>
                u.DisplayName.ToLower().Contains(s) ||
                u.Email.ToLower().Contains(s) ||
                u.Id.ToString().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "all")
        {
            query = query.Where(u => u.Role.ToLower() == role.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(u => u.Status.ToLower() == status.Trim().ToLower());
        }

        return await query.OrderByDescending(u => u.CreatedAt).ToListAsync();
    }
}

public interface IRecipeRepository : IRepository<Recipe>
{
    Task<List<Recipe>> GetRecipesWithCategoryAsync(string? search = null, string? status = null, int? categoryId = null);
    Task<Recipe?> GetRecipeDetailAsync(int id);
}

public class RecipeRepository : Repository<Recipe>, IRecipeRepository
{
    public RecipeRepository(VeggieAIDbContext context) : base(context)
    {
    }

    public async Task<List<Recipe>> GetRecipesWithCategoryAsync(string? search = null, string? status = null, int? categoryId = null)
    {
        var query = _context.Recipes
            .Include(r => r.Category)
            .Include(r => r.Creator)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(s) || (r.Creator != null && r.Creator.DisplayName.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(r => r.Status == status);
        }

        if (categoryId.HasValue && categoryId.Value > 0)
        {
            query = query.Where(r => r.CategoryId == categoryId.Value);
        }

        return await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
    }

    public async Task<Recipe?> GetRecipeDetailAsync(int id)
    {
        return await _context.Recipes
            .Include(r => r.Category)
            .Include(r => r.Creator)
            .Include(r => r.RecipeIngredients)
                .ThenInclude(ri => ri.Ingredient)
            .FirstOrDefaultAsync(r => r.Id == id);
    }
}

public interface ICategoryRepository : IRepository<Category>
{
    Task<List<Category>> GetCategoriesWithCountsAsync(string? type = null);
}

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(VeggieAIDbContext context) : base(context)
    {
    }

    public async Task<List<Category>> GetCategoriesWithCountsAsync(string? type = null)
    {
        var query = _context.Categories
            .Include(c => c.Recipes)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) && type != "all")
        {
            query = query.Where(c => c.Type == type);
        }

        return await query.OrderBy(c => c.Name).ToListAsync();
    }
}

public interface IModerationRepository
{
    Task<List<Post>> GetPendingModerationPostsAsync(string? type = null);
    Task<Post?> GetPostByIdAsync(int id);
    Task AddModerationLogAsync(ModerationLog log);
}

public class ModerationRepository : IModerationRepository
{
    private readonly VeggieAIDbContext _context;

    public ModerationRepository(VeggieAIDbContext context)
    {
        _context = context;
    }

    public async Task<List<Post>> GetPendingModerationPostsAsync(string? type = null)
    {
        var query = _context.Posts
            .Include(p => p.User)
            .Include(p => p.Recipe)
            .Include(p => p.ModerationLogs)
            .Where(p => p.Status == "pending")
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(type) && type != "all")
        {
            query = query.Where(p => p.PostType == type);
        }

        return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
    }

    public async Task<Post?> GetPostByIdAsync(int id)
    {
        return await _context.Posts
            .Include(p => p.User)
            .Include(p => p.Recipe)
            .Include(p => p.ModerationLogs)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddModerationLogAsync(ModerationLog log)
    {
        await _context.ModerationLogs.AddAsync(log);
    }
}

public interface IAiModelRepository : IRepository<AiModel>
{
    Task<List<AiModelLog>> GetRecentLogsAsync(int limit = 20);
    Task AddLogAsync(AiModelLog log);
}

public class AiModelRepository : Repository<AiModel>, IAiModelRepository
{
    public AiModelRepository(VeggieAIDbContext context) : base(context)
    {
    }

    public async Task<List<AiModelLog>> GetRecentLogsAsync(int limit = 20)
    {
        return await _context.AiModelLogs
            .Include(l => l.Model)
            .OrderByDescending(l => l.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    public async Task AddLogAsync(AiModelLog log)
    {
        await _context.AiModelLogs.AddAsync(log);
    }
}

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IRecipeRepository Recipes { get; }
    ICategoryRepository Categories { get; }
    IModerationRepository Moderation { get; }
    IAiModelRepository AiModels { get; }
    VeggieAIDbContext Context { get; }
    Task<int> CommitAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly VeggieAIDbContext _context;
    private IUserRepository? _users;
    private IRecipeRepository? _recipes;
    private ICategoryRepository? _categories;
    private IModerationRepository? _moderation;
    private IAiModelRepository? _aiModels;

    public UnitOfWork(VeggieAIDbContext context)
    {
        _context = context;
    }

    public IUserRepository Users => _users ??= new UserRepository(_context);
    public IRecipeRepository Recipes => _recipes ??= new RecipeRepository(_context);
    public ICategoryRepository Categories => _categories ??= new CategoryRepository(_context);
    public IModerationRepository Moderation => _moderation ??= new ModerationRepository(_context);
    public IAiModelRepository AiModels => _aiModels ??= new AiModelRepository(_context);
    public VeggieAIDbContext Context => _context;

    public async Task<int> CommitAsync() => await _context.SaveChangesAsync();

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
