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
- `POST /api/auth/login`: Đăng nhập → `{ token, refreshToken, expiresAt, refreshTokenExpiresAt, user }`
- `POST /api/auth/register`: Đăng ký tài khoản (trạng thái `pending`, gửi OTP). Mặc định role `user`; đăng ký `admin`/`moderator` cần mã mời cấu hình qua biến môi trường `Auth__AdminInviteCodes` / `Auth__ModeratorInviteCodes` (nhiều mã cách nhau dấu phẩy)
- `POST /api/auth/verify-code`, `POST /api/auth/resend-code`: Xác thực / gửi lại OTP
- `POST /api/auth/refresh` `{ refreshToken }`: Lấy cặp token mới (rotation — refresh token cũ hết hiệu lực ngay)
- `POST /api/auth/logout` `{ refreshToken? }`: Đăng xuất, thu hồi **mọi** access/refresh token của tài khoản
- `POST /api/auth/forgot-password` `{ email }` → `POST /api/auth/reset-password` `{ email, otpCode, newPassword }`: Quên mật khẩu bằng OTP email
- `GET /api/auth/me`, `PUT /api/auth/me` `{ displayName?, avatarUrl? }`
- `POST /api/auth/change-password`: Đổi mật khẩu → thu hồi phiên cũ, **trả cặp token mới** (FE thay token đang lưu)
- Lỗi 401 luôn là JSON, `errors[0]`: `TOKEN_EXPIRED` (gọi refresh) | `SESSION_REVOKED` | `ACCOUNT_LOCKED` | `TOKEN_INVALID` | `UNAUTHORIZED` (đăng nhập lại)

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
- `GET /api/recipes?search=&categoryId=&sort=`: Toàn bộ danh mục (khách/user chỉ thấy `published`). `sort`: `newest` | `oldest` | `popular` | `protein` | `kcal_asc` | `kcal_desc` | `title`
- `GET /api/recipes/paged?search=&categoryId=&sort=&page=1&pageSize=20`: Danh mục có phân trang
- `GET /api/recipes/{id}`: Chi tiết + nguyên liệu; gửi token → có `isFavorite`. Công thức chưa `published` chỉ tác giả/staff xem được (người khác 404). `views` là lượt xem thật
- `POST /api/recipes`: Tạo mới công thức (user bắt buộc có nguyên liệu; staff không nhập nguyên liệu → lưu `draft`)
- `PUT /api/recipes/{id}/status`: Đổi trạng thái (`published`, `hidden`, `draft`). Không cho `published` khi chưa có nguyên liệu/dinh dưỡng (`RECIPE_MISSING_INGREDIENTS`)
- `DELETE /api/recipes/{id}`: Xóa công thức

### 5. Hàng đợi Kiểm duyệt (`/api/moderation`)
- `GET /api/moderation/pending`: Danh sách nội dung chờ duyệt (kèm điểm AI đánh giá độ thuần chay và dinh dưỡng)
- `GET /api/moderation/count`: Số lượng bài viết đang chờ duyệt
- `POST /api/moderation/{id}/approve`: Phê duyệt và tự động xuất bản
- `POST /api/moderation/{id}/reject`: Từ chối bài viết vi phạm
- `POST /api/moderation/{id}/revision`: Yêu cầu tác giả chỉnh sửa (tác giả nhận thông báo `post_review` cho cả 3 quyết định)
- `GET /api/moderation/reports?status=open|resolved|dismissed|all&page=&pageSize=`: Báo cáo vi phạm từ người dùng
- `POST /api/moderation/reports/{reportId}/handle` `{ status: resolved|dismissed, removeContent?, note? }`: Xử lý báo cáo, người báo cáo nhận thông báo `report_result`

### 6. Giám sát AI (`/api/ai`)
- `GET /api/ai/health` (alias `/api/health`): Trạng thái thật — DB kết nối được không, AI đã cấu hình chưa, storage có bền không, thời gian chạy
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

### 9. Thư viện Nguyên liệu & Vi chất Dinh dưỡng (`/api/ingredients`)
- `GET /api/ingredients`: Danh sách nguyên liệu chay (tìm kiếm, lọc dị ứng, sắp xếp theo đạm, sắt, B12, canxi, calo)
- `GET /api/ingredients/{id}`: Chi tiết thành phần dinh dưỡng nguyên liệu
- `POST /api/ingredients`: Thêm nguyên liệu chay chuẩn hóa mới (Mod/Admin)
- `PUT /api/ingredients/{id}`: Cập nhật thành phần vi chất
- `DELETE /api/ingredients/{id}`: Xóa nguyên liệu
- `GET /api/ingredients/allergies`: Danh sách nhóm dị ứng thực vật và số nguyên liệu liên quan
- `GET /api/ingredients/standards`: Bảng nhu cầu khuyến nghị vi chất (RDI) theo giới tính và độ tuổi

### 10. Hồ sơ sức khỏe & dị ứng (`/api/health-profile`, `/api/allergies`) 🔒
- `GET /api/health-profile`: Hồ sơ của user đang đăng nhập (404 nếu chưa tạo)
- `PUT /api/health-profile`: Tạo/cập nhật hồ sơ, tự tính BMI/BMR/TDEE + mục tiêu dinh dưỡng/ngày
- `POST /api/health-profile/preview`: Tính thử, không lưu (không cần token)
- `GET|PUT /api/health-profile/allergies`: Dị ứng của user (`{ allergyIds: [1,3] }`)
- `GET /api/allergies`: Danh mục dị ứng (không cần token)

### 11. Thực đơn đã lưu & đi chợ (`/api/meal-plans`) 🔒
- `POST /api/meal-plans/ai/generate` (alias `/api/meal-plans/generate`) — chỉ chọn món `published`, có nguyên liệu, không chứa chất dị ứng của user
- `POST /api/meal-plans/ai/{planId}/items/{itemId}/swap` (alias `/api/meal-plans/{planId}/items/{itemId}/swap`) `{ reason?, recipeId?, servings? }` — có `recipeId` thì dùng đúng món đó
- `POST /api/meal-plans/{planId}/items` `{ planDate, mealType, recipeId, servings }`, `PATCH /api/meal-plans/{planId}/items/{itemId}` `{ servings?, mealType?, planDate?, recipeId? }`, `DELETE /api/meal-plans/{planId}/items/{itemId}`
- Sau mỗi lần đổi/thêm/sửa/xóa món, danh sách đi chợ (nếu đã tạo) tự cập nhật, giữ trạng thái "đã mua" theo nguyên liệu
- `GET /api/meal-plans/current` (204 nếu chưa có thực đơn active), `GET /api/meal-plans?status=&page=&pageSize=`, `GET /api/meal-plans/{id}`
- `PATCH /api/meal-plans/{id}/status` `{ status: "active" }`, `DELETE /api/meal-plans/{id}`
- `POST|GET /api/meal-plans/{planId}/shopping-list`, `PATCH /api/meal-plans/{planId}/shopping-list/items/{itemId}` `{ isBought: true }`

### 12. Yêu thích (`/api/recipes`) 🔒
- `GET /api/recipes/favorites?page=&pageSize=`, `POST /api/recipes/{id}/favorite`, `DELETE /api/recipes/{id}/favorite`

### 13. Theo dõi dinh dưỡng (`/api/nutrition`) 🔒
- `POST /api/nutrition/logs` `{ planItemId }` hoặc `{ recipeId, mealType?, servings?, logDate? }`, `PATCH /api/nutrition/logs/{id}` `{ servings?, mealType?, logDate? }`, `DELETE /api/nutrition/logs/{id}`
- `GET /api/nutrition/daily?date=` (tổng đã ăn, mục tiêu, vận động, cảnh báo thiếu chất — hôm nay chỉ cảnh báo sau 19h VN)
- `GET /api/nutrition/trend?from=&to=` (mặc định 7 ngày, tối đa 93), `PUT /api/nutrition/activity` `{ activityDate?, kcalBurned, steps }`

### 14. Cộng đồng (`/api/community`)
- `GET /api/community/posts?keyword=&postType=blog|video&sort=newest|top&page=&pageSize=` (không cần token) — mỗi bài có `excerpt`, `authorId`, `canEdit`, `canDelete`
- `GET /api/community/posts/{id}` (kèm `canEdit`, `canDelete`, `updatedAt`; `moderation` chỉ cho tác giả/staff), `GET /api/community/posts/{id}/comments?page=&pageSize=`
- 🔒 `GET /api/community/posts/mine` (mọi trạng thái, kể cả bị từ chối, kèm `moderation { decision, note, reviewedAt }`)
- 🔒 `POST /api/community/posts` (trạng thái `pending`), `PUT /api/community/posts/{id}` (tác giả sửa → quay về `pending` để duyệt lại), `DELETE /api/community/posts/{id}`
- 🔒 `POST /api/community/posts/{id}/comments`, `PUT|DELETE /api/community/comments/{id}`, `PUT /api/community/posts/{id}/vote` `{ value: 1|-1|0 }`
- 🔒 `POST /api/community/reports`, `GET /api/community/reports/mine`

### 15. Upload, nguyên liệu, scan, chat, thông báo
- 🔒 `POST /api/uploads` (multipart `file`, `purpose` = `post` | `avatar` | `recipe`) → `{ url, contentType, size, kind, durable }`. Kiểm tra định dạng thật theo nội dung file: ảnh ≤ 8 MB, video MP4/WEBM/MOV ≤ 50 MB (chỉ `post`)
- `GET /api/ingredients?search=&limit=20`: Tra nguyên liệu theo tên (không phân biệt dấu)
- 🔒 `GET /api/scans?page=&pageSize=`, `DELETE /api/scans/{id}` (xóa cả file ảnh)
- 🔒 Chat: AI lỗi/chưa cấu hình → HTTP 503, `errors[0]` = `AI_UNAVAILABLE` | `AI_NOT_CONFIGURED`, không lưu câu báo lỗi như tin AI
- 🔒 `GET /api/notifications?unreadOnly=&page=&pageSize=` — thông báo thật khi bài/công thức được duyệt, có bình luận mới, báo cáo được xử lý

### Phân trang & lỗi
- Mọi endpoint phân trang nhận `?page=1&pageSize=20` (tối đa 100) và trả `{ items, totalCount, page, pageSize, totalPages }`.
- Lỗi trả `{ success: false, message, errors: [ERROR_CODE, ...], traceId }`. Lỗi 500 không lộ chi tiết exception (xem log BE theo `traceId`).

### Lưu file
- Mặc định lưu ổ đĩa server (`Storage:LocalRoot`, phục vụ ở `/uploads/...`) — **mất khi Render redeploy**.
- Production nên dùng Cloudinary: `Storage__Provider=cloudinary`, `Storage__Cloudinary__CloudName`, `Storage__Cloudinary__ApiKey`, `Storage__Cloudinary__ApiSecret` (tùy chọn `Storage__Cloudinary__Folder`, mặc định `veggieai`).

### JWT
- `Jwt__ExpiryDays` (mặc định 7): hạn access token. `Jwt__RefreshTokenDays` (mặc định 30): hạn refresh token.
- Access token mang claim `tv` (TokenVersion); đăng xuất / đổi / đặt lại mật khẩu / bị khóa / đổi role → token cũ trả 401 `SESSION_REVOKED`.

### Database
- DB đã có sẵn: khi khởi động BE tự chạy `DatabaseSchemaUpgrader` (thêm cột/bảng mới, idempotent). Có thể chạy tay `database/migrations/20261106_api_audit_fixes.sql`.
- Seeder tự gắn nguyên liệu cho các công thức demo chưa có nguyên liệu (chỉ khi thư viện có đủ nguyên liệu của món đó).

### Gemini
- `Ai__Gemini__ThinkingLevel` (mặc định `low`) cho Gemini 3 / alias `*-latest`; `Ai__Gemini__ThinkingBudget` (mặc định 0) cho model 2.5. Model không hỗ trợ → tự gọi lại không kèm cấu hình suy nghĩ.

### Phân quyền
- `admin`: Users, Roles, Logs (GET), đổi trạng thái model AI.
- `admin` + `moderator`: Moderation, Dashboard, Ai, ghi Categories, đổi trạng thái/xóa Recipes.
- Đăng nhập (mọi role): tạo Recipe (user → `pending_verification`), hồ sơ sức khỏe, thực đơn, yêu thích, scan, chat.

### Email OTP
- `Email__Provider=smtp|brevo|resend`. Render gói free có thể chặn cổng SMTP → dùng `brevo`/`resend` (HTTPS) với `Email__ApiKey`, `Email__FromEmail` (đã xác minh), `Email__Enabled=true`.
- OTP lưu trong bảng `EmailOtp` (không mất khi restart/redeploy), dùng cho đăng ký và quên mật khẩu.
- `Email__Enabled=false` mà không bật `Otp__ExposeOtpInResponse=true` → API trả 503 `EMAIL_NOT_CONFIGURED` thay vì báo "đã gửi". Chế độ demo: bật `Otp__ExposeOtpInResponse=true` (mã trả trong `devOtp` và in ra log).
