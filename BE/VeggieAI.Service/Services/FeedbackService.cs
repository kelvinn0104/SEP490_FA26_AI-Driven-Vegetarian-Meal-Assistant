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
        var result = new List<FeedbackReportDto>();

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

                var reporterName = r.Reporter?.DisplayName ?? "Người dùng";
                result.Add(new FeedbackReportDto
                {
                    Id = r.Id,
                    FeedbackType = "report",
                    ReporterName = reporterName,
                    ReporterEmail = r.Reporter?.Email ?? string.Empty,
                    ReporterAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(reporterName)}&background=006948&color=ffffff",
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
                    ResolutionNote = r.Status == "resolved" ? "Đã xử lý bởi Điều phối viên." : (r.Status == "dismissed" ? "Đã từ chối báo cáo." : null)
                });
            }
        }

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
                var reviewerName = f.Reviewer?.DisplayName ?? "Điều phối viên";
                result.Add(new FeedbackReportDto
                {
                    Id = f.Id,
                    FeedbackType = "ai_feedback",
                    ReporterName = reviewerName,
                    ReporterEmail = f.Reviewer?.Email ?? string.Empty,
                    ReporterAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(reviewerName)}&background=006948&color=ffffff",
                    TargetType = f.TargetType,
                    TargetId = f.TargetId,
                    TargetTitle = f.TargetType == "meal_plan" ? $"Thực đơn AI #{f.TargetId}" : $"Tư vấn AI #{f.TargetId}",
                    Category = "ai_accuracy",
                    CategoryLabel = "Đánh giá chất lượng AI",
                    Content = f.Comment,
                    Rating = f.Rating,
                    IsAccurate = f.IsAccurate,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    HandlerName = f.Handler?.DisplayName,
                    ResolutionNote = f.Status == "resolved" ? "Đã ghi nhận cải thiện AI." : null
                });
            }
        }

        return result.OrderBy(r => r.Status == "open" ? 0 : 1).ThenByDescending(r => r.CreatedAt).ToList();
    }

    public async Task<FeedbackOverviewStatsDto> GetFeedbackStatsAsync()
    {
        var totalReports = await _unitOfWork.Context.Reports.CountAsync();
        var openReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "open");
        var resolvedReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "resolved");
        var dismissedReports = await _unitOfWork.Context.Reports.CountAsync(r => r.Status == "dismissed");
        var nutritionMisCount = await _unitOfWork.Context.Reports.CountAsync(r => r.Category == "nutrition_misinformation" && r.Status == "open");
        var spamCount = await _unitOfWork.Context.Reports.CountAsync(r => r.Category == "spam" && r.Status == "open");

        var ratings = await _unitOfWork.Context.AiFeedbacks.Select(f => (decimal)f.Rating).ToListAsync();
        var avgRating = ratings.Count > 0 ? Math.Round(ratings.Average(), 1) : 0m;

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
        }
        else
        {
            var item = await _unitOfWork.Context.Reports.FindAsync(id);
            if (item == null) return false;
            item.Status = request.Decision == "dismissed" ? "dismissed" : "resolved";
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
                    if (post != null) post.Status = "removed";
                }
                else if (item.TargetType == "comment")
                {
                    var comment = await _unitOfWork.Context.Comments.FindAsync(item.TargetId);
                    if (comment != null) comment.Status = "hidden";
                }
            }
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = handlerId,
            Action = "Xử lý phản hồi / báo cáo",
            Target = $"{feedbackType} #{id}",
            Details = request.ResolutionNote ?? request.Decision,
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return true;
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

        var list = await GetFeedbacksAsync("report", null, null, null);
        return list.First(r => r.Id == report.Id && r.FeedbackType == "report");
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

        var list = await GetFeedbacksAsync("ai_feedback", null, null, null);
        return list.First(r => r.Id == feedback.Id && r.FeedbackType == "ai_feedback");
    }

    private static string MapCategoryLabel(string category) => category switch
    {
        "nutrition_misinformation" => "Sai lệch Dinh dưỡng",
        "spam" => "Spam / Quảng cáo rác",
        "offensive" => "Ngôn từ thù địch",
        "inappropriate" => "Không phù hợp",
        "ai_accuracy" => "Đánh giá chất lượng AI",
        _ => "Báo cáo khác"
    };
}
