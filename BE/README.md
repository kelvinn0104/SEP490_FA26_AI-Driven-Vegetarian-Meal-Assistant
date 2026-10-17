# VeggieAI Backend (.NET 8 · Clean Architecture · PostgreSQL · Gemini/OpenAI)

## 1. Cấu trúc

```
BE/
├─ database/
│  ├─ VeggieAI_Database.sql      # schema "veggieai" (33 bảng) + trigger tính dinh dưỡng + seed chuẩn
│  └─ VeggieAI_Seed_Demo.sql     # dữ liệu demo: 42 nguyên liệu, 26 công thức đã duyệt, quán chay mẫu
├─ tools/scaffold_entities.py    # script sinh Entities + DbContext từ DB (DB-first)
└─ src/
   ├─ VeggieAI.Domain            # Entities/ (sinh từ DB) + Constants (giá trị CHECK constraint)
   ├─ VeggieAI.Application       # DTOs, Interfaces, NutritionCalculator (BMI/BMR/TDEE)
   ├─ VeggieAI.Infrastructure    # VeggieAiDbContext, Services, AI (LLM client, meal planner, vision, chat), JWT
   └─ VeggieAI.API               # Controllers, middleware lỗi, JWT, Swagger
```

## 2. Database (đã setup bằng pgAdmin)

| Thông số | Giá trị |
|---|---|
| Server | PostgreSQL 18 – localhost:5432 |
| Database | `veggieai_db` (schema `veggieai`) |
| User app | `veggieadmin` / `veggiepassword123` (chủ sở hữu DB, chỉ dùng cho dev) |

Chạy lại từ đầu (pgAdmin → Query Tool trên `veggieai_db`):
1. `SET ROLE veggieadmin;` + nội dung `database/VeggieAI_Database.sql` → F5 (script tự DROP/CREATE schema).
2. `database/VeggieAI_Seed_Demo.sql` → F5 (chạy lại nhiều lần không bị trùng).

## 3. Entities (DB-first)

Các class trong `VeggieAI.Domain/Entities` và `VeggieAiDbContext` được **sinh tự động từ database** (tên bảng/cột PascalCase,
navigation giống `dotnet ef dbcontext scaffold`; 2 bảng nối `UserAllergy`, `IngredientAllergy` thành many-to-many `User.Allergies`, `Ingredient.Allergies`).
Khi sửa schema, sinh lại bằng một trong hai cách:

```powershell
# Cách 1 – EF Core tools (chuẩn)
dotnet tool install --global dotnet-ef --version 8.*
dotnet ef dbcontext scaffold "Host=localhost;Database=veggieai_db;Username=veggieadmin;Password=veggiepassword123" Npgsql.EntityFrameworkCore.PostgreSQL `
  --schema veggieai --project src/VeggieAI.Infrastructure --startup-project src/VeggieAI.API `
  --context VeggieAiDbContext --context-dir Persistence --output-dir ../VeggieAI.Domain/Entities --namespace VeggieAI.Domain.Entities --no-onconfiguring --force
# Cách 2 – script đi kèm (đã dùng để sinh bản hiện tại)
pip install psycopg2-binary ; python tools/scaffold_entities.py out/
```

> Không dùng `dotnet ef migrations` — database là nguồn sự thật (schema do file SQL quản lý).

## 4. Chạy API

```powershell
cd "D:\FPTU\Veggieai\Source code\BE"
dotnet restore
dotnet run --project src/VeggieAI.API      # hoặc mở VeggieAI.sln trong Visual Studio → F5
```
Swagger: https://localhost:59609/swagger · Health check: `GET /api/health` (kiểm tra DB + AI).

### Cấu hình AI (bắt buộc cho tính năng AI)
Lấy API key Gemini miễn phí tại https://aistudio.google.com/apikey rồi **không commit key**, dùng user-secrets:
```powershell
dotnet user-secrets set "Ai:Gemini:ApiKey" "<KEY>" --project src/VeggieAI.API
# Dùng OpenAI thay thế:
dotnet user-secrets set "Ai:Provider" "OpenAI" --project src/VeggieAI.API
dotnet user-secrets set "Ai:OpenAI:ApiKey" "<KEY>" --project src/VeggieAI.API
```
Đổi `Jwt:Key` trong `appsettings.json` trước khi deploy. Chưa có key AI thì meal planner vẫn chạy bằng thuật toán rule-based.

## 5. Danh sách API luồng User (≈60 endpoint)

| Nhóm | Endpoint |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/auth/me`, `POST /api/auth/change-password` |
| Hồ sơ sức khỏe | `GET/PUT /api/health-profile`, `POST /api/health-profile/preview`, `GET/PUT /api/health-profile/allergies` |
| Danh mục | `GET /api/allergies`, `GET /api/categories?type=`, `GET /api/ingredients?keyword=`, `GET /api/ingredients/{id}` |
| Công thức | `GET /api/recipes` (lọc/sort/phân trang, tự loại món dị ứng), `GET /api/recipes/{id}`, `GET /api/recipes/suggest?ingredientIds=`, `GET /api/recipes/favorites`, `POST/DELETE /api/recipes/{id}/favorite` |
| 🤖 Thực đơn AI | `POST /api/meal-plans/generate`, `POST /api/meal-plans/{planId}/items/{itemId}/swap` |
| Thực đơn | `GET /api/meal-plans`, `GET /api/meal-plans/current`, `GET/DELETE /api/meal-plans/{id}`, `POST /api/meal-plans`, `PATCH /api/meal-plans/{id}/status`, `POST/PUT/DELETE /api/meal-plans/{id}/items[/{itemId}]` |
| Đi chợ | `POST/GET /api/meal-plans/{id}/shopping-list`, `PATCH /api/meal-plans/{id}/shopping-list/items/{itemId}` |
| 🤖 Quét ảnh | `POST /api/scans` (multipart `image`), `POST /api/scans/{id}/confirm`, `GET /api/scans/{id}`, `GET /api/scans` |
| 🤖 Chatbot | `POST/GET /api/chat/sessions`, `GET/POST /api/chat/sessions/{id}/messages`, `DELETE /api/chat/sessions/{id}` |
| Theo dõi dinh dưỡng | `POST /api/nutrition/logs`, `DELETE /api/nutrition/logs/{id}`, `GET /api/nutrition/daily?date=`, `GET /api/nutrition/trend?from=&to=`, `PUT /api/nutrition/activity` |
| Thông báo | `GET /api/notifications`, `GET /api/notifications/unread-count`, `PATCH /api/notifications/{id}/read`, `PATCH /api/notifications/read-all` |
| Quán chay | `GET /api/vegan-shops?lat=&lng=&radiusKm=&keyword=` |
| Cộng đồng | `GET /api/community/posts`, `GET /api/community/posts/mine`, `GET/POST/DELETE /api/community/posts[/{id}]`, `POST /api/community/posts/{id}/comments`, `DELETE /api/community/comments/{id}`, `PUT /api/community/posts/{id}/vote`, `POST /api/community/reports` |

## 6. Thiết kế AI

### 6.1 Lập thực đơn (`AiMealPlanner`)
1. **Ngữ cảnh**: HealthProfile (kcal/macro/vi chất mục tiêu tính bằng Mifflin-St Jeor + `GoalStandard` + `NutrientStandard`), dị ứng, nguyên liệu sẵn có (`preferredIngredientIds` hoặc `scanId`), ghi chú tự do.
2. **Lọc ứng viên bằng SQL**: chỉ công thức `published`, đã loại món chứa dị ứng → LLM **chỉ được chọn recipeId có thật** (không bịa món, dinh dưỡng luôn lấy từ DB đã được moderator duyệt).
3. **LLM (structured JSON prompting)** chọn món + khẩu phần cho từng ngày/bữa.
4. **Validate rule-based**: id hợp lệ, đủ bữa, không trùng món trong ngày, tổng kcal/ngày lệch ≤ ±12% → nếu sai gửi lại lỗi cho LLM sửa (tối đa 2 lần).
5. **Tinh chỉnh khẩu phần** (bước 0.25) cho sát kcal; thiếu gì thì **fallback rule-based** (điểm = phù hợp bữa + khớp kcal + mật độ protein + nguyên liệu sẵn có − lặp món). Không có API key vẫn chạy được.
6. Lưu `MealPlan` (draft) + `MealPlanItem`, trả về tổng dinh dưỡng từng ngày so với mục tiêu + cảnh báo (protein, sắt, B12...). Mọi lần gọi AI ghi vào `AiModelLog` (độ trễ, token, lỗi) phục vụ workflow giám sát model.

### 6.2 Nhận diện ảnh (`IngredientScanService`)
Ảnh → lưu `wwwroot/uploads/scans` → VLM (Gemini 3.8 Flash / GPT-4o-mini) trả JSON: loại ảnh (nguyên liệu / món ăn), tên món + ước lượng dinh dưỡng, danh sách nguyên liệu (confidence, **độ tươi** fresh/use_soon/spoiled) và ánh xạ vào danh mục `Ingredient` → lưu `IngredientScan.DetectedItems` (jsonb) →
gợi ý công thức theo độ khớp nguyên liệu (+ món có tên tương tự món nhận diện) và **thực đơn 1 ngày**; muốn cả tuần thì gọi `POST /api/meal-plans/generate` với `scanId`. AI nhận sai → `POST /api/scans/{id}/confirm` để sửa tay.

## 7. Luồng demo nhanh trên Swagger
1. `POST /api/auth/register` → copy `accessToken` → nút **Authorize**.
2. `PUT /api/health-profile` `{ "gender":"male","dateOfBirth":"2003-05-10","heightCm":170,"weightKg":65,"activityLevel":"moderate","healthGoal":"maintain","allergyIds":[1] }`
3. `POST /api/meal-plans/generate` `{ "days":7, "note":"thích món Việt, ít dầu" }`
4. `POST /api/meal-plans/{id}/shopping-list` → `PATCH /api/meal-plans/{id}/status` `{ "status":"active" }`
5. `POST /api/scans` (chọn ảnh rau củ/món ăn) → xem `suggestedRecipes`, `suggestedMenu`.
6. `POST /api/nutrition/logs` `{ "planItemId": ... }` → `GET /api/nutrition/daily`.

## 8. Còn để sau
OTP email & refresh token, upload ảnh lên cloud storage, OAuth Apple Health/Google Fit, kiểm duyệt nội dung bằng AI, API cho Admin/Moderator, RAG vector (pgvector) cho chatbot.
