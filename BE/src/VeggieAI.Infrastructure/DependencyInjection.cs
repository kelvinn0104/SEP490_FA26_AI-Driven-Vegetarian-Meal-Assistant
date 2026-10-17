using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VeggieAI.Application.Interfaces;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.AI;
using VeggieAI.Infrastructure.Auth;
using VeggieAI.Infrastructure.Persistence;
using VeggieAI.Infrastructure.Services;
using VeggieAI.Infrastructure.Storage;

namespace VeggieAI.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        var cs = config.GetConnectionString("DefaultConnection")
                 ?? throw new InvalidOperationException("Missing ConnectionStrings:DefaultConnection");
        services.AddDbContext<VeggieAiDbContext>(o => o.UseNpgsql(cs));

        services.Configure<JwtOptions>(config.GetSection(JwtOptions.Section));
        services.Configure<AiOptions>(config.GetSection(AiOptions.Section));

        services.AddSingleton<JwtTokenService>();
        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddSingleton<IFileStorage, LocalFileStorage>();

        // AI
        services.AddHttpClient<GeminiProvider>();
        services.AddHttpClient<OpenAiProvider>();
        services.AddScoped<ILlmClient, LlmClient>();
        services.AddScoped<IAiMealPlanner, AiMealPlanner>();
        services.AddScoped<IIngredientScanService, IngredientScanService>();
        services.AddScoped<IChatService, ChatService>();

        // business services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IHealthProfileService, HealthProfileService>();
        services.AddScoped<ICatalogService, CatalogService>();
        services.AddScoped<IRecipeService, RecipeService>();
        services.AddScoped<IMealPlanService, MealPlanService>();
        services.AddScoped<IShoppingListService, ShoppingListService>();
        services.AddScoped<ITrackingService, TrackingService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IVeganShopService, VeganShopService>();
        services.AddScoped<ICommunityService, CommunityService>();
        return services;
    }
}
