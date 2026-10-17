namespace VeggieAI.Domain.Entities;

public partial class IngredientScan
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string ImageUrl { get; set; } = null!;
    public string? DetectedItems { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
