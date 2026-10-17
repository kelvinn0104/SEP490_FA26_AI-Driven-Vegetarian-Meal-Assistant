namespace VeggieAI.Domain.Entities;

public partial class HealthProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Gender { get; set; } = null!;
    public DateOnly DateOfBirth { get; set; }
    public decimal HeightCm { get; set; }
    public decimal WeightKg { get; set; }
    public string ActivityLevel { get; set; } = null!;
    public string HealthGoal { get; set; } = null!;
    public decimal? Bmi { get; set; }
    public decimal? Bmr { get; set; }
    public decimal? Tdee { get; set; }
    public decimal? DailyKcalTarget { get; set; }
    public decimal? ProteinTargetG { get; set; }
    public decimal? CarbTargetG { get; set; }
    public decimal? FatTargetG { get; set; }
    public decimal? IronTargetMg { get; set; }
    public decimal? B12TargetMcg { get; set; }
    public decimal? CalciumTargetMg { get; set; }
    public decimal? ZincTargetMg { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
