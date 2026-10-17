namespace VeggieAI.Domain.Entities;

public partial class VeganShop
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public string Address { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string? Phone { get; set; }
    public string? Tags { get; set; }
    public bool IsActive { get; set; } = true;
}
