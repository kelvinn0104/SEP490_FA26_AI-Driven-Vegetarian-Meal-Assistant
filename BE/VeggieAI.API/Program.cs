using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using VeggieAI.API.Middlewares;
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

// 2. Database Configuration (Intelligent PostgreSQL check with InMemory fallback)
var useInMemory = builder.Configuration.GetValue<bool>("ConnectionStrings:UseInMemoryDatabase");
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");

bool canConnectToPostgres = false;
if (!useInMemory && !string.IsNullOrWhiteSpace(connStr))
{
    try
    {
        Console.WriteLine($"[PostgreSQL] Đang kiểm tra kết nối đến cơ sở dữ liệu...");
        using var testConn = new Npgsql.NpgsqlConnection(connStr);
        testConn.Open();
        canConnectToPostgres = true;
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"[PostgreSQL THÀNH CÔNG] Đã kết nối thành công đến PostgreSQL!");
        Console.ResetColor();
    }
    catch (Exception ex)
    {
        canConnectToPostgres = false;
        Console.ForegroundColor = ConsoleColor.Yellow;
        Console.WriteLine($"[PostgreSQL CẢNH BÁO] Không thể kết nối đến PostgreSQL: {ex.Message}");
        Console.WriteLine($"[PostgreSQL CẢNH BÁO] Hệ thống đang tự động kích hoạt InMemory Database dự phòng để API vẫn chạy được.");
        Console.ResetColor();
    }
}

builder.Services.AddDbContext<VeggieAIDbContext>(options =>
{
    if (canConnectToPostgres && !string.IsNullOrWhiteSpace(connStr))
    {
        options.UseNpgsql(connStr);
    }
    else
    {
        options.UseInMemoryDatabase("VeggieAIDb");
    }
});

// 3. Dependency Injection (4-Layer Pattern)
// Repositories & Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IModerationRepository, ModerationRepository>();
builder.Services.AddScoped<IAiModelRepository, AiModelRepository>();

// Email OTP verification (IMemoryCache + SMTP)
builder.Services.AddMemoryCache();
builder.Services.Configure<VeggieAI.Model.DTOs.EmailOptions>(
    builder.Configuration.GetSection(VeggieAI.Model.DTOs.EmailOptions.Section));
builder.Services.Configure<VeggieAI.Model.DTOs.OtpOptions>(
    builder.Configuration.GetSection(VeggieAI.Model.DTOs.OtpOptions.Section));
builder.Services.AddSingleton<IOtpService, OtpService>();
builder.Services.AddSingleton<IEmailService, SmtpEmailService>();

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

// AI services (Gemini/OpenAI)
builder.Services.Configure<VeggieAI.Model.DTOs.AiOptions>(
    builder.Configuration.GetSection(VeggieAI.Model.DTOs.AiOptions.Section));
builder.Services.AddHttpClient<VeggieAI.Service.Services.AI.GeminiProvider>();
builder.Services.AddHttpClient<VeggieAI.Service.Services.AI.OpenAiProvider>();
builder.Services.AddScoped<VeggieAI.Service.Services.AI.ILlmClient, VeggieAI.Service.Services.AI.LlmClient>();
builder.Services.AddSingleton<VeggieAI.Service.Services.AI.IFileStorage, VeggieAI.Service.Services.AI.LocalFileStorage>();
builder.Services.AddScoped<VeggieAI.Service.Services.AI.IAiMealPlanner, VeggieAI.Service.Services.AI.AiMealPlanner>();
builder.Services.AddScoped<VeggieAI.Service.Services.AI.IChatService, VeggieAI.Service.Services.AI.ChatService>();
builder.Services.AddScoped<VeggieAI.Service.Services.AI.IIngredientScanService, VeggieAI.Service.Services.AI.IngredientScanService>();

// 4. JWT Authentication & Authorization
var jwtKey = builder.Configuration["Jwt:Key"] ?? "VeggieAI_Super_Secret_Key_2026_Enterprise_Edition_Must_Be_Long_Enough!";
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
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "VeggieAI",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "VeggieAIClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization();

// 5. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
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
        Description = "Nền tảng Quản trị & Trợ lý Chế độ ăn Thuần thực vật VeggieAI"
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

// 7. Initialize Database & Seed
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<VeggieAIDbContext>();
        if (canConnectToPostgres)
        {
            context.Database.EnsureCreated();
            try
            {
                // Cho phép trạng thái 'pending' (chờ xác thực email OTP) trên bảng User
                context.Database.ExecuteSqlRaw(@"
DO $$
BEGIN
    IF to_regclass('veggieai.""User""') IS NOT NULL THEN
        ALTER TABLE veggieai.""User"" DROP CONSTRAINT IF EXISTS ""User_Status_check"";
        ALTER TABLE veggieai.""User"" ADD CONSTRAINT ""User_Status_check""
            CHECK (""Status"" IN ('pending', 'active', 'locked'));
    END IF;
END $$;");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Không cập nhật được CHECK constraint User.Status — hãy chạy database/migrations/20261024_user_pending_status.sql thủ công.");
            }
            await DatabaseSeeder.SeedAsync(context);
            logger.LogInformation("PostgreSQL Database connected and initialized successfully.");
        }
        else
        {
            context.Database.EnsureCreated();
            await DatabaseSeeder.SeedAsync(context);
            logger.LogInformation("VeggieAI API running with InMemory Database and preloaded seed data.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database seeding.");
    }
}

// 8. Middleware Pipeline
app.UseMiddleware<ExceptionMiddleware>();

app.UseCors("AllowAll");

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "VeggieAI API v1");
    c.RoutePrefix = string.Empty; // Serve Swagger at root "/"
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
