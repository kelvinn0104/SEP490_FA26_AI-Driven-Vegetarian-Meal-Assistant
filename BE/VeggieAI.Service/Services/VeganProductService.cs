using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IVeganProductService
{
    Task<List<VeganProductScanDto>> GetProductsAsync(string? status = null, string? category = null, string? search = null);
    Task<ProductScanStatsDto> GetStatsAsync();
    Task<VeganProductScanDto?> GetProductByIdAsync(int id);
    Task<VeganProductScanDto> SubmitProductScanAsync(SubmitVeganProductScanRequest request, int userId);
    Task<VeganProductScanDto> CreateProductAsync(CreateVeganProductRequest request, int modId);
    Task<VeganProductScanDto?> UpdateProductAsync(int id, UpdateVeganProductRequest request, int modId);
    Task<bool> DeleteProductAsync(int id, int modId);
    Task<bool> ReviewProductScanAsync(int id, ReviewProductScanRequest request, int modId);
}

public class VeganProductService : IVeganProductService
{
    private readonly IUnitOfWork _unitOfWork;

    public VeganProductService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<VeganProductScanDto>> GetProductsAsync(string? status = null, string? category = null, string? search = null)
    {
        var query = _unitOfWork.Context.VeganProductScans
            .Include(p => p.SubmittedBy)
            .Include(p => p.ReviewedBy)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(p => p.VeganStatus.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(p => p.Category.ToLower() == category.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.ProductName.ToLower().Contains(s) ||
                                     p.Brand.ToLower().Contains(s) ||
                                     (p.Barcode != null && p.Barcode.Contains(s)) ||
                                     p.IngredientListRaw.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return list.Select(MapToDto).ToList();
    }

    public async Task<ProductScanStatsDto> GetStatsAsync()
    {
        var list = await _unitOfWork.Context.VeganProductScans.ToListAsync();

        return new ProductScanStatsDto
        {
            TotalProducts = list.Count,
            VerifiedVeganCount = list.Count(p => p.VeganStatus == "vegan"),
            VerifiedVegetarianCount = list.Count(p => p.VeganStatus == "vegetarian"),
            FlaggedNonVeganCount = list.Count(p => p.VeganStatus == "non_vegan"),
            PendingReviewCount = list.Count(p => p.VeganStatus == "pending_review"),
            TotalScansRecorded = list.Sum(p => p.ScanCount)
        };
    }

    public async Task<VeganProductScanDto?> GetProductByIdAsync(int id)
    {
        var item = await _unitOfWork.Context.VeganProductScans
            .Include(p => p.SubmittedBy)
            .Include(p => p.ReviewedBy)
            .FirstOrDefaultAsync(p => p.Id == id);

        return item == null ? null : MapToDto(item);
    }

    private static List<string> AutoDetectAnimalAdditives(string rawIngredients)
    {
        var rules = new (string Keyword, string Label)[]
        {
            ("gelatin", "Gelatin (nguồn gốc da/xương động vật)"),
            ("e120", "Carmine E120 (chiết xuất côn trùng)"),
            ("carmine", "Carmine E120 (chiết xuất côn trùng)"),
            ("whey", "Whey / Đạm váng sữa bò"),
            ("casein", "Casein (đạm sữa động vật)"),
            ("lactose", "Lactose (đường sữa động vật)"),
            ("lòng đỏ trứng", "Trứng gia cầm"),
            ("sữa bột", "Sữa bột động vật"),
            ("mật ong", "Mật ong"),
            ("shellac", "Shellac E904"),
            ("mỡ heo", "Mỡ động vật")
        };

        return rules
            .Where(r => rawIngredients.Contains(r.Keyword, StringComparison.OrdinalIgnoreCase))
            .Select(r => r.Label)
            .Distinct()
            .ToList();
    }

    public async Task<VeganProductScanDto> SubmitProductScanAsync(SubmitVeganProductScanRequest request, int userId)
    {
        var detectedFlags = AutoDetectAnimalAdditives(request.IngredientListRaw);

        var item = new VeganProductScan
        {
            ProductName = request.ProductName.Trim(),
            Barcode = string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim(),
            Brand = request.Brand.Trim(),
            Category = request.Category,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            LabelImageUrl = string.IsNullOrWhiteSpace(request.LabelImageUrl) ? null : request.LabelImageUrl.Trim(),
            IngredientListRaw = request.IngredientListRaw.Trim(),
            FlaggedNonVeganIngredients = JsonSerializer.Serialize(detectedFlags),
            VeganStatus = "pending_review",
            ConfidenceScore = detectedFlags.Count > 0 ? 85.0m : 95.0m,
            ModeratorVerdict = null,
            NutritionistNotes = null,
            SubmittedById = userId,
            ReviewedById = null,
            ReviewedAt = null,
            ScanCount = 1,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.VeganProductScans.Add(item);
        await _unitOfWork.CommitAsync();

        return (await GetProductByIdAsync(item.Id))!;
    }

    public async Task<VeganProductScanDto> CreateProductAsync(CreateVeganProductRequest request, int modId)
    {
        var detectedFlags = request.FlaggedNonVeganIngredients != null && request.FlaggedNonVeganIngredients.Count > 0
            ? request.FlaggedNonVeganIngredients
            : AutoDetectAnimalAdditives(request.IngredientListRaw);

        var item = new VeganProductScan
        {
            ProductName = request.ProductName.Trim(),
            Barcode = string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim(),
            Brand = request.Brand.Trim(),
            Category = request.Category,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            LabelImageUrl = string.IsNullOrWhiteSpace(request.LabelImageUrl) ? null : request.LabelImageUrl.Trim(),
            IngredientListRaw = request.IngredientListRaw.Trim(),
            FlaggedNonVeganIngredients = JsonSerializer.Serialize(detectedFlags),
            VeganStatus = request.VeganStatus,
            ConfidenceScore = 98.0m,
            ModeratorVerdict = request.VeganStatus == "vegan" ? "verified_vegan"
                             : request.VeganStatus == "vegetarian" ? "verified_vegetarian"
                             : request.VeganStatus == "non_vegan" ? "rejected_non_vegan" : null,
            NutritionistNotes = request.NutritionistNotes?.Trim(),
            SubmittedById = modId,
            ReviewedById = request.VeganStatus == "pending_review" ? null : modId,
            ReviewedAt = request.VeganStatus == "pending_review" ? null : DateTime.UtcNow,
            ScanCount = 1,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.VeganProductScans.Add(item);
        await _unitOfWork.CommitAsync();

        return (await GetProductByIdAsync(item.Id))!;
    }

    public async Task<VeganProductScanDto?> UpdateProductAsync(int id, UpdateVeganProductRequest request, int modId)
    {
        var item = await _unitOfWork.Context.VeganProductScans.FindAsync(id);
        if (item == null) return null;

        item.ProductName = request.ProductName.Trim();
        item.Barcode = string.IsNullOrWhiteSpace(request.Barcode) ? null : request.Barcode.Trim();
        item.Brand = request.Brand.Trim();
        item.Category = request.Category;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl)) item.ImageUrl = request.ImageUrl.Trim();
        if (!string.IsNullOrWhiteSpace(request.LabelImageUrl)) item.LabelImageUrl = request.LabelImageUrl.Trim();
        item.IngredientListRaw = request.IngredientListRaw.Trim();

        var flags = request.FlaggedNonVeganIngredients ?? AutoDetectAnimalAdditives(request.IngredientListRaw);
        item.FlaggedNonVeganIngredients = JsonSerializer.Serialize(flags);

        item.VeganStatus = request.VeganStatus;
        item.NutritionistNotes = request.NutritionistNotes?.Trim();
        item.ReviewedById = modId;
        item.ReviewedAt = DateTime.UtcNow;

        await _unitOfWork.CommitAsync();
        return (await GetProductByIdAsync(id))!;
    }

    public async Task<bool> DeleteProductAsync(int id, int modId)
    {
        var item = await _unitOfWork.Context.VeganProductScans.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.VeganProductScans.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> ReviewProductScanAsync(int id, ReviewProductScanRequest request, int modId)
    {
        var item = await _unitOfWork.Context.VeganProductScans.FindAsync(id);
        if (item == null) return false;

        item.VeganStatus = request.Verdict is "vegan" or "vegetarian" or "non_vegan" ? request.Verdict : "vegan";
        item.ModeratorVerdict = item.VeganStatus == "vegan" ? "verified_vegan"
                              : item.VeganStatus == "vegetarian" ? "verified_vegetarian" : "rejected_non_vegan";
        item.NutritionistNotes = request.NutritionistNotes?.Trim();
        item.ReviewedById = modId;
        item.ReviewedAt = DateTime.UtcNow;

        if (request.FlaggedIngredients != null)
        {
            item.FlaggedNonVeganIngredients = JsonSerializer.Serialize(request.FlaggedIngredients);
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = "Thẩm định nhãn sản phẩm",
            Target = item.ProductName,
            Details = $"Kết luận: {item.VeganStatus}",
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    private static VeganProductScanDto MapToDto(VeganProductScan p)
    {
        List<string> flaggedList = new();
        if (!string.IsNullOrWhiteSpace(p.FlaggedNonVeganIngredients))
        {
            try
            {
                flaggedList = JsonSerializer.Deserialize<List<string>>(p.FlaggedNonVeganIngredients) ?? new();
            }
            catch
            {
                flaggedList = p.FlaggedNonVeganIngredients.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
            }
        }

        return new VeganProductScanDto
        {
            Id = p.Id,
            ProductName = p.ProductName,
            Barcode = p.Barcode,
            Brand = p.Brand,
            Category = p.Category,
            CategoryLabel = GetCategoryLabel(p.Category),
            ImageUrl = p.ImageUrl,
            LabelImageUrl = p.LabelImageUrl,
            IngredientListRaw = p.IngredientListRaw,
            FlaggedNonVeganIngredients = flaggedList,
            VeganStatus = p.VeganStatus,
            VeganStatusLabel = GetVeganStatusLabel(p.VeganStatus),
            ConfidenceScore = p.ConfidenceScore,
            ModeratorVerdict = p.ModeratorVerdict,
            NutritionistNotes = p.NutritionistNotes,
            SubmittedById = p.SubmittedById ?? 0,
            SubmittedByName = p.SubmittedBy?.DisplayName ?? "Người dùng",
            ReviewedByName = p.ReviewedBy?.DisplayName,
            ReviewedAt = p.ReviewedAt?.ToString("dd/MM/yyyy HH:mm"),
            ScanCount = p.ScanCount,
            CreatedAt = p.CreatedAt.ToString("dd/MM/yyyy HH:mm")
        };
    }

    private static string GetCategoryLabel(string cat) => cat switch
    {
        "beverage" => "Đồ Uống & Sữa Hạt",
        "snack" => "Bánh Kẹo & Ăn Vặt",
        "condiment" => "Gia Vị & Nước Sốt",
        "canned" => "Đồ Hộp & Chế Biến Sẵn",
        "dairy_alt" => "Phô Mai & Bơ Thực Vật",
        "supplement" => "Viên Uống Dinh Dưỡng",
        "noodle" => "Mì & Thực Phẩm Khô",
        _ => "Thực Phẩm Đóng Gói"
    };

    private static string GetVeganStatusLabel(string status) => status switch
    {
        "vegan" => "100% Thuần Chay",
        "vegetarian" => "Chay Có Sữa/Trứng",
        "non_vegan" => "Không Thuần Chay",
        "pending_review" => "Chờ Chuyên Gia Duyệt",
        _ => "Chưa Rõ"
    };
}
