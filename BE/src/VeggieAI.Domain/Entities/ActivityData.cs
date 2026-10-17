namespace VeggieAI.Domain.Entities;

public partial class ActivityData
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly ActivityDate { get; set; }
    public decimal KcalBurned { get; set; } = 0m;
    public int Steps { get; set; } = 0;
    public DateTime SyncedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
