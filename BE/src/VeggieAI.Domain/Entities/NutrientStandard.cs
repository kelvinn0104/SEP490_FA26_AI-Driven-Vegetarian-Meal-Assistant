namespace VeggieAI.Domain.Entities;

public partial class NutrientStandard
{
    public int Id { get; set; }
    public string Gender { get; set; } = null!;
    public int AgeFrom { get; set; }
    public int AgeTo { get; set; }
    public decimal IronMg { get; set; }
    public decimal B12Mcg { get; set; }
    public decimal CalciumMg { get; set; }
    public decimal ZincMg { get; set; }
    public string? Note { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
