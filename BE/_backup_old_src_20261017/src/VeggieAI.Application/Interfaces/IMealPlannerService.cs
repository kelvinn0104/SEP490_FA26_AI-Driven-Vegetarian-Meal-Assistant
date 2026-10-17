using VeggieAI.Domain.Entities;

namespace VeggieAI.Application.Interfaces;

public interface IMealPlannerService
{
    Task<MealPlan> GenerateWeeklyPlanAsync(Guid userId, List<string> availableIngredients);
}
