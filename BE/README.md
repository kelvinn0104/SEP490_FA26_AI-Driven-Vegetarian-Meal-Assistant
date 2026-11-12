# VeggieAI Backend (.NET 10 RESTful API)

Hệ thống Backend cho nền tảng **VeggieAI - Trợ lý Chế độ ăn Thuần thực vật & Quản trị AI**, được xây dựng bằng kiến trúc 4 lớp chuẩn Enterprise theo yêu cầu.

---

## 🏗️ Cấu trúc Kiến trúc 4 Lớp (4-Layer Architecture)

```
VeggieAI-BE/
├── VeggieAI.sln                         # Solution file quản lý toàn bộ 4 projects
│   ├── Entities/                        # Mapped 100% với schema VeggieAI_Database.sql
│   │   ├── User.cs                      # User, Role, Status, CreatedAt
│   │   ├── HealthProfile.cs             # Chỉ số dinh dưỡng cá nhân, TDEE, BMR, Macro targets
│   │   ├── NutritionEntities.cs         # Ingredient, Allergy, NutrientStandard, GoalStandard
│   │   ├── RecipeEntities.cs            # Recipe, Category, RecipeIngredient, Favorite
│   │   ├── MealPlanningEntities.cs      # MealPlan, MealPlanItem, ChatSession, ShoppingList, MealLog
│   │   ├── CommunityEntities.cs         # Post, Comment, PostVote, Report, ModerationLog
│   │   └── AiAndAdminEntities.cs        # AiModel, AiModelLog, AiFeedback, SystemSetting, Notification
│   └── DTOs/                            # Data Transfer Objects
│       ├── CommonDtos.cs                # ApiResponse<T>, PagedResult<T>
│       ├── UserAndAuthDtos.cs           # LoginRequest, RegisterRequest, UserDto, CreateUserRequest
│       ├── CategoryAndRecipeDtos.cs     # CategoryDto, RecipeDto, CreateRecipeRequest
│       └── DashboardAndAdminDtos.cs     # DashboardOverviewDto, ModerationItemDto, AiTelemetryLogDto
│
├── VeggieAI.Repository/                 # 2. Tầng Repository (Data Access & EF Core)
│   ├── Data/
│   │   ├── VeggieAIDbContext.cs         # DbContext cấu hình schema 'veggieai', composite keys & indexes
│   │   └── DatabaseSeeder.cs            # Nạp dữ liệu hạt giống ban đầu & tài khoản mẫu
│   └── Repositories/
│       ├── Repository.cs                # Generic Repository (IRepository<T>)
│       └── SpecializedRepositories.cs   # IUserRepository, IRecipeRepository, ICategoryRepository, 
│                                        # IModerationRepository, IAiModelRepository, IUnitOfWork
│
├── VeggieAI.Service/                    # 3. Tầng Service (Business Logic)
│   └── Services/
│       ├── AuthService.cs               # Mã hóa BCrypt, sinh JWT Token, xác thực
│       ├── UserService.cs               # Quản lý người dùng, lọc chế độ ăn, khóa/mở khóa tài khoản
│       ├── CategoryAndRecipeService.cs  # Quản lý danh mục chay, công thức & bài viết
│       └── DashboardAndAdminServices.cs # Dashboard thống kê, Duyệt nội dung, Giám sát AI, Phân quyền
│
└── VeggieAI.API/                        # 4. Tầng API (Controllers & Presentation)
    ├── Controllers/
    │   ├── AuthAndUsersControllers.cs   # /api/auth, /api/users
    │   ├── CategoriesAndRecipesControllers.cs # /api/categories, /api/recipes
    │   └── DashboardAndAdminControllers.cs # /api/moderation, /api/ai, /api/dashboard, /api/roles
    ├── Middlewares/
    │   └── ExceptionMiddleware.cs       # Bắt lỗi toàn cục, trả về ApiResponse chuẩn hóa
    ├── appsettings.json                 # Cấu hình chuỗi kết nối PostgreSQL, JWT, CORS
    └── Program.cs                       # Cấu hình DI, JWT, Swagger, CORS, Tự động phát hiện DB
```

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **.NET SDK 10.0** (hoặc .NET 8.0/9.0)
- **PostgreSQL 14+** (Tùy chọn: Hệ thống tự động chuyển sang `InMemory Database` kèm đầy đủ dữ liệu giả lập nếu chưa cấu hình mật khẩu PostgreSQL).

### 2. Build Dự Án
```powershell
cd d:\VeggieAI\VeggieAI-BE
dotnet build VeggieAI.sln
```

### 3. Chạy Backend
```powershell
dotnet run --project VeggieAI.API/VeggieAI.API.csproj
```
- Khi chạy, API sẽ lắng nghe tại: `http://localhost:5064`
- Truy cập Swagger UI trực tiếp tại: `http://localhost:5064/` hoặc `http://localhost:5064/index.html`

---

## 🔑 Tài Khoản Mặc Định Đã Seed
| Vai trò | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@veggie.vn` | `Password123!` | Toàn quyền quản trị hệ thống, giám sát AI, phân quyền |
| **Moderator (Dinh dưỡng)** | `mod@veggie.vn` | `Password123!` | Kiểm duyệt bài viết, công thức, quản lý danh mục |
| **User (Chef)** | `chef.maianh@gmail.com` | `Password123!` | Người dùng đăng công thức, tạo thực đơn |
| **User (Bị khóa)** | `spammer@veggie.vn` | `Password123!` | Tài khoản mẫu bị khóa (Status: `locked`) |

---

## 📡 Danh Sách Các RESTful API Endpoints

### 1. Xác thực & Phân quyền (`/api/auth`)
- `POST /api/auth/login`: Đăng nhập (trả về JWT Token & thông tin người dùng)
- `POST /api/auth/register`: Đăng ký tài khoản. Mặc định role `user`; đăng ký `admin`/`moderator` cần mã mời cấu hình qua biến môi trường `Auth__AdminInviteCodes` / `Auth__ModeratorInviteCodes` (nhiều mã cách nhau dấu phẩy)
- `POST /api/auth/logout`: Đăng xuất
- `GET /api/auth/me`: Lấy thông tin user hiện tại qua JWT Bearer

### 2. Quản lý Người dùng (`/api/users`)
- `GET /api/users`: Danh sách người dùng (hỗ trợ tìm kiếm theo tên/email/id, lọc theo chế độ ăn `diet`, vai trò `role`, trạng thái `status`)
- `GET /api/users/{id}`: Chi tiết người dùng và hồ sơ dinh dưỡng
- `POST /api/users`: Tạo tài khoản mới từ Admin
- `PUT /api/users/{id}/role`: Thay đổi quyền tài khoản
- `PUT /api/users/{id}/lock`: Khóa tài khoản
- `PUT /api/users/{id}/unlock`: Mở khóa tài khoản
- `DELETE /api/users/{id}`: Xóa tài khoản

### 3. Quản lý Danh mục (`/api/categories`)
- `GET /api/categories`: Danh sách danh mục (lọc theo `food_type` hoặc `recipe`)
- `POST /api/categories`: Thêm danh mục mới
- `PUT /api/categories/{id}`: Cập nhật danh mục
- `DELETE /api/categories/{id}`: Xóa danh mục

### 4. Quản lý Công thức (`/api/recipes`)
- `GET /api/recipes`: Danh sách công thức (tìm kiếm, lọc trạng thái `published`/`hidden`, lọc theo danh mục)
- `GET /api/recipes/{id}`: Chi tiết công thức & thành phần dinh dưỡng
- `POST /api/recipes`: Tạo mới công thức
- `PUT /api/recipes/{id}/status`: Đổi trạng thái (`published`, `hidden`, `draft`)
- `DELETE /api/recipes/{id}`: Xóa công thức

### 5. Hàng đợi Kiểm duyệt (`/api/moderation`)
- `GET /api/moderation/pending`: Danh sách nội dung chờ duyệt (kèm điểm AI đánh giá độ thuần chay và dinh dưỡng)
- `GET /api/moderation/count`: Số lượng bài viết đang chờ duyệt
- `POST /api/moderation/{id}/approve`: Phê duyệt và tự động xuất bản
- `POST /api/moderation/{id}/reject`: Từ chối bài viết vi phạm
- `POST /api/moderation/{id}/revision`: Yêu cầu tác giả chỉnh sửa

### 6. Giám sát AI (`/api/ai`)
- `GET /api/ai/health`: Kiểm tra tình trạng sức khỏe cụm máy chủ AI
- `GET /api/ai/models`: Danh sách các mô hình AI (`meal_planner`, `chatbot`, `vision`, `moderation`)
- `PUT /api/ai/models/{id}/status`: Bật/Tắt mô hình (`active`, `inactive`, `retraining`)
- `GET /api/ai/telemetry`: Lấy luồng log telemetry thời gian thực
- `POST /api/ai/recipe/parse-macros`: Phân tích macro, vi chất (B12, Sắt, Canxi) và cảnh báo dị ứng từ nguyên liệu đầu vào

### 7. Dashboard Thống kê (`/api/dashboard`)
- `GET /api/dashboard/stats`: Số liệu tổng quan (Tổng user, tăng trưởng, GPU/RAM cluster, độ chính xác AI)
- `GET /api/dashboard/diet-distribution`: Phân bổ chế độ ăn (Vegan, Lacto-Ovo, Flexitarian,...)
- `GET /api/dashboard/charts`: Biểu đồ hoạt động theo tuần (công thức, truy vấn AI, người dùng)
- `GET /api/dashboard/activities`: Hoạt động gần đây của hệ thống

### 8. Quản lý Vai trò (`/api/roles`)
- `GET /api/roles`: Danh sách vai trò và số lượng người dùng
- `GET /api/roles/permissions`: Danh sách tất cả quyền hạn hệ thống
- `POST /api/roles`: Tạo vai trò mới
- `PUT /api/roles/{id}`: Cập nhật quyền hạn cho vai trò

### 9. Hồ sơ sức khỏe & dị ứng (`/api/health-profile`, `/api/allergies`) 🔒
- `GET /api/health-profile`: Hồ sơ của user đang đăng nhập (404 nếu chưa tạo)
- `PUT /api/health-profile`: Tạo/cập nhật hồ sơ, tự tính BMI/BMR/TDEE + mục tiêu dinh dưỡng/ngày
- `POST /api/health-profile/preview`: Tính thử, không lưu (không cần token)
- `GET|PUT /api/health-profile/allergies`: Dị ứng của user (`{ allergyIds: [1,3] }`)
- `GET /api/allergies`: Danh mục dị ứng (không cần token)

### 10. Thực đơn đã lưu & đi chợ (`/api/meal-plans`) 🔒
- `POST /api/meal-plans/ai/generate` (alias `/api/meal-plans/generate`), `POST /api/meal-plans/ai/{planId}/items/{itemId}/swap` (alias `/api/meal-plans/{planId}/items/{itemId}/swap`)
- `GET /api/meal-plans/current` (204 nếu chưa có thực đơn active), `GET /api/meal-plans?status=&page=&pageSize=`, `GET /api/meal-plans/{id}`
- `PATCH /api/meal-plans/{id}/status` `{ status: "active" }`, `DELETE /api/meal-plans/{id}`
- `POST|GET /api/meal-plans/{planId}/shopping-list`, `PATCH /api/meal-plans/{planId}/shopping-list/items/{itemId}` `{ isBought: true }`

### 11. Yêu thích (`/api/recipes`) 🔒
- `GET /api/recipes/favorites?page=&pageSize=`, `POST /api/recipes/{id}/favorite`, `DELETE /api/recipes/{id}/favorite`

### 12. Theo dõi dinh dưỡng (`/api/nutrition`) 🔒
- `POST /api/nutrition/logs` `{ planItemId }` hoặc `{ recipeId, mealType?, servings?, logDate? }`, `DELETE /api/nutrition/logs/{id}`
- `GET /api/nutrition/daily?date=` (tổng đã ăn, mục tiêu, vận động, cảnh báo thiếu chất — hôm nay chỉ cảnh báo sau 19h VN)
- `GET /api/nutrition/trend?from=&to=` (mặc định 7 ngày, tối đa 93), `PUT /api/nutrition/activity` `{ activityDate?, kcalBurned, steps }`

### 13. Cộng đồng (`/api/community`)
- `GET /api/community/posts?keyword=&postType=blog|video&sort=newest|top&page=&pageSize=` (không cần token), `GET /api/community/posts/{id}`
- 🔒 `GET /api/community/posts/mine`, `POST /api/community/posts` (trạng thái `pending`, duyệt qua `/api/Moderation`), `DELETE /api/community/posts/{id}`
- 🔒 `POST /api/community/posts/{id}/comments`, `DELETE /api/community/comments/{id}`, `PUT /api/community/posts/{id}/vote` `{ value: 1|-1|0 }`, `POST /api/community/reports`

### Gemini
- `Ai__Gemini__ThinkingLevel` (mặc định `low`) cho Gemini 3 / alias `*-latest`; `Ai__Gemini__ThinkingBudget` (mặc định 0) cho model 2.5. Model không hỗ trợ → tự gọi lại không kèm cấu hình suy nghĩ.

### Phân quyền
- `admin`: Users, Roles, Logs (GET), đổi trạng thái model AI.
- `admin` + `moderator`: Moderation, Dashboard, Ai, ghi Categories, đổi trạng thái/xóa Recipes.
- Đăng nhập (mọi role): tạo Recipe (user → `pending_verification`), hồ sơ sức khỏe, thực đơn, yêu thích, scan, chat.

### Email OTP
- `Email__Provider=smtp|brevo|resend`. Render gói free có thể chặn cổng SMTP → dùng `brevo`/`resend` (HTTPS) với `Email__ApiKey`, `Email__FromEmail` (đã xác minh), `Email__Enabled=true`.
- Demo không có email: để `Email__Enabled=false` (OTP in ra log) hoặc `Otp__ExposeOtpInResponse=true` (chỉ dùng khi demo).
