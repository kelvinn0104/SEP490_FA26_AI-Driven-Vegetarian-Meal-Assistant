using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services;

public interface IIngredientCatalogService
{
    /// <summary>Tra nguyên liệu theo tên (không phân biệt hoa thường, dấu). search rỗng → trả danh sách đầu theo tên.</summary>
    Task<IReadOnlyList<IngredientLookupDto>> SearchAsync(string? search, int limit, CancellationToken ct = default);
}

public class IngredientCatalogService : IIngredientCatalogService
{
    private readonly VeggieAIDbContext _db;

    public IngredientCatalogService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<IngredientLookupDto>> SearchAsync(string? search, int limit, CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 100);
        // Danh mục nguyên liệu nhỏ (vài trăm dòng) → lọc trong bộ nhớ để so khớp không dấu cho cả tiếng Việt
        var all = await _db.Ingredients.AsNoTracking()
            .OrderBy(i => i.Name)
            .Select(i => new IngredientLookupDto(i.Id, i.Name, i.KcalPer100g, i.ProteinPer100g))
            .ToListAsync(ct);

        if (string.IsNullOrWhiteSpace(search)) return all.Take(limit).ToList();

        var key = Fold(search);
        return all
            .Select(i => new { Item = i, Name = Fold(i.Name) })
            .Where(x => x.Name.Contains(key, StringComparison.Ordinal))
            .OrderBy(x => x.Name.StartsWith(key, StringComparison.Ordinal) ? 0 : 1)
            .ThenBy(x => x.Name.Length)
            .Take(limit)
            .Select(x => x.Item)
            .ToList();
    }

    /// <summary>Bỏ dấu tiếng Việt + chữ thường: "Đậu phụ" → "dau phu".</summary>
    public static string Fold(string text)
    {
        var normalized = text.Trim().ToLowerInvariant().Replace('đ', 'd').Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalized.Length);
        foreach (var c in normalized)
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark) sb.Append(c);
        return sb.ToString().Normalize(NormalizationForm.FormC);
    }
}
