namespace VeggieAI.Domain.Entities;

public partial class SystemSetting
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string? Description { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
