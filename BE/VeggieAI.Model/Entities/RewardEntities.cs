using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("eco_rewards")]
public class EcoReward
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int PointsRequired { get; set; } = 500;

    public int StockQuantity { get; set; } = 50;

    public int ClaimedQuantity { get; set; } = 12;

    [MaxLength(50)]
    public string Category { get; set; } = "voucher"; // voucher, ebook, physical, seed

    public string? ImageUrl { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "active"; // active, out_of_stock, paused

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<RewardClaim> Claims { get; set; } = new List<RewardClaim>();
}

[Table("reward_claims")]
public class RewardClaim
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    public int RewardId { get; set; }

    [ForeignKey(nameof(RewardId))]
    public virtual EcoReward? Reward { get; set; }

    public int UserId { get; set; }

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }

    public int PointsSpent { get; set; }

    [MaxLength(30)]
    public string Status { get; set; } = "pending"; // pending, approved, delivered, rejected

    public DateTime ClaimDate { get; set; } = DateTime.UtcNow;

    public DateTime? HandledAt { get; set; }

    public int? HandledById { get; set; }

    public string? Notes { get; set; }
}

