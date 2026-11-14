using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IFeedbackService
{
    Task<List<FeedbackReportDto>> GetFeedbacksAsync(string? type = null, string? category = null, string? status = null, string? search = null);
    Task<FeedbackOverviewStatsDto> GetFeedbackStatsAsync();
    Task<bool> ResolveFeedbackAsync(int id, ResolveFeedbackRequest request, int handlerId, string feedbackType = "report");
    Task<FeedbackReportDto> CreateReportAsync(CreateReportRequest request, int reporterId);
    Task<FeedbackReportDto> SubmitAiFeedbackAsync(CreateAiFeedbackRequest request, int reviewerId);
}

public class FeedbackService : IFeedbackService
{
    private readonly IUnitOfWork _unitOfWork;

    public FeedbackService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<FeedbackReportDto>> GetFeedbacksAsync(string? type = null, string? category = null, string? status = null, string? search = null)
    {
        await EnsureSeedFeedbacksAsync();

        var result = new List<FeedbackReportDto>();

        // 1. Query Reports (Community violations & Nutrition misinformation)
        if (string.IsNullOrWhiteSpace(type) || type == "all" || type == "report")
        {
            var repQuery = _unitOfWork.Context.Reports
                .Include(r => r.Reporter)
                .Include(r => r.Handler)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                repQuery = repQuery.Where(r => r.Status.ToLower() == status.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(category) && category != "all")
            {
                repQuery = repQuery.Where(r => r.Category.ToLower() == category.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                repQuery = repQuery.Where(r =>
                    (r.Reason != null && r.Reason.ToLower().Contains(s)) ||
                    (r.Reporter != null && r.Reporter.DisplayName.ToLower().Contains(s)) ||
                    r.Category.ToLower().Contains(s));
            }

            var reports = await repQuery.OrderByDescending(r => r.CreatedAt).ToListAsync();

            foreach (var r in reports)
            {
                string targetTitle = r.TargetType == "recipe" ? $"Công thức #{r.TargetId}" :
                                     r.TargetType == "comment" ? $"Bình luận #{r.TargetId}" : $"Bài viết #{r.TargetId}";

                if (r.TargetType == "recipe")
                {
                    var recipe = await _unitOfWork.Context.Recipes.FindAsync(r.TargetId);
                    if (recipe != null) targetTitle = recipe.Title;
                }
                else if (r.TargetType == "post")
                {
                    var post = await _unitOfWork.Context.Posts.FindAsync(r.TargetId);
                    if (post != null) targetTitle = post.Title;
                }

                result.Add(new FeedbackReportDto
                {
                    Id = r.Id,
                    FeedbackType = "report",
                    ReporterName = r.Reporter?.DisplayName ?? "Người dùng ẩn danh",
                    ReporterEmail = r.Reporter?.Email ?? "user@veggie.vn",
                    ReporterAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    TargetType = r.TargetType,
                    TargetId = r.TargetId,
                    TargetTitle = targetTitle,
                    Category = r.Category,
                    CategoryLabel = MapCategoryLabel(r.Category),
                    Content = r.Reason,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    HandledAt = r.HandledAt?.ToString("dd/MM/yyyy HH:mm"),
                    HandlerName = r.Handler?.DisplayName,
                    ResolutionNote = r.Status == "resolved" ? "Đã xử lý và thông báo tới người dùng." : null
                });
            }
        }

        // 2. Query AiFeedbacks (Nutritionist & user evaluation of AI)
        if (string.IsNullOrWhiteSpace(type) || type == "all" || type == "ai_feedback")
        {
            var aiQuery = _unitOfWork.Context.AiFeedbacks
                .Include(f => f.Reviewer)
                .Include(f => f.Handler)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) && status != "all")
            {
                aiQuery = aiQuery.Where(f => f.Status.ToLower() == status.Trim().ToLower());
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                aiQuery = aiQuery.Where(f =>
                    (f.Comment != null && f.Comment.ToLower().Contains(s)) ||
                    (f.Reviewer != null && f.Reviewer.DisplayName.ToLower().Contains(s)));
            }

            var aiItems = await aiQuery.OrderByDescending(f => f.CreatedAt).ToListAsync();

            foreach (var f in aiItems)
            {
                string targetTitle = f.TargetType == "meal_plan" ? $"Gợi ý Thực đơn Tuần #{f.TargetId}" : $"Đoạn chat Tư vấn dinh dưỡng #{f.TargetId}";

                result.Add(new FeedbackReportDto
                {
                    Id = f.Id,
                    FeedbackType = "ai_feedback",
                    ReporterName = f.Reviewer?.DisplayName ?? "Chuyên gia Dinh dưỡng Mod",
                    ReporterEmail = f.Reviewer?.Email ?? "mod@veggie.vn",
                    ReporterAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                    TargetType = f.TargetType,
                    TargetId = f.TargetId,
                    TargetTitle = targetTitle,
                    Category = "ai_accuracy",
                    CategoryLabel = "Đánh giá chất lượng AI",
                    Content = f.Comment,
                    Rating = f.Rating,
                    IsAccurate = f.IsAccurate,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    HandlerName = f.Handler?.DisplayName,
                    ResolutionNote = f.Status == "resolved" ? "Đã ghi nhận dữ liệu để cập nhật Prompt AI." : null
                });
            }
        }

        return result.OrderBy(r => r.Status == "open" ? 0 : 1).ThenByDescending(r => r.CreatedAt).ToList();
    }

    public async Task<FeedbackOverviewStatsDto> GetFeedbackStatsAsync()
    {
        await EnsureSeedFeedbacksAsync();

        var totalReports = await _unitOfWork.Context.Reports.CountAsync();
        var openReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "open");
        var resolvedReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "resolved");
        var dismissedReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "dismissed");
        var nutritionMisCount = await _unitOfWork.Context.Reports.CountAsync(r => r.Category == "nutrition_misinformation" && r.Status == "open");
        var spamCount = await _unitOfWork.Context.Reports.CountAsync(r => r.Category == "spam" && r.Status == "open");

        var ratings = await _unitOfWork.Context.AiFeedbacks.Select(f => (decimal)f.Rating).ToListAsync();
        var avgRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 1) : 4.6m;

        return new FeedbackOverviewStatsDto
        {
            TotalReports = totalReports,
            OpenReports = openReports,
            ResolvedReports = resolvedReports,
            DismissedReports = dismissedReports,
            NutritionMisinformationCount = nutritionMisCount,
            SpamPolicyCount = spamCount,
            AvgAiSatisfaction = avgRating
        };
    }

    public async Task<bool> ResolveFeedbackAsync(int id, ResolveFeedbackRequest request, int handlerId, string feedbackType = "report")
    {
        if (feedbackType == "ai_feedback")
        {
            var item = await _unitOfWork.Context.AiFeedbacks.FindAsync(id);
            if (item == null) return false;
            item.Status = request.Decision == "dismissed" ? "acknowledged" : "resolved";
            item.HandledBy = handlerId;
            await _unitOfWork.CommitAsync();
            return true;
        }
        else
        {
            var item = await _unitOfWork.Context.Reports.FindAsync(id);
            if (item == null) return false;
            item.Status = request.Decision;
            item.HandledBy = handlerId;
            item.HandledAt = DateTime.UtcNow;

            if (request.HideTargetContent)
            {
                if (item.TargetType == "recipe")
                {
                    var recipe = await _unitOfWork.Context.Recipes.FindAsync(item.TargetId);
                    if (recipe != null) recipe.Status = "hidden";
                }
                else if (item.TargetType == "post")
                {
                    var post = await _unitOfWork.Context.Posts.FindAsync(item.TargetId);
                    if (post != null) post.Status = "hidden";
                }
            }

            await _unitOfWork.CommitAsync();
            return true;
        }
    }

    public async Task<FeedbackReportDto> CreateReportAsync(CreateReportRequest request, int reporterId)
    {
        var report = new Report
        {
            ReporterId = reporterId,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            Category = request.Category,
            Reason = request.Reason,
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Context.Reports.AddAsync(report);
        await _unitOfWork.CommitAsync();

        return (await GetFeedbacksAsync("report", null, null, null)).First(r => r.Id == report.Id && r.FeedbackType == "report");
    }

    public async Task<FeedbackReportDto> SubmitAiFeedbackAsync(CreateAiFeedbackRequest request, int reviewerId)
    {
        var feedback = new AiFeedback
        {
            ReviewedBy = reviewerId,
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            Rating = request.Rating,
            IsAccurate = request.IsAccurate,
            Comment = request.Comment,
            Status = "open",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Context.AiFeedbacks.AddAsync(feedback);
        await _unitOfWork.CommitAsync();

        return (await GetFeedbacksAsync("ai_feedback", null, null, null)).First(r => r.Id == feedback.Id && r.FeedbackType == "ai_feedback");
    }

    private static string MapCategoryLabel(string category)
    {
        return category switch
        {
            "nutrition_misinformation" => "Sai lệch Dinh dưỡng",
            "spam" => "Spam / Quảng cáo rác",
            "offensive" => "Ngôn từ thù địch",
            "inappropriate" => "Không phù hợp",
            "ai_accuracy" => "Đánh giá chất lượng AI",
            _ => "Góp ý khác"
        };
    }

    private async Task EnsureSeedFeedbacksAsync()
    {
        if (!await _unitOfWork.Context.Reports.AnyAsync())
        {
            var user = await _unitOfWork.Context.Users.FirstOrDefaultAsync() ?? new User { Email = "user@veggie.vn", DisplayName = "Thanh Thảo" };
            var mod = await _unitOfWork.Context.Users.FirstOrDefaultAsync(u => u.Role == "moderator") ?? user;

            var sampleReports = new List<Report>
            {
                new()
                {
                    ReporterId = user.Id,
                    TargetType = "recipe",
                    TargetId = 1,
                    Category = "nutrition_misinformation",
                    Reason = "Công thức ghi là 'Bánh dẻo hoa quả thuần chay 100%' nhưng thành phần nguyên liệu lại dùng Gelatine động vật. Cần chuyên gia Mod thẩm định đính chính sang bột rau câu Agar-agar.",
                    Status = "open",
                    CreatedAt = DateTime.UtcNow.AddHours(-3)
                },
                new()
                {
                    ReporterId = user.Id,
                    TargetType = "post",
                    TargetId = 2,
                    Category = "nutrition_misinformation",
                    Reason = "Bài viết tuyên truyền ăn chay thải độc 21 ngày trị dứt điểm mọi bệnh tật mà không cần theo phác đồ y tế. Thông tin này thiếu căn cứ khoa học, có thể gây nguy hiểm cho người bệnh.",
                    Status = "open",
                    CreatedAt = DateTime.UtcNow.AddHours(-12)
                },
                new()
                {
                    ReporterId = user.Id,
                    TargetType = "comment",
                    TargetId = 5,
                    Category = "spam",
                    Reason = "Bình luận chèn link liên kết tiếp thị dẫn đến trang bán thuốc giảm cân giả mạo không rõ nguồn gốc trong bài viết chia sẻ thực đơn thuần chay.",
                    Status = "open",
                    CreatedAt = DateTime.UtcNow.AddDays(-1)
                },
                new()
                {
                    ReporterId = user.Id,
                    TargetType = "recipe",
                    TargetId = 3,
                    Category = "other",
                    Reason = "Góp ý: Tác giả nên bổ sung thời gian ngâm nấm đông cô kỹ để tránh vị đắng cho người mới tập nấu chay.",
                    Status = "resolved",
                    HandledBy = mod.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-2),
                    HandledAt = DateTime.UtcNow.AddDays(-1)
                }
            };

            await _unitOfWork.Context.Reports.AddRangeAsync(sampleReports);
            await _unitOfWork.CommitAsync();
        }

        if (!await _unitOfWork.Context.AiFeedbacks.AnyAsync())
        {
            var mod = await _unitOfWork.Context.Users.FirstOrDefaultAsync(u => u.Role == "moderator") 
                      ?? await _unitOfWork.Context.Users.FirstOrDefaultAsync();

            if (mod != null)
            {
                var sampleAiFeedbacks = new List<AiFeedback>
                {
                    new()
                    {
                        ReviewedBy = mod.Id,
                        TargetType = "meal_plan",
                        TargetId = 101,
                        Rating = 3,
                        IsAccurate = false,
                        Comment = "Thực đơn AI tạo cho Gymer thuần chay còn thiếu khoảng 12g đạm so với mục tiêu 80g/ngày. Cần bổ sung thêm Tempeh hoặc hạt sen vào bữa xế.",
                        Status = "open",
                        CreatedAt = DateTime.UtcNow.AddHours(-5)
                    },
                    new()
                    {
                        ReviewedBy = mod.Id,
                        TargetType = "chat_message",
                        TargetId = 205,
                        Rating = 5,
                        IsAccurate = true,
                        Comment = "Trợ lý AI tư vấn bổ sung vi chất Vitamin B12 từ men dinh dưỡng và tảo biển cho phụ nữ mang thai ăn chay rất chi tiết và chuẩn y khoa.",
                        Status = "resolved",
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    }
                };

                await _unitOfWork.Context.AiFeedbacks.AddRangeAsync(sampleAiFeedbacks);
                await _unitOfWork.CommitAsync();
            }
        }
    }
}
