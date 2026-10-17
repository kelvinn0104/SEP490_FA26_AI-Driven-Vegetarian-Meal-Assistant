using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Constants;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly VeggieAiDbContext _db;
    public NotificationService(VeggieAiDbContext db) => _db = db;

    public async Task<PagedResult<NotificationDto>> GetAsync(int userId, bool? unreadOnly, PageQuery page, CancellationToken ct = default)
    {
        await EnsureProfileReminderAsync(userId, ct);
        var q = _db.Notifications.AsNoTracking().Where(n => n.UserId == userId && (unreadOnly != true || !n.IsRead));
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(n => n.CreatedAt).Skip(page.Skip).Take(page.PageSize)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Content, n.IsRead, n.CreatedAt)).ToListAsync(ct);
        return new PagedResult<NotificationDto> { Items = items, Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }

    public Task<int> CountUnreadAsync(int userId, CancellationToken ct = default) =>
        _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);

    public async Task MarkReadAsync(int userId, int id, CancellationToken ct = default)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct)
                ?? throw AppException.NotFound("Thông báo");
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public Task MarkAllReadAsync(int userId, CancellationToken ct = default) =>
        _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

    public async Task CreateAsync(int userId, string type, string content, CancellationToken ct = default)
    {
        _db.Notifications.Add(new Notification { UserId = userId, Type = type, Content = content });
        await _db.SaveChangesAsync(ct);
    }

    /// <summary>"profile.reminder_days" setting: remind the user to update weight/height every N days.</summary>
    private async Task EnsureProfileReminderAsync(int userId, CancellationToken ct)
    {
        var updatedAt = await _db.HealthProfiles.Where(h => h.UserId == userId).Select(h => (DateTime?)h.UpdatedAt).FirstOrDefaultAsync(ct);
        if (updatedAt is null) return;
        var setting = await _db.SystemSettings.Where(s => s.Key == "profile.reminder_days").Select(s => s.Value).FirstOrDefaultAsync(ct);
        var days = int.TryParse(setting, out var d) ? d : 30;
        if (updatedAt > DateTime.UtcNow.AddDays(-days)) return;
        var already = await _db.Notifications.AnyAsync(n => n.UserId == userId && n.Type == NotificationTypes.ProfileReminder && n.CreatedAt > updatedAt, ct);
        if (already) return;
        await CreateAsync(userId, NotificationTypes.ProfileReminder,
            $"Đã hơn {days} ngày bạn chưa cập nhật hồ sơ sức khỏe. Cập nhật cân nặng để VeggieAI tính lại nhu cầu dinh dưỡng chính xác hơn.", ct);
    }
}

public class VeganShopService : IVeganShopService
{
    private readonly VeggieAiDbContext _db;
    public VeganShopService(VeggieAiDbContext db) => _db = db;

    public async Task<IReadOnlyList<VeganShopDto>> SearchAsync(decimal? lat, decimal? lng, double radiusKm, string? keyword, CancellationToken ct = default)
    {
        var q = _db.VeganShops.AsNoTracking().Where(s => s.IsActive);
        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = $"%{keyword.Trim()}%";
            q = q.Where(s => EF.Functions.ILike(s.Name, k) || (s.Tags != null && EF.Functions.ILike(s.Tags, k)) || EF.Functions.ILike(s.Address, k));
        }
        var shops = await q.Take(500).ToListAsync(ct);
        var result = shops.Select(s => new VeganShopDto(s.Id, s.Name, s.Address, s.Latitude, s.Longitude, s.Phone, s.Tags,
            lat is null || lng is null ? null : Math.Round(Haversine((double)lat, (double)lng, (double)s.Latitude, (double)s.Longitude), 2)));
        if (lat is not null && lng is not null)
            result = result.Where(s => s.DistanceKm <= radiusKm).OrderBy(s => s.DistanceKm);
        return result.Take(50).ToList();
    }

    private static double Haversine(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371;
        double ToRad(double x) => x * Math.PI / 180;
        var dLat = ToRad(lat2 - lat1); var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) + Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}

public class CommunityService : ICommunityService
{
    private readonly VeggieAiDbContext _db;
    public CommunityService(VeggieAiDbContext db) => _db = db;

    public async Task<PagedResult<PostSummaryDto>> GetPostsAsync(PostQuery q, int? userId, CancellationToken ct = default)
    {
        var query = _db.Posts.AsNoTracking().Where(p => p.Status == PostStatuses.Published);
        if (!string.IsNullOrWhiteSpace(q.Keyword))
        {
            var k = $"%{q.Keyword.Trim()}%";
            query = query.Where(p => EF.Functions.ILike(p.Title, k) || (p.Content != null && EF.Functions.ILike(p.Content, k)));
        }
        if (q.PostType is not null) query = query.Where(p => p.PostType == q.PostType);
        query = q.Sort == "top"
            ? query.OrderByDescending(p => p.PostVotes.Sum(v => (int)v.Value)).ThenByDescending(p => p.CreatedAt)
            : query.OrderByDescending(p => p.CreatedAt);
        return await PageAsync(query, q, userId, ct);
    }

    public Task<PagedResult<PostSummaryDto>> GetMyPostsAsync(int userId, PageQuery page, CancellationToken ct = default) =>
        PageAsync(_db.Posts.AsNoTracking().Where(p => p.UserId == userId && p.Status != PostStatuses.Removed)
            .OrderByDescending(p => p.CreatedAt), page, userId, ct);

    public async Task<PostDetailDto> GetPostAsync(int id, int? userId, CancellationToken ct = default)
    {
        var p = await _db.Posts.AsNoTracking().Include(x => x.User).Include(x => x.Recipe)
            .FirstOrDefaultAsync(x => x.Id == id && (x.Status == PostStatuses.Published || x.UserId == userId), ct)
            ?? throw AppException.NotFound("Bài viết");
        var score = await _db.PostVotes.Where(v => v.PostId == id).SumAsync(v => (int)v.Value, ct);
        var myVote = userId is null ? (short)0
            : await _db.PostVotes.Where(v => v.PostId == id && v.UserId == userId).Select(v => v.Value).FirstOrDefaultAsync(ct);
        var comments = await _db.Comments.AsNoTracking().Where(c => c.PostId == id && c.Status == "visible")
            .OrderBy(c => c.CreatedAt).Select(c => new CommentDto(c.Id, c.UserId, c.User.DisplayName, c.Content, c.CreatedAt)).ToListAsync(ct);
        return new PostDetailDto(p.Id, p.PostType, p.Title, p.Content, p.MediaUrl, p.VideoSummary, p.User.DisplayName,
            p.RecipeId, p.Recipe?.Title, p.Status, score, myVote, p.CreatedAt, comments);
    }

    public async Task<PostDetailDto> CreatePostAsync(int userId, CreatePostRequest req, CancellationToken ct = default)
    {
        if (req.PostType == "video" && string.IsNullOrWhiteSpace(req.MediaUrl))
            throw new AppException("Bài đăng video cần có MediaUrl.");
        if (req.RecipeId is not null && !await _db.Recipes.AnyAsync(r => r.Id == req.RecipeId, ct))
            throw AppException.NotFound("Công thức");
        // Status = pending: goes to the AI moderation / admin review queue (workflow 7)
        var post = new Post { UserId = userId, PostType = req.PostType, Title = req.Title.Trim(), Content = req.Content,
            MediaUrl = req.MediaUrl, RecipeId = req.RecipeId, Status = PostStatuses.Pending };
        _db.Posts.Add(post);
        await _db.SaveChangesAsync(ct);
        return await GetPostAsync(post.Id, userId, ct);
    }

    public async Task DeletePostAsync(int userId, int postId, CancellationToken ct = default)
    {
        var p = await _db.Posts.FirstOrDefaultAsync(x => x.Id == postId && x.UserId == userId, ct) ?? throw AppException.NotFound("Bài viết");
        p.Status = PostStatuses.Removed;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<CommentDto> AddCommentAsync(int userId, int postId, string content, CancellationToken ct = default)
    {
        if (!await _db.Posts.AnyAsync(p => p.Id == postId && p.Status == PostStatuses.Published, ct)) throw AppException.NotFound("Bài viết");
        var c = new Comment { PostId = postId, UserId = userId, Content = content.Trim(), Status = "visible" };
        _db.Comments.Add(c);
        await _db.SaveChangesAsync(ct);
        var name = await _db.Users.Where(u => u.Id == userId).Select(u => u.DisplayName).FirstAsync(ct);
        return new CommentDto(c.Id, userId, name, c.Content, c.CreatedAt);
    }

    public async Task DeleteCommentAsync(int userId, int commentId, CancellationToken ct = default)
    {
        var c = await _db.Comments.FirstOrDefaultAsync(x => x.Id == commentId && x.UserId == userId, ct) ?? throw AppException.NotFound("Bình luận");
        c.Status = "removed";
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> VoteAsync(int userId, int postId, short value, CancellationToken ct = default)
    {
        if (!await _db.Posts.AnyAsync(p => p.Id == postId && p.Status == PostStatuses.Published, ct)) throw AppException.NotFound("Bài viết");
        var vote = await _db.PostVotes.FindAsync(new object[] { postId, userId }, ct);
        if (value == 0) { if (vote is not null) _db.PostVotes.Remove(vote); }
        else if (vote is null) _db.PostVotes.Add(new PostVote { PostId = postId, UserId = userId, Value = value });
        else vote.Value = value;
        await _db.SaveChangesAsync(ct);
        return await _db.PostVotes.Where(v => v.PostId == postId).SumAsync(v => (int)v.Value, ct);
    }

    public async Task<ReportDto> ReportAsync(int userId, CreateReportRequest req, CancellationToken ct = default)
    {
        var exists = req.TargetType switch
        {
            "post" => await _db.Posts.AnyAsync(p => p.Id == req.TargetId, ct),
            "comment" => await _db.Comments.AnyAsync(c => c.Id == req.TargetId, ct),
            _ => await _db.Recipes.AnyAsync(r => r.Id == req.TargetId, ct),
        };
        if (!exists) throw AppException.NotFound("Đối tượng cần báo cáo");
        if (await _db.Reports.AnyAsync(r => r.ReporterId == userId && r.TargetType == req.TargetType && r.TargetId == req.TargetId && r.Status == "open", ct))
            throw AppException.Conflict("Bạn đã báo cáo nội dung này và đang chờ xử lý.");
        var r = new Report { ReporterId = userId, TargetType = req.TargetType, TargetId = req.TargetId, Category = req.Category, Reason = req.Reason, Status = "open" };
        _db.Reports.Add(r);
        await _db.SaveChangesAsync(ct);
        return new ReportDto(r.Id, r.TargetType, r.TargetId, r.Category, r.Reason, r.Status, r.CreatedAt);
    }

    private static async Task<PagedResult<PostSummaryDto>> PageAsync(IQueryable<Post> q, PageQuery page, int? userId, CancellationToken ct)
    {
        var total = await q.CountAsync(ct);
        var items = await q.Skip(page.Skip).Take(page.PageSize).Select(p => new PostSummaryDto(p.Id, p.PostType, p.Title, p.MediaUrl,
            p.User.DisplayName, p.RecipeId, p.Status, p.PostVotes.Sum(v => (int)v.Value),
            p.Comments.Count(c => c.Status == "visible"),
            userId == null ? (short)0 : p.PostVotes.Where(v => v.UserId == userId).Select(v => v.Value).FirstOrDefault(),
            p.CreatedAt)).ToListAsync(ct);
        return new PagedResult<PostSummaryDto> { Items = items, Page = page.Page, PageSize = page.PageSize, TotalCount = total };
    }
}
