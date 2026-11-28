namespace VeggieAI.Model.DTOs;

public class NutritionOverviewDto
{
    public bool HasData { get; set; }
    public bool HasMealLogData { get; set; }
    public bool HasFiberData { get; set; }

    // Reporting window & averaging definition
    public int PeriodDays { get; set; } = 30;
    public string PeriodStart { get; set; } = string.Empty;
    public string PeriodEnd { get; set; } = string.Empty;
    public string AveragingMode { get; set; } = "per_logged_day"; // per_logged_day | per_active_user_period | per_all_users_period
    public string AveragingModeLabel { get; set; } = string.Empty;
    public int CalculationDenominator { get; set; }
    public string CalculationNote { get; set; } = string.Empty;

    // Data coverage
    public int TotalUsersTracked { get; set; }          // active standard Users
    public int ActiveLoggedUsersCount { get; set; }     // Users with ≥1 MealLog in the period
    public int UsersWithoutLogCount { get; set; }       // Users with no MealLog (no data, NOT "ate 0")
    public decimal DataCoveragePercent { get; set; }
    public int LoggedUserDaysCount { get; set; }
    public int TotalMealLogs { get; set; }

    // Community averages (null when there is no MealLog data)
    public int? AvgDailyCalories { get; set; }
    public decimal? AvgDailyProtein { get; set; }
    public decimal? AvgDailyCarb { get; set; }
    public decimal? AvgDailyFat { get; set; }
    public decimal? AvgDailyFiber { get; set; }

    // Fiber completeness
    public int FiberCompleteUserDays { get; set; }
    public int FiberIncompleteUserDays { get; set; }
    public decimal FiberCoveragePercent { get; set; }
    public string FiberCalculationNote { get; set; } = string.Empty;

    public List<DeficitItemDto> MicronutrientDeficits { get; set; } = new();
    public List<IngredientPopularityDto> TopIngredients { get; set; } = new();
    public string TopIngredientsNote { get; set; } = string.Empty;
    public List<GoalDistributionDto> DietaryGoals { get; set; } = new();
    public List<CalorieRangeDto> CalorieDistribution { get; set; } = new();
    public List<WeeklyIntakeDto> WeeklyIntakeTrends { get; set; } = new();
    public string WeeklyTrendsNote { get; set; } = string.Empty;
}

public class DeficitItemDto
{
    public string NutrientName { get; set; } = string.Empty;
    public string StandardRdi { get; set; } = string.Empty;
    public string AvgCommunityIntake { get; set; } = string.Empty;
    public decimal? AvgCommunityIntakeValue { get; set; }

    /// <summary>Percentage of evaluated users below their personal RDI; null when nobody could be evaluated.</summary>
    public int? DeficitPercent { get; set; }
    /// <summary>Confirmed deficient users divided by TotalUsersInScope (missing-data users are NOT counted as deficient).</summary>
    public int? DeficitPercentOfScope { get; set; }
    public string Severity { get; set; } = "unknown"; // "high", "medium", "low", "unknown"
    public string StatusText { get; set; } = string.Empty;
    public string ScopeNote { get; set; } = string.Empty;

    // Coverage metadata — users without data are never merged with deficient users
    public int TotalActiveUsers { get; set; }
    public int TotalUsersInScope { get; set; }
    public int UsersWithData { get; set; }
    public int UsersWithoutData { get; set; }
    public int TotalUsersWithoutData { get; set; }
    public int UsersWithoutStandard { get; set; }
    public int UsersEvaluated { get; set; }
    public int DeficientUsers { get; set; }
    public decimal DataCoveragePercent { get; set; }

    public List<string> RecommendedSources { get; set; } = new();
    public string NutritionistAdvice { get; set; } = string.Empty;
}

public class IngredientPopularityDto
{
    public int IngredientId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int MentionsCount { get; set; }
    public int CurrentPeriodUses { get; set; }
    public int PreviousPeriodUses { get; set; }
    public int PublishedRecipeCount { get; set; }

    /// <summary>Real growth vs. the previous equal-length period; null when the previous period has no usage.</summary>
    public decimal? GrowthRate { get; set; }
    public string GrowthNote { get; set; } = string.Empty;
    public string PrimaryNutrient { get; set; } = string.Empty;
    public string StatusTag { get; set; } = string.Empty;
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
    public string Date { get; set; } = string.Empty;
    public string DayLabel { get; set; } = string.Empty;
    public bool HasData { get; set; }
    public int LoggedUsersCount { get; set; }

    // null = no MealLog that day (missing data), never rendered as 0
    public int? Calories { get; set; }
    public decimal? ProteinGrams { get; set; }
    public decimal? FiberGrams { get; set; }
}
