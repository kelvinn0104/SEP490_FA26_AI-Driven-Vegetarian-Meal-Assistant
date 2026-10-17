namespace VeggieAI.Domain.Entities;

public partial class Report
{
    public int Id { get; set; }
    public int ReporterId { get; set; }
    public string TargetType { get; set; } = null!;
    public int TargetId { get; set; }
    public string Category { get; set; } = null!;
    public string? Reason { get; set; }
    public string Status { get; set; } = "open";
    public int? HandledBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? HandledAt { get; set; }

    public virtual User? HandledByNavigation { get; set; }
    public virtual User Reporter { get; set; } = null!;
}
