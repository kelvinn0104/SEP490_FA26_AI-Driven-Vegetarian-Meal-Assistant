using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.Entities;

namespace VeggieAI.Repository.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(VeggieAIDbContext context)
    {
        // 0. Ensure missing tables exist in database (PostgreSQL dynamic creation)
        try
        {
            if (context.Database.IsRelational())
            {
                var sql = @"
CREATE SCHEMA IF NOT EXISTS ""veggieai"";

CREATE TABLE IF NOT EXISTS ""veggieai"".""Role"" (
    ""Id""            VARCHAR(50) PRIMARY KEY,
    ""Name""          VARCHAR(100) NOT NULL UNIQUE,
    ""Description""   TEXT,
    ""IsSystem""      BOOLEAN NOT NULL DEFAULT FALSE,
    ""Theme""         VARCHAR(30) DEFAULT 'surface',
    ""Icon""          VARCHAR(50) DEFAULT 'shield_person',
    ""CreatedAt""     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ""veggieai"".""Permission"" (
    ""Id""            VARCHAR(50) PRIMARY KEY,
    ""Label""         VARCHAR(100) NOT NULL,
    ""GroupName""     VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS ""veggieai"".""RolePermission"" (
    ""RoleId""        VARCHAR(50) NOT NULL REFERENCES ""veggieai"".""Role""(""Id"") ON DELETE CASCADE,
    ""PermissionId""  VARCHAR(50) NOT NULL REFERENCES ""veggieai"".""Permission""(""Id"") ON DELETE CASCADE,
    PRIMARY KEY (""RoleId"", ""PermissionId"")
);

CREATE TABLE IF NOT EXISTS ""veggieai"".""SystemLog"" (
    ""Id""            BIGSERIAL PRIMARY KEY,
    ""UserId""        INT REFERENCES ""veggieai"".""User""(""Id"") ON DELETE SET NULL,
    ""Action""        VARCHAR(100) NOT NULL,
    ""Target""        VARCHAR(200),
    ""Details""       TEXT,
    ""LogType""       VARCHAR(30) NOT NULL DEFAULT 'system',
    ""CreatedAt""     TIMESTAMPTZ NOT NULL DEFAULT now()
);";
                await context.Database.ExecuteSqlRawAsync(sql);
                Console.WriteLine("[DatabaseSeeder] Đã kiểm tra và đảm bảo các bảng Role, Permission, RolePermission, SystemLog tồn tại.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DatabaseSeeder Notice] Table creation check: {ex.Message}");
        }

        // 1. Allergies
        if (!await context.Allergies.AnyAsync())
        {
            var allergies = new List<Allergy>
            {
                new() { Name = "Peanut" },
                new() { Name = "Tree nuts" },
                new() { Name = "Soy" },
                new() { Name = "Gluten" },
                new() { Name = "Sesame" },
                new() { Name = "Mushroom" }
            };
            await context.Allergies.AddRangeAsync(allergies);
            await context.SaveChangesAsync();
        }

        // 2. Categories
        var richCategories = new (string Name, string Type)[]
        {
            ("Món kho chay đậm đà", "recipe"),
            ("Canh & Súp dưỡng sinh", "recipe"),
            ("Bánh ngọt thuần chay (Raw Vegan)", "recipe"),
            ("Salad & Gỏi tươi mát sốt hạt", "recipe"),
            ("Món xào & Chiên không dầu", "recipe"),
            ("Sinh tố & Nước ép thanh lọc (Detox)", "recipe"),
            ("Thực đơn giàu Protein cho Gymer", "recipe"),
            ("Món nước truyền thống", "recipe"),
            ("Đậu hũ & Tàu hũ ky biến tấu", "recipe"),
            ("Món khai vị thực dưỡng", "recipe"),
            ("Rau củ hữu cơ tươi", "food_type"),
            ("Các loại hạt & ngũ cốc", "food_type"),
            ("Nấm & Dược liệu", "food_type"),
            ("Đạm thực vật chế biến", "food_type")
        };

        foreach (var (name, type) in richCategories)
        {
            if (!await context.Categories.AnyAsync(c => c.Name == name))
            {
                context.Categories.Add(new Category { Name = name, Type = type });
            }
        }
        await context.SaveChangesAsync();

        // 3. Default Users (BCrypt hashed for "Password123!")
        if (!await context.Users.AnyAsync())
        {
            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");

            var adminUser = new User
            {
                Email = "admin@veggie.vn",
                DisplayName = "Linh Nguyen (Admin)",
                PasswordHash = defaultPasswordHash,
                Role = "admin",
                Status = "active",
                CreatedAt = DateTime.UtcNow.AddMonths(-6)
            };

            var modUser = new User
            {
                Email = "mod@veggie.vn",
                DisplayName = "Dr. Thao Nutrition",
                PasswordHash = defaultPasswordHash,
                Role = "moderator",
                Status = "active",
                CreatedAt = DateTime.UtcNow.AddMonths(-4)
            };

            var standardUser = new User
            {
                Email = "chef.maianh@gmail.com",
                DisplayName = "Chef Mai Anh",
                PasswordHash = defaultPasswordHash,
                Role = "user",
                Status = "active",
                CreatedAt = DateTime.UtcNow.AddMonths(-2)
            };

            var lockedUser = new User
            {
                Email = "spammer@veggie.vn",
                DisplayName = "Spam Account",
                PasswordHash = defaultPasswordHash,
                Role = "user",
                Status = "locked",
                CreatedAt = DateTime.UtcNow.AddMonths(-1)
            };

            await context.Users.AddRangeAsync(adminUser, modUser, standardUser, lockedUser);
            await context.SaveChangesAsync();

            // 4. Health Profile
            var userProfile = new HealthProfile
            {
                UserId = standardUser.Id,
                Gender = "female",
                DateOfBirth = new DateOnly(1996, 5, 20),
                HeightCm = 162.5m,
                WeightKg = 52.0m,
                ActivityLevel = "moderate",
                HealthGoal = "maintain",
                Bmi = 19.7m,
                Bmr = 1320m,
                Tdee = 2046m,
                DailyKcalTarget = 2000m,
                ProteinTargetG = 75m,
                CarbTargetG = 260m,
                FatTargetG = 55m,
                IronTargetMg = 18m,
                B12TargetMcg = 2.4m,
                CalciumTargetMg = 1000m,
                ZincTargetMg = 8m
            };
            await context.HealthProfiles.AddAsync(userProfile);
            await context.SaveChangesAsync();
        }

        // 3b. Ensure Rich Seed Users exist
        if (await context.Users.CountAsync() < 10)
        {
            var defaultPasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!");
            var additionalUsers = new List<User>
            {
                new() { Email = "mod.thanh@veggie.vn", DisplayName = "Mod Thanh", PasswordHash = defaultPasswordHash, Role = "moderator", Status = "active", CreatedAt = DateTime.UtcNow.AddMonths(-3) },
                new() { Email = "nam.hoang@veggie.vn", DisplayName = "Hoàng Nam", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddMonths(-2) },
                new() { Email = "thao.tran@veggie.vn", DisplayName = "Trần Bích Thảo", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddMonths(-2) },
                new() { Email = "triet.le@veggie.vn", DisplayName = "Lê Minh Triết", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddMonths(-1) },
                new() { Email = "phuonganh@veggie.vn", DisplayName = "Phạm Phương Anh", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddDays(-25) },
                new() { Email = "huy.dang@veggie.vn", DisplayName = "Đặng Quốc Huy", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddDays(-20) },
                new() { Email = "hong.vu@veggie.vn", DisplayName = "Vũ Thị Hồng", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddDays(-15) },
                new() { Email = "kiet.nguyen@veggie.vn", DisplayName = "Nguyễn Tuấn Kiệt", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddDays(-10) },
                new() { Email = "lanchi@veggie.vn", DisplayName = "Đỗ Lan Chi", PasswordHash = defaultPasswordHash, Role = "user", Status = "active", CreatedAt = DateTime.UtcNow.AddDays(-5) },
                new() { Email = "spammer2@veggie.vn", DisplayName = "Tài khoản Vi phạm", PasswordHash = defaultPasswordHash, Role = "user", Status = "locked", CreatedAt = DateTime.UtcNow.AddDays(-2) }
            };

            await context.Users.AddRangeAsync(additionalUsers);
            await context.SaveChangesAsync();

            var goals = new[] { "loss", "gain", "maintain", "loss", "loss", "gain", "maintain", "loss", "loss", "maintain" };
            for (int i = 0; i < additionalUsers.Count; i++)
            {
                var hp = new HealthProfile
                {
                    UserId = additionalUsers[i].Id,
                    Gender = i % 2 == 0 ? "male" : "female",
                    DateOfBirth = new DateOnly(1995 + (i % 8), 1 + (i % 12), 10),
                    HeightCm = 165m + (i % 15),
                    WeightKg = 54m + (i % 20),
                    ActivityLevel = "moderate",
                    HealthGoal = goals[i],
                    Bmi = 21.2m,
                    Bmr = 1450m,
                    Tdee = 2100m,
                    DailyKcalTarget = 1900m + (i * 50),
                    ProteinTargetG = 70m + (i * 2),
                    CarbTargetG = 240m,
                    FatTargetG = 50m,
                    IronTargetMg = 18m,
                    B12TargetMcg = 2.4m,
                    CalciumTargetMg = 1000m,
                    ZincTargetMg = 10m
                };
                context.HealthProfiles.Add(hp);
            }
            await context.SaveChangesAsync();
        }

        // 5. Ingredients
        if (!await context.Ingredients.AnyAsync())
        {
            var ingredients = new List<Ingredient>
            {
                new() { Name = "Firm tofu (calcium-set)", KcalPer100g = 144, ProteinPer100g = 17.3m, CarbPer100g = 2.8m, FatPer100g = 8.7m, IronPer100g = 2.66m, B12Per100g = 0m, CalciumPer100g = 683m, ZincPer100g = 1.57m, DataSource = "USDA FoodData Central" },
                new() { Name = "Brown rice, cooked", KcalPer100g = 123, ProteinPer100g = 2.74m, CarbPer100g = 25.6m, FatPer100g = 0.97m, IronPer100g = 0.56m, B12Per100g = 0m, CalciumPer100g = 3m, ZincPer100g = 0.71m, DataSource = "USDA FoodData Central" },
                new() { Name = "Spinach, raw", KcalPer100g = 23, ProteinPer100g = 2.86m, CarbPer100g = 3.63m, FatPer100g = 0.39m, IronPer100g = 2.71m, B12Per100g = 0m, CalciumPer100g = 99m, ZincPer100g = 0.53m, DataSource = "USDA FoodData Central" },
                new() { Name = "Lentils, cooked", KcalPer100g = 116, ProteinPer100g = 9.02m, CarbPer100g = 20.1m, FatPer100g = 0.38m, IronPer100g = 3.33m, B12Per100g = 0m, CalciumPer100g = 19m, ZincPer100g = 1.27m, DataSource = "USDA FoodData Central" },
                new() { Name = "Peanuts, raw", KcalPer100g = 567, ProteinPer100g = 25.8m, CarbPer100g = 16.1m, FatPer100g = 49.2m, IronPer100g = 4.58m, B12Per100g = 0m, CalciumPer100g = 92m, ZincPer100g = 3.27m, DataSource = "USDA FoodData Central" },
                new() { Name = "Shiitake mushroom, raw", KcalPer100g = 34, ProteinPer100g = 2.24m, CarbPer100g = 6.79m, FatPer100g = 0.49m, IronPer100g = 0.41m, B12Per100g = 0m, CalciumPer100g = 2m, ZincPer100g = 1.03m, DataSource = "USDA FoodData Central" }
            };
            await context.Ingredients.AddRangeAsync(ingredients);
            await context.SaveChangesAsync();
        }

        // 6. Recipes
        if (!await context.Recipes.AnyAsync())
        {
            var catSoup = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Món nước") 
                          ?? await context.Categories.FirstOrDefaultAsync();
            var catMain = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Món chính") 
                          ?? await context.Categories.FirstOrDefaultAsync();
            var catSalad = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Salad") 
                           ?? await context.Categories.FirstOrDefaultAsync();

            var authorUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "user") 
                             ?? await context.Users.FirstOrDefaultAsync();
            var verifierUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "moderator" || u.Role == "admin");

            if (catSoup != null && authorUser != null)
            {
                var recipes = new List<Recipe>
                {
                    new()
                    {
                        CategoryId = catSoup.Id,
                        CreatedBy = authorUser.Id,
                        VerifiedBy = verifierUser?.Id,
                        Title = "Bún Riêu Chay Đậu Hũ Non",
                        ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                        Instructions = "Nấu nước dùng từ củ quả và sữa đậu nành, tao cà chua với nấm hương và đậu hũ non.",
                        Servings = 2,
                        KcalPerServing = 340,
                        ProteinG = 16.5m,
                        CarbG = 48.0m,
                        FatG = 8.5m,
                        IronMg = 4.2m,
                        B12Mcg = 0.5m,
                        CalciumMg = 180m,
                        ZincMg = 2.1m,
                        Status = "published",
                        VerifiedAt = DateTime.UtcNow.AddDays(-10)
                    },
                    new()
                    {
                        CategoryId = catSalad?.Id ?? catSoup.Id,
                        CreatedBy = authorUser.Id,
                        VerifiedBy = verifierUser?.Id,
                        Title = "Salad Xoài Xanh Hạt Điều",
                        ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60",
                        Instructions = "Bào sợi xoài xanh, trộn nước mắm chay chua ngọt và rắc hạt điều rang giòn.",
                        Servings = 1,
                        KcalPerServing = 220,
                        ProteinG = 7.2m,
                        CarbG = 24.5m,
                        FatG = 11.0m,
                        IronMg = 2.1m,
                        B12Mcg = 0m,
                        CalciumMg = 65m,
                        ZincMg = 1.5m,
                        Status = "published",
                        VerifiedAt = DateTime.UtcNow.AddDays(-5)
                    },
                    new()
                    {
                        CategoryId = catMain?.Id ?? catSoup.Id,
                        CreatedBy = authorUser.Id,
                        VerifiedBy = verifierUser?.Id,
                        Title = "Nấm Đùi Gà Kho Tiêu Vegan",
                        ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
                        Instructions = "Khía nấm đùi gà, ướp tiêu đen và nước tương nguyên chất, kho lửa nhỏ đến khi sánh kẹo.",
                        Servings = 3,
                        KcalPerServing = 185,
                        ProteinG = 9.8m,
                        CarbG = 18.2m,
                        FatG = 4.5m,
                        IronMg = 3.0m,
                        B12Mcg = 0m,
                        CalciumMg = 40m,
                        ZincMg = 2.4m,
                        Status = "hidden",
                        VerifiedAt = DateTime.UtcNow.AddDays(-15)
                    }
                };
                await context.Recipes.AddRangeAsync(recipes);
                await context.SaveChangesAsync();
            }
        }

        if (await context.Recipes.CountAsync() < 8)
        {
            var authorUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "user") 
                             ?? await context.Users.FirstOrDefaultAsync();
            var verifierUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "moderator" || u.Role == "admin");
            var anyCat = await context.Categories.FirstOrDefaultAsync();

            var moreRecipes = new List<Recipe>
            {
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = verifierUser?.Id ?? 2,
                    Title = "Cà Ri Chay Khoai Lang Cốt Dừa",
                    ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Nấu khoai lang, cà rốt và đậu hũ chiên cùng sốt cà ri và nước cốt dừa béo ngậy thơm nức mùi sả.",
                    Servings = 4,
                    KcalPerServing = 380,
                    ProteinG = 12.5m,
                    CarbG = 52.0m,
                    FatG = 14.5m,
                    IronMg = 3.8m,
                    B12Mcg = 0m,
                    CalciumMg = 110m,
                    ZincMg = 1.9m,
                    Status = "published",
                    VerifiedAt = DateTime.UtcNow.AddDays(-8)
                },
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = verifierUser?.Id ?? 2,
                    Title = "Canh Chua Nam Bộ Bạc Hà Nấm Rơm",
                    ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Nấu nước cốt me tươi, bạc hà giòn, đậu bắp, cà chua và nấm rơm ngọt nước, nêm ngò gai ngò ôm thơm lừng.",
                    Servings = 3,
                    KcalPerServing = 165,
                    ProteinG = 6.2m,
                    CarbG = 26.0m,
                    FatG = 2.5m,
                    IronMg = 2.4m,
                    B12Mcg = 0m,
                    CalciumMg = 85m,
                    ZincMg = 1.2m,
                    Status = "published",
                    VerifiedAt = DateTime.UtcNow.AddDays(-6)
                },
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = verifierUser?.Id ?? 2,
                    Title = "Đậu Hũ Tứ Xuyên Thuần Chay Sốt Cay",
                    ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Đậu hũ non cắt quân cờ xào với sốt sa tế chay nấm đùi gà băm nhuyễn, rắc ớt khô và tiêu Tứ Xuyên tê cay đậm vị.",
                    Servings = 2,
                    KcalPerServing = 260,
                    ProteinG = 18.0m,
                    CarbG = 14.5m,
                    FatG = 12.0m,
                    IronMg = 4.5m,
                    B12Mcg = 0m,
                    CalciumMg = 230m,
                    ZincMg = 2.2m,
                    Status = "published",
                    VerifiedAt = DateTime.UtcNow.AddDays(-4)
                },
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = verifierUser?.Id ?? 2,
                    Title = "Bánh Xèo Chay Giòn Rụm Đậu Xanh Nấm Mối",
                    ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Bột gạo pha nước cốt dừa và bột nghệ vàng ươm, đổ bánh mỏng giòn rụm với nhân nấm mối, giá đỗ và đậu xanh luộc chín tới.",
                    Servings = 2,
                    KcalPerServing = 410,
                    ProteinG = 14.2m,
                    CarbG = 58.0m,
                    FatG = 15.0m,
                    IronMg = 3.6m,
                    B12Mcg = 0m,
                    CalciumMg = 95m,
                    ZincMg = 1.8m,
                    Status = "published",
                    VerifiedAt = DateTime.UtcNow.AddDays(-3)
                },
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = verifierUser?.Id ?? 2,
                    Title = "Chả Giò Chay Khoai Môn Giòn Tan",
                    ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Khoai môn bào sợi xào nấm mèo và đậu xanh, cuốn bánh tráng bò bía chiên vàng giòn rụm chấm tương ớt chua ngọt.",
                    Servings = 4,
                    KcalPerServing = 290,
                    ProteinG = 7.5m,
                    CarbG = 38.0m,
                    FatG = 11.5m,
                    IronMg = 1.9m,
                    B12Mcg = 0m,
                    CalciumMg = 50m,
                    ZincMg = 1.1m,
                    Status = "hidden",
                    VerifiedAt = DateTime.UtcNow.AddDays(-12)
                },
                new()
                {
                    CategoryId = anyCat?.Id ?? 1,
                    CreatedBy = authorUser?.Id ?? 1,
                    VerifiedBy = null,
                    Title = "Chè Hạt Sen Long Nhãn Thanh Nhiệt",
                    ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
                    Instructions = "Hạt sen tươi hầm mềm nhừ với đường phèn thanh ngọt, lồng vào từng múi long nhãn giòn sần sật ướp hoa nhài thanh mát.",
                    Servings = 3,
                    KcalPerServing = 210,
                    ProteinG = 4.8m,
                    CarbG = 46.0m,
                    FatG = 0.8m,
                    IronMg = 1.5m,
                    B12Mcg = 0m,
                    CalciumMg = 35m,
                    ZincMg = 0.9m,
                    Status = "draft",
                    VerifiedAt = null
                }
            };

            await context.Recipes.AddRangeAsync(moreRecipes);
            await context.SaveChangesAsync();
        }

        // 7. Posts / Moderation Items
        if (!await context.Posts.AnyAsync())
        {
            var authorUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "user") 
                             ?? await context.Users.FirstOrDefaultAsync();
            var allRecipes = await context.Recipes.ToListAsync();
            var r0Id = allRecipes.Count > 0 ? allRecipes[0].Id : (int?)null;
            var r1Id = allRecipes.Count > 1 ? allRecipes[1].Id : r0Id;

            if (authorUser != null)
            {
                var post1 = new Post
                {
                    UserId = authorUser.Id,
                    RecipeId = r0Id,
                    PostType = "blog",
                    Title = "Bún Riêu Chay Đậu Hũ Non & Nấm Hương Tươi",
                    Content = "Công thức nấu bún riêu chay đậm vị từ sữa chua đậu nành và củ quả lên men tự nhiên.",
                    MediaUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60",
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow.AddHours(-2)
                };

                var post2 = new Post
                {
                    UserId = authorUser.Id,
                    RecipeId = r1Id,
                    PostType = "video",
                    Title = "Cách làm chả lụa chay từ tàu hũ ky tươi",
                    Content = "Video hướng dẫn gói chả lụa bằng lá chuối truyền thống không dùng hàn the.",
                    MediaUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60",
                    VideoSummary = "Bước 1: Ngâm nở tàu hũ ky. Bước 2: Nêm gia vị tiêu sọ. Bước 3: Hấp 45 phút.",
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow.AddHours(-6)
                };

                await context.Posts.AddRangeAsync(post1, post2);
                await context.SaveChangesAsync();

                var modLog1 = new ModerationLog
                {
                    PostId = post1.Id,
                    AiLabel = "Vegan Purity High",
                    AiConfidence = 0.982m,
                    RiskLevel = "low",
                    Decision = "pending",
                    Reason = "Công thức thuần thực vật 100%, tỷ lệ protein cao, cân bằng canxi.",
                    ReviewedAt = DateTime.UtcNow.AddMinutes(-30)
                };
                await context.ModerationLogs.AddAsync(modLog1);
                await context.SaveChangesAsync();
            }
        }

        // 8. AI Models
        if (!await context.AiModels.AnyAsync())
        {
            var aiModels = new List<AiModel>
            {
                new() { Name = "Meal Planner LLM", Type = "meal_planner", Provider = "OpenAI", Version = "gpt-4o-mini", Status = "active" },
                new() { Name = "Nutrition Chatbot", Type = "chatbot", Provider = "OpenAI", Version = "gpt-4o-mini", Status = "active" },
                new() { Name = "Content Moderation", Type = "moderation", Provider = "OpenAI", Version = "omni-moderation", Status = "active" },
                new() { Name = "Ingredient Recognition", Type = "vision", Provider = "Google", Version = "gemini-flash", Status = "active" },
                new() { Name = "Freshness Classifier", Type = "vision", Provider = "Self-hosted", Version = "mobilenetv3-v1", Status = "inactive" }
            };
            await context.AiModels.AddRangeAsync(aiModels);
            await context.SaveChangesAsync();

            var firstUser = await context.Users.FirstOrDefaultAsync();
            var sampleLog = new AiModelLog
            {
                ModelId = aiModels[0].Id,
                UserId = firstUser?.Id,
                LatencyMs = 24,
                TokensUsed = 120,
                IsSuccess = true,
                MetricName = "Accuracy",
                MetricValue = 0.95m,
                CreatedAt = DateTime.UtcNow
            };
            await context.AiModelLogs.AddAsync(sampleLog);
            await context.SaveChangesAsync();
        }

        // 9. System Settings
        if (!await context.SystemSettings.AnyAsync())
        {
            var settings = new List<SystemSetting>
            {
                new() { Key = "moderation.medium_risk_threshold", Value = "0.50", Description = "AI confidence from which a post goes to the review queue" },
                new() { Key = "moderation.high_risk_threshold", Value = "0.80", Description = "AI confidence from which a post is hidden immediately" },
                new() { Key = "chatbot.guest_trial_limit", Value = "5", Description = "Number of free chatbot questions for guests" },
                new() { Key = "profile.reminder_days", Value = "30", Description = "Days before reminding users to update their profile" }
            };
            await context.SystemSettings.AddRangeAsync(settings);
            await context.SaveChangesAsync();
        }

        // 10. Permissions & Roles
        if (!await context.Permissions.AnyAsync())
        {
            var perms = new List<Permission>
            {
                new() { Id = "usr_read", Label = "Xem danh sách user", GroupName = "Người dùng" },
                new() { Id = "usr_write", Label = "Chỉnh sửa / Khóa", GroupName = "Người dùng" },
                new() { Id = "usr_role", Label = "Thay đổi quyền", GroupName = "Người dùng" },
                new() { Id = "nutri_read", Label = "Xem danh mục", GroupName = "Nguồn Dinh dưỡng" },
                new() { Id = "nutri_write", Label = "Thêm/Sửa danh mục", GroupName = "Nguồn Dinh dưỡng" },
                new() { Id = "content_approve", Label = "Duyệt bài / Công thức", GroupName = "Nội dung" },
                new() { Id = "content_delete", Label = "Gỡ bài vi phạm", GroupName = "Nội dung" },
                new() { Id = "sys_log", Label = "Xem Log hoạt động", GroupName = "Hệ thống" },
                new() { Id = "sys_ai", Label = "Cấu hình AI", GroupName = "Hệ thống" }
            };
            await context.Permissions.AddRangeAsync(perms);
            await context.SaveChangesAsync();
        }

        if (!await context.Roles.AnyAsync())
        {
            var roles = new List<Role>
            {
                new() { Id = "role-1", Name = "Super Admin", Description = "Quyền quản trị cao nhất, toàn quyền truy cập và thay đổi hệ thống.", IsSystem = true, Theme = "error", Icon = "admin_panel_settings" },
                new() { Id = "role-2", Name = "Chuyên gia Dinh dưỡng", Description = "Quản lý nguồn gốc thực phẩm và duyệt công thức theo tiêu chuẩn.", IsSystem = true, Theme = "primary", Icon = "local_hospital" },
                new() { Id = "role-4", Name = "Người dùng chuẩn", Description = "Xem công thức, sử dụng tính năng tra cứu AI và lưu bộ sưu tập.", IsSystem = true, Theme = "surface", Icon = "person" }
            };
            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();

            var allPerms = await context.Permissions.ToListAsync();
            // Role 1 gets all
            foreach (var p in allPerms)
            {
                context.RolePermissions.Add(new RolePermission { RoleId = "role-1", PermissionId = p.Id });
            }
            // Role 2
            var modPermIds = new[] { "usr_read", "nutri_read", "nutri_write", "content_approve", "content_delete" };
            foreach (var pid in modPermIds)
            {
                context.RolePermissions.Add(new RolePermission { RoleId = "role-2", PermissionId = pid });
            }
            await context.SaveChangesAsync();
        }

        // Dọn role demo "Đại sứ / Creator" (role-3) - hệ thống chỉ có 3 role: admin, moderator, user
        var legacyRole = await context.Roles.FirstOrDefaultAsync(r => r.Id == "role-3");
        if (legacyRole != null)
        {
            var legacyPerms = await context.RolePermissions.Where(rp => rp.RoleId == "role-3").ToListAsync();
            context.RolePermissions.RemoveRange(legacyPerms);
            context.Roles.Remove(legacyRole);
            await context.SaveChangesAsync();
        }

        // 11. Initial System Audit Logs
        if (!await context.SystemLogs.AnyAsync())
        {
            var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "admin");
            var mod = await context.Users.FirstOrDefaultAsync(u => u.Role == "moderator");

            var logs = new List<SystemLog>
            {
                new() { UserId = admin?.Id, Action = "Hệ thống khởi động", Target = "Server Cluster", Details = "Khởi chạy cụm dịch vụ VeggieAI trên nền tảng .NET 10", LogType = "system", CreatedAt = DateTime.UtcNow.AddHours(-1) },
                new() { UserId = admin?.Id, Action = "Cập nhật quyền", Target = "Chuyên gia Dinh dưỡng", Details = "Gán quyền duyệt công thức và quản lý danh mục", LogType = "role_management", CreatedAt = DateTime.UtcNow.AddMinutes(-45) },
                new() { UserId = mod?.Id, Action = "Phê duyệt nội dung", Target = "Công thức Bún Riêu Chay", Details = "Đánh giá đạt chuẩn 100% thuần chay", LogType = "moderation", CreatedAt = DateTime.UtcNow.AddMinutes(-30) },
                new() { UserId = admin?.Id, Action = "Khóa tài khoản", Target = "Spam Account", Details = "Tài khoản spam nội dung thương mại", LogType = "user_management", CreatedAt = DateTime.UtcNow.AddMinutes(-10) }
            };
            await context.SystemLogs.AddRangeAsync(logs);
            await context.SaveChangesAsync();
        }

        // 12. Ensure Rich Posts & Moderation Items
        if (await context.Posts.CountAsync() < 7)
        {
            var author = await context.Users.FirstOrDefaultAsync(u => u.Role == "user") ?? await context.Users.FirstAsync();
            var verifier = await context.Users.FirstOrDefaultAsync(u => u.Role == "moderator" || u.Role == "admin") ?? author;
            var spammer = await context.Users.FirstOrDefaultAsync(u => u.Status == "locked") ?? author;
            var catMain = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Món chính" || c.Name.Contains("kho")) ?? await context.Categories.FirstAsync();
            var catSoup = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Món nước" || c.Name.Contains("Canh")) ?? await context.Categories.FirstAsync();
            var catSalad = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Salad" || c.Name.Contains("Salad")) ?? await context.Categories.FirstAsync();

            var r1 = new Recipe { CategoryId = catMain.Id, CreatedBy = author.Id, VerifiedBy = verifier.Id, VerifiedAt = DateTime.UtcNow.AddDays(-2), Title = "Cà Ri Bí Đỏ Cốt Dừa Nam Bộ", ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60", Instructions = "Hầm bí đỏ với nước cốt dừa tươi, nấm đùi gà và đậu gà hữu cơ.", Servings = 2, KcalPerServing = 385, ProteinG = 14.5m, CarbG = 52.0m, FatG = 12.0m, Status = "published" };
            var r2 = new Recipe { CategoryId = catSoup.Id, CreatedBy = author.Id, VerifiedBy = verifier.Id, VerifiedAt = DateTime.UtcNow.AddDays(-3), Title = "Canh Rong Biển Đậu Hũ Non Thanh Nhiệt", ImageUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60", Instructions = "Nấu nước dùng rau củ, thả đậu hũ non và rong biển wakame ngâm nở.", Servings = 3, KcalPerServing = 160, ProteinG = 11.2m, CarbG = 16.5m, FatG = 4.2m, Status = "published" };
            var r3 = new Recipe { CategoryId = catSalad.Id, CreatedBy = author.Id, VerifiedBy = verifier.Id, VerifiedAt = DateTime.UtcNow.AddDays(-5), Title = "Gỏi Cuốn Ngũ Sắc Chấm Tương Bơ Đậu Phộng", ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60", Instructions = "Cuốn bánh tráng với rau thơm, bắp cải tím, dưa leo, đậu hũ áp chảo.", Servings = 2, KcalPerServing = 240, ProteinG = 8.5m, CarbG = 34.0m, FatG = 6.8m, Status = "published" };
            var r4 = new Recipe { CategoryId = catMain.Id, CreatedBy = author.Id, VerifiedBy = verifier.Id, VerifiedAt = DateTime.UtcNow.AddDays(-7), Title = "Bánh Xèo Chay Nấm Mối Miền Tây", ImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60", Instructions = "Pha bột gạo với cốt dừa và nghệ, đổ bánh mỏng giòn kẹp nấm mối xào.", Servings = 2, KcalPerServing = 310, ProteinG = 10.2m, CarbG = 45.0m, FatG = 9.0m, Status = "published" };
            var r5 = new Recipe { CategoryId = catSalad.Id, CreatedBy = author.Id, VerifiedBy = verifier.Id, VerifiedAt = DateTime.UtcNow.AddDays(-1), Title = "Gỏi Ngó Sen Nấm Tuyết Sốt Tắc Chua Ngọt", ImageUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60", Instructions = "Ngó sen giòn sần sật phối cùng nấm tuyết ngâm nở, cà rốt bào sợi và sốt tắc pha đường thốt nốt.", Servings = 2, KcalPerServing = 165, ProteinG = 4.2m, CarbG = 28.0m, FatG = 2.0m, Status = "published" };

            await context.Recipes.AddRangeAsync(r1, r2, r3, r4, r5);
            await context.SaveChangesAsync();

            var p1 = new Post { UserId = author.Id, RecipeId = r1.Id, PostType = "blog", Title = "Cà ri bí đỏ cốt dừa kiểu Nam Bộ", Content = "Món cà ri thuần chay béo ngậy tự nhiên từ nước cốt dừa và bí đỏ chín cây, kết hợp đậu hũ chiên non và khoai lang mật.", MediaUrl = r1.ImageUrl, Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-1) };
            var p2 = new Post { UserId = author.Id, RecipeId = r2.Id, PostType = "blog", Title = "Canh Rong Biển Đậu Hũ Non Thanh Nhiệt", Content = "Canh rong biển đậu phụ giàu i-ốt và canxi hữu cơ tự nhiên, thanh lọc cơ thể trong những ngày thời tiết oi bức.", MediaUrl = r2.ImageUrl, Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-3) };
            var p3 = new Post { UserId = author.Id, RecipeId = r3.Id, PostType = "video", Title = "Video: Bí quyết làm tương hột chay thủ công lên men truyền thống", Content = "Video từng bước làm nước chấm bơ đậu phộng và ủ tương đậu nành truyền thống 21 ngày sạch không hóa chất phụ gia.", MediaUrl = r3.ImageUrl, VideoSummary = "Bước 1: Ngâm nở đậu nành. Bước 2: Lên men tự nhiên 21 ngày. Bước 3: Nấu tương sánh kẹo.", Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-5) };
            var p4 = new Post { UserId = author.Id, RecipeId = r4.Id, PostType = "blog", Title = "Bánh Xèo Chay Nấm Mối Giòn Tan", Content = "Bí quyết pha bột bánh xèo chay giòn rụm không cần trứng với nước cốt dừa béo bùi và hành ba-rô phi vàng.", MediaUrl = r4.ImageUrl, Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-8) };
            var p5 = new Post { UserId = author.Id, RecipeId = r5.Id, PostType = "blog", Title = "Công thức: Gỏi ngó sen nấm tuyết sốt tắc chua ngọt", Content = "Ngó sen giòn sần sật phối cùng nấm tuyết ngâm nở, cà rốt bào sợi và sốt tắc pha đường thốt nốt thanh khiết bổ sung chất xơ hòa tan.", MediaUrl = r5.ImageUrl, Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-12) };
            var pReport = new Post { UserId = spammer.Id, RecipeId = null, PostType = "blog", Title = "Báo cáo vi phạm: Bình luận nghi vấn quảng cáo sai lệch thực phẩm chức năng", Content = "Bình luận chứa liên kết dẫn tới website bán viên uống giảm cân không rõ nguồn gốc trong bài viết 'Tác dụng men dinh dưỡng'. Nghi vấn spam liên kết tiếp thị vi phạm chính sách cộng đồng VeggieAI.", MediaUrl = null, Status = "pending", CreatedAt = DateTime.UtcNow.AddHours(-2) };

            await context.Posts.AddRangeAsync(p1, p2, p3, p4, p5, pReport);
            await context.SaveChangesAsync();

            var moreModLogs = new List<ModerationLog>
            {
                new() { PostId = p1.Id, AiLabel = "Vegan Purity 100%", AiConfidence = 0.982m, RiskLevel = "low", Decision = "pending", Reason = "Công thức hoàn hảo, đầy đủ đạm thực vật từ đậu gà và cốt dừa.", ReviewedAt = DateTime.UtcNow.AddMinutes(-50) },
                new() { PostId = p2.Id, AiLabel = "Vegan Purity 100%", AiConfidence = 0.965m, RiskLevel = "low", Decision = "pending", Reason = "Nguồn khoáng chất I-ốt và canxi dồi dào, an toàn với người dị ứng hạt.", ReviewedAt = DateTime.UtcNow.AddMinutes(-40) },
                new() { PostId = p3.Id, AiLabel = "Vegan Purity 98%", AiConfidence = 0.950m, RiskLevel = "low", Decision = "pending", Reason = "Lưu ý cảnh báo dị ứng đậu phộng trong nước xốt.", ReviewedAt = DateTime.UtcNow.AddMinutes(-20) },
                new() { PostId = p4.Id, AiLabel = "Vegan Purity 92%", AiConfidence = 0.880m, RiskLevel = "low", Decision = "pending", Reason = "Đạt tiêu chuẩn chay, cần hướng dẫn thêm về độ nóng của chảo.", ReviewedAt = DateTime.UtcNow.AddMinutes(-10) },
                new() { PostId = p5.Id, AiLabel = "Vegan Purity 99.8%", AiConfidence = 0.974m, RiskLevel = "low", Decision = "pending", Reason = "Công thức thanh nhiệt giàu vitamin C tự nhiên từ tắc chín và ngó sen tươi.", ReviewedAt = DateTime.UtcNow.AddMinutes(-5) },
                new() { PostId = pReport.Id, AiLabel = "Toxicity & Spam Alert", AiConfidence = 0.880m, RiskLevel = "high", Decision = "pending", Reason = "Phát hiện mã URL tiếp thị liên kết vi phạm quy định cộng đồng VeggieAI.", ReviewedAt = DateTime.UtcNow.AddMinutes(-2) }
            };
            await context.ModerationLogs.AddRangeAsync(moreModLogs);
            await context.SaveChangesAsync();
        }

        // 13. Ensure Rich Audit Logs
        if (await context.SystemLogs.CountAsync() < 10)
        {
            var admin = await context.Users.FirstOrDefaultAsync(u => u.Role == "admin");
            var mod = await context.Users.FirstOrDefaultAsync(u => u.Role == "moderator");
            var moreLogs = new List<SystemLog>
            {
                new() { UserId = admin?.Id, Action = "Đăng nhập hệ thống", Target = "admin@veggie.vn", Details = "Đăng nhập thành công với vai trò: admin", LogType = "auth", CreatedAt = DateTime.UtcNow.AddMinutes(-5) },
                new() { UserId = admin?.Id, Action = "Cập nhật phân quyền", Target = "Chuyên gia Dinh dưỡng", Details = "Gán thêm quyền kiểm duyệt video thực dưỡng", LogType = "role_management", CreatedAt = DateTime.UtcNow.AddMinutes(-18) },
                new() { UserId = mod?.Id, Action = "Phê duyệt nội dung", Target = "Bún Riêu Chay Đậu Hũ Non", Details = "Đạt tiêu chuẩn 100% thuần chay, AI Score: 98/100", LogType = "moderation", CreatedAt = DateTime.UtcNow.AddMinutes(-35) },
                new() { UserId = admin?.Id, Action = "Tạo tài khoản mới", Target = "Trần Bích Thảo", Details = "Thêm người dùng mới vào nhóm Chay Trứng - Sữa", LogType = "user_management", CreatedAt = DateTime.UtcNow.AddHours(-1) },
                new() { UserId = admin?.Id, Action = "Khóa tài khoản", Target = "spammer@veggie.vn", Details = "Khóa do phát hiện spam link quảng cáo tự động", LogType = "user_management", CreatedAt = DateTime.UtcNow.AddHours(-2) },
                new() { UserId = mod?.Id, Action = "Yêu cầu chỉnh sửa", Target = "Bánh Xèo Chay", Details = "Yêu cầu tác giả bổ sung định lượng dầu chiên", LogType = "moderation", CreatedAt = DateTime.UtcNow.AddHours(-4) },
                new() { UserId = admin?.Id, Action = "Cấu hình AI Inference", Target = "Gemini Flash Vision", Details = "Tối ưu hóa độ trễ nhận diện nguyên liệu xuống 21ms", LogType = "system", CreatedAt = DateTime.UtcNow.AddHours(-6) }
            };
            await context.SystemLogs.AddRangeAsync(moreLogs);
            await context.SaveChangesAsync();
        }
    }
}
