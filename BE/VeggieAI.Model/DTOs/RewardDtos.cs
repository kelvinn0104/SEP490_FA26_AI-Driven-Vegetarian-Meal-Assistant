using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class EcoRewardDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int PointsRequired { get; set; } = 500;
    public int StockQuantity { get; set; }
    public int ClaimedQuantity { get; set; }
    public string Category { get; set; } = "voucher";
    public string CategoryLabel { get; set; } = "Voucher Đối Tác";
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = "active";
    public string StatusLabel { get; set; } = "Đang khả dụng";
    public string CreatedAt { get; set; } = string.Empty;
}

public class CreateEcoRewardRequest
{
    [Required(ErrorMessage = "Tiêu đề phần thưởng không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(50, 50000, ErrorMessage = "Điểm Mầm Xanh từ 50 đến 50,000 điểm")]
    public int PointsRequired { get; set; } = 500;

    [Range(0, 10000, ErrorMessage = "Số lượng tồn kho không hợp lệ")]
    public int StockQuantity { get; set; } = 50;

    public string Category { get; set; } = "voucher"; // voucher, ebook, physical, seed

    public string? ImageUrl { get; set; }

    public string Status { get; set; } = "active"; // active, out_of_stock, paused
}

public class UpdateEcoRewardRequest
{
    [Required(ErrorMessage = "Tiêu đề phần thưởng không được để trống")]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsRequired { get; set; } = 500;

    public int StockQuantity { get; set; } = 50;

    public string Category { get; set; } = "voucher";

    public string? ImageUrl { get; set; }

    public string Status { get; set; } = "active";
}

public class RewardClaimDto
{
    public int Id { get; set; }
    public int RewardId { get; set; }
    public string RewardTitle { get; set; } = string.Empty;
    public string RewardCategory { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string UserAvatar { get; set; } = string.Empty;
    public int PointsSpent { get; set; }
    public string Status { get; set; } = "pending";
    public string ClaimDate { get; set; } = string.Empty;
    public string? HandledAt { get; set; }
    public string? Notes { get; set; }
}

public class ProcessClaimRequest
{
    [Required]
    public string Decision { get; set; } = "approved"; // approved, delivered, rejected

    public string? Notes { get; set; }
}

public class RewardOverviewStatsDto
{
    public int TotalRewards { get; set; }
    public int AvailableRewards { get; set; }
    public int TotalClaimsProcessed { get; set; }
    public int PendingClaimsCount { get; set; }
    public int TotalKarmaPointsCirculated { get; set; }
}

