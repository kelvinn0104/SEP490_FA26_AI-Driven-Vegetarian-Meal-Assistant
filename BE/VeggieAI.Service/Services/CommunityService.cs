using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Service.Services.AI;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services;

public interface ICommunityService
{
    Task<PagedResult<PostSummaryDto>> ListAsync(int? viewerId, string? keyword, string? postType, string? sort, PageQuery page, CancellationToken ct = default);
    Task<PagedResult<PostSummaryDto>> ListMineAsync(int userId, PageQuery page, CancellationToken ct = default);
    Task<PostDetailDto> GetAsync(int? viewerId, bool viewerIsStaff, int postId, CancellationToken ct = default);
    Task<PostDetailDto> CreateAsync(int userId, CreatePostRequest req, CancellationToken ct = default);
    Task<PostDetailDto> UpdateAsync(int userId, int postId, UpdatePostRequest req, CancellationToken ct = default);
    Task DeletePostAsync(int userId, bool isStaff, int postId, CancellationToken ct = default);
    Task<PagedResult<PostCommentDto>> ListCommentsAsync(int? viewerId, bool viewerIsStaff, int postId, PageQuery page, CancellationToken ct = default);
    Task<PostCommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default);
    Task<PostCommentDto> UpdateCommentAsync(int userId, int commentId, string content, CancellationToken ct = default);
    Task DeleteCommentAsync(int userId, bool isStaff, int commentId, CancellationToken ct = default);
    Task<int> VoteAsync(int userId, int postId, int value, CancellationToken ct = default);
    Task<PostLikeDto> LikeAsync(int userId, int postId, bool liked, CancellationToken ct = default);
    Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default);
    Task<PagedResult<ReportDto>> ListMyReportsAsync(int userId, PageQuery page, CancellationToken ct = default);
}

/// <summary>
/// Bài viết cộng đồng (blog/video), bình luận, vote và báo cáo vi phạm.
/// Bài mới ở trạng thái "pending" → được duyệt qua /api/Moderation; chỉ bài "published" mới hiện công khai, comment và vote được.
/// Tác giả sửa bài → bài quay về "pending" để duyệt lại.
/// Xóa bài/bình luận là xóa mềm (status = removed) để giữ lịch sử kiểm duyệt.
/// </summary>
public class CommunityService : ICommunityService
{
    private const int ExcerptLength = 200;
    private readonly VeggieAIDbContext _db;

    public CommunityService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<PostSummaryDto>> ListAsync(int? viewerId, string? keyword, string? postType, string? sort,
        PageQuery page, CancellationToken ct = default)
    {
        var q = _db.Posts.AsNoTracking().Where(p => p.Status == "published");
        if (!string.IsNullOrWhiteSpace(postType)) q = q.Where(p => p.PostType == postType.Trim().ToLower());
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim().ToLower();
            q = q.Where(p => p.Title.ToLower().Contains(k) || (p.Content != null && p.Content.ToLower().Contains(k)));
        }

        q = string.Equals(sort, "top", StringComparison.OrdinalIgnoreCase)
            ? q.OrderByDescending(p => p.Votes.Count(v => v.Value == 1)).ThenByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
            : q.OrderByDescending(p => p.CreatedAt);

        return await PageAsync(q, viewerId, includeModeration: false, page, ct);
    }

    /// <summary>
    /// Bài của tôi: mọi trạng thái, kể cả bài bị moderator từ chối (để tác giả thấy lý do và sửa gửi lại).
    /// Bài do chính tác giả xóa không hiện.
    /// </summary>
    public Task<PagedResult<PostSummaryDto>> ListMineAsync(int userId, PageQuery page, CancellationToken ct = default) =>
        PageAsync(_db.Posts.AsNoTracking()
            .Where(p => p.UserId == userId &&
                        (p.Status != "removed" ||
                         p.ModerationLogs.OrderByDescending(l => l.ReviewedAt).ThenByDescending(l => l.Id)
                             .Select(l => l.Decision).FirstOrDefault() == "rejected"))
            .OrderByDescending(p => p.UpdatedAt ?? p.CreatedAt), userId, includeModeration: true, page, ct);

    public async Task<PostDetailDto> GetAsync(int? viewerId, bool viewerIsStaff, int postId, CancellationToken ct = default)
    {
        var vid = viewerId ?? 0;
        var attachable = _db.Recipes.FromApprovedCatalog();
        var p = await _db.Posts.AsNoTracking()
            .Where(x => x.Id == postId)
            .Select(x => new
            {
                x.Id, x.UserId, x.PostType, x.Title, x.MediaUrl, x.RecipeId, x.Status, x.CreatedAt, x.UpdatedAt, x.Content, x.VideoSummary,
                AuthorName = x.User != null ? x.User.DisplayName : "",
                RecipeTitle = attachable.Where(r => r.Id == x.RecipeId).Select(r => r.Title).FirstOrDefault(),
                Score = x.Votes.Sum(v => (int)v.Value),
                LikeCount = x.Votes.Count(v => v.Value == 1),
                MyVote = x.Votes.Where(v => v.UserId == vid).Select(v => (int)v.Value).FirstOrDefault(),
                Moderation = x.ModerationLogs.OrderByDescending(l => l.ReviewedAt).ThenByDescending(l => l.Id)
                    .Select(l => new { l.Decision, l.Reason, l.ReviewedAt }).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(ct);

        // Bài chưa duyệt / đã gỡ: chỉ tác giả hoặc admin/mod xem được
        var isAuthor = p is not null && vid != 0 && p.UserId == vid;
        if (p is null || (p.Status != "published" && !isAuthor && !viewerIsStaff) || (p.Status == "removed" && !viewerIsStaff && !isAuthor))
            throw AppException.NotFound("Bài viết");

        var comments = await _db.Comments.AsNoTracking()
            .Where(c => c.PostId == postId && c.Status == "visible")
            .OrderBy(c => c.CreatedAt).ThenBy(c => c.Id)
            .Select(c => new { c.Id, c.UserId, AuthorName = c.User != null ? c.User.DisplayName : "", c.Content, c.CreatedAt, c.UpdatedAt })
            .ToListAsync(ct);

        var commentDtos = comments
            .Select(c => new PostCommentDto(c.Id, c.UserId, c.AuthorName, c.Content, c.CreatedAt, c.UpdatedAt,
                CanEdit: c.UserId == vid, CanDelete: c.UserId == vid || viewerIsStaff))
            .ToList();

        // Tác giả chỉ thấy quyết định của người duyệt, không thấy bản sàng lọc tự động (decision = pending)
        var showModeration = p.Moderation is not null && (viewerIsStaff || (isAuthor && p.Moderation.Decision != "pending"));
        return new PostDetailDto(p.Id, p.PostType, p.Title, p.MediaUrl, p.AuthorName, p.RecipeId, p.Status, p.Score,
            commentDtos.Count, p.MyVote, p.CreatedAt, p.Content, p.VideoSummary, p.RecipeTitle, commentDtos,
            AuthorId: p.UserId,
            UpdatedAt: p.UpdatedAt,
            CanEdit: isAuthor && CanAuthorEdit(p.Status, p.Moderation?.Decision),
            CanDelete: (isAuthor || viewerIsStaff) && p.Status != "removed",
            Moderation: showModeration ? new PostModerationDto(p.Moderation!.Decision, p.Moderation.Reason, p.Moderation.ReviewedAt) : null,
            LikeCount: p.LikeCount);
    }

    public async Task<PostDetailDto> CreateAsync(int userId, CreatePostRequest req, CancellationToken ct = default)
    {
        var (title, content, mediaUrl) = ValidatePost(req.PostType, req.Title, req.Content, req.MediaUrl);
        await EnsureRecipeAttachableAsync(req.RecipeId, ct);

        var post = new Post
        {
            UserId = userId,
            PostType = req.PostType,
            Title = title,
            Content = content,
            MediaUrl = mediaUrl,
            RecipeId = req.RecipeId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
        };
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(ct);
        await QueueForReviewAsync(post, isResubmit: false, ct);
        return await GetAsync(userId, false, post.Id, ct);
    }

    public async Task<PostDetailDto> UpdateAsync(int userId, int postId, UpdatePostRequest req, CancellationToken ct = default)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId, ct) ?? throw AppException.NotFound("Bài viết");
        if (post.UserId != userId) throw AppException.Forbidden("Chỉ tác giả mới được sửa bài viết.");

        var lastDecision = await LastDecisionAsync(postId, ct);
        if (!CanAuthorEdit(post.Status, lastDecision))
            throw new AppException("Bài viết đã bị xóa nên không thể sửa.", 400, "POST_NOT_EDITABLE");

        var postType = req.PostType ?? post.PostType;
        var (title, content, mediaUrl) = ValidatePost(postType, req.Title, req.Content, req.MediaUrl);
        if (req.RecipeId != post.RecipeId) await EnsureRecipeAttachableAsync(req.RecipeId, ct);

        post.Title = title;
        post.Content = content;
        if (post.MediaUrl != mediaUrl || post.PostType != postType) post.VideoSummary = null;
        post.PostType = postType;
        post.MediaUrl = mediaUrl;
        post.RecipeId = req.RecipeId;
        post.UpdatedAt = DateTime.UtcNow;
        post.Status = "pending"; // nội dung mới → kiểm duyệt lại
        await _db.SaveChangesAsync(ct);
        await QueueForReviewAsync(post, isResubmit: true, ct);
        return await GetAsync(userId, false, post.Id, ct);
    }

    public async Task DeletePostAsync(int userId, bool isStaff, int postId, CancellationToken ct = default)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.Status != "removed", ct)
                   ?? throw AppException.NotFound("Bài viết");
        if (post.UserId != userId && !isStaff) throw AppException.Forbidden();
        post.Status = "removed";
        if (post.UserId != userId)
            Notifier.Queue(_db, post.UserId, NotificationTypes.PostReview, $"Bài viết {Notifier.Quote(post.Title)} đã bị quản trị viên gỡ.");
        await _db.SaveChangesAsync(ct);
    }

    public async Task<PagedResult<PostCommentDto>> ListCommentsAsync(int? viewerId, bool viewerIsStaff, int postId, PageQuery page,
        CancellationToken ct = default)
    {
        var vid = viewerId ?? 0;
        var post = await _db.Posts.AsNoTracking().Where(p => p.Id == postId).Select(p => new { p.UserId, p.Status }).FirstOrDefaultAsync(ct);
        if (post is null || (post.Status != "published" && post.UserId != vid && !viewerIsStaff))
            throw AppException.NotFound("Bài viết");

        var q = _db.Comments.AsNoTracking().Where(c => c.PostId == postId && c.Status == "visible");
        var total = await q.CountAsync(ct);
        var rows = await q.OrderBy(c => c.CreatedAt).ThenBy(c => c.Id)
            .Skip(page.Skip).Take(page.PageSize)
            .Select(c => new { c.Id, c.UserId, AuthorName = c.User != null ? c.User.DisplayName : "", c.Content, c.CreatedAt, c.UpdatedAt })
            .ToListAsync(ct);

        return new PagedResult<PostCommentDto>
        {
            Items = rows.Select(c => new PostCommentDto(c.Id, c.UserId, c.AuthorName, c.Content, c.CreatedAt, c.UpdatedAt,
                CanEdit: c.UserId == vid, CanDelete: c.UserId == vid || viewerIsStaff)).ToList(),
            TotalCount = total,
            Page = page.Page,
            PageSize = page.PageSize
        };
    }

    public async Task<PostCommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default)
    {
        var text = content.Trim();
        if (text.Length == 0) throw new AppException("Nội dung bình luận không được để trống.");
        var post = await EnsurePublishedAsync(postId, ct);

        var c = new Comment { PostId = postId, UserId = userId, Content = text, Status = "visible", CreatedAt = DateTime.UtcNow };
        _db.Comments.Add(c);

        var author = await _db.Users.Where(u => u.Id == userId).Select(u => u.DisplayName).FirstOrDefaultAsync(ct) ?? "";
        if (post.UserId != userId)
        {
            Notifier.Queue(_db, post.UserId, NotificationTypes.System,
                $"{(author.Length > 0 ? author : "Một thành viên")} đã bình luận về bài viết {Notifier.Quote(post.Title)} của bạn.");
        }
        await _db.SaveChangesAsync(ct);

        return new PostCommentDto(c.Id, userId, author, c.Content, c.CreatedAt, null, CanEdit: true, CanDelete: true);
    }

    public async Task<PostCommentDto> UpdateCommentAsync(int userId, int commentId, string content, CancellationToken ct = default)
    {
        var text = content.Trim();
        if (text.Length == 0) throw new AppException("Nội dung bình luận không được để trống.");

        var c = await _db.Comments.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == commentId && x.Status == "visible", ct)
                ?? throw AppException.NotFound("Bình luận");
        if (c.UserId != userId) throw AppException.Forbidden("Chỉ người viết mới được sửa bình luận.");

        c.Content = text;
        c.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
        return new PostCommentDto(c.Id, c.UserId, c.User?.DisplayName ?? "", c.Content, c.CreatedAt, c.UpdatedAt, CanEdit: true, CanDelete: true);
    }

    public async Task DeleteCommentAsync(int userId, bool isStaff, int commentId, CancellationToken ct = default)
    {
        var c = await _db.Comments.FirstOrDefaultAsync(x => x.Id == commentId && x.Status != "removed", ct)
                ?? throw AppException.NotFound("Bình luận");
        if (c.UserId != userId && !isStaff) throw AppException.Forbidden();
        c.Status = "removed";
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> VoteAsync(int userId, int postId, int value, CancellationToken ct = default)
    {
        if (value is < -1 or > 1) throw new AppException("value phải là -1, 0 hoặc 1.");
        await SetVoteAsync(userId, postId, value, ct);
        return await _db.PostVotes.Where(v => v.PostId == postId).SumAsync(v => (int)v.Value, ct);
    }

    public async Task<PostLikeDto> LikeAsync(int userId, int postId, bool liked, CancellationToken ct = default)
    {
        await SetVoteAsync(userId, postId, liked ? 1 : 0, ct);
        return new PostLikeDto(await _db.PostVotes.CountAsync(v => v.PostId == postId && v.Value == 1, ct), liked);
    }

    private async Task SetVoteAsync(int userId, int postId, int value, CancellationToken ct)
    {
        await EnsurePublishedAsync(postId, ct);

        if (_db.Database.IsNpgsql())
        {
            if (value == 0)
                await _db.PostVotes.Where(v => v.PostId == postId && v.UserId == userId).ExecuteDeleteAsync(ct);
            else
                await _db.Database.ExecuteSqlInterpolatedAsync($@"
                    INSERT INTO veggieai.""PostVote"" (""PostId"", ""UserId"", ""Value"", ""CreatedAt"")
                    VALUES ({postId}, {userId}, {(short)value}, {DateTime.UtcNow})
                    ON CONFLICT (""PostId"", ""UserId"") DO UPDATE
                    SET ""Value"" = EXCLUDED.""Value"", ""CreatedAt"" = EXCLUDED.""CreatedAt""", ct);
            return;
        }
        var vote = await _db.PostVotes.FirstOrDefaultAsync(v => v.PostId == postId && v.UserId == userId, ct);
        if (value == 0)
        {
            if (vote is not null) _db.PostVotes.Remove(vote);
        }
        else if (vote is null)
        {
            _db.PostVotes.Add(new PostVote { PostId = postId, UserId = userId, Value = (short)value, CreatedAt = DateTime.UtcNow });
        }
        else
        {
            vote.Value = (short)value;
            vote.CreatedAt = DateTime.UtcNow;
        }
        await _db.SaveChangesAsync(ct);
    }

    public async Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default)
    {
        // Chỉ báo cáo được nội dung đang hiển thị công khai (bài chưa duyệt chỉ tác giả/staff thấy nên không báo cáo được)
        int? ownerId = req.TargetType switch
        {
            "post" => await _db.Posts.Where(p => p.Id == req.TargetId && (p.Status == "published" || p.Status == "flagged")).Select(p => (int?)p.UserId).FirstOrDefaultAsync(ct),
            "comment" => await _db.Comments.Where(c => c.Id == req.TargetId && c.Status == "visible" && c.Post!.Status == "published").Select(c => (int?)c.UserId).FirstOrDefaultAsync(ct),
            "recipe" => await _db.Recipes.Where(r => r.Id == req.TargetId && r.Status == "published").Select(r => (int?)r.CreatedBy).FirstOrDefaultAsync(ct),
            _ => null,
        };
        if (ownerId is null) throw AppException.NotFound("Nội dung bị báo cáo");
        if (ownerId == userId) throw new AppException("Bạn không thể báo cáo nội dung của chính mình.", 400, "CANNOT_REPORT_OWN_CONTENT");

        if (await _db.Reports.AnyAsync(r => r.ReporterId == userId && r.TargetType == req.TargetType &&
                                            r.TargetId == req.TargetId && r.Status == "open", ct))
            throw AppException.Conflict("Bạn đã báo cáo nội dung này và đang chờ xử lý.");

        var report = new Report
        {
            ReporterId = userId,
            TargetType = req.TargetType,
            TargetId = req.TargetId,
            Category = req.Category,
            Reason = string.IsNullOrWhiteSpace(req.Reason) ? null : req.Reason.Trim(),
            Status = "open",
            CreatedAt = DateTime.UtcNow,
        };
        _db.Reports.Add(report);
        await _db.SaveChangesAsync(ct);
        await EscalateIfNeededAsync(report, ownerId.Value, ct);
        return new ReportDto(report.Id, report.TargetType, report.TargetId, report.Category, report.Reason, report.Status, report.CreatedAt,
            null, await TargetPreviewAsync(report.TargetType, report.TargetId, ct));
    }

    /// <summary>
    /// Điểm báo cáo (số người báo cáo × độ uy tín theo tuổi tài khoản) đạt ngưỡng → tự ẩn tạm thời (post: flagged, comment: hidden)
    /// và báo moderator; chưa đạt ngưỡng → chỉ báo moderator khi mức ưu tiên cao/trung bình.
    /// </summary>
    private async Task EscalateIfNeededAsync(Report report, int ownerId, CancellationToken ct)
    {
        try
        {
            var sc = await ReportScoring.ScoreAsync(_db, report.TargetType, report.TargetId, ct);
            var flagged = false;
            if (sc.Score >= ReportScoring.AutoFlagThreshold)
            {
                switch (report.TargetType)
                {
                    case "post":
                        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == report.TargetId && p.Status == "published", ct);
                        if (post != null)
                        {
                            post.Status = "flagged"; flagged = true;
                            Notifier.Queue(_db, post.UserId, NotificationTypes.PostReview,
                                $"Bài viết {Notifier.Quote(post.Title)} bị ẩn tạm thời vì nhận nhiều báo cáo, đang chờ moderator xem xét.");
                        }
                        break;
                    case "comment":
                        var cm = await _db.Comments.FirstOrDefaultAsync(c => c.Id == report.TargetId && c.Status == "visible", ct);
                        if (cm != null)
                        {
                            cm.Status = "hidden"; flagged = true;
                            Notifier.Queue(_db, cm.UserId, NotificationTypes.PostReview,
                                "Một bình luận của bạn bị ẩn tạm thời vì nhận nhiều báo cáo, đang chờ moderator xem xét.");
                        }
                        break;
                }
            }
            if (flagged || sc.Priority != "low")
            {
                var staffIds = await _db.Users
                    .Where(u => (u.Role == AppRoles.Admin || u.Role == AppRoles.Moderator) && u.Status == "active" && u.Id != ownerId)
                    .Select(u => u.Id).ToListAsync(ct);
                var msg = flagged
                    ? $"Nội dung ({report.TargetType} #{report.TargetId}) đã bị tự động ẩn: {sc.ReportCount} báo cáo, điểm uy tín {sc.Score}."
                    : $"Nội dung ({report.TargetType} #{report.TargetId}) có {sc.ReportCount} báo cáo, điểm uy tín {sc.Score} (ưu tiên {sc.Priority}).";
                foreach (var id in staffIds) Notifier.Queue(_db, id, NotificationTypes.System, msg);
            }
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception) when (!ct.IsCancellationRequested)
        {
            // Báo cáo đã lưu; moderator vẫn thấy trong hàng đợi.
        }
    }

    public async Task<PagedResult<ReportDto>> ListMyReportsAsync(int userId, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.Reports.AsNoTracking().Where(r => r.ReporterId == userId);
        var total = await q.CountAsync(ct);
        var rows = await q.OrderByDescending(r => r.CreatedAt).ThenByDescending(r => r.Id)
            .Skip(page.Skip).Take(page.PageSize).ToListAsync(ct);

        var items = new List<ReportDto>();
        foreach (var r in rows)
        {
            items.Add(new ReportDto(r.Id, r.TargetType, r.TargetId, r.Category, r.Reason, r.Status, r.CreatedAt, r.HandledAt,
                await TargetPreviewAsync(r.TargetType, r.TargetId, ct)));
        }
        return new PagedResult<ReportDto> { Items = items, TotalCount = total, Page = page.Page, PageSize = page.PageSize };
    }

    // ---------------- helpers ----------------

    /// <summary>Tác giả được sửa bài pending/published/flagged, và bài bị moderator từ chối (để sửa rồi gửi duyệt lại).</summary>
    private static bool CanAuthorEdit(string status, string? lastDecision) =>
        status != "removed" || lastDecision == "rejected";

    private Task<string?> LastDecisionAsync(int postId, CancellationToken ct) =>
        _db.ModerationLogs.AsNoTracking().Where(l => l.PostId == postId)
            .OrderByDescending(l => l.ReviewedAt).ThenByDescending(l => l.Id)
            .Select(l => l.Decision).FirstOrDefaultAsync(ct);

    private static (string Title, string? Content, string? MediaUrl) ValidatePost(
        string postType, string? title, string? content, string? mediaUrl)
    {
        content = string.IsNullOrWhiteSpace(content) ? null : content.Trim();
        mediaUrl = string.IsNullOrWhiteSpace(mediaUrl) ? null : mediaUrl.Trim();
        if (postType == "video" && mediaUrl is null) throw new AppException("Chọn video trước khi gửi.");
        if (content is null && mediaUrl is null) throw new AppException("Viết nội dung hoặc đính kèm ảnh/video.");
        ValidateMediaUrl(mediaUrl);
        var heading = string.IsNullOrWhiteSpace(title) ? content?.Split('\n', 2)[0].Trim() : title.Trim();
        heading ??= postType == "video" ? "Video chia sẻ" : "Ảnh chia sẻ";
        return (heading.Length > 200 ? heading[..200] : heading, content, mediaUrl);
    }

    /// <summary>mediaUrl chỉ nhận http(s) tuyệt đối hoặc đường dẫn /uploads/... (chặn javascript:, data:, ftp:...).</summary>
    private static void ValidateMediaUrl(string? mediaUrl)
    {
        if (string.IsNullOrWhiteSpace(mediaUrl)) return;
        var url = mediaUrl.Trim();
        var ok = url.StartsWith("/uploads/", StringComparison.Ordinal) ||
                 (Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp) &&
                  string.IsNullOrEmpty(uri.UserInfo));
        if (!ok) throw new AppException("mediaUrl phải là liên kết http(s) hợp lệ hoặc file đã tải lên.", 400, "INVALID_MEDIA_URL");
    }

    /// <summary>
    /// Ghi kết quả sàng lọc tự động (ModerationLog, decision = pending, ReviewedBy = null) và báo cho admin/moderator có bài chờ duyệt.
    /// Không bao giờ tự đăng bài (LI-03). Lỗi ở bước này không làm hỏng việc gửi bài.
    /// </summary>
    private async Task QueueForReviewAsync(Post post, bool isResubmit, CancellationToken ct)
    {
        try
        {
            var score = ContentPreScreen.Score(post.Title, post.Content, post.MediaUrl);
            _db.ModerationLogs.Add(new ModerationLog
            {
                PostId = post.Id,
                ReviewedBy = null,
                AiLabel = score.Label,
                AiConfidence = score.Confidence,
                RiskLevel = score.RiskLevel,
                Decision = "pending",
                Reason = score.Note,
                ReviewedAt = DateTime.UtcNow,
            });

            var staffIds = await _db.Users
                .Where(u => (u.Role == AppRoles.Admin || u.Role == AppRoles.Moderator) && u.Status == "active" && u.Id != post.UserId)
                .Select(u => u.Id).ToListAsync(ct);
            var verb = isResubmit ? "được sửa và gửi lại" : "mới chờ duyệt";
            foreach (var id in staffIds)
                Notifier.Queue(_db, id, NotificationTypes.System, $"Bài viết {verb}: {Notifier.Quote(post.Title)} (rủi ro {score.RiskLevel}).");
            await _db.SaveChangesAsync(ct);
        }
        catch (Exception) when (!ct.IsCancellationRequested)
        {
            // Bài đã lưu ở trạng thái pending; moderator vẫn thấy trong hàng đợi.
        }
    }

    private async Task EnsureRecipeAttachableAsync(int? recipeId, CancellationToken ct)
    {
        if (recipeId is int rid && !await _db.Recipes.FromApprovedCatalog().AnyAsync(r => r.Id == rid, ct))
            throw AppException.NotFound("Công thức");
    }

    private async Task<Post> EnsurePublishedAsync(int postId, CancellationToken ct)
    {
        var post = await _db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == postId, ct)
                   ?? throw AppException.NotFound("Bài viết");
        if (post.Status != "published") throw new AppException("Bài viết chưa được duyệt nên chưa thể bình luận/vote.");
        return post;
    }

    private async Task<string?> TargetPreviewAsync(string type, int id, CancellationToken ct)
    {
        var text = type switch
        {
            "post" => await _db.Posts.Where(p => p.Id == id).Select(p => p.Title).FirstOrDefaultAsync(ct),
            "comment" => await _db.Comments.Where(c => c.Id == id).Select(c => c.Content).FirstOrDefaultAsync(ct),
            "recipe" => await _db.Recipes.Where(r => r.Id == id).Select(r => r.Title).FirstOrDefaultAsync(ct),
            _ => null
        };
        return text is { Length: > 120 } ? text[..120] + "…" : text;
    }

    private static readonly Regex Whitespace = new(@"\s+", RegexOptions.Compiled);
    private static readonly Regex MarkdownNoise = new(@"[#>*_`\[\]!]|\(https?://[^)]*\)|<[^>]+>", RegexOptions.Compiled);

    /// <summary>Đoạn trích ~200 ký tự: bỏ thẻ HTML/ký hiệu markdown, gộp khoảng trắng, cắt ở ranh giới từ.</summary>
    public static string? MakeExcerpt(string? content)
    {
        if (string.IsNullOrWhiteSpace(content)) return null;
        var text = Whitespace.Replace(MarkdownNoise.Replace(content, " "), " ").Trim();
        if (text.Length <= ExcerptLength) return text;
        var cut = text.LastIndexOf(' ', ExcerptLength);
        return text[..(cut > ExcerptLength / 2 ? cut : ExcerptLength)].TrimEnd(',', '.', ';', ':') + "…";
    }

    private async Task<PagedResult<PostSummaryDto>> PageAsync(IQueryable<Post> q, int? viewerId, bool includeModeration,
        PageQuery page, CancellationToken ct)
    {
        var vid = viewerId ?? 0;
        var attachable = _db.Recipes.FromApprovedCatalog();
        var total = await q.CountAsync(ct);
        var rows = await q.Skip(page.Skip).Take(page.PageSize)
            .Select(p => new
            {
                p.Id, p.UserId, p.PostType, p.Title, p.MediaUrl, p.RecipeId, p.Status, p.CreatedAt, p.UpdatedAt,
                AuthorName = p.User != null ? p.User.DisplayName : "",
                ContentHead = p.Content == null ? null : (p.Content.Length > 600 ? p.Content.Substring(0, 600) : p.Content),
                Score = p.Votes.Sum(v => (int)v.Value),
                LikeCount = p.Votes.Count(v => v.Value == 1),
                RecipeTitle = attachable.Where(r => r.Id == p.RecipeId).Select(r => r.Title).FirstOrDefault(),
                CommentCount = p.Comments.Count(c => c.Status == "visible"),
                MyVote = p.Votes.Where(v => v.UserId == vid).Select(v => (int)v.Value).FirstOrDefault(),
                Moderation = p.ModerationLogs.OrderByDescending(l => l.ReviewedAt).ThenByDescending(l => l.Id)
                    .Select(l => new { l.Decision, l.Reason, l.ReviewedAt }).FirstOrDefault(),
            })
            .ToListAsync(ct);

        var items = rows.Select(p =>
        {
            var isAuthor = vid != 0 && p.UserId == vid;
            return new PostSummaryDto(p.Id, p.PostType, p.Title, p.MediaUrl, p.AuthorName, p.RecipeId, p.Status, p.Score,
                p.CommentCount, p.MyVote, p.CreatedAt,
                AuthorId: p.UserId,
                Excerpt: MakeExcerpt(p.ContentHead),
                UpdatedAt: p.UpdatedAt,
                CanEdit: isAuthor && CanAuthorEdit(p.Status, p.Moderation?.Decision),
                CanDelete: isAuthor && p.Status != "removed",
                Moderation: includeModeration && isAuthor && p.Moderation is not null && p.Moderation.Decision != "pending"
                    ? new PostModerationDto(p.Moderation.Decision, p.Moderation.Reason, p.Moderation.ReviewedAt)
                    : null, LikeCount: p.LikeCount, RecipeTitle: p.RecipeTitle);
        }).ToList();

        return new PagedResult<PostSummaryDto> { Items = items, TotalCount = total, Page = page.Page, PageSize = page.PageSize };
    }
}
