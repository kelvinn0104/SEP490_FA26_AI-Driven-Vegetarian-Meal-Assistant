namespace VeggieAI.Domain.Entities;

public class MealPlanItem
{
    public string DayOfWeek { get; set; } = "Monday"; // Monday..Sunday
    public string MealType { get; set; } = "Breakfast"; // Breakfast, Lunch, Dinner, Snack
    public Guid RecipeId { get; set; }
    public string RecipeTitle { get; set; } = string.Empty;
}

public class MealPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public List<MealPlanItem> Items { get; set; } = new();
    
    public double TotalCaloriesTarget { get; set; }
    public double TotalProteinTarget { get; set; }
    
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
