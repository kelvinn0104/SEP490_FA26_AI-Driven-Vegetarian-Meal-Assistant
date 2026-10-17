namespace VeggieAI.Domain.Entities;

public partial class AiModel
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string? Provider { get; set; }
    public string Version { get; set; } = null!;
    public string? Config { get; set; }
    public string Status { get; set; } = "active";
    public int? UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
    public virtual ICollection<AiFeedback> AiFeedbacks { get; set; } = new List<AiFeedback>();
    public virtual ICollection<AiModelLog> AiModelLogs { get; set; } = new List<AiModelLog>();
}
