using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Constants;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IBroadcastNotificationService
{
    Task<List<BroadcastNotificationDto>> GetBroadcastsAsync(string? status = null, string? type = null, string? search = null);
    Task<BroadcastStatsDto> GetStatsAsync();
    Task<BroadcastNotificationDto> CreateBroadcastAsync(CreateBroadcastNotificationRequest request, int creatorId);
    Task<BroadcastNotificationDto?> UpdateBroadcastAsync(int id, UpdateBroadcastNotificationRequest request, int modId);
    Task<bool> DeleteBroadcastAsync(int id, int modId);
    Task<bool> SendNowAsync(int id, int modId);
    Task<List<UserNotificationDto>> GetUserNotificationsAsync(int userId);
}

public class BroadcastNotificationService : IBroadcastNotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public BroadcastNotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<BroadcastNotificationDto>> GetBroadcastsAsync(string? status = null, string? type = null, string? search = null)
    {
        var query = _unitOfWork.Context.BroadcastNotifications
            .Include(b => b.CreatedBy)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(b => b.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(type) && type != "all")
        {
            query = query.Where(b => b.Type.ToLower() == type.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(b => b.Title.ToLower().Contains(s) || b.Message.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return list.Select(MapToDto).ToList();
    }

    public async Task<BroadcastStatsDto> GetStatsAsync()
    {
        var list = await _unitOfWork.Context.BroadcastNotifications.ToListAsync();
        var sentList = list.Where(b => b.Status == "sent").ToList();

        return new BroadcastStatsDto
        {
            TotalSent = sentList.Count,
            ScheduledCount = list.Count(b => b.Status == "scheduled"),
            AvgOpenRate = sentList.Count > 0 ? Math.Round(sentList.Average(b => b.OpenRate), 1) : 0m,
            TotalClicks = sentList.Sum(b => b.ClickCount)
        };
    }

    private async Task<List<int>> ResolveRecipientUserIdsAsync(string targetAudience)
    {
        var activeUsersQuery = _unitOfWork.Context.Users
            .Where(u => u.Role == RoleConstants.User && u.Status == "active");

        return targetAudience switch
        {
            "challenge_participants" => await _unitOfWork.Context.ChallengeCheckins
                .Select(c => c.UserId)
                .Distinct()
                .ToListAsync(),
            "fitness" => await _unitOfWork.Context.HealthProfiles
                .Where(hp => hp.HealthGoal == "gain")
                .Select(hp => hp.UserId)
                .ToListAsync(),
            "beginners" => await activeUsersQuery
                .Where(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                .Select(u => u.Id)
                .ToListAsync(),
            _ => await activeUsersQuery.Select(u => u.Id).ToListAsync()
        };
    }

    private async Task DeliverInAppNotificationsAsync(BroadcastNotification broadcast, List<int> recipientIds)
    {
        if (recipientIds.Count == 0) return;

        var notifType = broadcast.Type == "urgent" ? "nutrition_alert" : "system";
        var notifications = recipientIds.Select(uid => new Notification
        {
            UserId = uid,
            Type = notifType,
            Content = $"{broadcast.Title}: {broadcast.Message}",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        await _unitOfWork.Context.Notifications.AddRangeAsync(notifications);
    }

    public async Task<BroadcastNotificationDto> CreateBroadcastAsync(CreateBroadcastNotificationRequest request, int creatorId)
    {
        var recipientIds = await ResolveRecipientUserIdsAsync(request.TargetAudience);
        var normalizedStatus = request.Status is "sent" or "scheduled" or "draft" ? request.Status : "draft";

        var item = new BroadcastNotification
        {
            Title = request.Title.Trim(),
            Message = request.Message.Trim(),
            Type = request.Type,
            TargetAudience = request.TargetAudience,
            Status = normalizedStatus,
            ScheduledAt = normalizedStatus == "scheduled" ? request.ScheduledAt : null,
            SentAt = normalizedStatus == "sent" ? DateTime.UtcNow : null,
            RecipientsCount = recipientIds.Count,
            OpenRate = 0m,
            ClickCount = 0,
            ActionUrl = string.IsNullOrWhiteSpace(request.ActionUrl) ? null : request.ActionUrl.Trim(),
            CreatedById = creatorId,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.BroadcastNotifications.Add(item);

        if (normalizedStatus == "sent")
        {
            await DeliverInAppNotificationsAsync(item, recipientIds);
        }

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = creatorId,
            Action = normalizedStatus == "sent" ? "Phát sóng thông báo" : "Lưu thông báo",
            Target = item.Title,
            Details = $"Đối tượng: {item.TargetAudience} ({recipientIds.Count} người nhận)",
            LogType = "moderation"
        });

        await _unitOfWork.CommitAsync();
        return MapToDto(item);
    }

    public async Task<BroadcastNotificationDto?> UpdateBroadcastAsync(int id, UpdateBroadcastNotificationRequest request, int modId)
    {
        var item = await _unitOfWork.Context.BroadcastNotifications.FindAsync(id);
        if (item == null) return null;

        var recipientIds = await ResolveRecipientUserIdsAsync(request.TargetAudience);
        var wasSent = item.Status == "sent";

        item.Title = request.Title.Trim();
        item.Message = request.Message.Trim();
        item.Type = request.Type;
        item.TargetAudience = request.TargetAudience;
        item.Status = request.Status;
        item.ScheduledAt = request.Status == "scheduled" ? request.ScheduledAt : null;
        item.RecipientsCount = recipientIds.Count;
        item.ActionUrl = string.IsNullOrWhiteSpace(request.ActionUrl) ? null : request.ActionUrl.Trim();

        if (!wasSent && request.Status == "sent")
        {
            item.SentAt = DateTime.UtcNow;
            await DeliverInAppNotificationsAsync(item, recipientIds);
        }

        await _unitOfWork.CommitAsync();
        return MapToDto(item);
    }

    public async Task<bool> DeleteBroadcastAsync(int id, int modId)
    {
        var item = await _unitOfWork.Context.BroadcastNotifications.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.BroadcastNotifications.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<bool> SendNowAsync(int id, int modId)
    {
        var item = await _unitOfWork.Context.BroadcastNotifications.FindAsync(id);
        if (item == null) return false;

        if (item.Status != "sent")
        {
            var recipientIds = await ResolveRecipientUserIdsAsync(item.TargetAudience);
            item.Status = "sent";
            item.SentAt = DateTime.UtcNow;
            item.RecipientsCount = recipientIds.Count;
            await DeliverInAppNotificationsAsync(item, recipientIds);
            await _unitOfWork.CommitAsync();
        }

        return true;
    }

    public async Task<List<UserNotificationDto>> GetUserNotificationsAsync(int userId)
    {
        var list = await _unitOfWork.Context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return list.Select(n => new UserNotificationDto
        {
            Id = n.Id,
            Type = n.Type,
            Content = n.Content,
            IsRead = n.IsRead,
            CreatedAt = n.CreatedAt.ToString("dd/MM/yyyy HH:mm")
        }).ToList();
    }

    private static BroadcastNotificationDto MapToDto(BroadcastNotification b)
    {
        return new BroadcastNotificationDto
        {
            Id = b.Id,
            Title = b.Title,
            Message = b.Message,
            Type = b.Type,
            TypeLabel = GetTypeLabel(b.Type),
            TargetAudience = b.TargetAudience,
            TargetAudienceLabel = $"{GetAudienceLabel(b.TargetAudience)} ({b.RecipientsCount} người)",
            Status = b.Status,
            ScheduledAt = b.ScheduledAt?.ToString("dd/MM/yyyy HH:mm"),
            SentAt = b.SentAt?.ToString("dd/MM/yyyy HH:mm"),
            RecipientsCount = b.RecipientsCount,
            OpenRate = b.OpenRate,
            ClickCount = b.ClickCount,
            ActionUrl = b.ActionUrl,
            CreatedAt = b.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
            CreatedByName = b.CreatedBy?.DisplayName ?? "Điều phối viên (Mod)"
        };
    }

    private static string GetTypeLabel(string type) => type switch
    {
        "tip" => "Mẹo Dinh Dưỡng Khoa Học",
        "challenge" => "Nhắc Nhở Thử Thách",
        "urgent" => "Cảnh Báo Dị Ứng & Sức Khỏe",
        "recipe" => "Công Thức Thuần Chay Mới",
        "event" => "Sự Kiện & Workshop",
        _ => "Thông Báo Chung"
    };

    private static string GetAudienceLabel(string aud) => aud switch
    {
        "all" => "Toàn bộ người dùng",
        "challenge_participants" => "Người tham gia Thử thách",
        "beginners" => "Người dùng mới (30 ngày)",
        "fitness" => "Nhóm Tăng cơ & Thể thao",
        _ => "Cộng đồng"
    };
}
