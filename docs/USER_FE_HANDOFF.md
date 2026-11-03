# FE User / Guest — cập nhật BE ngày 2026-11-03

## Phiên bản đã đối chiếu

GitHub: sep490/main = 591426b, chứa commit BE cc7e4c6 (bổ sung API còn thiếu và sửa tích hợp FE).
Đã fetch remote, đọc controller/DTO/service từ remote; không merge đè working tree và không sửa BE hay màn admin/mod.
API live: https://veggieai-api.onrender.com/api
Swagger: https://veggieai-api.onrender.com/swagger/v1/swagger.json

## Kết quả live hiện tại

- Swagger đã khai báo hồ sơ, dị ứng, favorites, meal plans/current/history/status, shopping list, nutrition logs/daily/activity, community, notifications, cập nhật tài khoản và đổi mật khẩu.
- GET /allergies: 200, 6 mục.
- GET /community/posts: 200, PagedResult với 10 bài ở trang mặc định.
- GET /Recipes/r31: 200; code FE đã đọc Ingredients và IronMg/B12Mcg/CalciumMg/ZincMg theo DTO mới.
- GET /health-profile, /recipes/favorites, /meal-plans/current, /notifications, /nutrition/daily không token: 401. Thiếu API 404 ghi trong bản note cũ đã được BE xử lý; không còn kết luận các route này chưa có.
- Chưa có tài khoản/email test thật: chưa xác minh thư OTP đến hộp thư hoặc Gemini/mutations theo tài khoản thật trên Render.

## FE đã nối theo BE mới

- Đăng ký POST /Auth/register: email chuẩn hóa, displayName, password, role=user; không đăng nhập trước xác thực.
- OTP POST /Auth/verify-code: 6 chữ số, paste/autofill, lỗi mã sai/hết hạn từ BE. Chỉ đăng nhập khi nhận token và user hợp lệ.
- Gửi lại POST /Auth/resend-code: codeSent=false giải thích dùng mã gần nhất; cooldown và hạn mã theo ResendAfterSeconds/ExpiresInSeconds/ExpiresAt, dùng deadline để không sai khi tab ngủ.
- Chỉ lưu email/deadline trong sessionStorage để refresh tiếp tục xác thực. Không lưu password, OTP hoặc DevOtp; không hiển thị mã DevOtp BE có thể gửi ở môi trường dev.
- Login bị EMAIL_NOT_VERIFIED chuyển sang nhập OTP. Sau verify, HasHealthProfile=false chuyển tới hồ sơ; có hồ sơ thì trở về nơi người dùng muốn mở.
- Profile round-trip allergy IDs, hiển thị BMI/TDEE/target protein do BE tính, cập nhật trạng thái user sau lưu. Form không tự điền cân nặng/ngày sinh mẫu.
- Recipe scale grams theo số khẩu phần toàn công thức; macro/vi chất theo per-serving. Thiếu số liệu hiển thị dấu —, không bịa B12 hoặc độ phù hợp.
- Favorites, lịch sử thực đơn, community, notifications giữ PagedResult và có phân trang.
- Kích hoạt plan dùng response BE; shopping list đọc GET trước, chỉ POST tạo khi chưa có để tránh reset các ô đã mua.
- Nutrition daily đọc consumed/target/logs/alerts; hiển thị bữa đã ghi nhận, bỏ ghi nhận và PUT vận động thật.
- Notifications hiển thị chưa đọc/đã đọc, PATCH từng mục hoặc tất cả. Community like dùng MyVote để bỏ thích đúng, score đọc từ BE.
- UI OTP và profile làm lại theo cùng nền giấy sáng/xanh trầm; responsive, chữ rõ, focus bàn phím, reduced motion. Dữ liệu fixture chỉ ở tests, không import vào web.

## Các việc BE/vận hành vẫn cần xác minh

1. Email provider/SMTP trên Render và khả năng nhận email thực tế. FE không thể chứng minh email đã đến hộp thư từ CodeSent=true.
2. OTP đang có giới hạn vòng đời theo dịch vụ BE; cần xác nhận mã còn hợp lệ sau Render restart/sleep và rate-limit. FE không bỏ qua xác thực khi email gửi lỗi.
3. Bật cấu hình production không expose DevOtp; không log OTP/JWT/mật khẩu. FE không hiển thị DevOtp.
4. Kiểm tra quyền/ownership thật cho mỗi user, dị ứng trước/sau tạo hoặc đổi món, idempotent log meal và Gemini fallback. HTTP 401 không chứng minh các nghiệp vụ đăng nhập hoạt động.
5. Kiểm tra ảnh bền vững và chất lượng dữ liệu seed trong DB. FE không tạo ảnh stock, tên tác giả/lượt xem hay vi chất giả; dữ liệu seed từ BE không có cờ provenance nên FE không tự kết luận hoặc xóa DB.
6. BE public recipes hiện trả List, các tài nguyên cá nhân dùng PagedResult. Không đổi contract này mà không cập nhật FE/test.

## Kiểm thử tái lập

- npm --prefix FE run build
- npm --prefix FE run lint (legacy warnings còn tồn tại; phần src/user kiểm tra riêng không warnings/errors)
- node --test FE/tests/user.test.mjs (5 ca dữ liệu/HTTP/OTP deadline)
- npm --prefix FE run dev -- --host 127.0.0.1
- npx --yes --package @playwright/cli playwright-cli -s=veggie open http://127.0.0.1:5173/
- Chạy từng file bằng: npx --yes --package @playwright/cli playwright-cli -s=veggie run-code --filename=FE/tests/<file>
  - portal.smoke.js: public live recipes/detail/community, search, refresh và guest guard; authenticated errors dùng fixture.
  - workflows.smoke.js: fixture OTP, plan, scan multipart/confirm.
  - otp.smoke.js: fixture register/codeSent=false, refresh, zero cooldown, wrong OTP, resend, onboarding profile và bảo toàn allergy IDs.
  - contracts.smoke.js: fixture PagedResult favorites, đọc shopping list không POST ghi đè, mua nguyên liệu, daily consumption, activity và đọc notification.

Tất cả mutation trong browser smoke được intercept bằng fixture, không gửi account/bài viết/ảnh thử lên BE live. Ảnh QA ở docs/screenshots. Chưa deploy/push.

## Rà UI/UX và hoàn thiện lần hai — 2026-11-03

- Thống nhất nhịp tiêu đề, màu nhấn đất nung cho hành động Vào bếp, trạng thái focus và form, nền/card nhẹ trên toàn user portal. Giữ reduced-motion; không dùng badge AI, điểm phù hợp hay số liệu trang trí.
- Guest nhận lời dẫn đúng tính năng đang mở; đăng nhập vẫn giữ đích tới. Trạng thái thực đơn/bài viết và danh mục tiếng Anh được diễn đạt bằng tiếng Việt tự nhiên, giữ nguyên key API.
- Chế độ Vào bếp dùng dialog native: khóa focus trong modal, Escape/đóng trả về trang, khóa scroll nền, định lượng theo khẩu phần và checklist do người dùng đánh dấu. Chỉ dùng instructions/ingredients live, thiếu dữ liệu nói rõ.
- Đọc bài cộng đồng tự cuộn và đưa focus tới nội dung, không reload danh sách khi chỉ đọc. Quét ảnh cho biết xác nhận đã thành công; thay lựa chọn thì cần xác nhận lại.
- design.smoke.js kiểm tra public live tại 320/390/768/1440px, đổi gợi ý thật, Vào bếp, Escape/khôi phục scroll và checklist nguyên liệu live r1.
- Các smoke portal/workflows/otp/contracts đã chạy lại sau thay đổi. Không thêm dependency vào package.json.
- Dữ liệu nguồn còn vấn đề: ví dụ ảnh /Recipes/r30 (Bánh Xèo Chay Nấm Mối Miền Tây) trông như bowl đậu hũ; công thức này thiếu định lượng nguyên liệu. FE không tự thay ảnh hay tạo nguyên liệu. Cần chủ dữ liệu BE rà provenance, ảnh khớp món và định lượng trước nghiệm thu production.
- Chưa có tài khoản User thật để nghiệm thu mutation/AI/email end-to-end trên Render. Mức kiểm tra live public và fixture authenticated vẫn được tách rõ.

## Visual pass: ít chữ, màu sắc rõ hơn — 2026-11-03

- Hero xanh rừng, CTA xanh non; công cụ dùng ba sắc nền nhạt (sage/clay/slate). Không thêm gradient, số liệu hoặc badge trang trí.
- Rút gọn lời dẫn trang chủ, bỏ mô tả lặp ở các công cụ và trang tài khoản. PageHeading không tự thêm tiêu đề phụ chung.
- Thẻ thiếu ảnh dùng biểu tượng giao diện trung tính có nhãn Chưa có ảnh; không lặp tên món và không tạo ảnh thay thế. Tên dài giới hạn hai dòng, vẫn giữ đầy đủ accessible name/title và nội dung trang chi tiết.
- Danh mục hiển thị số lượng từ catalogue thật. Không thay dữ liệu dinh dưỡng hoặc API contract.
- Header mobile dùng nền đặc để nội dung bên dưới không xuyên qua. Kiểm tra lại 320/390/768/1440px bằng design.smoke; build, 5 unit tests và lint src/user pass.
- Các thay đổi visual pass này chưa commit/push. Commit d63b864 trên hai remote là bản trước visual pass.
