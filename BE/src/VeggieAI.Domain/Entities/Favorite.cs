namespace VeggieAI.Domain.Entities;

public partial class Favorite
{
    public int UserId { get; set; }
    public int RecipeId { get; set; }
    public DateTime CreatedAt { get; set; }

    public virtual Recipe Recipe { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
