# Báo cáo BE / API / dữ liệu phục vụ User & Guest

Ngày kiểm tra: **03/11/2026**. Đây là toàn bộ phát hiện trong đợt rà user/guest, không phải chứng nhận đã tìm hết lỗi BE.

- Source đã đọc: `sep490/main` commit **591426b**, chứa BE **cc7e4c6**.
- API live: https://veggieai-api.onrender.com/api
- Swagger live: https://veggieai-api.onrender.com/swagger/v1/swagger.json
- Không sửa BE, không tạo tài khoản/bài viết/ảnh thử trên production. Sau khi user cung cấp tài khoản, có tạo draft plan/log/chat và favorite kiểm thử riêng rồi dọn lại; không sửa hồ sơ cá nhân hay bản ghi cũ. Không thực hiện kiểm thử xâm nhập.
- **Live** = đã gửi request tới Render; thao tác ghi được nêu rõ trong bảng kiểm thử tài khoản thật. **Source** = chứng cứ từ code, chưa tái hiện live trừ khi có ghi bổ sung. **Chưa nghiệm thu** = chưa đủ dữ liệu/tài khoản để kết luận.

## Tổng quan

| Mục | Kết quả live |
| --- | --- |
| Danh sách recipe | 32 record, đều trả `status=published` |
| Recipe detail | Đọc được 32/32; 5 record không có nguyên liệu |
| Ảnh recipe | 27/32 record không có `imageUrl` |
| Dữ liệu thử nghiệm | `r34`: `Bún trộn tempeh sả ớt (dummy)` đang published |
| Dị ứng | 6 mục, tên đang bằng tiếng Anh |
| Community published | 10 record; có 3 video đường dẫn dummy, cả 3 HEAD trả 404 |
| Health | Trả `database=postgresql`; uptime/GPU/memory/cluster là hằng số trong source |
| API cá nhân không token | Hồ sơ, favorites, current plan, notifications, nutrition, chat và scans trả 401 — đúng, không phải lỗi thiếu endpoint |

## Kiểm tra bổ sung bằng tài khoản thật do user cung cấp

Không ghi email/mật khẩu/JWT vào tài liệu hoặc source/test. Các thông tin sức khỏe cá nhân không được đưa vào báo cáo.

| Luồng | Kết quả |
| --- | --- |
| Đăng ký nhận OTP | **User xác nhận đã nhận email và đăng ký thành công** |
| Login / me | API 200 và đăng nhập UI thành công |
| Hồ sơ | GET 200, UI khôi phục được các trường; không sửa hồ sơ thật |
| Favorites | Add → đọc lại thấy món → remove thành công, giữ nguyên món đã lưu trước đó |
| Plan generate | Tạo 1 ngày/3 bữa thành công, generatedBy=rule-based, 2 validation warnings; sample không có dummy hoặc recipe thiếu nguyên liệu |
| Active/current | Kích hoạt draft thử và đọc lại current khớp ID |
| Swap | Có plan trả về, generatedBy=rule-based |
| Shopping | Tạo danh sách 8 nguyên liệu trong lượt đầu; lượt lifecycle tạo/tích isBought thành công |
| Meal log/daily | POST log đọc lại có trong daily; log thử đã được xóa |
| Notifications / mine / history / scans | Authenticated GET 200; current trước kiểm tra trả 204 đúng vì chưa active |
| Chat AI | **HTTP 200 nhưng exact busy fallback**, không trả lời câu hỏi nấu ăn thật. Chi tiết BE-18 |
| Logout/reuse token | Sau POST logout, cùng token gọi /Auth/me vẫn 200. BE-09 có thêm bằng chứng live |
| Scan ảnh thật | Chưa upload ảnh; thiếu ảnh thực tế được cung cấp và không có API xóa scan để dọn ảnh thử. GET history hoạt động. BE-19 |

Plan/danh sách đi chợ/log/chat/favorite tạo riêng cho lượt kiểm thử đã được dọn. Không activate hoặc xóa plan cũ của user. Kết quả rule-based không được ghi thành Gemini thành công; zero-allergen trên profile không dị ứng không thay thế test profile dị ứng.

## P1 — cần xử lý trước nghiệm thu production

### BE-01 — dữ liệu dummy được xuất bản và có thể vào thực đơn

**Live:** GET `/Recipes` trả `r34`, tên có `(dummy)`, trạng thái published. Community cũng có media `/uploads/videos/dummy-*.mp4` ở bài published.

**Source:** bộ chọn recipe của `AiMealPlanner.LoadCandidatesAsync` lọc published/kcal/allergen nhưng không có cờ test/provenance để loại nội dung thử nghiệm.

**Ảnh hưởng:** dữ liệu thử có thể xuất hiện trong thư viện/gợi ý hoặc trở thành ứng viên AI. Các lượt generation thật trong đợt này không chọn r34; chưa có bằng chứng món này đã xuất hiện trong plan.

**BE cần làm:** tách DB/seed test khỏi production; thêm cờ rõ ràng hoặc quy trình publish; chỉ cho catalogue đã xác minh vào AI.

**Nghiệm thu:** public list/detail, favorites, scan suggestions và tất cả generated plans không chứa record test.

**FE đã giảm ảnh hưởng:** ẩn marker test rõ ràng ở recipe/community/favorites/suggestions; chặn hiển thị thực đơn có tên món test. Không thể phát hiện dữ liệu giả không được đánh dấu, và việc ẩn FE không xóa record đã được BE tạo.

### BE-02 — 5 recipe published thiếu toàn bộ nguyên liệu, ảnh hưởng lọc dị ứng

**Live:** GET `/Recipes/r27` đến `/Recipes/r31` trả `ingredients: []`; vẫn có kcal/macro/vi chất. Các tên gồm Cà Ri Bí Đỏ, Canh Rong Biển, Gỏi Cuốn, Bánh Xèo và Gỏi Ngó Sen.

**Source:** AI lọc `!r.RecipeIngredients.Any(ri => bad.Contains(ri.IngredientId))`. Recipe không có Ingredient rows không bị loại bởi điều kiện này. Không thấy điều kiện bắt buộc có đủ nguyên liệu ở bước tải ứng viên.

**Ảnh hưởng:** không thể xác minh dị ứng hoặc định lượng cho các món này. Lọc dị ứng có thể coi dữ liệu thiếu là không có dị ứng. Đây là rủi ro suy ra từ source, chưa tạo plan dị ứng thật.

**BE cần làm:** không publish/không đưa vào AI recipe chưa hoàn thiện ingredients; bổ sung định lượng, mapping IngredientAllergy và tính lại dinh dưỡng từ nguồn xác minh.

**Nghiệm thu:** 0 recipe không đủ nguyên liệu trong catalogue AI; kiểm thử profile dị ứng trên cả AI và rule-based fallback. Không mặc định “thiếu dữ liệu” thành “an toàn”.

### BE-03 — recipe detail không kiểm tra trạng thái/quyền trong đường đọc

**Source:** controller `GetRecipeById` công khai gọi service; `CategoryAndRecipeService.GetRecipeByIdAsync` gọi `GetRecipeDetailAsync`; repository chỉ `FirstOrDefaultAsync(r => r.Id == id)`, không lọc published hay kiểm tra chủ sở hữu/staff.

**Ảnh hưởng:** theo đường code này, biết ID có thể đọc recipe hidden/draft/pending. Không brute-force ID hoặc tạo hidden recipe trên live để tái hiện.

**BE cần làm:** public chỉ đọc published; record khác yêu cầu đúng owner hoặc staff và trả 404/403 thích hợp.

**Nghiệm thu:** guest/user khác không đọc được draft/pending/hidden bằng ID trực tiếp, kể cả nội dung/ingredients.

**FE:** không render recipe không published. Đây không thay thế authorization của BE.

### BE-04 — gửi OTP có thể báo đã gửi dù email bị tắt hoặc cấu hình không đủ

**Source:** `SmtpEmailService.IsEnabled` false khi Email.Enabled=false hoặc thiếu trường cấu hình. `SendOtpAsync` khi đó chỉ in OTP ra console rồi return. `AuthService.IssueAndSendOtpAsync` vẫn trả `CodeSent=true` sau lời gọi thành công này.

**Ảnh hưởng:** nếu production rơi vào cấu hình đó, user thấy “đã gửi” nhưng không nhận email. User đã xác nhận email OTP live nhận được và đăng ký thành công. Phát hiện này là guard cấu hình thiếu an toàn trong source, **không phải kết luận email hiện đang hỏng**.

**BE cần làm:** fail startup hoặc trả lỗi service rõ ràng trong Production khi provider chưa sẵn sàng; không trả CodeSent=true ở chế độ chỉ log. Tắt DevOtp và log OTP trên production.

**Nghiệm thu:** test mailbox thật: register, nhận thư, sai mã, hết hạn, resend, verify, login pending. Thử tắt provider phải trả lỗi, không báo gửi thành công.

## P2 — lỗi chức năng / rủi ro vận hành cần sửa

### BE-05 — phân trang bị sai khi dùng query thông thường

**Live, tái lập đọc an toàn:**

```text
GET /community/posts?page=1&pageSize=2
=> page=1, pageSize=20, ids=[24,23,16,15,14,13,12,11,10,9]

GET /community/posts?page=2&pageSize=2
=> page=1, pageSize=20, cùng danh sách

GET /community/posts?page.Page=2&page.PageSize=2
=> page=2, pageSize=2, ids=[16,15]
```

**Source:** nhiều controller dùng `[FromQuery] PageQuery page`; tên tham số `page` trùng thuộc tính `Page`, dẫn tới prefix binding khi query có `page=`. Meal plan list, notifications và scan history dùng cùng kiểu; chưa test các route có token bằng account thật.

**BE cần làm:** thống nhất binding để `/...?page=2&pageSize=12` hoạt động (ví dụ bind scalar page/pageSize rồi tạo query object), tài liệu hóa contract và thêm integration test trang 1/2.

**FE:** đã dùng `page.Page`/`page.PageSize` cho community, meal plans và notifications. Favorites dùng scalar page/pageSize theo controller riêng nên giữ nguyên. Cần phối hợp đổi lại khi BE sửa binding.

### BE-06 — 3 video published không có file

**Live HEAD:**

- `/uploads/videos/dummy-bun-xao.mp4` → 404, bài id 16.
- `/uploads/videos/dummy-meal-prep.mp4` → 404, bài id 13.
- `/uploads/videos/dummy-pho-chay.mp4` → 404, bài id 9.

**BE cần làm:** gỡ bài test khỏi public hoặc cung cấp media thật, xác thực tồn tại/quyền URL trước publish. Không dùng tên file thay cho URL upload hoàn chỉnh.

### BE-07 — ảnh thiếu và ảnh không khớp món

**Live:** 27/32 recipe không có imageUrl. Kiểm tra ảnh bằng mắt thấy ảnh r30 (Bánh Xèo) là bowl đậu hũ/salad, không minh họa đúng tên món.

**Ảnh hưởng:** thư viện khó nhận biết, mất tin cậy. Không thể tự động xác minh mọi ảnh khớp món trong đợt này.

**BE/data cần làm:** ảnh thật/ảnh đúng nội dung có quyền sử dụng, upload bền vững, kiểm tra URL trước publish và rà toàn catalogue.

**FE:** dùng placeholder có nhãn khi thiếu/lỗi ảnh; không tạo ảnh món giả.

### BE-08 — OTP và hạn gửi nằm trong RAM

**Source:** `OtpService` dùng IMemoryCache cho code hash, cooldown và cửa sổ gửi; comment source xác nhận restart làm mất mã.

**Ảnh hưởng:** Render restart/sleep hoặc scale nhiều instance có thể mất mã/chia cắt trạng thái và reset hạn gửi. Chưa chủ động restart production để thử.

**BE cần làm:** lưu hash/expiry/attempt/cooldown trong DB hoặc shared Redis, single-use atomic, giữ giới hạn gửi trên toàn instance.

### BE-09 — vòng đời JWT / logout / khóa tài khoản cần kiểm tra lại

**Source:** token hạn 7 ngày; logout chỉ trả “Logged out”; AuthResponse sinh RefreshToken nhưng Swagger không có refresh endpoint. `Program.cs` cấu hình kiểm tra chữ ký/hạn JWT, không thấy per-request token version/status check trong phần đã đọc.

**Ảnh hưởng cần nghiệm thu:** token cũ sau logout/đổi mật khẩu/khóa user/đổi role có thể vẫn dùng được tới hết hạn nếu không có cơ chế thu hồi khác. Bổ sung live: POST /Auth/logout xong, token cùng lượt kiểm tra vẫn gọi /Auth/me trả 200. Đổi mật khẩu/khóa tài khoản chưa thử vì không thay đổi bảo mật tài khoản của user. Nếu logout được thiết kế chỉ xóa token client thì cần ghi rõ giới hạn, không mô tả đã thu hồi phiên trên BE.

**BE cần làm:** quyết định/chứng minh chính sách revoke, kiểm tra status/security stamp hoặc refresh rotation; không cấp RefreshToken vô tác dụng.

**Nghiệm thu:** giữ token trước đổi mật khẩu/khóa tài khoản rồi gọi lại API cá nhân. Kết quả phải đúng chính sách bảo mật đã cam kết.

### BE-10 — lỗi nội bộ có thể lộ thông tin xuống client

**Source:** ExceptionMiddleware đưa `InnerException.Message` hoặc exception.Message vào errors; fallback 500 không thay bằng mã lỗi an toàn.

**BE cần làm:** trả message chung + correlation ID với lỗi không dự kiến trong Production; giữ chi tiết DB/provider trong log nội bộ. Không cố gây lỗi DB live trong đợt rà này.

### BE-11 — thiếu API khôi phục mật khẩu

**Swagger/source:** có change-password cần currentPassword; chưa có forgot/reset-password.

**Ảnh hưởng:** user quên mật khẩu không có luồng tự khôi phục. Không nên đặt nút “gửi email đặt lại” trên FE nếu BE chưa hỗ trợ.

**BE cần làm:** reset token một lần, expiry, anti-enumeration/rate limit và endpoint request/confirm; sau đó mới nối UI.

### BE-12 — thiếu lookup nguyên liệu để sửa kết quả scan đầy đủ

**Swagger:** có scan/confirm(ingredientIds)/suggest, chưa có API public/user tìm ingredient theo tên và trả ID/dictionary.

**Ảnh hưởng:** user có thể bỏ chọn item nhận diện được; chưa có nguồn ID để thêm nguyên liệu BE nhận sai hoặc không nhận ra. Không được tự tạo ingredientId ở FE.

**BE cần làm:** endpoint lookup có phân trang/tìm kiếm tên Việt, đơn vị và thông tin dị ứng; confirm phải validate IDs.

### BE-13 — lưu ảnh local và fallback database có rủi ro mất dữ liệu

**Source:** LocalFileStorage mặc định ghi `wwwroot/uploads`; Program có fallback InMemory nếu không kết nối PostgreSQL.

**Live:** health hiện trả postgresql; không có bằng chứng đang dùng InMemory. Chưa xác minh Render có persistent disk hay không.

**BE/ops cần làm:** Production fail rõ khi DB không sẵn sàng, không âm thầm tạo DB RAM; file dùng object storage hoặc persistent disk có backup. Test ảnh và dữ liệu sau redeploy trên staging.

## P3 — chất lượng dữ liệu / contract còn thiếu

### BE-14 — tên dị ứng và nguyên liệu chưa Việt hóa

**Live /allergies:** Gluten, Mushroom, Peanut, Sesame, Soy, Tree nuts.
**Live /Recipes/r1 ingredients:** Soy milk, fortified; Banana; Oats, rolled; Chia seeds.

**Cần làm:** thêm displayNameVi, giữ canonical ID/USDA name, thống nhất locale. Đừng đổi ID khi dịch tên; đặc biệt phân biệt đậu phộng và nhóm hạt cây.

### BE-15 — thiếu provenance/độ hoàn thiện của recipe

Recipe detail có vi chất và ingredient grams nhưng không có cờ seed/test/verified, nguồn dinh dưỡng hoặc dấu hiệu completeness. Với recipe thiếu ingredients vẫn có số dinh dưỡng nên FE không tự chứng minh nguồn tính được.

**Cần làm:** contract xác minh catalogue: nguồn USDA/version, servings, ingredient mapping và trạng thái kiểm duyệt; API phải phân biệt zero thật với unknown. Không kết luận tất cả số hiện có là giả chỉ vì thiếu provenance.

### BE-16 — health không chứng minh AI đang khỏe

**Live và source:** `status=healthy`, uptime=99.98%, memory=68%, gpuTemperature=58°C, cluster=Cụm HCM-01; các trường này hardcode. database cho biết provider, không test Gemini/DB query trong action health.

**Cần làm:** liveness/readiness thật; bỏ số telemetry hardcode khỏi endpoint production. FE hiện không hiển thị các số này, không dùng chúng để chặn/tạo thực đơn.

### BE-17 — giới hạn tải và dữ liệu media cần nghiệm thu

Public Recipes hiện trả toàn bộ List, không có server pagination. 32 món chưa phải lỗi hiệu năng, nhưng contract chưa phù hợp catalogue lớn. Đường upload bài viết/video tổng quát cũng chưa có endpoint riêng (scans upload ảnh phục vụ scan, CreatePost nhận mediaUrl).

**Cần làm:** xác định giới hạn/catalogue pagination; nếu yêu cầu upload media cộng đồng, cung cấp upload bền vững hoặc signed URL, kiểm tra loại/kích thước và quyền. Không đưa STT/video summarization ngoài scope thành blocker.

## Bổ sung sau kiểm tra tài khoản thật

### BE-18 — Chat trả HTTP 200 với câu bận hardcode, AI chưa trả lời được

**Live:** gửi câu hỏi nấu đậu hũ tới session kiểm thử. `aiMessage.content` khớp chính xác: “Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.”, HTTP 200. Session thử đã xóa.

**Source:** ChatService catch AppException có status >=500 rồi lưu câu bận trên như tin nhắn AI và vẫn trả ChatReplyDto thành công. Plan và swap live cũng đang trả rule-based, không chứng minh provider LLM hoạt động.

**Ảnh hưởng:** FE/monitoring nếu chỉ kiểm tra 200 hoặc có aiMessage sẽ kết luận nhầm AI hoạt động. User không có câu trả lời thật dù có lịch sử tin nhắn.

**BE cần làm:** tìm nguyên nhân provider/model/quota/timeout trong log nội bộ; chưa có bằng chứng xác định nguyên nhân nào. Trả 503 hoặc trạng thái máy đọc được như AI_PROVIDER_UNAVAILABLE, phân biệt failed reply với assistant message thật. Health readiness cần phản ánh AI. Rule-based plan vẫn nên được giữ là fallback và thông báo trung thực.

**FE đã sửa:** nhận diện các câu fallback cố định hiện có, hiển thị lỗi dịch vụ thay vì đưa vào câu trả lời AI; không tạo câu trả lời mẫu thay thế. Đây là tương thích tạm thời tới khi BE có structured status.

### BE-19 — Không có endpoint xóa scan/ảnh của user

**Swagger/source:** scans có upload, get, confirm, history; không có DELETE scan hoặc cơ chế xóa ảnh được khai báo.

**Ảnh hưởng:** user chưa có cách tự xóa lịch sử ảnh/nguyên liệu cá nhân qua API này; kiểm thử upload cũng không có đường dọn bản ghi/ảnh bằng API công khai. Vì vậy chưa upload ảnh test vào tài khoản user trong đợt này.

**BE cần làm:** DELETE thuộc quyền chủ sở hữu, dọn metadata + file/object storage phù hợp; có retention policy. Xác nhận tài nguyên nào phải giữ theo nghiệp vụ trước khi triển khai.

## API đã có, không còn kết luận là thiếu

Auth/OTP/me/change-password; health-profile/allergies/preview; favorites; meal plans current/list/detail/status; shopping list; nutrition logs/daily/trend/activity; community/posts/comments/vote/reports; notifications/read/unread-count; chat sessions/messages; scans/confirm/history; recipe suggestions.

Sự tồn tại trong Swagger hoặc trả 401 chưa chứng minh nghiệp vụ đăng nhập chạy đúng. Các ca còn cần nghiệm thu sâu: profile dị ứng khi generate/swap, độ chính xác tổng gram/vi chất, Gemini trả lời thật, ảnh scan thật, moderation/ownership, notification reminder và thu hồi token khi đổi mật khẩu/khóa tài khoản. Kết quả account thật đã thực hiện được ghi ở bảng đầu.

## Các lỗi FE đã sửa trong cùng đợt

- Bottom nav 4 mục rõ ràng trên mobile, có active state, vùng an toàn và không phủ toast/nội dung cuối trang.
- Xác thực xong tới chào mừng; có thể bỏ qua hồ sơ để khám phá. Không tạo plan tự động.
- Hồ sơ chia 2 bước; lưu xong có màn xác nhận và lựa chọn tiếp theo.
- Planner chỉ mở form sau hành động rõ ràng; kiểm tra hồ sơ trước khi gọi generate.
- Sửa query phân trang tương thích BE hiện tại.
- Ẩn marker dummy/demo/test rõ ràng; không giả dữ liệu thay thế.
- Hiển thị Retry-After/cooldown 429 theo dữ liệu BE, tránh lộ mã lỗi kỹ thuật lên UX.

## Thứ tự xử lý đề xuất cho BE

1. Dọn dummy + chặn recipe thiếu ingredients vào catalogue AI.
2. Sửa quyền recipe detail và chính sách thu hồi token; giữ kiểm tra cấu hình email fail-fast dù OTP live đã được user xác nhận.
3. Khôi phục chat AI thật; sửa pagination; dọn media 404; kiểm tra định lượng/dị ứng.
4. Bền vững OTP/storage/DB; thêm reset-password và ingredient lookup.
5. Việt hóa, provenance và health/telemetry thật.

## Nguồn code chính

Tất cả đường dẫn dưới đây thuộc commit `591426b` của repo đồ án:

- [Controllers recipe](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.API/Controllers/CategoriesAndRecipesControllers.cs)
- [Recipe service](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/CategoryAndRecipeService.cs)
- [Repository detail query](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Repository/Repositories/SpecializedRepositories.cs)
- [AI candidate filter](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/AI/AiMealPlanner.cs)
- [Email service](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/EmailService.cs)
- [Auth service](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/AuthService.cs)
- [OTP storage](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/OtpService.cs)
- [Exception middleware](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.API/Middlewares/ExceptionMiddleware.cs)
- [Local storage](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/AI/LocalFileStorage.cs)
- [Startup/JWT/DB](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.API/Program.cs)

Các smoke authenticated trong FE/tests dùng fixture cách ly. Không dùng chúng làm bằng chứng BE live gửi email hoặc chạy AI thành công. Sau đó user đã cung cấp tài khoản thật: kết quả live ghi ở bảng đầu; không ghi credential trong tài liệu.
