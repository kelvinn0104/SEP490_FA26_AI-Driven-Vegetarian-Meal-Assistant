namespace VeggieAI.Model.DTOs;

public class NutritionOverviewDto
{
    public int TotalUsersTracked { get; set; } = 3840;
    public int AvgDailyCalories { get; set; } = 1860;
    public decimal AvgDailyProtein { get; set; } = 62.5m;
    public decimal AvgDailyCarb { get; set; } = 245.0m;
    public decimal AvgDailyFat { get; set; } = 52.0m;
    public decimal AvgDailyFiber { get; set; } = 34.2m;
    public List<DeficitItemDto> MicronutrientDeficits { get; set; } = new();
    public List<IngredientPopularityDto> TopIngredients { get; set; } = new();
    public List<GoalDistributionDto> DietaryGoals { get; set; } = new();
    public List<CalorieRangeDto> CalorieDistribution { get; set; } = new();
    public List<WeeklyIntakeDto> WeeklyIntakeTrends { get; set; } = new();
}

public class DeficitItemDto
{
    public string NutrientName { get; set; } = string.Empty;
    public string StandardRdi { get; set; } = string.Empty;
    public string AvgCommunityIntake { get; set; } = string.Empty;
    public int DeficitPercent { get; set; }
    public string Severity { get; set; } = "high"; // "high", "medium", "low"
    public string StatusText { get; set; } = "Thiếu hụt nghiêm trọng";
    public List<string> RecommendedSources { get; set; } = new();
    public string NutritionistAdvice { get; set; } = string.Empty;
}

public class IngredientPopularityDto
{
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int MentionsCount { get; set; }
    public decimal GrowthRate { get; set; }
    public string PrimaryNutrient { get; set; } = string.Empty;
    public string StatusTag { get; set; } = "Thịnh hành";
}

public class GoalDistributionDto
{
    public string GoalName { get; set; } = string.Empty;
    public int Percentage { get; set; }
    public int MemberCount { get; set; }
    public string ColorHex { get; set; } = "#10b981";
}

public class CalorieRangeDto
{
    public string RangeLabel { get; set; } = string.Empty;
    public int Percentage { get; set; }
    public int UserCount { get; set; }
}

public class WeeklyIntakeDto
{
    public string DayLabel { get; set; } = string.Empty;
    public decimal ProteinGrams { get; set; }
    public decimal FiberGrams { get; set; }
    public int Calories { get; set; }
}

