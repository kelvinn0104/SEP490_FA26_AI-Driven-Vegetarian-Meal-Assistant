namespace VeggieAI.Domain.Entities;

public partial class GoalStandard
{
    public int Id { get; set; }
    public string HealthGoal { get; set; } = null!;
    public decimal KcalAdjustmentPercent { get; set; }
    public decimal ProteinGPerKg { get; set; }
    public decimal CarbPercent { get; set; }
    public decimal FatPercent { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
