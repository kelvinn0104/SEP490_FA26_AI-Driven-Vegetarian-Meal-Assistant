using Microsoft.EntityFrameworkCore;
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
    Task DeletePostAsync(int userId, bool isStaff, int postId, CancellationToken ct = default);
    Task<PostCommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default);
    Task DeleteCommentAsync(int userId, bool isStaff, int commentId, CancellationToken ct = default);
    Task<int> VoteAsync(int userId, int postId, int value, CancellationToken ct = default);
    Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default);
}

/// <summary>
/// Bài viết cộng đồng (blog/video), bình luận, vote và báo cáo vi phạm.
/// Bài mới ở trạng thái "pending" → được duyệt qua /api/Moderation; chỉ bài "published" mới hiện công khai, comment và vote được.
/// Xóa bài/bình luận là xóa mềm (status = removed) để giữ lịch sử kiểm duyệt.
/// </summary>
public class CommunityService : ICommunityService
{
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
            ? q.OrderByDescending(p => p.Votes.Sum(v => (int)v.Value)).ThenByDescending(p => p.CreatedAt)
            : q.OrderByDescending(p => p.CreatedAt);

        return await PageAsync(q, viewerId, page, ct);
    }

    public Task<PagedResult<PostSummaryDto>> ListMineAsync(int userId, PageQuery page, CancellationToken ct = default) =>
        PageAsync(_db.Posts.AsNoTracking()
            .Where(p => p.UserId == userId && p.Status != "removed")
            .OrderByDescending(p => p.CreatedAt), userId, page, ct);

    public async Task<PostDetailDto> GetAsync(int? viewerId, bool viewerIsStaff, int postId, CancellationToken ct = default)
    {
        var vid = viewerId ?? 0;
        var p = await _db.Posts.AsNoTracking()
            .Where(x => x.Id == postId)
            .Select(x => new
            {
                x.Id, x.UserId, x.PostType, x.Title, x.MediaUrl, x.RecipeId, x.Status, x.CreatedAt, x.Content, x.VideoSummary,
                AuthorName = x.User != null ? x.User.DisplayName : "",
                RecipeTitle = x.Recipe != null ? x.Recipe.Title : null,
                Score = x.Votes.Sum(v => (int)v.Value),
                MyVote = x.Votes.Where(v => v.UserId == vid).Select(v => (int)v.Value).FirstOrDefault(),
            })
            .FirstOrDefaultAsync(ct);

        // Bài chưa duyệt / đã gỡ: chỉ tác giả hoặc admin/mod xem được
        if (p is null || (p.Status != "published" && p.UserId != vid && !viewerIsStaff) || (p.Status == "removed" && !viewerIsStaff))
            throw AppException.NotFound("Bài viết");

        var comments = await _db.Comments.AsNoTracking()
            .Where(c => c.PostId == postId && c.Status == "visible")
            .OrderBy(c => c.CreatedAt)
            .Select(c => new PostCommentDto(c.Id, c.UserId, c.User != null ? c.User.DisplayName : "", c.Content, c.CreatedAt))
            .ToListAsync(ct);

        return new PostDetailDto(p.Id, p.PostType, p.Title, p.MediaUrl, p.AuthorName, p.RecipeId, p.Status, p.Score,
            comments.Count, p.MyVote, p.CreatedAt, p.Content, p.VideoSummary, p.RecipeTitle, comments);
    }

    public async Task<PostDetailDto> CreateAsync(int userId, CreatePostRequest req, CancellationToken ct = default)
    {
        var title = req.Title.Trim();
        if (title.Length == 0) throw new AppException("Tiêu đề không được để trống.");
        if (req.PostType == "video" && string.IsNullOrWhiteSpace(req.MediaUrl))
            throw new AppException("Bài video bắt buộc có mediaUrl.");
        if (req.PostType == "blog" && string.IsNullOrWhiteSpace(req.Content))
            throw new AppException("Bài blog cần có nội dung.");
        if (req.RecipeId is int rid && !await _db.Recipes.AnyAsync(r => r.Id == rid && r.Status == "published", ct))
            throw AppException.NotFound("Công thức");

        var post = new Post
        {
            UserId = userId,
            PostType = req.PostType,
            Title = title,
            Content = req.Content,
            MediaUrl = string.IsNullOrWhiteSpace(req.MediaUrl) ? null : req.MediaUrl.Trim(),
            RecipeId = req.RecipeId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
        };
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(ct);
        return await GetAsync(userId, false, post.Id, ct);
    }

    public async Task DeletePostAsync(int userId, bool isStaff, int postId, CancellationToken ct = default)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.Status != "removed", ct)
                   ?? throw AppException.NotFound("Bài viết");
        if (post.UserId != userId && !isStaff) throw AppException.Forbidden();
        post.Status = "removed";
        await _db.SaveChangesAsync(ct);
    }

    public async Task<PostCommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default)
    {
        var text = content.Trim();
        if (text.Length == 0) throw new AppException("Nội dung bình luận không được để trống.");
        await EnsurePublishedAsync(postId, ct);

        var c = new Comment { PostId = postId, UserId = userId, Content = text, Status = "visible", CreatedAt = DateTime.UtcNow };
        _db.Comments.Add(c);
        await _db.SaveChangesAsync(ct);

        var author = await _db.Users.Where(u => u.Id == userId).Select(u => u.DisplayName).FirstOrDefaultAsync(ct);
        return new PostCommentDto(c.Id, userId, author ?? "", c.Content, c.CreatedAt);
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
        await EnsurePublishedAsync(postId, ct);

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

        return await _db.PostVotes.Where(v => v.PostId == postId).SumAsync(v => (int)v.Value, ct);
    }

    public async Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default)
    {
        var exists = req.TargetType switch
        {
            "post" => await _db.Posts.AnyAsync(p => p.Id == req.TargetId && p.Status != "removed", ct),
            "comment" => await _db.Comments.AnyAsync(c => c.Id == req.TargetId && c.Status != "removed", ct),
            "recipe" => await _db.Recipes.AnyAsync(r => r.Id == req.TargetId, ct),
            _ => false,
        };
        if (!exists) throw AppException.NotFound("Nội dung bị báo cáo");

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
        return new ReportDto(report.Id, report.TargetType, report.TargetId, report.Category, report.Reason, report.Status, report.CreatedAt);
    }

    // ---------------- helpers ----------------

    private async Task EnsurePublishedAsync(int postId, CancellationToken ct)
    {
        var status = await _db.Posts.Where(p => p.Id == postId).Select(p => p.Status).FirstOrDefaultAsync(ct)
                     ?? throw AppException.NotFound("Bài viết");
        if (status != "published") throw new AppException("Bài viết chưa được duyệt nên chưa thể bình luận/vote.");
    }

    private static async Task<PagedResult<PostSummaryDto>> PageAsync(IQueryable<Post> q, int? viewerId, PageQuery page, CancellationToken ct)
    {
        var vid = viewerId ?? 0;
        var total = await q.CountAsync(ct);
        var items = await q.Skip(page.Skip).Take(page.PageSize)
            .Select(p => new PostSummaryDto(
                p.Id, p.PostType, p.Title, p.MediaUrl,
                p.User != null ? p.User.DisplayName : "",
                p.RecipeId, p.Status,
                p.Votes.Sum(v => (int)v.Value),
                p.Comments.Count(c => c.Status == "visible"),
                p.Votes.Where(v => v.UserId == vid).Select(v => (int)v.Value).FirstOrDefault(),
                p.CreatedAt))
            .ToListAsync(ct);
        return new PagedResult<PostSummaryDto> { Items = items, TotalCount = total, Page = page.Page, PageSize = page.PageSize };
    }
}
