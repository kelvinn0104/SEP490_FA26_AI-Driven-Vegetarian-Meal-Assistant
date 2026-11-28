using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IModerationService
{
    Task<List<ModerationItemDto>> GetPendingItemsAsync(string? type = null);
    Task<List<ModerationItemDto>> GetModerationHistoryAsync(int limit = 30);
    Task<bool> ModerateAsync(string id, ModerationActionRequest request, int reviewerId);
    Task<int> GetPendingCountAsync();
}

public class ModerationService : IModerationService
{
    private readonly IUnitOfWork _unitOfWork;

    public ModerationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<ModerationItemDto>> GetPendingItemsAsync(string? type = null)
    {
        var posts = await _unitOfWork.Moderation.GetPendingModerationPostsAsync(type);
        var result = posts.Select(MapPostToModerationDto).ToList();

        // Also include standalone Recipes in 'pending_verification' status that do not have a pending Post yet
        var normalizedType = (type ?? "all").Trim().ToLowerInvariant();
        if (normalizedType is "all" or "" or "recipe")
        {
            var pendingPostRecipeIds = posts
                .Where(p => p.RecipeId.HasValue)
                .Select(p => p.RecipeId!.Value)
                .ToHashSet();

            var unlinkedRecipes = await _unitOfWork.Context.Recipes
                .Include(r => r.Creator)
                .Include(r => r.Category)
                .Where(r => r.Status == "pending_verification" && !pendingPostRecipeIds.Contains(r.Id))
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            foreach (var r in unlinkedRecipes)
            {
                result.Add(new ModerationItemDto
                {
                    Id = $"r{r.Id}",
                    Title = r.Title,
                    Author = r.Creator?.DisplayName ?? "Người dùng",
                    AuthorAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(r.Creator?.DisplayName ?? "User")}&background=006948&color=ffffff",
                    Category = r.Category?.Name ?? "Công thức món chay",
                    SubmittedAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
                    Type = "recipe",
                    Status = "pending",
                    AiScore = 95,
                    NutritionalScore = 90,
                    PlantBasedScore = 100,
                    Calories = (int)Math.Round(r.KcalPerServing),
                    Protein = $"{r.ProteinG}g",
                    Carbs = $"{r.CarbG}g",
                    Fat = $"{r.FatG}g",
                    Content = r.Instructions,
                    MediaUrl = r.ImageUrl
                });
            }
        }

        return result;
    }

    public async Task<List<ModerationItemDto>> GetModerationHistoryAsync(int limit = 30)
    {
        var logs = await _unitOfWork.Context.ModerationLogs
            .Include(l => l.Post)
                .ThenInclude(p => p!.User)
            .Include(l => l.Post)
                .ThenInclude(p => p!.Recipe)
                    .ThenInclude(r => r!.Category)
            .Include(l => l.Reviewer)
            .Where(l => l.Decision != "pending")
            .OrderByDescending(l => l.ReviewedAt)
            .Take(limit)
            .ToListAsync();

        return logs.Where(l => l.Post != null).Select(l =>
        {
            var dto = MapPostToModerationDto(l.Post!);
            dto.Decision = l.Decision;
            dto.FlagReason = l.Reason;
            dto.ReviewedBy = l.Reviewer?.DisplayName ?? "Điều phối viên (Mod)";
            dto.ReviewedAt = l.ReviewedAt.ToString("yyyy-MM-dd HH:mm");
            return dto;
        }).ToList();
    }

    private static ModerationItemDto MapPostToModerationDto(Post p)
    {
        var log = p.ModerationLogs.OrderByDescending(l => l.ReviewedAt).FirstOrDefault();
        return new ModerationItemDto
        {
            Id = $"mod-{p.Id}",
            Title = p.Title,
            Author = p.User?.DisplayName ?? "Người dùng",
            AuthorAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(p.User?.DisplayName ?? "User")}&background=006948&color=ffffff",
            Category = p.Recipe?.Category?.Name ?? (p.PostType == "video" ? "Video Thực dưỡng" : "Bài viết Cộng đồng"),
            SubmittedAt = p.CreatedAt.ToString("yyyy-MM-dd HH:mm"),
            Type = p.PostType == "video" ? "video" : "recipe",
            Status = p.Status,
            AiScore = (int)((log?.AiConfidence ?? 0.90m) * 100),
            NutritionalScore = log?.RiskLevel == "high" ? 0 : 90,
            PlantBasedScore = log?.RiskLevel == "high" ? 0 : 100,
            FlagReason = log?.Reason,
            Calories = (int)(p.Recipe?.KcalPerServing ?? 0),
            Protein = p.Recipe != null ? $"{p.Recipe.ProteinG}g" : "0g",
            Carbs = p.Recipe != null ? $"{p.Recipe.CarbG}g" : "0g",
            Fat = p.Recipe != null ? $"{p.Recipe.FatG}g" : "0g",
            Content = p.Content,
            MediaUrl = p.MediaUrl,
            Decision = log?.Decision
        };
    }

    public async Task<bool> ModerateAsync(string id, ModerationActionRequest request, int reviewerId)
    {
        var decision = request.Decision.Trim().ToLowerInvariant();
        var logDecision = decision is "approved" or "rejected" ? decision : "pending";
        var reasonText = request.Reason ?? (decision == "approved"
            ? "Nội dung đạt chuẩn thuần chay và dinh dưỡng."
            : "Cần rà soát hoặc vi phạm tiêu chuẩn.");

        // Support moderating standalone Recipes ('r{id}' or 'rec-{id}') as well as Posts ('mod-{id}' or '{id}')
        var recipeId = ParseRecipeModerationId(id);
        if (recipeId > 0)
        {
            var recipe = await _unitOfWork.Context.Recipes
                .FirstOrDefaultAsync(r => r.Id == recipeId);
            if (recipe == null) return false;

            recipe.Status = decision == "approved"
                ? "published"
                : (decision == "rejected" ? "hidden" : "draft");
            if (decision == "approved")
            {
                recipe.VerifiedBy = reviewerId;
                recipe.VerifiedAt = DateTime.UtcNow;
            }
            recipe.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Recipes.Update(recipe);

            var linkedPost = await _unitOfWork.Context.Posts
                .FirstOrDefaultAsync(p => p.RecipeId == recipe.Id);
            if (linkedPost == null)
            {
                linkedPost = new Post
                {
                    UserId = recipe.CreatedBy,
                    RecipeId = recipe.Id,
                    PostType = "blog",
                    Title = recipe.Title,
                    Content = recipe.Instructions,
                    MediaUrl = recipe.ImageUrl,
                    Status = decision == "approved" ? "published" : (decision == "rejected" ? "removed" : "flagged"),
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Context.Posts.AddAsync(linkedPost);
                await _unitOfWork.CommitAsync();
            }
            else
            {
                linkedPost.Status = decision == "approved" ? "published" : (decision == "rejected" ? "removed" : "flagged");
            }

            await _unitOfWork.Moderation.AddModerationLogAsync(new ModerationLog
            {
                PostId = linkedPost.Id,
                ReviewedBy = reviewerId,
                Decision = logDecision,
                RiskLevel = decision == "rejected" ? "high" : "low",
                Reason = reasonText,
                ReviewedAt = DateTime.UtcNow
            });

            await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
            {
                UserId = reviewerId,
                Action = decision == "approved" ? "Phê duyệt công thức" : (decision == "rejected" ? "Từ chối công thức" : "Yêu cầu chỉnh sửa công thức"),
                Target = recipe.Title,
                Details = reasonText,
                LogType = "moderation"
            });

            await _unitOfWork.CommitAsync();
            return true;
        }

        var postId = ParseId(id);
        var post = await _unitOfWork.Moderation.GetPostByIdAsync(postId);
        if (post == null) return false;

        post.Status = decision switch
        {
            "approved" => "published",
            "rejected" => "removed",
            "revision" => "flagged",
            _ => "pending"
        };

        var log = new ModerationLog
        {
            PostId = post.Id,
            ReviewedBy = reviewerId,
            Decision = logDecision,
            RiskLevel = decision == "rejected" ? "high" : "low",
            Reason = reasonText,
            ReviewedAt = DateTime.UtcNow
        };
        await _unitOfWork.Moderation.AddModerationLogAsync(log);

        if (post.Recipe != null)
        {
            post.Recipe.Status = decision == "approved" ? "published" : (decision == "rejected" ? "hidden" : "pending_verification");
            if (decision == "approved")
            {
                post.Recipe.VerifiedBy = reviewerId;
                post.Recipe.VerifiedAt = DateTime.UtcNow;
            }
            _unitOfWork.Recipes.Update(post.Recipe);
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = reviewerId,
            Action = decision == "approved" ? "Phê duyệt nội dung" : (decision == "rejected" ? "Từ chối nội dung" : "Yêu cầu chỉnh sửa"),
            Target = post.Title,
            Details = log.Reason,
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<int> GetPendingCountAsync()
    {
        var pendingPosts = await _unitOfWork.Context.Posts
            .Where(p => p.Status == "pending")
            .Select(p => p.RecipeId)
            .ToListAsync();

        var linkedRecipeIds = pendingPosts.Where(id => id.HasValue).Select(id => id!.Value).ToHashSet();
        var unlinkedRecipesCount = await _unitOfWork.Context.Recipes
            .CountAsync(r => r.Status == "pending_verification" && !linkedRecipeIds.Contains(r.Id));

        return pendingPosts.Count + unlinkedRecipesCount;
    }

    private static int ParseRecipeModerationId(string id)
    {
        if (id.StartsWith("rec-", StringComparison.OrdinalIgnoreCase) && int.TryParse(id[4..], out var recNum))
        {
            return recNum;
        }
        if (id.StartsWith("r", StringComparison.OrdinalIgnoreCase) && !id.StartsWith("rep", StringComparison.OrdinalIgnoreCase) && int.TryParse(id[1..], out var rNum))
        {
            return rNum;
        }
        return 0;
    }

    private static int ParseId(string id)
    {
        if (int.TryParse(id, out var num)) return num;
        if (id.StartsWith("mod-", StringComparison.OrdinalIgnoreCase) && int.TryParse(id[4..], out var parsed))
        {
            return parsed;
        }
        return 0;
    }
}

public interface IAiService
{
    Task<List<AiModelDto>> GetModelsAsync();
    Task<List<AiTelemetryLogDto>> GetTelemetryLogsAsync(int limit = 30);
    Task<NutritionAnalysisResponse> ParseNutritionAsync(string recipeText, int? userId = null);
    Task<bool> UpdateModelStatusAsync(int id, string status, int adminId);
}

public class AiService : IAiService
{
    private static readonly HttpClient SharedHttpClient = new();
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _config;

    public AiService(IUnitOfWork unitOfWork, IConfiguration config)
    {
        _unitOfWork = unitOfWork;
        _config = config;
    }

    public async Task<List<AiModelDto>> GetModelsAsync()
    {
        var models = (await _unitOfWork.AiModels.GetAllAsync()).ToList();
        var logStats = await _unitOfWork.Context.AiModelLogs
            .GroupBy(l => l.ModelId)
            .Select(g => new
            {
                ModelId = g.Key,
                TotalCalls = g.Count(),
                AvgLatency = g.Average(x => (double)(x.LatencyMs ?? 0)),
                SuccessCount = g.Count(x => x.IsSuccess)
            })
            .ToDictionaryAsync(x => x.ModelId);

        return models.Select(m =>
        {
            var hasLogs = logStats.TryGetValue(m.Id, out var stat);
            var totalCalls = hasLogs ? stat!.TotalCalls : 0;
            var accuracy = hasLogs && totalCalls > 0
                ? Math.Round((decimal)stat!.SuccessCount / totalCalls * 100m, 1)
                : 0m;
            var avgLatency = hasLogs ? (int)Math.Round(stat!.AvgLatency) : 0;

            return new AiModelDto
            {
                Id = m.Id,
                Name = m.Name,
                Type = m.Type,
                Provider = m.Provider,
                Version = m.Version,
                Status = m.Status,
                Accuracy = accuracy,
                AvgLatencyMs = avgLatency,
                TotalCalls = totalCalls
            };
        }).ToList();
    }

    public async Task<List<AiTelemetryLogDto>> GetTelemetryLogsAsync(int limit = 30)
    {
        var logs = await _unitOfWork.AiModels.GetRecentLogsAsync(limit);
        return logs.Select(l => new AiTelemetryLogDto
        {
            Id = $"log-{l.Id}",
            Timestamp = l.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            Tag = l.MetricName ?? l.Model?.Type?.ToUpperInvariant() ?? "AI_CALL",
            Message = l.IsSuccess
                ? $"{l.Model?.Name ?? "Model"}: xử lý thành công ({l.LatencyMs ?? 0}ms, {l.TokensUsed ?? 0} tokens)"
                : $"Lỗi AI: {l.ErrorMessage ?? "Không xác định"}",
            LatencyMs = l.LatencyMs ?? 0,
            Type = l.IsSuccess ? "success" : "error"
        }).ToList();
    }

    public async Task<NutritionAnalysisResponse> ParseNutritionAsync(string recipeText, int? userId = null)
    {
        if (string.IsNullOrWhiteSpace(recipeText))
        {
            throw new ArgumentException("Vui lòng nhập nguyên liệu và định lượng cần phân tích.");
        }

        var sw = Stopwatch.StartNew();
        var activeModel = await _unitOfWork.Context.AiModels.FirstOrDefaultAsync(m => m.Status == "active")
                          ?? await _unitOfWork.Context.AiModels.FirstOrDefaultAsync();

        // 1. Check if non-vegan keywords appear
        var nonVeganKeywords = new[] { "thịt", "cá", "tôm", "gà", "bò", "heo", "lợn", "gelatin", "mỡ heo", "nước mắm cá" };
        var foundNonVegan = nonVeganKeywords.Where(k => recipeText.Contains(k, StringComparison.OrdinalIgnoreCase)).ToList();

        // 2. If Gemini API Key is configured in Backend config, call Gemini REST API securely from Backend
        var geminiApiKey = _config["Ai:GeminiApiKey"];
        if (!string.IsNullOrWhiteSpace(geminiApiKey))
        {
            try
            {
                var geminiModel = _config["Ai:GeminiModel"] ?? "gemini-2.0-flash";
                var timeoutSec = int.TryParse(_config["Ai:TimeoutSeconds"], out var parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15;
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(timeoutSec));

                var prompt = $"Phân tích dinh dưỡng thuần chay cho khẩu phần sau và trả về JSON thuần (calories:int, protein:string, carbs:string, fat:string, b12Percent:string, ironPercent:string, veganPurity:string, allergenAlert:string): {recipeText}";
                var url = $"https://generativelanguage.googleapis.com/v1beta/models/{geminiModel}:generateContent?key={geminiApiKey}";
                var httpResp = await SharedHttpClient.PostAsJsonAsync(url, new
                {
                    contents = new[] { new { parts = new[] { new { text = prompt } } } }
                }, cts.Token);

                if (httpResp.IsSuccessStatusCode)
                {
                    var rawJson = await httpResp.Content.ReadAsStringAsync();
                    sw.Stop();
                    if (activeModel != null)
                    {
                        await _unitOfWork.Context.AiModelLogs.AddAsync(new AiModelLog
                        {
                            ModelId = activeModel.Id,
                            UserId = userId,
                            LatencyMs = (int)sw.ElapsedMilliseconds,
                            TokensUsed = recipeText.Length / 3 + 120,
                            IsSuccess = true,
                            MetricName = "GEMINI_NUTRITION"
                        });
                        await _unitOfWork.CommitAsync();
                    }

                    using var doc = JsonDocument.Parse(rawJson);
                    var textOut = doc.RootElement
                        .GetProperty("candidates")[0]
                        .GetProperty("content")
                        .GetProperty("parts")[0]
                        .GetProperty("text")
                        .GetString() ?? "";

                    var cleanJson = textOut.Replace("```json", "").Replace("```", "").Trim();
                    var parsed = JsonSerializer.Deserialize<NutritionAnalysisResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (parsed != null)
                    {
                        parsed.Analyzed = true;
                        parsed.Source = "gemini";
                        return parsed;
                    }
                }
            }
            catch (Exception ex)
            {
                sw.Stop();
                if (activeModel != null)
                {
                    await _unitOfWork.Context.AiModelLogs.AddAsync(new AiModelLog
                    {
                        ModelId = activeModel.Id,
                        UserId = userId,
                        LatencyMs = (int)sw.ElapsedMilliseconds,
                        IsSuccess = false,
                        ErrorMessage = ex.Message,
                        MetricName = "GEMINI_ERROR"
                    });
                    await _unitOfWork.CommitAsync();
                }
            }
        }

        // 3. Real PostgreSQL Ingredient Database Calculation
        var dbIngredients = await _unitOfWork.Context.Ingredients
            .Include(i => i.IngredientAllergies)
                .ThenInclude(ia => ia.Allergy)
            .ToListAsync();

        var matchedNames = new List<string>();
        var detectedAllergens = new HashSet<string>();
        decimal totalKcal = 0, totalProtein = 0, totalCarb = 0, totalFat = 0, totalIron = 0, totalB12 = 0;

        foreach (var ing in dbIngredients)
        {
            // Match full name or primary Vietnamese/English keyword before '('
            var baseKeyword = ing.Name.Split('(')[0].Trim();
            if (baseKeyword.Length >= 3 && recipeText.Contains(baseKeyword, StringComparison.OrdinalIgnoreCase))
            {
                // Extract quantity in grams near keyword if provided, default 100g
                decimal grams = 100m;
                var qtyMatch = Regex.Match(recipeText, $@"(\d+)\s*g\s+{Regex.Escape(baseKeyword)}", RegexOptions.IgnoreCase);
                if (qtyMatch.Success && decimal.TryParse(qtyMatch.Groups[1].Value, out var parsedG) && parsedG > 0)
                {
                    grams = parsedG;
                }

                var factor = grams / 100m;
                totalKcal += ing.KcalPer100g * factor;
                totalProtein += ing.ProteinPer100g * factor;
                totalCarb += ing.CarbPer100g * factor;
                totalFat += ing.FatPer100g * factor;
                totalIron += ing.IronPer100g * factor;
                totalB12 += ing.B12Per100g * factor;
                matchedNames.Add($"{ing.Name} ({grams}g)");

                foreach (var ia in ing.IngredientAllergies)
                {
                    if (!string.IsNullOrWhiteSpace(ia.Allergy?.Name))
                    {
                        detectedAllergens.Add(ia.Allergy.Name);
                    }
                }
            }
        }

        sw.Stop();
        if (activeModel != null)
        {
            await _unitOfWork.Context.AiModelLogs.AddAsync(new AiModelLog
            {
                ModelId = activeModel.Id,
                UserId = userId,
                LatencyMs = Math.Max(5, (int)sw.ElapsedMilliseconds),
                TokensUsed = recipeText.Length / 4,
                IsSuccess = matchedNames.Count > 0,
                ErrorMessage = matchedNames.Count == 0 ? "Không khớp nguyên liệu nào trong cơ sở dữ liệu." : null,
                MetricName = "DB_NUTRITION_MATCH"
            });
            await _unitOfWork.CommitAsync();
        }

        if (matchedNames.Count == 0)
        {
            return new NutritionAnalysisResponse
            {
                Analyzed = false,
                Source = "database",
                Calories = 0,
                Protein = "0g",
                Carbs = "0g",
                Fat = "0g",
                B12Percent = "Chưa xác định",
                IronPercent = "Chưa xác định",
                AbsorptionRating = "Chưa đủ dữ liệu phân tích",
                VeganPurity = foundNonVegan.Count > 0
                    ? $"CẢNH BÁO: Phát hiện từ khóa động vật ({string.Join(", ", foundNonVegan)})"
                    : "Chưa đối chiếu được nguyên liệu trong thư viện",
                AllergenAlert = "Chưa nhận diện được nguyên liệu khớp với Thư viện Vi chất. Vui lòng nhập tên nguyên liệu có trong hệ thống hoặc cấu hình Ai:GeminiApiKey."
            };
        }

        var b12Rdi = Math.Round(totalB12 / 2.4m * 100m, 1);
        var ironRdi = Math.Round(totalIron / 18m * 100m, 1);

        return new NutritionAnalysisResponse
        {
            Analyzed = true,
            Source = "database",
            Calories = (int)Math.Round(totalKcal),
            Protein = $"{Math.Round(totalProtein, 1)}g",
            Carbs = $"{Math.Round(totalCarb, 1)}g",
            Fat = $"{Math.Round(totalFat, 1)}g",
            B12Percent = $"{Math.Round(totalB12, 2)} mcg ({b12Rdi}% RDI)",
            IronPercent = $"{Math.Round(totalIron, 2)} mg ({ironRdi}% RDI)",
            AbsorptionRating = recipeText.Contains("chanh", StringComparison.OrdinalIgnoreCase) || recipeText.Contains("ớt chuông", StringComparison.OrdinalIgnoreCase)
                ? "Tối ưu (Có Vitamin C hỗ trợ hấp thu sắt non-heme)"
                : "Tiêu chuẩn (Khuyến nghị thêm nguồn Vitamin C)",
            VeganPurity = foundNonVegan.Count > 0
                ? $"Không thuần chay - Phát hiện: {string.Join(", ", foundNonVegan)}"
                : "100% Thuần thực vật (Đối chiếu Thư viện Vi chất)",
            AllergenAlert = detectedAllergens.Count > 0
                ? $"Cảnh báo dị ứng: {string.Join(", ", detectedAllergens)}"
                : "Không phát hiện dị nguyên trong danh sách đối chiếu",
            MatchedIngredients = matchedNames
        };
    }

    public async Task<bool> UpdateModelStatusAsync(int id, string status, int adminId)
    {
        var normalized = status.Trim().ToLowerInvariant();
        if (normalized is not ("active" or "inactive" or "retraining"))
        {
            throw new ArgumentException("Trạng thái mô hình chỉ chấp nhận 'active', 'inactive' hoặc 'retraining'.");
        }

        var model = await _unitOfWork.AiModels.GetByIdAsync(id);
        if (model == null) return false;

        model.Status = normalized;
        model.UpdatedBy = adminId;
        model.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.AiModels.Update(model);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = adminId,
            Action = "Cập nhật trạng thái AI Model",
            Target = model.Name,
            Details = $"Chuyển trạng thái '{model.Name}' sang {normalized}",
            LogType = "system"
        });

        await _unitOfWork.CommitAsync();
        return true;
    }
}

public interface IDashboardService
{
    Task<DashboardOverviewDto> GetOverviewStatsAsync();
    Task<List<DietDistributionItemDto>> GetDietDistributionAsync();
    Task<List<WeeklyChartDayDto>> GetWeeklyChartDataAsync(int days = 7);
    Task<List<ActivityItemDto>> GetRecentActivitiesAsync();
}

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardOverviewDto> GetOverviewStatsAsync()
    {
        var now = DateTime.UtcNow;
        var thirtyDaysAgo = now.AddDays(-30);
        var sixtyDaysAgo = now.AddDays(-60);

        var totalUsers = await _unitOfWork.Context.Users.CountAsync();
        var totalMods = await _unitOfWork.Context.Users.CountAsync(u => u.Role == RoleConstants.Mod);
        var totalRoles = await _unitOfWork.Context.Roles.CountAsync();
        var usersLast30 = await _unitOfWork.Context.Users.CountAsync(u => u.CreatedAt >= thirtyDaysAgo);
        var usersPrev30 = await _unitOfWork.Context.Users.CountAsync(u => u.CreatedAt >= sixtyDaysAgo && u.CreatedAt < thirtyDaysAgo);
        var userGrowth = usersPrev30 > 0
            ? Math.Round((decimal)(usersLast30 - usersPrev30) / usersPrev30 * 100m, 1)
            : (totalUsers > 0 ? Math.Round((decimal)usersLast30 / totalUsers * 100m, 1) : 0m);

        var totalRecipes = await _unitOfWork.Context.Recipes.CountAsync();
        var totalCategories = await _unitOfWork.Context.Categories.CountAsync();
        var totalIngredients = await _unitOfWork.Context.Ingredients.CountAsync();
        var blogsCount = await _unitOfWork.Context.Posts.CountAsync(p => p.PostType == "blog");
        var videosCount = await _unitOfWork.Context.Posts.CountAsync(p => p.PostType == "video");
        var pendingCount = await _unitOfWork.Context.Posts.CountAsync(p => p.Status == "pending");
        var openFeedbacks = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "open");
        var activeChallenges = await _unitOfWork.Context.VeganChallenges.CountAsync(c => c.Status == "active");
        var pendingScans = await _unitOfWork.Context.VeganProductScans.CountAsync(s => s.VeganStatus == "pending_review");

        var totalAiQueries = await _unitOfWork.Context.AiModelLogs.CountAsync();
        var failedAiQueries = await _unitOfWork.Context.AiModelLogs.CountAsync(l => !l.IsSuccess);
        var aiAccuracy = totalAiQueries > 0
            ? $"{Math.Round((decimal)(totalAiQueries - failedAiQueries) / totalAiQueries * 100m, 1)}%"
            : "Chưa có dữ liệu";

        return new DashboardOverviewDto
        {
            TotalUsers = totalUsers,
            TotalMods = totalMods,
            TotalRoles = totalRoles,
            UserGrowth = userGrowth,
            TotalRecipes = totalRecipes,
            TotalCategories = totalCategories,
            TotalIngredients = totalIngredients,
            TotalBlogs = blogsCount,
            BlogGrowth = totalRecipes > 0 ? Math.Round((decimal)blogsCount / Math.Max(1, totalRecipes) * 10m, 1) : 0m,
            TotalVideos = videosCount,
            VideoGrowth = totalRecipes > 0 ? Math.Round((decimal)videosCount / Math.Max(1, totalRecipes) * 10m, 1) : 0m,
            PendingModeration = pendingCount,
            OpenFeedbacks = openFeedbacks,
            ActiveChallenges = activeChallenges,
            PendingProductScans = pendingScans,
            TotalAiQueries = totalAiQueries,
            SystemErrorsCount = failedAiQueries,
            AiAccuracy = aiAccuracy
        };
    }

    public async Task<List<DietDistributionItemDto>> GetDietDistributionAsync()
    {
        var profiles = await _unitOfWork.Context.HealthProfiles.ToListAsync();
        var total = profiles.Count;
        if (total == 0)
        {
            return new List<DietDistributionItemDto>();
        }

        var veganCount = profiles.Count(p => p.HealthGoal == "loss");
        var lactoCount = profiles.Count(p => p.HealthGoal == "gain");
        var flexiCount = total - veganCount - lactoCount;

        var veganPercent = Math.Round((decimal)veganCount / total * 100m, 1);
        var lactoPercent = Math.Round((decimal)lactoCount / total * 100m, 1);
        var flexiPercent = Math.Round((decimal)flexiCount / total * 100m, 1);

        return new List<DietDistributionItemDto>
        {
            new() { Name = "Thuần chay giảm cân (Vegan)", Type = "vegan", Count = veganCount, Percent = veganPercent, Color = "#006948", Subtext = $"{veganCount:N0} hồ sơ ({veganPercent}%)" },
            new() { Name = "Tăng cơ thực vật (Plant Gain)", Type = "lacto-ovo", Count = lactoCount, Percent = lactoPercent, Color = "#336b53", Subtext = $"{lactoCount:N0} hồ sơ ({lactoPercent}%)" },
            new() { Name = "Duy trì cân bằng (Maintain)", Type = "flexitarian", Count = flexiCount, Percent = flexiPercent, Color = "#556447", Subtext = $"{flexiCount:N0} hồ sơ ({flexiPercent}%)" }
        };
    }

    public async Task<List<WeeklyChartDayDto>> GetWeeklyChartDataAsync(int days = 7)
    {
        var countDays = Math.Clamp(days, 1, 30);
        var startUtc = DateTime.UtcNow.Date.AddDays(-(countDays - 1));
        var startDateOnly = DateOnly.FromDateTime(startUtc);

        var users = await _unitOfWork.Context.Users.Where(u => u.CreatedAt >= startUtc).ToListAsync();
        var recipes = await _unitOfWork.Context.Recipes.Where(r => r.CreatedAt >= startUtc).ToListAsync();
        var aiLogs = await _unitOfWork.Context.AiModelLogs.Where(l => l.CreatedAt >= startUtc).ToListAsync();
        var mealLogs = await _unitOfWork.Context.MealLogs.Where(m => m.LogDate >= startDateOnly).ToListAsync();

        var dayNames = new[] { "CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7" };
        var rawItems = new List<WeeklyChartDayDto>();

        for (int i = 0; i < countDays; i++)
        {
            var date = startUtc.AddDays(i);
            var dateOnly = DateOnly.FromDateTime(date);
            var newUsers = users.Count(u => u.CreatedAt.Date == date);
            var newRecipes = recipes.Count(r => r.CreatedAt.Date == date);
            var queries = aiLogs.Count(l => l.CreatedAt.Date == date);
            var activeMealUsers = mealLogs.Where(m => m.LogDate == dateOnly).Select(m => m.UserId).Distinct().Count();

            rawItems.Add(new WeeklyChartDayDto
            {
                Day = $"{dayNames[(int)date.DayOfWeek]} ({date:dd/MM})",
                Date = date.ToString("yyyy-MM-dd"),
                Recipes = newRecipes,
                Queries = queries,
                Users = newUsers + activeMealUsers,
                NewUsers = newUsers,
                ActiveUsers = activeMealUsers
            });
        }

        var maxVal = Math.Max(1, rawItems.Max(x => Math.Max(x.ActiveUsers + x.NewUsers, x.Recipes + x.Queries)));
        foreach (var item in rawItems)
        {
            var activityScore = item.ActiveUsers + item.NewUsers + item.Recipes + item.Queries;
            item.Height = Math.Clamp((int)Math.Round((double)activityScore / maxVal * 180.0), 12, 200);
            item.Y = 220 - item.Height;
            item.IsPeak = activityScore == maxVal && activityScore > 0;
        }

        return rawItems;
    }

    public async Task<List<ActivityItemDto>> GetRecentActivitiesAsync()
    {
        var logs = await _unitOfWork.Context.SystemLogs
            .Include(l => l.User)
            .OrderByDescending(l => l.CreatedAt)
            .Take(10)
            .ToListAsync();

        return logs.Select(l =>
        {
            var type = l.LogType switch
            {
                "user_management" => "Tài khoản",
                "role_management" => "Phân quyền",
                "moderation" => "Kiểm duyệt",
                "auth" => "Xác thực",
                _ => "Hệ thống"
            };

            var icon = l.LogType switch
            {
                "user_management" => "person_add",
                "role_management" => "admin_panel_settings",
                "moderation" => "verified_user",
                "auth" => "login",
                _ => "settings"
            };

            return new ActivityItemDto
            {
                Id = $"act-{l.Id}",
                Type = type,
                TypeIcon = icon,
                TypeBgClass = "bg-primary-fixed",
                TypeTextClass = "text-on-primary-fixed-variant",
                User = l.User?.DisplayName ?? "Hệ thống VeggieAI",
                Action = l.Action,
                Target = l.Target ?? "Hệ thống",
                Details = l.Details ?? l.Action,
                Time = FormatTimeAgo(l.CreatedAt),
                Status = "Hoàn tất",
                StatusBgClass = "bg-secondary-container",
                StatusTextClass = "text-on-secondary-container",
                Avatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(l.User?.DisplayName ?? "Sys")}&background=006948&color=ffffff"
            };
        }).ToList();
    }

    private static string FormatTimeAgo(DateTime dt)
    {
        var span = DateTime.UtcNow - dt;
        if (span.TotalMinutes < 1) return "Vừa xong";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} giờ trước";
        return $"{(int)span.TotalDays} ngày trước";
    }
}

public interface IRoleService
{
    Task<List<RoleDto>> GetRolesAsync();
    Task<List<PermissionDto>> GetAllPermissionsAsync();
    Task<List<string>> GetPermissionsByRoleAsync(string role);
    Task<RoleDto> SaveRoleAsync(string? id, SaveRoleRequest request, int adminId);
    Task<bool> DeleteRoleAsync(string id, int adminId);
}

public class RoleService : IRoleService
{
    private readonly IUnitOfWork _unitOfWork;

    public RoleService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<RoleDto>> GetRolesAsync()
    {
        var roles = await _unitOfWork.Context.Roles
            .Include(r => r.RolePermissions)
            .Where(r => r.Id == RoleConstants.SuperAdmin
                        || r.Id == RoleConstants.Mod
                        || r.Id == RoleConstants.User)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();

        var users = await _unitOfWork.Context.Users.ToListAsync();

        return roles.Select(r =>
        {
            var count = users.Count(u => RoleConstants.Normalize(u.Role) == r.Id);
            return new RoleDto
            {
                Id = r.Id,
                Name = r.Name,
                Description = r.Description ?? string.Empty,
                UserCount = count,
                Permissions = r.RolePermissions.Select(rp => rp.PermissionId).ToList(),
                IsSystem = r.IsSystem,
                Theme = r.Theme,
                Icon = r.Icon
            };
        }).ToList();
    }

    public async Task<List<PermissionDto>> GetAllPermissionsAsync()
    {
        var perms = await _unitOfWork.Context.Permissions
            .OrderBy(p => p.GroupName)
            .ThenBy(p => p.Id)
            .ToListAsync();

        return perms.Select(p => new PermissionDto
        {
            Id = p.Id,
            Label = p.Label,
            Group = p.GroupName
        }).ToList();
    }

    public async Task<List<string>> GetPermissionsByRoleAsync(string role)
    {
        var normalized = RoleConstants.Normalize(role);
        return await _unitOfWork.Context.RolePermissions
            .Where(rp => rp.RoleId == normalized)
            .Select(rp => rp.PermissionId)
            .ToListAsync();
    }

    public async Task<RoleDto> SaveRoleAsync(string? id, SaveRoleRequest request, int adminId)
    {
        if (string.IsNullOrWhiteSpace(id))
        {
            throw new InvalidOperationException("Hệ thống chuẩn hóa chỉ có 2 vai trò quản trị (SuperAdmin, Mod) và tài khoản người dùng (User). Không tạo thêm vai trò thứ ba.");
        }

        var role = await _unitOfWork.Context.Roles
            .Include(r => r.RolePermissions)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (role == null)
        {
            throw new KeyNotFoundException("Không tìm thấy vai trò cần cấu hình.");
        }

        if (role.Id == RoleConstants.SuperAdmin)
        {
            // Ensure SuperAdmin never loses core IAM & system permissions
            foreach (var required in new[] { "usr_read", "usr_write", "usr_role", "sys_log", "sys_ai" })
            {
                if (!request.Permissions.Contains(required))
                {
                    request.Permissions.Add(required);
                }
            }
        }
        else if (role.Id == RoleConstants.Mod)
        {
            // Mod cannot be granted SuperAdmin IAM permission usr_role
            request.Permissions.Remove("usr_role");
            request.Permissions.Remove("sys_log");
        }
        else if (role.Id == RoleConstants.User)
        {
            request.Permissions.Clear();
        }

        role.Description = request.Description.Trim();

        var validPermIds = await _unitOfWork.Context.Permissions.Select(p => p.Id).ToListAsync();
        var filteredPerms = request.Permissions.Distinct().Where(p => validPermIds.Contains(p)).ToList();

        _unitOfWork.Context.RolePermissions.RemoveRange(role.RolePermissions);
        foreach (var permId in filteredPerms)
        {
            _unitOfWork.Context.RolePermissions.Add(new RolePermission
            {
                RoleId = role.Id,
                PermissionId = permId
            });
        }

        _unitOfWork.Context.Roles.Update(role);

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = adminId,
            Action = "Cập nhật quyền vai trò",
            Target = role.Name,
            Details = $"Cập nhật {filteredPerms.Count} quyền cho vai trò {role.Id}",
            LogType = "role_management"
        });

        await _unitOfWork.CommitAsync();

        var userCount = await _unitOfWork.Context.Users.CountAsync(u => u.Role == role.Id);
        return new RoleDto
        {
            Id = role.Id,
            Name = role.Name,
            Description = role.Description ?? string.Empty,
            UserCount = userCount,
            Permissions = filteredPerms,
            IsSystem = role.IsSystem,
            Theme = role.Theme,
            Icon = role.Icon
        };
    }

    public async Task<bool> DeleteRoleAsync(string id, int adminId)
    {
        var role = await _unitOfWork.Context.Roles.FirstOrDefaultAsync(r => r.Id == id);
        if (role == null) return false;

        if (role.IsSystem || role.Id is RoleConstants.SuperAdmin or RoleConstants.Mod or RoleConstants.User)
        {
            throw new InvalidOperationException("Không thể xóa vai trò cốt lõi của hệ thống.");
        }

        _unitOfWork.Context.Roles.Remove(role);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = adminId,
            Action = "Xóa vai trò",
            Target = role.Name,
            Details = $"Đã xóa vai trò {role.Id}",
            LogType = "role_management"
        });
        await _unitOfWork.CommitAsync();
        return true;
    }
}

public interface ISystemSettingService
{
    Task<List<SystemSettingDto>> GetSettingsAsync(string? search = null);
    Task<SystemSettingDto> SaveSettingAsync(SaveSystemSettingRequest request, int adminId);
    Task<bool> DeleteSettingAsync(string key, int adminId);
}

public class SystemSettingService : ISystemSettingService
{
    private readonly IUnitOfWork _unitOfWork;

    public SystemSettingService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SystemSettingDto>> GetSettingsAsync(string? search = null)
    {
        var query = _unitOfWork.Context.SystemSettings
            .Include(s => s.UpdatedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x => x.Key.ToLower().Contains(s)
                                     || x.Value.ToLower().Contains(s)
                                     || (x.Description != null && x.Description.ToLower().Contains(s)));
        }

        var items = await query.OrderBy(x => x.Key).ToListAsync();
        return items.Select(x => new SystemSettingDto
        {
            Key = x.Key,
            Value = x.Value,
            Description = x.Description,
            UpdatedByName = x.UpdatedByUser?.DisplayName ?? "Hệ thống",
            UpdatedAt = x.UpdatedAt.ToString("yyyy-MM-dd HH:mm")
        }).ToList();
    }

    public async Task<SystemSettingDto> SaveSettingAsync(SaveSystemSettingRequest request, int adminId)
    {
        var key = request.Key.Trim();
        var item = await _unitOfWork.Context.SystemSettings.FindAsync(key);
        bool isNew = item == null;

        if (item == null)
        {
            item = new SystemSetting
            {
                Key = key,
                Value = request.Value.Trim(),
                Description = request.Description?.Trim(),
                UpdatedBy = adminId,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Context.SystemSettings.AddAsync(item);
        }
        else
        {
            item.Value = request.Value.Trim();
            item.Description = request.Description?.Trim();
            item.UpdatedBy = adminId;
            item.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Context.SystemSettings.Update(item);
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = adminId,
            Action = isNew ? "Thêm cấu hình hệ thống" : "Cập nhật cấu hình hệ thống",
            Target = key,
            Details = $"{key} = {item.Value}",
            LogType = "system"
        });

        await _unitOfWork.CommitAsync();

        var saved = await _unitOfWork.Context.SystemSettings
            .Include(s => s.UpdatedByUser)
            .FirstAsync(s => s.Key == key);

        return new SystemSettingDto
        {
            Key = saved.Key,
            Value = saved.Value,
            Description = saved.Description,
            UpdatedByName = saved.UpdatedByUser?.DisplayName ?? "SuperAdmin",
            UpdatedAt = saved.UpdatedAt.ToString("yyyy-MM-dd HH:mm")
        };
    }

    public async Task<bool> DeleteSettingAsync(string key, int adminId)
    {
        var item = await _unitOfWork.Context.SystemSettings.FindAsync(key);
        if (item == null) return false;

        _unitOfWork.Context.SystemSettings.Remove(item);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = adminId,
            Action = "Xóa cấu hình hệ thống",
            Target = key,
            Details = $"Xóa cấu hình '{key}'",
            LogType = "system"
        });
        await _unitOfWork.CommitAsync();
        return true;
    }
}

public interface ISystemLogService
{
    Task<List<SystemLogDto>> GetLogsAsync(string? logType = null, string? search = null, int limit = 100);
    Task<SystemLogDto> CreateLogAsync(CreateSystemLogRequest request, int? userId = null);
}

public class SystemLogService : ISystemLogService
{
    private readonly IUnitOfWork _unitOfWork;

    public SystemLogService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<SystemLogDto>> GetLogsAsync(string? logType = null, string? search = null, int limit = 100)
    {
        var query = _unitOfWork.Context.SystemLogs
            .Include(l => l.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(logType) && logType != "ALL")
        {
            query = query.Where(l => l.LogType.ToLower() == logType.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(l => l.Action.ToLower().Contains(s)
                || (l.Target != null && l.Target.ToLower().Contains(s))
                || (l.Details != null && l.Details.ToLower().Contains(s))
                || (l.User != null && l.User.DisplayName.ToLower().Contains(s)));
        }

        var safeLimit = Math.Clamp(limit, 1, 500);
        var logs = await query.OrderByDescending(l => l.CreatedAt).Take(safeLimit).ToListAsync();
        return logs.Select(l => new SystemLogDto
        {
            Id = l.Id,
            UserName = l.User?.DisplayName ?? "Hệ thống",
            UserEmail = l.User?.Email,
            Action = l.Action,
            Target = l.Target,
            Details = l.Details,
            LogType = l.LogType,
            CreatedAt = l.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            TimeAgo = FormatTimeAgo(l.CreatedAt)
        }).ToList();
    }

    public async Task<SystemLogDto> CreateLogAsync(CreateSystemLogRequest request, int? userId = null)
    {
        var log = new SystemLog
        {
            UserId = userId,
            Action = request.Action,
            Target = request.Target,
            Details = request.Details,
            LogType = request.LogType ?? "system",
            CreatedAt = DateTime.UtcNow
        };
        await _unitOfWork.Context.SystemLogs.AddAsync(log);
        await _unitOfWork.CommitAsync();

        return new SystemLogDto
        {
            Id = log.Id,
            UserName = "Hệ thống",
            Action = log.Action,
            Target = log.Target,
            Details = log.Details,
            LogType = log.LogType,
            CreatedAt = log.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
            TimeAgo = "Vừa xong"
        };
    }

    private static string FormatTimeAgo(DateTime dt)
    {
        var span = DateTime.UtcNow - dt;
        if (span.TotalMinutes < 1) return "Vừa xong";
        if (span.TotalMinutes < 60) return $"{(int)span.TotalMinutes} phút trước";
        if (span.TotalHours < 24) return $"{(int)span.TotalHours} giờ trước";
        return $"{(int)span.TotalDays} ngày trước";
    }
}
