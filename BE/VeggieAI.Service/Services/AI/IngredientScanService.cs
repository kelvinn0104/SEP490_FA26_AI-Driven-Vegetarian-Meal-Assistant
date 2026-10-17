using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

public class ScanPayload
{
    public string ImageType { get; set; } = "unknown";
    public string? DishName { get; set; }
    public string? DishDescription { get; set; }
    public NutrientAmountsDto? EstimatedDishNutrition { get; set; }
    public List<DetectedItemDto> Items { get; set; } = new();
    public bool ConfirmedByUser { get; set; }
}

public static class ScanJson
{
    public static ScanPayload Read(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return new ScanPayload();
        try
        {
            if (json.TrimStart().StartsWith("["))
                return new ScanPayload { ImageType = "ingredients", Items = JsonSerializer.Deserialize<List<DetectedItemDto>>(json, LlmJson.Options) ?? new() };
            return JsonSerializer.Deserialize<ScanPayload>(json, LlmJson.Options) ?? new ScanPayload();
        }
        catch (JsonException) { return new ScanPayload(); }
    }

    public static string Write(ScanPayload p) => JsonSerializer.Serialize(p, LlmJson.Options);
}

public interface IIngredientScanService
{
    Task<ScanResultDto> ScanAsync(int userId, Stream image, string fileName, string contentType, CancellationToken ct = default);
    Task<ScanResultDto> ConfirmAsync(int userId, int scanId, List<int> ingredientIds, CancellationToken ct = default);
    Task<ScanResultDto> GetAsync(int userId, int scanId, CancellationToken ct = default);
    Task<PagedResult<ScanSummaryDto>> GetHistoryAsync(int userId, PageQuery page, CancellationToken ct = default);
}

public class IngredientScanService : IIngredientScanService
{
    private static readonly string[] AllowedTypes = { "image/jpeg", "image/png", "image/webp", "image/heic", "image/heif" };

    private readonly VeggieAIDbContext _db;
    private readonly ILlmClient _llm;
    private readonly IFileStorage _storage;
    private readonly IAiMealPlanner _planner;
    private readonly ILogger<IngredientScanService> _log;

    public IngredientScanService(VeggieAIDbContext db, ILlmClient llm, IFileStorage storage,
        IAiMealPlanner planner, ILogger<IngredientScanService> log)
    {
        _db = db;
        _llm = llm;
        _storage = storage;
        _planner = planner;
        _log = log;
    }

    public async Task<ScanResultDto> ScanAsync(int userId, Stream image, string fileName, string contentType, CancellationToken ct = default)
    {
        contentType = contentType.ToLowerInvariant();
        if (!AllowedTypes.Contains(contentType)) throw new AppException("Chỉ hỗ trợ ảnh JPEG, PNG, WEBP, HEIC.");

        using var ms = new MemoryStream();
        await image.CopyToAsync(ms, ct);
        var bytes = ms.ToArray();
        if (bytes.Length == 0) throw new AppException("File ảnh rỗng.");
        ms.Position = 0;
        var url = await _storage.SaveAsync(ms, fileName, "scans", ct);

        var payload = new ScanPayload();
        string? message = null;
        if (_llm.IsConfigured)
        {
            try
            {
                payload = await RecognizeAsync(userId, bytes, contentType, ct);
            }
            catch (AppException ex) when (ex.StatusCode >= 500)
            {
                message = "Không gọi được AI nhận diện: " + ex.Message;
            }
            catch (JsonException ex)
            {
                _log.LogWarning(ex, "Vision JSON parse failed");
                message = "AI trả về kết quả không đọc được.";
            }
        }
        else
        {
            message = "Chưa cấu hình API key AI (Ai:Gemini:ApiKey).";
        }

        if (payload.Items.Count == 0 && payload.DishName is null)
            message ??= "Không nhận diện được nguyên liệu/món ăn. Hãy chụp lại rõ hơn hoặc chọn nguyên liệu thủ công.";

        var scan = new IngredientScan { UserId = userId, ImageUrl = url, DetectedItems = ScanJson.Write(payload) };
        _db.IngredientScans.Add(scan);
        await _db.SaveChangesAsync(ct);
        return await BuildResultAsync(userId, scan, payload, message, ct);
    }

    public async Task<ScanResultDto> ConfirmAsync(int userId, int scanId, List<int> ingredientIds, CancellationToken ct = default)
    {
        var scan = await _db.IngredientScans.FirstOrDefaultAsync(s => s.Id == scanId && s.UserId == userId, ct)
                   ?? throw AppException.NotFound("Lượt quét");
        var payload = ScanJson.Read(scan.DetectedItems);
        var ids = ingredientIds.Distinct().ToList();
        var ings = await _db.Ingredients.Where(i => ids.Contains(i.Id)).ToDictionaryAsync(i => i.Id, i => i.Name, ct);
        if (ings.Count != ids.Count) throw new AppException("Có mã nguyên liệu không hợp lệ.");

        var old = payload.Items.Where(i => i.IngredientId != null).ToDictionary(i => i.IngredientId!.Value);
        payload.Items = ids.Select(id => old.TryGetValue(id, out var o) ? o
            : new DetectedItemDto { IngredientId = id, Name = ings[id], Confidence = 1, Freshness = "unknown" }).ToList();
        payload.ConfirmedByUser = true;
        if (payload.ImageType == "unknown") payload.ImageType = "ingredients";
        scan.DetectedItems = ScanJson.Write(payload);
        await _db.SaveChangesAsync(ct);
        return await BuildResultAsync(userId, scan, payload, "Đã cập nhật danh sách nguyên liệu.", ct);
    }

    public async Task<ScanResultDto> GetAsync(int userId, int scanId, CancellationToken ct = default)
    {
        var scan = await _db.IngredientScans.AsNoTracking().FirstOrDefaultAsync(s => s.Id == scanId && s.UserId == userId, ct)
                   ?? throw AppException.NotFound("Lượt quét");
        return await BuildResultAsync(userId, scan, ScanJson.Read(scan.DetectedItems), null, ct);
    }

    public async Task<PagedResult<ScanSummaryDto>> GetHistoryAsync(int userId, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.IngredientScans.AsNoTracking().Where(s => s.UserId == userId);
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(s => s.CreatedAt).Skip(page.Skip).Take(page.PageSize).ToListAsync(ct);
        var items = rows.Select(s =>
        {
            var p = ScanJson.Read(s.DetectedItems);
            var names = p.Items.Select(i => i.NameVi ?? i.Name).ToList();
            if (p.DishName is not null) names.Insert(0, p.DishName);
            return new ScanSummaryDto(s.Id, s.ImageUrl, s.CreatedAt, p.Items.Count, names);
        }).ToList();
        return new PagedResult<ScanSummaryDto> { Items = items, Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }

    private async Task<ScanPayload> RecognizeAsync(int userId, byte[] bytes, string mime, CancellationToken ct)
    {
        var catalog = await _db.Ingredients.AsNoTracking().OrderBy(i => i.Name).Select(i => new { i.Id, i.Name }).Take(400).ToListAsync(ct);

        var sb = new StringBuilder();
        sb.AppendLine("Phân tích ảnh (ứng dụng ăn chay VeggieAI). Ảnh có thể là: nguyên liệu/tủ lạnh, một món ăn đã nấu, hoặc cả hai.");
        sb.AppendLine("1) Xác định imageType: \"ingredients\" | \"dish\" | \"mixed\" | \"unknown\" (không phải thực phẩm).");
        sb.AppendLine("2) Nếu là món ăn: dishName (tên món tiếng Việt), dishDescription (1 câu), estimatedNutrition cho 1 phần (kcal, proteinG, carbG, fatG) — ước lượng.");
        sb.AppendLine("3) Liệt kê từng nguyên liệu nhìn thấy (hoặc thành phần chính của món): name (English), nameVi, catalogName, confidence (0-1), " +
                      "freshness (\"fresh\" | \"use_soon\" | \"spoiled\" | \"unknown\" — dựa vào màu sắc, héo, dập, mốc), estimatedQuantityG.");
        sb.AppendLine("   catalogName: chọn ĐÚNG NGUYÊN VĂN 1 tên trong danh mục dưới đây nếu khớp, nếu không có thì null.");
        sb.AppendLine("4) Nếu thấy thịt/cá/trứng/hải sản, vẫn liệt kê nhưng thêm \"isVegetarian\": false.");
        sb.AppendLine("Danh mục nguyên liệu của hệ thống:");
        sb.AppendLine(string.Join("; ", catalog.Select(c => c.Name)));
        sb.AppendLine();
        sb.AppendLine("Trả về JSON: {\"imageType\":\"...\",\"dishName\":null,\"dishDescription\":null," +
                      "\"estimatedNutrition\":null,\"items\":[{\"name\":\"tofu\",\"nameVi\":\"đậu phụ\",\"catalogName\":\"Firm tofu (calcium-set)\"," +
                      "\"confidence\":0.92,\"freshness\":\"fresh\",\"estimatedQuantityG\":200,\"isVegetarian\":true}]}");

        var res = await _llm.GenerateAsync(new LlmRequest
        {
            Task = AiModelTypes.Vision,
            UserId = userId,
            JsonOutput = true,
            Temperature = 0.2,
            MaxOutputTokens = 4096,
            SystemPrompt = "Bạn là hệ thống thị giác máy tính nhận diện thực phẩm. Chỉ mô tả những gì thực sự thấy trong ảnh, không bịa. Trả về JSON hợp lệ.",
            Messages = { LlmMessage.User(sb.ToString()) },
            Images = { new LlmImage(bytes, mime) },
        }, ct);

        var v = LlmJson.Parse<VisionAnswer>(res.Text) ?? new VisionAnswer();
        var byName = catalog.GroupBy(c => c.Name.ToLowerInvariant()).ToDictionary(g => g.Key, g => g.First().Id);
        var payload = new ScanPayload
        {
            ImageType = v.ImageType ?? "unknown",
            DishName = string.IsNullOrWhiteSpace(v.DishName) ? null : v.DishName,
            DishDescription = v.DishDescription,
            EstimatedDishNutrition = v.EstimatedNutrition is null ? null
                : new NutrientAmountsDto(v.EstimatedNutrition.Kcal ?? 0, v.EstimatedNutrition.ProteinG ?? 0, v.EstimatedNutrition.CarbG ?? 0,
                    v.EstimatedNutrition.FatG ?? 0, 0, 0, 0, 0),
        };
        foreach (var it in v.Items ?? new())
        {
            if (string.IsNullOrWhiteSpace(it.Name) && string.IsNullOrWhiteSpace(it.NameVi)) continue;
            int? id = null;
            if (it.CatalogName is not null && byName.TryGetValue(it.CatalogName.ToLowerInvariant(), out var exact)) id = exact;
            else
            {
                var n = (it.Name ?? "").ToLowerInvariant();
                if (n.Length >= 3)
                {
                    var fuzzy = catalog.FirstOrDefault(c => c.Name.ToLowerInvariant().StartsWith(n) || c.Name.ToLowerInvariant().Contains(n));
                    id = fuzzy?.Id;
                }
            }
            payload.Items.Add(new DetectedItemDto
            {
                IngredientId = it.IsVegetarian == false ? null : id,
                Name = it.Name ?? it.NameVi ?? "",
                NameVi = it.NameVi,
                Confidence = Math.Clamp(it.Confidence ?? 0.5, 0, 1),
                Freshness = it.Freshness is "fresh" or "use_soon" or "spoiled" ? it.Freshness : "unknown",
                EstimatedQuantityG = it.EstimatedQuantityG,
            });
        }
        return payload;
    }

    private async Task<ScanResultDto> BuildResultAsync(int userId, IngredientScan scan, ScanPayload p, string? message, CancellationToken ct)
    {
        var usable = p.Items.Where(i => i.IngredientId != null && i.Freshness != "spoiled" && i.Confidence >= 0.4)
            .Select(i => i.IngredientId!.Value).Distinct().ToList();

        var suggestions = await SuggestRecipesByIngredientsAsync(usable, userId, 10, ct);

        var spoiled = p.Items.Where(i => i.Freshness == "spoiled").Select(i => i.NameVi ?? i.Name).ToList();
        if (spoiled.Count > 0)
            message = (message is null ? "" : message + " ") + $"Cảnh báo: {string.Join(", ", spoiled)} có dấu hiệu hỏng — không nên sử dụng.";
        if (p.Items.Any(i => i.IngredientId == null && i.Confidence >= 0.5) && usable.Count == 0 && p.Items.Count > 0)
            message ??= "Các nguyên liệu nhận diện được chưa có trong thư viện của hệ thống.";

        SuggestedMenuDto? menu = null;
        if (usable.Count > 0 || p.DishName is not null)
            menu = await _planner.SuggestDayMenuAsync(userId, usable, p.DishName, ct);

        return new ScanResultDto(scan.Id, scan.ImageUrl, scan.CreatedAt, p.ImageType, p.DishName, p.DishDescription,
            p.EstimatedDishNutrition, p.Items, suggestions, menu, message);
    }

    private async Task<List<RecipeSuggestionDto>> SuggestRecipesByIngredientsAsync(List<int> ingredientIds, int userId, int take, CancellationToken ct)
    {
        if (ingredientIds.Count == 0) return new List<RecipeSuggestionDto>();
        var have = ingredientIds.ToHashSet();

        var bad = await _db.AllergenIngredientIdsAsync(userId, ct);

        var candidates = await _db.Recipes.AsNoTracking()
            .Where(r => r.Status == "published")
            .Where(r => !r.RecipeIngredients.Any(ri => bad.Contains(ri.IngredientId)))
            .Where(r => r.RecipeIngredients.Any(ri => have.Contains(ri.IngredientId)))
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.ImageUrl,
                r.KcalPerServing,
                Ingredients = r.RecipeIngredients.Select(ri => new { ri.IngredientId, ri.Ingredient!.Name }).ToList(),
            })
            .Take(100)
            .ToListAsync(ct);

        var scored = candidates.Select(c =>
        {
            var matched = c.Ingredients.Where(i => have.Contains(i.IngredientId)).ToList();
            var score = 0.7 * matched.Count / Math.Max(1, c.Ingredients.Count) + 0.3 * matched.Count / Math.Max(1, have.Count);
            return new
            {
                c.Id,
                c.Title,
                c.ImageUrl,
                c.KcalPerServing,
                Score = score,
                MatchedNames = matched.Select(m => m.Name).ToList()
            };
        })
        .OrderByDescending(x => x.Score)
        .Take(take)
        .Select(x => new RecipeSuggestionDto(
            x.Id,
            x.Title,
            x.ImageUrl,
            x.KcalPerServing,
            $"Khớp {x.MatchedNames.Count} nguyên liệu: {string.Join(", ", x.MatchedNames.Take(3))}"))
        .ToList();

        return scored;
    }

    private sealed class VisionAnswer
    {
        public string? ImageType { get; set; }
        public string? DishName { get; set; }
        public string? DishDescription { get; set; }
        public VisionNutrition? EstimatedNutrition { get; set; }
        public List<VisionItem>? Items { get; set; }
    }

    private sealed class VisionNutrition
    {
        public decimal? Kcal { get; set; }
        public decimal? ProteinG { get; set; }
        public decimal? CarbG { get; set; }
        public decimal? FatG { get; set; }
    }

    private sealed class VisionItem
    {
        public string? Name { get; set; }
        public string? NameVi { get; set; }
        public string? CatalogName { get; set; }
        public double? Confidence { get; set; }
        public string? Freshness { get; set; }
        public decimal? EstimatedQuantityG { get; set; }
        public bool? IsVegetarian { get; set; }
    }
}
