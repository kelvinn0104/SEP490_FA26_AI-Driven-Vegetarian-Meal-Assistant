using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using VeggieAI.API.Middlewares;
using VeggieAI.Model.Constants;
using VeggieAI.Repository.Data;
using VeggieAI.Repository.Repositories;
using VeggieAI.Service.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller & JSON Configuration
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddHttpClient();

// 2. Database Configuration (Secrets via User Secrets or Environment Variables; NO plaintext password in appsettings)
var useInMemory = builder.Environment.IsDevelopment()
                  && builder.Configuration.GetValue<bool>("ConnectionStrings:UseInMemoryDatabase");

var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connStr))
{
    connStr = Environment.GetEnvironmentVariable("VEGGIEAI_DB_CONNECTION")
              ?? Environment.GetEnvironmentVariable("DATABASE_URL");
}

// Allow injecting DB password via VEGGIEAI_DB_PASSWORD or PGPASSWORD when base connection string omits Password=
if (!string.IsNullOrWhiteSpace(connStr)
    && !connStr.Contains("Password=", StringComparison.OrdinalIgnoreCase))
{
    var envDbPassword = builder.Configuration["Database:Password"]
                        ?? Environment.GetEnvironmentVariable("VEGGIEAI_DB_PASSWORD")
                        ?? Environment.GetEnvironmentVariable("PGPASSWORD");
    if (!string.IsNullOrWhiteSpace(envDbPassword))
    {
        connStr = $"{connStr.TrimEnd(';')};Password={envDbPassword}";
    }
}

if (!useInMemory)
{
    if (string.IsNullOrWhiteSpace(connStr))
    {
        throw new InvalidOperationException(
            "Thiếu cấu hình kết nối PostgreSQL. Vui lòng thiết lập biến môi trường 'ConnectionStrings__DefaultConnection' (hoặc User Secrets trong Development).");
    }

    if (!connStr.Contains("Password=", StringComparison.OrdinalIgnoreCase)
        && !connStr.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        && !connStr.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException(
            "Chuỗi kết nối PostgreSQL chưa có mật khẩu. Không lưu mật khẩu trong appsettings.json; hãy cấu hình qua User Secrets ('dotnet user-secrets set \"ConnectionStrings:DefaultConnection\" ...') hoặc biến môi trường 'VEGGIEAI_DB_PASSWORD' / 'ConnectionStrings__DefaultConnection'.");
    }
}

builder.Services.AddDbContext<VeggieAIDbContext>(options =>
{
    if (useInMemory)
    {
        options.UseInMemoryDatabase("VeggieAIDevDb");
    }
    else
    {
        options.UseNpgsql(connStr);
    }
});

// 3. Dependency Injection (4-Layer Pattern)
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IModerationRepository, ModerationRepository>();
builder.Services.AddScoped<IAiModelRepository, AiModelRepository>();

// Business Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IModerationService, ModerationService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();
builder.Services.AddScoped<ISystemSettingService, SystemSettingService>();
builder.Services.AddScoped<IIngredientService, IngredientService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IVeganChallengeService, VeganChallengeService>();
builder.Services.AddScoped<INutritionAnalyticsService, NutritionAnalyticsService>();
builder.Services.AddScoped<IBroadcastNotificationService, BroadcastNotificationService>();
builder.Services.AddScoped<IRewardService, RewardService>();
builder.Services.AddScoped<IVeganProductService, VeganProductService>();

// 4. Strict JWT Authentication & Role-Based Authorization Policies
var jwtKey = builder.Configuration["Jwt:Key"] ?? Environment.GetEnvironmentVariable("VEGGIEAI_JWT_KEY");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? Environment.GetEnvironmentVariable("VEGGIEAI_JWT_ISSUER");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? Environment.GetEnvironmentVariable("VEGGIEAI_JWT_AUDIENCE");

if (string.IsNullOrWhiteSpace(jwtKey) || Encoding.UTF8.GetByteCount(jwtKey) < 32)
{
    throw new InvalidOperationException(
        "Cấu hình bảo mật 'Jwt:Key' (hoặc biến môi trường 'Jwt__Key' / 'VEGGIEAI_JWT_KEY') bắt buộc phải được thiết lập tối thiểu 32 bytes. Không sử dụng khóa mặc định.");
}

if (string.IsNullOrWhiteSpace(jwtIssuer) || string.IsNullOrWhiteSpace(jwtAudience))
{
    throw new InvalidOperationException("Cấu hình bảo mật 'Jwt:Issuer' và 'Jwt:Audience' bắt buộc phải được thiết lập.");
}

// Ensure AuthService reading IConfiguration["Jwt:Key"] also sees env fallback if VEGGIEAI_JWT_KEY was used
builder.Configuration["Jwt:Key"] = jwtKey;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = ClaimTypes.Role,
        NameClaimType = ClaimTypes.NameIdentifier
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(RoleConstants.SuperAdminOnlyPolicy, policy =>
        policy.RequireAuthenticatedUser()
              .RequireAssertion(ctx =>
                  RoleConstants.Normalize(ctx.User.FindFirstValue(ClaimTypes.Role)) == RoleConstants.SuperAdmin));

    options.AddPolicy(RoleConstants.ModOnlyPolicy, policy =>
        policy.RequireAuthenticatedUser()
              .RequireAssertion(ctx =>
                  RoleConstants.Normalize(ctx.User.FindFirstValue(ClaimTypes.Role)) == RoleConstants.Mod));

    options.AddPolicy(RoleConstants.ManagementAccessPolicy, policy =>
        policy.RequireAuthenticatedUser()
              .RequireAssertion(ctx =>
                  RoleConstants.IsManagementRole(ctx.User.FindFirstValue(ClaimTypes.Role))));

    options.AddPolicy(RoleConstants.AuthenticatedUserPolicy, policy =>
        policy.RequireAuthenticatedUser());
});

// 5. Environment-Aware Restricted CORS Configuration
var configuredOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
var envOriginsRaw = builder.Configuration["CORS_ALLOWED_ORIGINS"] ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS");
var envOrigins = string.IsNullOrWhiteSpace(envOriginsRaw)
    ? Array.Empty<string>()
    : envOriginsRaw.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

var effectiveOrigins = configuredOrigins
    .Concat(envOrigins)
    .Where(o => !string.IsNullOrWhiteSpace(o))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

if (!builder.Environment.IsDevelopment())
{
    // Strip localhost origins in Production to prevent accidental dev CORS exposure
    effectiveOrigins = effectiveOrigins
        .Where(o => !o.Contains("localhost", StringComparison.OrdinalIgnoreCase)
                    && !o.Contains("127.0.0.1", StringComparison.OrdinalIgnoreCase))
        .ToArray();

    if (effectiveOrigins.Length == 0)
    {
        throw new InvalidOperationException(
            "Môi trường Production bắt buộc phải cấu hình domain thực tế trong 'Cors:AllowedOrigins' hoặc biến môi trường 'CORS_ALLOWED_ORIGINS' (không sử dụng localhost).");
    }
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredCors", policy =>
    {
        if (effectiveOrigins.Length > 0)
        {
            policy.WithOrigins(effectiveOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// 6. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "VeggieAI RESTful API",
        Version = "v1",
        Description = "Nền tảng Quản trị (Web Admin Portal: SuperAdmin & Mod) & Dịch vụ Ứng dụng Người dùng VeggieAI (User App / Mobile)"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using Bearer scheme. Ví dụ: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        }
    });
});

var app = builder.Build();

// Ensure wwwroot/uploads exists for file uploads
var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
Directory.CreateDirectory(Path.Combine(webRoot, "uploads"));

// 7. Verify Database Connection, Sync Schema, and Seed ONLY in Development
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<VeggieAIDbContext>();

    if (!useInMemory)
    {
        if (!await context.Database.CanConnectAsync())
        {
            logger.LogCritical("Không thể kết nối đến PostgreSQL Database. Hệ thống từ chối chuyển sang InMemory.");
            throw new InvalidOperationException("Không thể kết nối đến cơ sở dữ liệu PostgreSQL. Vui lòng kiểm tra dịch vụ PostgreSQL và chuỗi kết nối.");
        }

        await DatabaseSeeder.EnsureSchemaSynchronizedAsync(context);
        logger.LogInformation("PostgreSQL Database connected and schema synchronized.");
    }
    else
    {
        await context.Database.EnsureCreatedAsync();
    }

    if (app.Environment.IsDevelopment())
    {
        await DatabaseSeeder.SeedDevelopmentDataAsync(context);
        logger.LogInformation("Development seed data verified.");
    }
}

// 8. Middleware Pipeline
app.UseMiddleware<ExceptionMiddleware>();

app.UseStaticFiles();

app.UseCors("ConfiguredCors");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "VeggieAI API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
