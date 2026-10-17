namespace VeggieAI.Domain.Entities;

public partial class WearableConnection
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Provider { get; set; } = null!;
    public string AccessTokenEnc { get; set; } = null!;
    public DateTime? LastSyncedAt { get; set; }

    public virtual User User { get; set; } = null!;
}
