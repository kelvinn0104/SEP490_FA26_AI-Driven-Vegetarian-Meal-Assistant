using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IRewardService
{
    Task<List<EcoRewardDto>> GetRewardsAsync(string? category = null, string? status = null, string? search = null);
    Task<RewardOverviewStatsDto> GetStatsAsync();
    Task<EcoRewardDto> CreateRewardAsync(CreateEcoRewardRequest request, int modId);
    Task<EcoRewardDto?> UpdateRewardAsync(int id, UpdateEcoRewardRequest request, int modId);
    Task<bool> DeleteRewardAsync(int id, int modId);
    Task<RewardClaimDto?> CreateClaimAsync(int rewardId, CreateRewardClaimRequest request, int userId);
    Task<List<RewardClaimDto>> GetClaimsAsync(string? status = null, string? search = null);
    Task<bool> ProcessClaimAsync(int claimId, ProcessClaimRequest request, int handlerId);
}

public class RewardService : IRewardService
{
    private readonly IUnitOfWork _unitOfWork;

    public RewardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<EcoRewardDto>> GetRewardsAsync(string? category = null, string? status = null, string? search = null)
    {
        var query = _unitOfWork.Context.EcoRewards.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(r => r.Category.ToLower() == category.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(r => r.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(r => r.Title.ToLower().Contains(s) || r.Description.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return list.Select(MapToRewardDto).ToList();
    }

    public async Task<RewardOverviewStatsDto> GetStatsAsync()
    {
        var rewards = await _unitOfWork.Context.EcoRewards.ToListAsync();
        var claims = await _unitOfWork.Context.RewardClaims.ToListAsync();

        return new RewardOverviewStatsDto
        {
            TotalRewards = rewards.Count,
            AvailableRewards = rewards.Count(r => r.Status == "active" && r.StockQuantity > 0),
            TotalClaimsProcessed = claims.Count(c => c.Status == "approved" || c.Status == "delivered"),
            PendingClaimsCount = claims.Count(c => c.Status == "pending"),
            TotalKarmaPointsCirculated = claims.Where(c => c.Status != "rejected").Sum(c => c.PointsSpent)
        };
    }

    public async Task<EcoRewardDto> CreateRewardAsync(CreateEcoRewardRequest request, int modId)
    {
        var item = new EcoReward
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            PointsRequired = request.PointsRequired,
            StockQuantity = request.StockQuantity,
            ClaimedQuantity = 0,
            Category = request.Category,
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            Status = request.StockQuantity == 0 ? "out_of_stock" : request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.EcoRewards.Add(item);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = modId,
            Action = "Tạo quà đổi thưởng",
            Target = item.Title,
            Details = $"{item.PointsRequired} điểm • Tồn kho: {item.StockQuantity}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return MapToRewardDto(item);
    }

    public async Task<EcoRewardDto?> UpdateRewardAsync(int id, UpdateEcoRewardRequest request, int modId)
    {
        var item = await _unitOfWork.Context.EcoRewards.FindAsync(id);
        if (item == null) return null;

        item.Title = request.Title.Trim();
        item.Description = request.Description.Trim();
        item.PointsRequired = request.PointsRequired;
        item.StockQuantity = request.StockQuantity;
        item.Category = request.Category;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl)) item.ImageUrl = request.ImageUrl.Trim();
        item.Status = request.StockQuantity == 0 && request.Status == "active" ? "out_of_stock" : request.Status;

        await _unitOfWork.CommitAsync();
        return MapToRewardDto(item);
    }

    public async Task<bool> DeleteRewardAsync(int id, int modId)
    {
        var item = await _unitOfWork.Context.EcoRewards.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.EcoRewards.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<RewardClaimDto?> CreateClaimAsync(int rewardId, CreateRewardClaimRequest request, int userId)
    {
        var reward = await _unitOfWork.Context.EcoRewards.FindAsync(rewardId);
        if (reward == null || reward.Status != "active" || reward.StockQuantity <= 0) return null;

        var user = await _unitOfWork.Context.Users.FindAsync(userId);
        var uName = user?.DisplayName ?? "Người dùng";

        var claim = new RewardClaim
        {
            RewardId = rewardId,
            UserId = userId,
            PointsSpent = reward.PointsRequired,
            Status = "pending",
            ClaimDate = DateTime.UtcNow,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim()
        };

        await _unitOfWork.Context.RewardClaims.AddAsync(claim);
        await _unitOfWork.CommitAsync();

        return new RewardClaimDto
        {
            Id = claim.Id,
            RewardId = reward.Id,
            RewardTitle = reward.Title,
            RewardCategory = reward.Category,
            UserId = userId,
            UserName = uName,
            UserEmail = user?.Email ?? string.Empty,
            UserAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(uName)}&background=006948&color=ffffff",
            PointsSpent = claim.PointsSpent,
            Status = claim.Status,
            ClaimDate = claim.ClaimDate.ToString("dd/MM/yyyy HH:mm"),
            Notes = claim.Notes
        };
    }

    public async Task<List<RewardClaimDto>> GetClaimsAsync(string? status = null, string? search = null)
    {
        var query = _unitOfWork.Context.RewardClaims
            .Include(c => c.Reward)
            .Include(c => c.User)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(c => c.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => (c.Reward != null && c.Reward.Title.ToLower().Contains(s)) ||
                                     (c.User != null && c.User.DisplayName.ToLower().Contains(s)));
        }

        var list = await query.OrderBy(c => c.Status == "pending" ? 0 : 1)
                              .ThenByDescending(c => c.ClaimDate)
                              .ToListAsync();

        return list.Select(c =>
        {
            var uName = c.User?.DisplayName ?? "Người dùng";
            return new RewardClaimDto
            {
                Id = c.Id,
                RewardId = c.RewardId,
                RewardTitle = c.Reward?.Title ?? "Phần thưởng",
                RewardCategory = c.Reward?.Category ?? "voucher",
                UserId = c.UserId,
                UserName = uName,
                UserEmail = c.User?.Email ?? string.Empty,
                UserAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(uName)}&background=006948&color=ffffff",
                PointsSpent = c.PointsSpent,
                Status = c.Status,
                ClaimDate = c.ClaimDate.ToString("dd/MM/yyyy HH:mm"),
                HandledAt = c.HandledAt?.ToString("dd/MM/yyyy HH:mm"),
                Notes = c.Notes
            };
        }).ToList();
    }

    public async Task<bool> ProcessClaimAsync(int claimId, ProcessClaimRequest request, int handlerId)
    {
        var claim = await _unitOfWork.Context.RewardClaims
            .Include(c => c.Reward)
            .FirstOrDefaultAsync(c => c.Id == claimId);
        if (claim == null) return false;

        var prevStatus = claim.Status;
        var decision = request.Decision is "approved" or "delivered" or "rejected" ? request.Decision : "approved";

        if (prevStatus == "pending" && decision is "approved" or "delivered" && claim.Reward != null)
        {
            if (claim.Reward.StockQuantity <= 0)
            {
                throw new InvalidOperationException("Phần thưởng này đã hết tồn kho, không thể duyệt cấp quà.");
            }

            claim.Reward.ClaimedQuantity += 1;
            claim.Reward.StockQuantity -= 1;
            if (claim.Reward.StockQuantity == 0)
            {
                claim.Reward.Status = "out_of_stock";
            }
        }

        claim.Status = decision;
        claim.HandledAt = DateTime.UtcNow;
        claim.HandledById = handlerId;
        claim.Notes = request.Notes;

        await _unitOfWork.CommitAsync();
        return true;
    }

    private static EcoRewardDto MapToRewardDto(EcoReward r)
    {
        return new EcoRewardDto
        {
            Id = r.Id,
            Title = r.Title,
            Description = r.Description,
            PointsRequired = r.PointsRequired,
            StockQuantity = r.StockQuantity,
            ClaimedQuantity = r.ClaimedQuantity,
            Category = r.Category,
            CategoryLabel = GetCategoryLabel(r.Category),
            ImageUrl = r.ImageUrl,
            Status = r.Status,
            StatusLabel = r.Status == "active" ? "Đang khả dụng" : r.Status == "out_of_stock" ? "Hết quà tặng" : "Tạm dừng",
            CreatedAt = r.CreatedAt.ToString("dd/MM/yyyy")
        };
    }

    private static string GetCategoryLabel(string cat) => cat switch
    {
        "voucher" => "Voucher Nhà Hàng Chay",
        "ebook" => "Ebook Dinh Dưỡng Độc Quyền",
        "physical" => "Đồ Dùng Sinh Thái Eco",
        "seed" => "Hạt Giống Rau Hữu Cơ",
        _ => "Quà Tặng Mầm Xanh"
    };
}
