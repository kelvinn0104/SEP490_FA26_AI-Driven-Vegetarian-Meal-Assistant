using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Infrastructure.Common;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class CatalogService : ICatalogService
{
    private readonly VeggieAiDbContext _db;
    public CatalogService(VeggieAiDbContext db) => _db = db;

    public async Task<IReadOnlyList<AllergyDto>> GetAllergiesAsync(CancellationToken ct = default) =>
        await _db.Allergies.AsNoTracking().OrderBy(a => a.Name).Select(a => new AllergyDto(a.Id, a.Name)).ToListAsync(ct);

    public async Task<IReadOnlyList<CategoryDto>> GetCategoriesAsync(string? type, CancellationToken ct = default) =>
        await _db.Categories.AsNoTracking().Where(c => type == null || c.Type == type)
            .OrderBy(c => c.Type).ThenBy(c => c.Name).Select(c => new CategoryDto(c.Id, c.Name, c.Type)).ToListAsync(ct);

    public async Task<PagedResult<IngredientDto>> GetIngredientsAsync(string? keyword, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.Ingredients.AsNoTracking().Include(i => i.Allergies).AsQueryable();
        if (!string.IsNullOrWhiteSpace(keyword))
            q = q.Where(i => EF.Functions.ILike(i.Name, $"%{keyword.Trim()}%"));
        var total = await q.CountAsync(ct);
        var items = await q.OrderBy(i => i.Name).Skip(page.Skip).Take(page.PageSize).ToListAsync(ct);
        return new PagedResult<IngredientDto> { Items = items.Select(i => i.ToDto()).ToList(), Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }

    public async Task<IngredientDto> GetIngredientAsync(int id, CancellationToken ct = default)
    {
        var i = await _db.Ingredients.AsNoTracking().Include(x => x.Allergies).FirstOrDefaultAsync(x => x.Id == id, ct)
                ?? throw AppException.NotFound("Nguyên liệu");
        return i.ToDto();
    }
}
