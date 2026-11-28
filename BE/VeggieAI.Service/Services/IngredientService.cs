using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IIngredientService
{
    Task<List<IngredientDto>> GetIngredientsAsync(string? search = null, int? allergyId = null, string? sortBy = null);
    Task<IngredientDto?> GetIngredientByIdAsync(int id);
    Task<IngredientDto> CreateIngredientAsync(CreateIngredientRequest request, int moderatorId);
    Task<IngredientDto?> UpdateIngredientAsync(int id, UpdateIngredientRequest request, int moderatorId);
    Task<bool> DeleteIngredientAsync(int id, int moderatorId);
    Task<List<AllergyDto>> GetAllergiesAsync();
    Task<List<NutrientStandardDto>> GetNutrientStandardsAsync();
}

public class IngredientService : IIngredientService
{
    private readonly IUnitOfWork _unitOfWork;

    public IngredientService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<IngredientDto>> GetIngredientsAsync(string? search = null, int? allergyId = null, string? sortBy = null)
    {
        var query = _unitOfWork.Context.Ingredients
            .Include(i => i.IngredientAllergies)
                .ThenInclude(ia => ia.Allergy)
            .Include(i => i.UpdatedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(s)
                                     || (i.DataSource != null && i.DataSource.ToLower().Contains(s)));
        }

        if (allergyId.HasValue && allergyId.Value > 0)
        {
            query = query.Where(i => i.IngredientAllergies.Any(ia => ia.AllergyId == allergyId.Value));
        }

        query = sortBy switch
        {
            "protein_desc" => query.OrderByDescending(i => i.ProteinPer100g),
            "fiber_desc" => query.OrderByDescending(i => i.FiberPer100g ?? -1m),
            "iron_desc" => query.OrderByDescending(i => i.IronPer100g),
            "b12_desc" => query.OrderByDescending(i => i.B12Per100g),
            "calcium_desc" => query.OrderByDescending(i => i.CalciumPer100g),
            "zinc_desc" => query.OrderByDescending(i => i.ZincPer100g),
            "kcal_asc" => query.OrderBy(i => i.KcalPer100g),
            "kcal_desc" => query.OrderByDescending(i => i.KcalPer100g),
            _ => query.OrderByDescending(i => i.UpdatedAt)
        };

        var items = await query.ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<IngredientDto?> GetIngredientByIdAsync(int id)
    {
        var item = await _unitOfWork.Context.Ingredients
            .Include(i => i.IngredientAllergies)
                .ThenInclude(ia => ia.Allergy)
            .Include(i => i.UpdatedByUser)
            .FirstOrDefaultAsync(i => i.Id == id);

        return item == null ? null : MapToDto(item);
    }

    public async Task<IngredientDto> CreateIngredientAsync(CreateIngredientRequest request, int moderatorId)
    {
        var exists = await _unitOfWork.Context.Ingredients
            .AnyAsync(i => i.Name.ToLower() == request.Name.Trim().ToLower());
        if (exists)
        {
            throw new InvalidOperationException($"Nguyên liệu '{request.Name.Trim()}' đã tồn tại trong thư viện.");
        }

        var ingredient = new Ingredient
        {
            Name = request.Name.Trim(),
            KcalPer100g = request.KcalPer100g,
            ProteinPer100g = request.ProteinPer100g,
            CarbPer100g = request.CarbPer100g,
            FatPer100g = request.FatPer100g,
            FiberPer100g = request.FiberPer100g,
            IronPer100g = request.IronPer100g,
            B12Per100g = request.B12Per100g,
            CalciumPer100g = request.CalciumPer100g,
            ZincPer100g = request.ZincPer100g,
            DataSource = string.IsNullOrWhiteSpace(request.DataSource) ? "USDA FoodData Central" : request.DataSource.Trim(),
            UpdatedBy = moderatorId,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Context.Ingredients.AddAsync(ingredient);
        await _unitOfWork.CommitAsync();

        if (request.AllergyIds != null && request.AllergyIds.Count > 0)
        {
            var validAllergies = await _unitOfWork.Context.Allergies
                .Where(a => request.AllergyIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync();

            foreach (var aId in validAllergies.Distinct())
            {
                await _unitOfWork.Context.IngredientAllergies.AddAsync(new IngredientAllergy
                {
                    IngredientId = ingredient.Id,
                    AllergyId = aId
                });
            }
            await _unitOfWork.CommitAsync();
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Thêm nguyên liệu",
            Target = ingredient.Name,
            Details = $"Thêm '{ingredient.Name}' ({ingredient.KcalPer100g} kcal/100g)",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return (await GetIngredientByIdAsync(ingredient.Id))!;
    }

    public async Task<IngredientDto?> UpdateIngredientAsync(int id, UpdateIngredientRequest request, int moderatorId)
    {
        var item = await _unitOfWork.Context.Ingredients
            .Include(i => i.IngredientAllergies)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null) return null;

        item.Name = request.Name.Trim();
        item.KcalPer100g = request.KcalPer100g;
        item.ProteinPer100g = request.ProteinPer100g;
        item.CarbPer100g = request.CarbPer100g;
        item.FatPer100g = request.FatPer100g;
        item.FiberPer100g = request.FiberPer100g;
        item.IronPer100g = request.IronPer100g;
        item.B12Per100g = request.B12Per100g;
        item.CalciumPer100g = request.CalciumPer100g;
        item.ZincPer100g = request.ZincPer100g;
        if (!string.IsNullOrWhiteSpace(request.DataSource))
        {
            item.DataSource = request.DataSource.Trim();
        }
        item.UpdatedBy = moderatorId;
        item.UpdatedAt = DateTime.UtcNow;

        if (request.AllergyIds != null)
        {
            _unitOfWork.Context.IngredientAllergies.RemoveRange(item.IngredientAllergies);
            var validAllergies = await _unitOfWork.Context.Allergies
                .Where(a => request.AllergyIds.Contains(a.Id))
                .Select(a => a.Id)
                .ToListAsync();

            foreach (var aId in validAllergies.Distinct())
            {
                await _unitOfWork.Context.IngredientAllergies.AddAsync(new IngredientAllergy
                {
                    IngredientId = item.Id,
                    AllergyId = aId
                });
            }
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Cập nhật nguyên liệu",
            Target = item.Name,
            Details = $"Cập nhật vi chất '{item.Name}'",
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return (await GetIngredientByIdAsync(id))!;
    }

    public async Task<bool> DeleteIngredientAsync(int id, int moderatorId)
    {
        var item = await _unitOfWork.Context.Ingredients.FindAsync(id);
        if (item == null) return false;

        var usedInRecipes = await _unitOfWork.Context.RecipeIngredients.CountAsync(ri => ri.IngredientId == id);
        if (usedInRecipes > 0)
        {
            throw new InvalidOperationException($"Không thể xóa nguyên liệu '{item.Name}' vì đang liên kết với {usedInRecipes} công thức món ăn.");
        }

        _unitOfWork.Context.Ingredients.Remove(item);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Xóa nguyên liệu",
            Target = item.Name,
            Details = $"Đã xóa nguyên liệu #{id}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<List<AllergyDto>> GetAllergiesAsync()
    {
        var allergies = await _unitOfWork.Context.Allergies
            .Include(a => a.IngredientAllergies)
            .OrderBy(a => a.Name)
            .ToListAsync();

        return allergies.Select(a => new AllergyDto
        {
            Id = a.Id,
            Name = a.Name,
            IngredientCount = a.IngredientAllergies.Count
        }).ToList();
    }

    public async Task<List<NutrientStandardDto>> GetNutrientStandardsAsync()
    {
        var standards = await _unitOfWork.Context.NutrientStandards
            .OrderBy(s => s.Gender)
            .ThenBy(s => s.AgeFrom)
            .ToListAsync();

        return standards.Select(s => new NutrientStandardDto
        {
            Id = s.Id,
            Gender = s.Gender,
            AgeFrom = s.AgeFrom,
            AgeTo = s.AgeTo,
            IronMg = s.IronMg,
            B12Mcg = s.B12Mcg,
            CalciumMg = s.CalciumMg,
            ZincMg = s.ZincMg,
            Note = s.Note
        }).ToList();
    }

    private static IngredientDto MapToDto(Ingredient i)
    {
        return new IngredientDto
        {
            Id = i.Id,
            Name = i.Name,
            KcalPer100g = i.KcalPer100g,
            ProteinPer100g = i.ProteinPer100g,
            CarbPer100g = i.CarbPer100g,
            FatPer100g = i.FatPer100g,
            FiberPer100g = i.FiberPer100g,
            IronPer100g = i.IronPer100g,
            B12Per100g = i.B12Per100g,
            CalciumPer100g = i.CalciumPer100g,
            ZincPer100g = i.ZincPer100g,
            DataSource = i.DataSource ?? "USDA FoodData Central",
            UpdatedAt = i.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
            UpdatedByName = i.UpdatedByUser?.DisplayName ?? "Hệ thống",
            Allergies = i.IngredientAllergies.Select(ia => ia.Allergy?.Name ?? string.Empty).Where(n => !string.IsNullOrEmpty(n)).ToList(),
            AllergyIds = i.IngredientAllergies.Select(ia => ia.AllergyId).ToList()
        };
    }
}
