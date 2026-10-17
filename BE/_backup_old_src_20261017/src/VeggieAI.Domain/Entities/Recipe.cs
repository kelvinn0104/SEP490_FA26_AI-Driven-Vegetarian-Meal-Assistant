namespace VeggieAI.Domain.Entities;

public enum ModerationStatus
{
    Pending,
    Approved,
    Rejected,
    FlaggedByAI
}

public class Recipe
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public List<string> Ingredients { get; set; } = new();
    public List<string> Instructions { get; set; } = new();
    
    // Nutrition breakdown
    public double Calories { get; set; }
    public double ProteinGrams { get; set; }
    public double IronMg { get; set; }
    public double B12Mcg { get; set; }
    public double Omega3Grams { get; set; }
    
    public string? VideoUrl { get; set; }
    public string? AutoSummarizedText { get; set; }
    
    public ModerationStatus Status { get; set; } = ModerationStatus.Pending;
    public Guid AuthorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
