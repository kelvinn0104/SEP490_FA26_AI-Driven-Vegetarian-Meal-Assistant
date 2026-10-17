namespace VeggieAI.Domain.Entities;

public partial class AiFeedback
{
    public int Id { get; set; }
    public int ReviewedBy { get; set; }
    public int? ModelId { get; set; }
    public string TargetType { get; set; } = null!;
    public int TargetId { get; set; }
    public short Rating { get; set; }
    public bool IsAccurate { get; set; }
    public string? Comment { get; set; }
    public string Status { get; set; } = "open";
    public int? HandledBy { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual User? HandledByNavigation { get; set; }
    public virtual AiModel? Model { get; set; }
    public virtual User ReviewedByNavigation { get; set; } = null!;
}
