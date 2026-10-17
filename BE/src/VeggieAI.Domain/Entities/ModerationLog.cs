namespace VeggieAI.Domain.Entities;

public partial class ModerationLog
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public int? ReviewedBy { get; set; }
    public string? AiLabel { get; set; }
    public decimal? AiConfidence { get; set; }
    public string RiskLevel { get; set; } = null!;
    public string Decision { get; set; } = "pending";
    public string? Reason { get; set; }
    public DateTime ReviewedAt { get; set; }

    public virtual Post Post { get; set; } = null!;
    public virtual User? ReviewedByNavigation { get; set; }
}
