namespace VeggieAI.Domain.Entities;

public partial class AiModelLog
{
    public long Id { get; set; }
    public int ModelId { get; set; }
    public int? UserId { get; set; }
    public int? LatencyMs { get; set; }
    public int? TokensUsed { get; set; }
    public bool IsSuccess { get; set; } = true;
    public string? ErrorMessage { get; set; }
    public string? MetricName { get; set; }
    public decimal? MetricValue { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual AiModel Model { get; set; } = null!;
    public virtual User? User { get; set; }
}
