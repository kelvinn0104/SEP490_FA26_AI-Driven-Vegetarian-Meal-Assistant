using VeggieAI.Domain.Entities;

namespace VeggieAI.Infrastructure.Persistence;

public class ApplicationDbContext
{
    // EF Core DbContext Stub (Will be configured with Npgsql.EntityFrameworkCore.PostgreSQL)
    public List<User> Users { get; set; } = new();
    public List<Recipe> Recipes { get; set; } = new();
    public List<MealPlan> MealPlans { get; set; } = new();
}
