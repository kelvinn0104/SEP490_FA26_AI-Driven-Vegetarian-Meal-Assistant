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
    Task<bool> DeleteIngredientAsync(int id);
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
        await EnsureSeedIngredientsAsync();

        var query = _unitOfWork.Context.Ingredients
            .Include(i => i.IngredientAllergies)
                .ThenInclude(ia => ia.Allergy)
            .Include(i => i.UpdatedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(i => i.Name.ToLower().Contains(s) || (i.DataSource != null && i.DataSource.ToLower().Contains(s)));
        }

        if (allergyId.HasValue && allergyId.Value > 0)
        {
            query = query.Where(i => i.IngredientAllergies.Any(ia => ia.AllergyId == allergyId.Value));
        }

        query = sortBy switch
        {
            "protein_desc" => query.OrderByDescending(i => i.ProteinPer100g),
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
        var ingredient = new Ingredient
        {
            Name = request.Name.Trim(),
            KcalPer100g = request.KcalPer100g,
            ProteinPer100g = request.ProteinPer100g,
            CarbPer100g = request.CarbPer100g,
            FatPer100g = request.FatPer100g,
            IronPer100g = request.IronPer100g,
            B12Per100g = request.B12Per100g,
            CalciumPer100g = request.CalciumPer100g,
            ZincPer100g = request.ZincPer100g,
            DataSource = string.IsNullOrWhiteSpace(request.DataSource) ? "Viện Dinh Dưỡng Thực Dưỡng" : request.DataSource.Trim(),
            UpdatedBy = moderatorId,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Context.Ingredients.AddAsync(ingredient);
        await _unitOfWork.CommitAsync();

        if (request.AllergyIds != null && request.AllergyIds.Count > 0)
        {
            foreach (var aId in request.AllergyIds.Distinct())
            {
                await _unitOfWork.Context.IngredientAllergies.AddAsync(new IngredientAllergy
                {
                    IngredientId = ingredient.Id,
                    AllergyId = aId
                });
            }
            await _unitOfWork.CommitAsync();
        }

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
            foreach (var aId in request.AllergyIds.Distinct())
            {
                await _unitOfWork.Context.IngredientAllergies.AddAsync(new IngredientAllergy
                {
                    IngredientId = item.Id,
                    AllergyId = aId
                });
            }
        }

        await _unitOfWork.CommitAsync();
        return (await GetIngredientByIdAsync(id))!;
    }

    public async Task<bool> DeleteIngredientAsync(int id)
    {
        var item = await _unitOfWork.Context.Ingredients.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.Ingredients.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<List<AllergyDto>> GetAllergiesAsync()
    {
        await EnsureSeedAllergiesAsync();

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
        await EnsureSeedStandardsAsync();

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
            IronPer100g = i.IronPer100g,
            B12Per100g = i.B12Per100g,
            CalciumPer100g = i.CalciumPer100g,
            ZincPer100g = i.ZincPer100g,
            DataSource = i.DataSource ?? "USDA FoodData Central 2025",
            UpdatedAt = i.UpdatedAt.ToString("dd/MM/yyyy HH:mm"),
            UpdatedByName = i.UpdatedByUser?.DisplayName ?? "Chuyên gia Dinh dưỡng Mod",
            Allergies = i.IngredientAllergies.Select(ia => ia.Allergy?.Name ?? string.Empty).Where(n => !string.IsNullOrEmpty(n)).ToList(),
            AllergyIds = i.IngredientAllergies.Select(ia => ia.AllergyId).ToList()
        };
    }

    private async Task EnsureSeedAllergiesAsync()
    {
        if (!await _unitOfWork.Context.Allergies.AnyAsync())
        {
            var defaultAllergies = new List<Allergy>
            {
                new() { Name = "Đậu nành (Soy)" },
                new() { Name = "Gluten (Lúa mì / Lúa mạch)" },
                new() { Name = "Đậu phộng (Peanuts)" },
                new() { Name = "Hạt cây (Hạt điều, óc chó, hạnh nhân)" },
                new() { Name = "Mè / Vừng (Sesame)" },
                new() { Name = "Nấm (Mushroom allergy)" }
            };
            await _unitOfWork.Context.Allergies.AddRangeAsync(defaultAllergies);
            await _unitOfWork.CommitAsync();
        }
    }

    private async Task EnsureSeedIngredientsAsync()
    {
        await EnsureSeedAllergiesAsync();

        if (await _unitOfWork.Context.Ingredients.CountAsync() < 8)
        {
            var soyAllergy = await _unitOfWork.Context.Allergies.FirstOrDefaultAsync(a => a.Name.Contains("Đậu nành") || a.Name.Contains("Soy"));
            var glutenAllergy = await _unitOfWork.Context.Allergies.FirstOrDefaultAsync(a => a.Name.Contains("Gluten"));
            var nutAllergy = await _unitOfWork.Context.Allergies.FirstOrDefaultAsync(a => a.Name.Contains("Hạt cây") || a.Name.Contains("Tree"));
            var peanutAllergy = await _unitOfWork.Context.Allergies.FirstOrDefaultAsync(a => a.Name.Contains("Đậu phộng") || a.Name.Contains("Peanut"));

            var seedItems = new List<(Ingredient ing, int? allergyId)>
            {
                (new Ingredient { Name = "Đậu hũ non (Tofu ép canxi)", KcalPer100g = 144, ProteinPer100g = 17.3m, CarbPer100g = 2.8m, FatPer100g = 8.7m, IronPer100g = 2.66m, B12Per100g = 0m, CalciumPer100g = 683m, ZincPer100g = 1.57m, DataSource = "USDA FoodData Central 2025" }, soyAllergy?.Id),
                (new Ingredient { Name = "Tempeh đậu nành lên men hữu cơ", KcalPer100g = 192, ProteinPer100g = 20.3m, CarbPer100g = 7.6m, FatPer100g = 10.8m, IronPer100g = 2.70m, B12Per100g = 0.08m, CalciumPer100g = 111m, ZincPer100g = 1.81m, DataSource = "Viện Dinh Dưỡng Quốc Gia" }, soyAllergy?.Id),
                (new Ingredient { Name = "Men dinh dưỡng (Nutritional Yeast tăng cường)", KcalPer100g = 390, ProteinPer100g = 51.0m, CarbPer100g = 36.0m, FatPer100g = 5.0m, IronPer100g = 5.0m, B12Per100g = 44.0m, CalciumPer100g = 80m, ZincPer100g = 12.0m, DataSource = "USDA FoodData Central 2025" }, null),
                (new Ingredient { Name = "Tảo xoắn Spirulina nguyên chất", KcalPer100g = 290, ProteinPer100g = 57.5m, CarbPer100g = 23.9m, FatPer100g = 7.7m, IronPer100g = 28.5m, B12Per100g = 0m, CalciumPer100g = 120m, ZincPer100g = 3.6m, DataSource = "Viện Dinh Dưỡng Thực Dưỡng" }, null),
                (new Ingredient { Name = "Hạt chia hữu cơ giàu Omega-3", KcalPer100g = 486, ProteinPer100g = 16.5m, CarbPer100g = 42.1m, FatPer100g = 30.7m, IronPer100g = 7.72m, B12Per100g = 0m, CalciumPer100g = 631m, ZincPer100g = 4.58m, DataSource = "USDA FoodData Central 2025" }, null),
                (new Ingredient { Name = "Đậu gà Chickpeas nấu chín", KcalPer100g = 164, ProteinPer100g = 8.86m, CarbPer100g = 27.4m, FatPer100g = 2.59m, IronPer100g = 2.89m, B12Per100g = 0m, CalciumPer100g = 49m, ZincPer100g = 1.53m, DataSource = "USDA FoodData Central 2025" }, null),
                (new Ingredient { Name = "Đậu hũ ky tươi (Váng đậu)", KcalPer100g = 180, ProteinPer100g = 24.2m, CarbPer100g = 8.5m, FatPer100g = 6.8m, IronPer100g = 3.4m, B12Per100g = 0m, CalciumPer100g = 198m, ZincPer100g = 1.9m, DataSource = "Viện Dinh Dưỡng Quốc Gia" }, soyAllergy?.Id),
                (new Ingredient { Name = "Hạt sen tươi Huế", KcalPer100g = 89, ProteinPer100g = 4.1m, CarbPer100g = 17.2m, FatPer100g = 0.5m, IronPer100g = 1.2m, B12Per100g = 0m, CalciumPer100g = 44m, ZincPer100g = 0.8m, DataSource = "Viện Dinh Dưỡng Quốc Gia" }, null),
                (new Ingredient { Name = "Hạt điều rang mộc Bình Phước", KcalPer100g = 553, ProteinPer100g = 18.2m, CarbPer100g = 30.2m, FatPer100g = 43.8m, IronPer100g = 6.68m, B12Per100g = 0m, CalciumPer100g = 37m, ZincPer100g = 5.78m, DataSource = "USDA FoodData Central 2025" }, nutAllergy?.Id),
                (new Ingredient { Name = "Mì căn luộc (Seitan gluten cao đạm)", KcalPer100g = 370, ProteinPer100g = 75.2m, CarbPer100g = 13.8m, FatPer100g = 1.9m, IronPer100g = 5.2m, B12Per100g = 0m, CalciumPer100g = 142m, ZincPer100g = 1.6m, DataSource = "USDA FoodData Central 2025" }, glutenAllergy?.Id),
                (new Ingredient { Name = "Rau cải bó xôi (Spinach) hữu cơ", KcalPer100g = 23, ProteinPer100g = 2.86m, CarbPer100g = 3.63m, FatPer100g = 0.39m, IronPer100g = 2.71m, B12Per100g = 0m, CalciumPer100g = 99m, ZincPer100g = 0.53m, DataSource = "USDA FoodData Central 2025" }, null),
                (new Ingredient { Name = "Đậu phộng rang thơm", KcalPer100g = 567, ProteinPer100g = 25.8m, CarbPer100g = 16.1m, FatPer100g = 49.2m, IronPer100g = 4.58m, B12Per100g = 0m, CalciumPer100g = 92m, ZincPer100g = 3.27m, DataSource = "USDA FoodData Central 2025" }, peanutAllergy?.Id)
            };

            foreach (var item in seedItems)
            {
                if (!await _unitOfWork.Context.Ingredients.AnyAsync(i => i.Name == item.ing.Name))
                {
                    await _unitOfWork.Context.Ingredients.AddAsync(item.ing);
                    await _unitOfWork.CommitAsync();

                    if (item.allergyId.HasValue)
                    {
                        await _unitOfWork.Context.IngredientAllergies.AddAsync(new IngredientAllergy
                        {
                            IngredientId = item.ing.Id,
                            AllergyId = item.allergyId.Value
                        });
                        await _unitOfWork.CommitAsync();
                    }
                }
            }
        }
    }

    private async Task EnsureSeedStandardsAsync()
    {
        if (!await _unitOfWork.Context.NutrientStandards.AnyAsync())
        {
            var standards = new List<NutrientStandard>
            {
                new() { Gender = "male", AgeFrom = 19, AgeTo = 50, IronMg = 8.0m, B12Mcg = 2.4m, CalciumMg = 1000m, ZincMg = 11.0m, Note = "Nam giới trưởng thành ăn chay (Cần x1.8 Sắt do hấp thu non-heme)" },
                new() { Gender = "female", AgeFrom = 19, AgeTo = 50, IronMg = 18.0m, B12Mcg = 2.4m, CalciumMg = 1000m, ZincMg = 8.0m, Note = "Nữ giới trưởng thành ăn chay (Nhu cầu sắt cao hơn trong độ tuổi sinh sản)" },
                new() { Gender = "male", AgeFrom = 51, AgeTo = 100, IronMg = 8.0m, B12Mcg = 2.4m, CalciumMg = 1200m, ZincMg = 11.0m, Note = "Nam giới cao tuổi (Ưu tiên Canxi chống loãng xương và B12 hấp thu kém)" },
                new() { Gender = "female", AgeFrom = 51, AgeTo = 100, IronMg = 8.0m, B12Mcg = 2.4m, CalciumMg = 1200m, ZincMg = 8.0m, Note = "Nữ giới mãn kinh ăn chay (Cần 1200mg Canxi phòng xốp xương)" }
            };
            await _unitOfWork.Context.NutrientStandards.AddRangeAsync(standards);
            await _unitOfWork.CommitAsync();
        }
    }
}
