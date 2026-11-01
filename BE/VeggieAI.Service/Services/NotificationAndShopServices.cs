using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services;

public interface INotificationService
{
    Task<PagedResult<NotificationDto>> GetAsync(int userId, bool unreadOnly, PageQuery page, CancellationToken ct = default);
    Task<int> GetUnreadCountAsync(int userId, CancellationToken ct = default);
    Task MarkAsReadAsync(int userId, int notificationId, CancellationToken ct = default);
    Task<int> MarkAllAsReadAsync(int userId, CancellationToken ct = default);
}

/// <summary>Thông báo hệ thống của người dùng (bảng Notification).</summary>
public class NotificationService : INotificationService
{
    private readonly VeggieAIDbContext _db;

    public NotificationService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<NotificationDto>> GetAsync(int userId, bool unreadOnly, PageQuery page, CancellationToken ct = default)
    {
        var q = _db.Notifications.AsNoTracking().Where(n => n.UserId == userId);
        if (unreadOnly) q = q.Where(n => !n.IsRead);

        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(n => n.CreatedAt)
            .Skip(page.Skip).Take(page.PageSize)
            .Select(n => new NotificationDto(n.Id, n.Type, n.Content, n.IsRead, n.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<NotificationDto> { Items = items, TotalCount = total, Page = page.Page, PageSize = page.PageSize };
    }

    public Task<int> GetUnreadCountAsync(int userId, CancellationToken ct = default) =>
        _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead, ct);

    public async Task MarkAsReadAsync(int userId, int notificationId, CancellationToken ct = default)
    {
        var n = await _db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId, ct)
            ?? throw AppException.NotFound("Thông báo");
        if (n.IsRead) return;
        n.IsRead = true;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<int> MarkAllAsReadAsync(int userId, CancellationToken ct = default)
    {
        // Không dùng ExecuteUpdateAsync vì InMemory provider (chế độ dự phòng) không hỗ trợ
        var unread = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync(ct);
        foreach (var n in unread) n.IsRead = true;
        if (unread.Count > 0) await _db.SaveChangesAsync(ct);
        return unread.Count;
    }
}

public interface IVeganShopService
{
    Task<IReadOnlyList<VeganShopDto>> SearchAsync(double? lat, double? lng, double? radiusKm, string? keyword, int take, CancellationToken ct = default);
}

/// <summary>Tìm quán chay theo từ khóa và/hoặc vị trí (khoảng cách Haversine).</summary>
public class VeganShopService : IVeganShopService
{
    private const double DefaultRadiusKm = 10;
    private const double MaxRadiusKm = 100;

    private readonly VeggieAIDbContext _db;

    public VeganShopService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<VeganShopDto>> SearchAsync(double? lat, double? lng, double? radiusKm, string? keyword, int take, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 100);
        var q = _db.VeganShops.AsNoTracking().Where(s => s.IsActive);

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var kw = keyword.Trim().ToLower();
            q = q.Where(s => s.Name.ToLower().Contains(kw)
                             || s.Address.ToLower().Contains(kw)
                             || (s.Tags != null && s.Tags.ToLower().Contains(kw)));
        }

        var shops = await q.ToListAsync(ct);
        var hasLocation = lat is >= -90 and <= 90 && lng is >= -180 and <= 180;
        var radius = Math.Clamp(radiusKm ?? DefaultRadiusKm, 0.1, MaxRadiusKm);

        var result = shops
            .Select(s => new
            {
                Shop = s,
                Distance = hasLocation ? HaversineKm(lat!.Value, lng!.Value, (double)s.Latitude, (double)s.Longitude) : (double?)null
            })
            .Where(x => !hasLocation || x.Distance <= radius)
            .OrderBy(x => x.Distance ?? 0).ThenBy(x => x.Shop.Name)
            .Take(take)
            .Select(x => new VeganShopDto(
                x.Shop.Id, x.Shop.Name, x.Shop.Address, x.Shop.Latitude, x.Shop.Longitude, x.Shop.Phone,
                SplitTags(x.Shop.Tags),
                x.Distance is double d ? Math.Round(d, 2) : null))
            .ToList();

        return result;
    }

    private static IReadOnlyList<string> SplitTags(string? tags) =>
        string.IsNullOrWhiteSpace(tags)
            ? Array.Empty<string>()
            : tags.Split(new[] { ',', ';', '|' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371.0;
        static double Rad(double deg) => deg * Math.PI / 180.0;
        var dLat = Rad(lat2 - lat1);
        var dLon = Rad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
                + Math.Cos(Rad(lat1)) * Math.Cos(Rad(lat2)) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return R * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    }
}
