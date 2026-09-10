namespace VeggieAI.Domain.Entities;

public enum UserRole
{
    Admin,
    Moderator,
    AuthorizedUser,
    UnauthorizedUser
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.AuthorizedUser;
    
    // Nutrition Profile
    public double HeightCm { get; set; }
    public double WeightKg { get; set; }
    public int Age { get; set; }
    public string ActivityLevel { get; set; } = "Moderate"; // Sedentary, Moderate, Active
    public string HealthGoal { get; set; } = "Maintenance"; // WeightLoss, MuscleGain, Maintenance
    
    public List<string> Allergies { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
