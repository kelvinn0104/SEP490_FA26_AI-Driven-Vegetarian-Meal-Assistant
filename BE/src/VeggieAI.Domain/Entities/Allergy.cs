namespace VeggieAI.Domain.Entities;

public partial class Allergy
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;

    public virtual ICollection<Ingredient> Ingredients { get; set; } = new List<Ingredient>();
    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
