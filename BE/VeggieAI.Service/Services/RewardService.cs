using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IRewardService
{
    Task<List<EcoRewardDto>> GetRewardsAsync(string? category = null, string? status = null, string? search = null);
    Task<RewardOverviewStatsDto> GetStatsAsync();
    Task<EcoRewardDto> CreateRewardAsync(CreateEcoRewardRequest request);
    Task<EcoRewardDto?> UpdateRewardAsync(int id, UpdateEcoRewardRequest request);
    Task<bool> DeleteRewardAsync(int id);
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
        await EnsureSeedRewardsAsync();

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
        await EnsureSeedRewardsAsync();

        var rewards = await _unitOfWork.Context.EcoRewards.ToListAsync();
        var claims = await _unitOfWork.Context.RewardClaims.ToListAsync();

        return new RewardOverviewStatsDto
        {
            TotalRewards = rewards.Count,
            AvailableRewards = rewards.Count(r => r.Status == "active"),
            TotalClaimsProcessed = claims.Count(c => c.Status == "approved" || c.Status == "delivered"),
            PendingClaimsCount = claims.Count(c => c.Status == "pending"),
            TotalKarmaPointsCirculated = claims.Sum(c => c.PointsSpent)
        };
    }

    public async Task<EcoRewardDto> CreateRewardAsync(CreateEcoRewardRequest request)
    {
        var item = new EcoReward
        {
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            PointsRequired = request.PointsRequired,
            StockQuantity = request.StockQuantity,
            ClaimedQuantity = 0,
            Category = request.Category,
            ImageUrl = request.ImageUrl,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow
        };

        _unitOfWork.Context.EcoRewards.Add(item);
        await _unitOfWork.CommitAsync();

        return MapToRewardDto(item);
    }

    public async Task<EcoRewardDto?> UpdateRewardAsync(int id, UpdateEcoRewardRequest request)
    {
        var item = await _unitOfWork.Context.EcoRewards.FindAsync(id);
        if (item == null) return null;

        item.Title = request.Title.Trim();
        item.Description = request.Description.Trim();
        item.PointsRequired = request.PointsRequired;
        item.StockQuantity = request.StockQuantity;
        item.Category = request.Category;
        if (!string.IsNullOrWhiteSpace(request.ImageUrl)) item.ImageUrl = request.ImageUrl;
        item.Status = request.Status;

        await _unitOfWork.CommitAsync();
        return MapToRewardDto(item);
    }

    public async Task<bool> DeleteRewardAsync(int id)
    {
        var item = await _unitOfWork.Context.EcoRewards.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.EcoRewards.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<List<RewardClaimDto>> GetClaimsAsync(string? status = null, string? search = null)
    {
        await EnsureSeedRewardsAsync();

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

        var list = await query.OrderByDescending(c => c.ClaimDate).ToListAsync();
        return list.Select(c => new RewardClaimDto
        {
            Id = c.Id,
            RewardId = c.RewardId,
            RewardTitle = c.Reward?.Title ?? "Phần thưởng",
            RewardCategory = c.Reward?.Category ?? "voucher",
            UserId = c.UserId,
            UserName = c.User?.DisplayName ?? "Hội viên VeggieAI",
            UserEmail = c.User?.Email ?? "member@veggie.vn",
            UserAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
            PointsSpent = c.PointsSpent,
            Status = c.Status,
            ClaimDate = c.ClaimDate.ToString("dd/MM/yyyy HH:mm"),
            HandledAt = c.HandledAt?.ToString("dd/MM/yyyy HH:mm"),
            Notes = c.Notes
        }).ToList();
    }

    public async Task<bool> ProcessClaimAsync(int claimId, ProcessClaimRequest request, int handlerId)
    {
        var claim = await _unitOfWork.Context.RewardClaims.Include(c => c.Reward).FirstOrDefaultAsync(c => c.Id == claimId);
        if (claim == null) return false;

        claim.Status = request.Decision; // approved, delivered, rejected
        claim.HandledAt = DateTime.UtcNow;
        claim.HandledById = handlerId;
        claim.Notes = request.Notes;

        if (request.Decision == "approved" && claim.Reward != null)
        {
            claim.Reward.ClaimedQuantity += 1;
            if (claim.Reward.StockQuantity > 0)
            {
                claim.Reward.StockQuantity -= 1;
                if (claim.Reward.StockQuantity == 0)
                {
                    claim.Reward.Status = "out_of_stock";
                }
            }
        }

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

    private async Task EnsureSeedRewardsAsync()
    {
        if (await _unitOfWork.Context.EcoRewards.AnyAsync()) return;

        var rewards = new List<EcoReward>
        {
            new()
            {
                Title = "Ebook 50 Công Thức Thuần Chay Dinh Dưỡng Khoa Học (PDF)",
                Description = "Cẩm nang dinh dưỡng y khoa biên soạn bởi Chuyên gia VeggieAI. Đầy đủ bảng tính Macro, mẹo kết hợp vi chất sắt non-heme và B12.",
                PointsRequired = 250,
                StockQuantity = 999,
                ClaimedQuantity = 142,
                Category = "ebook",
                ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
                Status = "active"
            },
            new()
            {
                Title = "Voucher Giảm 20% Toàn Menu Tại Hệ Thống Chay An Lạc",
                Description = "Áp dụng cho hóa đơn từ 200k tại tất cả các chi nhánh Hà Nội & TP.HCM. Không giới hạn thời gian trong tuần.",
                PointsRequired = 500,
                StockQuantity = 45,
                ClaimedQuantity = 55,
                Category = "voucher",
                ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
                Status = "active"
            },
            new()
            {
                Title = "Túi Vải Canvas Sống Xanh VeggieAI Eco-Tote",
                Description = "Túi canvas 100% sợi cotton hữu cơ tự nhiên, độ bền cao, bảo vệ môi trường khi đi chợ mua sắm rau củ quả.",
                PointsRequired = 800,
                StockQuantity = 28,
                ClaimedQuantity = 22,
                Category = "physical",
                ImageUrl = "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
                Status = "active"
            },
            new()
            {
                Title = "Combo 3 Gói Hạt Giống Rau Mầm Cải Xoăn Kale & Đậu Hà Lan",
                Description = "Hạt giống hữu cơ đạt chuẩn tự trồng tại nhà trong 5-7 ngày. Siêu giàu chất xơ, vitamin C và canxi thực vật.",
                PointsRequired = 350,
                StockQuantity = 60,
                ClaimedQuantity = 40,
                Category = "seed",
                ImageUrl = "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80",
                Status = "active"
            }
        };

        _unitOfWork.Context.EcoRewards.AddRange(rewards);
        await _unitOfWork.CommitAsync();

        // Seed 3 sample claims
        var user = await _unitOfWork.Context.Users.FirstOrDefaultAsync();
        var userId = user?.Id ?? 1;

        var claims = new List<RewardClaim>
        {
            new()
            {
                RewardId = rewards[1].Id,
                UserId = userId,
                PointsSpent = 500,
                Status = "pending",
                ClaimDate = DateTime.UtcNow.AddHours(-2),
                Notes = "Hội viên hoàn thành xuất sắc Thử thách 21 ngày, yêu cầu nhận mã voucher gửi qua email."
            },
            new()
            {
                RewardId = rewards[0].Id,
                UserId = userId,
                PointsSpent = 250,
                Status = "approved",
                ClaimDate = DateTime.UtcNow.AddDays(-1),
                HandledAt = DateTime.UtcNow.AddHours(-12),
                Notes = "Đã gửi link tải Ebook qua email tự động."
            },
            new()
            {
                RewardId = rewards[2].Id,
                UserId = userId,
                PointsSpent = 800,
                Status = "pending",
                ClaimDate = DateTime.UtcNow.AddHours(-5),
                Notes = "Địa chỉ nhận túi canvas: Số 12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM."
            }
        };

        _unitOfWork.Context.RewardClaims.AddRange(claims);
        await _unitOfWork.CommitAsync();
    }
}

