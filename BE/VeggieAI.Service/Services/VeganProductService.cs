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
    Task<VeganProductScanDto> CreateProductAsync(CreateVeganProductRequest request, int modId);
    Task<VeganProductScanDto?> UpdateProductAsync(int id, UpdateVeganProductRequest request);
    Task<bool> DeleteProductAsync(int id);
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
        await EnsureSeedProductsAsync();

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
        await EnsureSeedProductsAsync();

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
        await EnsureSeedProductsAsync();

        var item = await _unitOfWork.Context.VeganProductScans
            .Include(p => p.SubmittedBy)
            .Include(p => p.ReviewedBy)
            .FirstOrDefaultAsync(p => p.Id == id);

        return item == null ? null : MapToDto(item);
    }

    public async Task<VeganProductScanDto> CreateProductAsync(CreateVeganProductRequest request, int modId)
    {
        var flaggedStr = request.FlaggedNonVeganIngredients != null && request.FlaggedNonVeganIngredients.Count > 0
            ? JsonSerializer.Serialize(request.FlaggedNonVeganIngredients)
            : null;

        var item = new VeganProductScan
        {
            ProductName = request.ProductName.Trim(),
            Barcode = request.Barcode?.Trim(),
            Brand = request.Brand.Trim(),
            Category = request.Category,
            ImageUrl = request.ImageUrl,
            LabelImageUrl = request.LabelImageUrl,
            IngredientListRaw = request.IngredientListRaw.Trim(),
            FlaggedNonVeganIngredients = flaggedStr,
            VeganStatus = request.VeganStatus,
            ConfidenceScore = 98.0m,
            ModeratorVerdict = request.VeganStatus == "vegan" ? "verified_vegan" : request.VeganStatus == "vegetarian" ? "verified_vegetarian" : "rejected_non_vegan",
            NutritionistNotes = request.NutritionistNotes?.Trim(),
            SubmittedById = modId,
            ReviewedById = modId,
            ReviewedAt = DateTime.UtcNow,
            ScanCount = 1,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.VeganProductScans.Add(item);
        await _unitOfWork.CommitAsync();

        return MapToDto(item);
    }

    public async Task<VeganProductScanDto?> UpdateProductAsync(int id, UpdateVeganProductRequest request)
    {
        var item = await _unitOfWork.Context.VeganProductScans.FindAsync(id);
        if (item == null) return null;

        item.ProductName = request.ProductName.Trim();
        item.Barcode = request.Barcode?.Trim();
        item.Brand = request.Brand.Trim();
        item.Category = request.Category;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl)) item.ImageUrl = request.ImageUrl;
        if (!string.IsNullOrWhiteSpace(request.LabelImageUrl)) item.LabelImageUrl = request.LabelImageUrl;
        item.IngredientListRaw = request.IngredientListRaw.Trim();

        if (request.FlaggedNonVeganIngredients != null)
        {
            item.FlaggedNonVeganIngredients = JsonSerializer.Serialize(request.FlaggedNonVeganIngredients);
        }

        item.VeganStatus = request.VeganStatus;
        item.NutritionistNotes = request.NutritionistNotes?.Trim();

        await _unitOfWork.CommitAsync();
        return MapToDto(item);
    }

    public async Task<bool> DeleteProductAsync(int id)
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

        item.VeganStatus = request.Verdict; // vegan, vegetarian, non_vegan
        item.ModeratorVerdict = request.Verdict == "vegan" ? "verified_vegan" : request.Verdict == "vegetarian" ? "verified_vegetarian" : "rejected_non_vegan";
        item.NutritionistNotes = request.NutritionistNotes?.Trim();
        item.ReviewedById = modId;
        item.ReviewedAt = DateTime.UtcNow;

        if (request.FlaggedIngredients != null && request.FlaggedIngredients.Count > 0)
        {
            item.FlaggedNonVeganIngredients = JsonSerializer.Serialize(request.FlaggedIngredients);
        }

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
            SubmittedById = p.SubmittedById,
            SubmittedByName = p.SubmittedBy?.DisplayName ?? "Hội viên quét nhãn",
            ReviewedByName = p.ReviewedBy?.DisplayName ?? (p.ReviewedAt != null ? "Chuyên Gia Dinh Dưỡng" : null),
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

    private async Task EnsureSeedProductsAsync()
    {
        if (await _unitOfWork.Context.VeganProductScans.AnyAsync()) return;

        var seeds = new List<VeganProductScan>
        {
            new()
            {
                ProductName = "Sữa Hạt Hạnh Nhân Không Đường 137 Degrees",
                Barcode = "8858908800123",
                Brand = "137 Degrees",
                Category = "beverage",
                ImageUrl = "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Sữa hạt hạnh nhân tươi 95%, hạt hướng dương 5%, không đường, không chất bảo quản, không đậu nành, không sữa bò.",
                FlaggedNonVeganIngredients = "[]",
                VeganStatus = "vegan",
                ConfidenceScore = 99.5m,
                ModeratorVerdict = "verified_vegan",
                NutritionistNotes = "100% thuần thực vật đạt chuẩn y khoa. Giàu vitamin E, chất béo không bão hòa đơn và canxi tự nhiên từ hạt. Hoàn toàn không có sữa bò ẩn.",
                ScanCount = 284,
                ReviewedAt = DateTime.UtcNow.AddDays(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-5)
            },
            new()
            {
                ProductName = "Bánh Quy Kẹp Kem Oreo Vani Original",
                Barcode = "8934680031024",
                Brand = "Mondelez",
                Category = "snack",
                ImageUrl = "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Bột mì, đường tinh luyện, dầu cọ thực vật, bột ca cao (4.5%), si-rô bắp fructose, bột nở, muối, lecithin đậu nành, hương vani tự nhiên.",
                FlaggedNonVeganIngredients = "[]",
                VeganStatus = "vegan",
                ConfidenceScore = 96.0m,
                ModeratorVerdict = "verified_vegan",
                NutritionistNotes = "Sản phẩm được xác nhận thuần chay ngẫu nhiên (Accidentally Vegan). Không chứa trứng hay sữa bột. Lưu ý người ăn chay vì môi trường cần cân nhắc thành phần dầu cọ.",
                ScanCount = 412,
                ReviewedAt = DateTime.UtcNow.AddDays(-1),
                CreatedAt = DateTime.UtcNow.AddDays(-3)
            },
            new()
            {
                ProductName = "Kẹo Dẻo Trái Cây Gummy Fruity Chews",
                Barcode = "8935220019921",
                Brand = "SweetLand",
                Category = "snack",
                ImageUrl = "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Đường, si-rô glucose, nước ép táo cô đặc (5%), Gelatin (chiết xuất từ da heo), axit citric, phẩm màu Carmine (E120), sáp carnauba chống dính.",
                FlaggedNonVeganIngredients = "[\"Gelatin (chiết xuất da động vật)\", \"Carmine E120 (chiết xuất từ bọ cánh kiến đỏ)\"]",
                VeganStatus = "non_vegan",
                ConfidenceScore = 100.0m,
                ModeratorVerdict = "rejected_non_vegan",
                NutritionistNotes = "CẢNH BÁO: Sản phẩm chứa Gelatin từ da heo làm chất tạo đông và phẩm màu đỏ Carmine E120 chiết xuất từ bọ cánh kiến. Người ăn chay tuyệt đối không sử dụng!",
                ScanCount = 189,
                ReviewedAt = DateTime.UtcNow.AddHours(-10),
                CreatedAt = DateTime.UtcNow.AddHours(-18)
            },
            new()
            {
                ProductName = "Hạt Nêm Chay Nấm Hương & Hạt Sen Knorr",
                Barcode = "8934868110502",
                Brand = "Knorr Unilever",
                Category = "condiment",
                ImageUrl = "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Muối i-ốt, chất điều vị (mononatri L-glutamat, dinatri 5-ribonucleotid), đường, bột sắn, bột nấm hương 3%, bột hạt sen 1.5%, chiết xuất nấm men, dầu cọ.",
                FlaggedNonVeganIngredients = "[]",
                VeganStatus = "vegan",
                ConfidenceScore = 98.2m,
                ModeratorVerdict = "verified_vegan",
                NutritionistNotes = "Sản phẩm 100% nguyên liệu thực vật và nấm. Chiết xuất nấm men tự nhiên an toàn cho người ăn chay trường.",
                ScanCount = 520,
                ReviewedAt = DateTime.UtcNow.AddDays(-3),
                CreatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new()
            {
                ProductName = "Sốt Salad Mè Rang Roasted Sesame Dressing",
                Barcode = "8935001123498",
                Brand = "Kewpie",
                Category = "condiment",
                ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Dầu đậu nành, nước, đường, nước tương đậu nành, mè rang (5%), giấm, lòng đỏ trứng gà, muối, bột ngọt, hương mè tự nhiên.",
                FlaggedNonVeganIngredients = "[\"Lòng đỏ trứng gà\"]",
                VeganStatus = "vegetarian",
                ConfidenceScore = 99.0m,
                ModeratorVerdict = "verified_vegetarian",
                NutritionistNotes = "Sản phẩm chứa lòng đỏ trứng gà. Thích hợp cho người ăn chay có trứng (Ovo-vegetarian), KHÔNG phù hợp cho người ăn thuần chay (Strict Vegan).",
                ScanCount = 230,
                ReviewedAt = DateTime.UtcNow.AddDays(-2),
                CreatedAt = DateTime.UtcNow.AddDays(-4)
            },
            new()
            {
                ProductName = "Mì Ramen Miso Chay Thuần Thực Vật Nongshim",
                Barcode = "8801043058211",
                Brand = "Nongshim",
                Category = "noodle",
                ImageUrl = "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Vắt mì: Bột mì, tinh bột khoai tây, dầu cọ, muối. Gói súp: Bột tương miso đậu nành lên men, nấm đông cô sấy, hành boa-rô, gia vị hương bò chay (tự nhiên).",
                FlaggedNonVeganIngredients = "[\"Gia vị hương bò chay (Cần thẩm định nguồn gốc chiết xuất)\"]",
                VeganStatus = "pending_review",
                ConfidenceScore = 82.5m,
                ModeratorVerdict = null,
                NutritionistNotes = "Hội viên quét nhãn tại Circle K. Cần chuyên gia dinh dưỡng liên hệ xác minh gói hương bò chay là hương liệu hóa học tổng hợp từ thực vật hay có enzyme động vật.",
                ScanCount = 37,
                ReviewedAt = null,
                CreatedAt = DateTime.UtcNow.AddHours(-2)
            },
            new()
            {
                ProductName = "Thạch Rau Câu Trái Cây Tự Nhiên Orihiro Konjac",
                Barcode = "4571157256740",
                Brand = "Orihiro Japan",
                Category = "snack",
                ImageUrl = "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
                LabelImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
                IngredientListRaw = "Đường si-rô fructose, nước ép nho tím, bột củ nưa konjac, chất làm dày polysaccharide thực vật, chất điều chỉnh độ axit, hương nho tổng hợp.",
                FlaggedNonVeganIngredients = "[]",
                VeganStatus = "pending_review",
                ConfidenceScore = 89.0m,
                ModeratorVerdict = null,
                NutritionistNotes = "Sản phẩm dùng bột củ nưa Konjac thay cho Gelatin động vật. Chờ Mod duyệt xác thực để gắn huy hiệu Thuần Chay chính thức.",
                ScanCount = 45,
                ReviewedAt = null,
                CreatedAt = DateTime.UtcNow.AddHours(-4)
            }
        };

        _unitOfWork.Context.VeganProductScans.AddRange(seeds);
        await _unitOfWork.CommitAsync();
    }
}

