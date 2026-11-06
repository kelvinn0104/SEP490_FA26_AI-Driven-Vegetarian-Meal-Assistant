# Cộng đồng và bài đăng: nghiệm thu FE user/guest

Ngày: 04/11/2026. Branch Khang. Source BE mới nhất tại thời điểm fetch: sep490/main `591426b`, BE `cc7e4c6`. Không thay đổi BE hoặc màn admin/mod.

## Phát hiện và thay đổi FE

| Trước | Hiện tại |
| --- | --- |
| Danh sách chỉ có tiêu đề, nút đọc; không tìm/lọc | Tìm bằng keyword, lọc blog/video, sort newest/top, phân trang đúng PageQuery BE; query được giữ trong URL để refresh/back |
| Nội dung mở dưới danh sách, mất khi refresh, dễ đọc nhầm bài | `/post-detail?id=<id>` riêng, mở trực tiếp/refresh/chia sẻ; liên kết bình luận tới đúng phần thảo luận |
| Không thể xem media/tóm tắt/công thức gắn bài | Media HTTPS thật, YouTube được nhúng theo whitelist hostname, MP4/WebM dùng player; liên kết khác mở nguồn; lỗi video/ảnh có trạng thái rõ; summary và recipeId lấy từ BE |
| Chỉ gửi blog, giới hạn nội dung sai 10.000 | Blog/video, ảnh bìa qua URL, video qua URL, optional recipeId từ catalogue thật, 20.000 content/200 title/500 mediaUrl theo DTO |
| Không xem trước, dễ mất nội dung khi lỗi/refresh | Công cụ in đậm/danh sách/liên kết, xem trước Markdown, draft riêng theo tài khoản trong sessionStorage của tab, xóa draft có xác nhận; gửi lỗi giữ nguyên nội dung; chỉ xóa draft sau BE xác nhận id |
| Vote chỉ thích trên danh sách | Upvote/downvote/bỏ vote ở trang đọc; dùng đúng score BE trả về, có aria-pressed, không giả điểm |
| Bình luận không có xóa/report, có thể gửi trắng | Trim/giới hạn 2.000; comment response thật cập nhật luồng; chỉ hiện xóa nếu userId khớp; report cho bình luận người khác; lỗi giữ nội dung |
| Không báo cáo bài | Form lý do đúng enum BE, ghi chú optional, gửi báo cáo riêng; lỗi 409 trùng báo cáo được hiển thị |
| Bài chờ duyệt vẫn có nút thích/comment | Theo dõi trạng thái trong Bài của tôi; chưa published không mở vote/comment; xóa bài có xác nhận, chỉ cập nhật danh sách sau BE xác nhận |
| Guest mất đích đến khi bắt đầu viết | Đích create-post được giữ qua đăng nhập; guest đọc công khai và mở login để tham gia, không gửi mutation bằng dữ liệu giả |

Không tự tạo bài/bình luận, không gắn số tương tác hoặc ảnh mẫu vào production. Bản nháp là nội dung người dùng đang soạn, chưa xuất bản và không được trộn vào feed. Không có API edit nên không dựng nút sửa giả. Quyền xóa post được mở tại danh sách mine do BE trả về; quyền comment dựa userId. BE vẫn phải kiểm tra quyền cho mọi mutation.

## Hợp đồng API đã nối

- GET `/community/posts?keyword=…&postType=blog|video&sort=newest|top&page.Page=…&page.PageSize=12`.
- GET `/community/posts/mine?page.Page=…&page.PageSize=12`.
- GET `/community/posts/{id}`.
- POST `/community/posts`: `postType,title,content,mediaUrl,recipeId`; recipe catalogue trả `r20` được chuyển đúng integer 20 theo mapping BE.
- DELETE `/community/posts/{id}`.
- PUT `/community/posts/{id}/vote`: value 1/-1/0, response integer score.
- POST `/community/posts/{id}/comments`: content; DELETE `/community/comments/{id}`.
- POST `/community/reports`: targetType post/comment, targetId, category, reason optional.

## BE còn thiếu hoặc cần cải thiện

1. **Chưa có sửa bài/sửa bình luận.** Swagger/controller chỉ có create/get/delete. Cần edit thuộc quyền tác giả, revision và quy tắc duyệt lại khi thay đổi nội dung; không cho FE tự sửa local rồi báo thành công.
2. **Chưa có upload media cộng đồng.** DTO chỉ nhận mediaUrl, chưa có upload/signed URL, kiểm tra loại/kích thước, lưu trữ bền vững. FE hiện dùng URL; không thể cung cấp chọn ảnh/video từ thiết bị như một upload thật. Không tái sử dụng API scan cho việc này.
3. **Media/dữ liệu thử vẫn published.** Live post 9/13/16 có `/uploads/videos/dummy-*.mp4`; đợt 03/11 cả ba HEAD 404, ngày 04/11 list/detail vẫn trả các đường dẫn đó. FE chặn marker rõ ràng ở feed/detail. BE cần dọn dữ liệu và kiểm tra media khi publish.
4. **Pagination DTO binding sai query tiêu chuẩn.** FE dùng `page.Page`/`page.PageSize` như đợt trước; query Page/PageSize trong Swagger dễ khiến client dùng sai. Cần đồng bộ controller, Swagger, client contract khi sửa.
5. **Post DTO không có authorId/isMine/canEdit/canDelete.** Không so sánh authorName để đoán quyền. FE đặt xóa post trong mine; BE nên trả capabilities đáng tin cậy để thao tác ngay ở detail, kể cả tác giả đổi tên.
6. **Không có lý do kiểm duyệt/updatedAt cho tác giả trong DTO.** Mine chỉ trả trạng thái. ModerationLog có reason trong entity nhưng user không được cung cấp lý do/cách sửa/gửi lại; chưa có luồng kháng nghị hoặc resubmit. Cần API user rõ ràng, không mở API staff cho user.
7. **Không có preview/excerpt ở summary; comments trả toàn bộ trong detail.** FE không tạo N+1 request tải content chỉ để dựng đoạn giới thiệu. Cần excerpt/cover metadata do BE trả và phân trang comments nếu tăng dữ liệu. Không tạo số lượt xem, thời gian đọc hay badge uy tín giả.
8. **Report chỉ có create.** Chưa có user report history/status để theo dõi; server trả 409 cho báo cáo open trùng. FE hiển thị đúng phản hồi, không giả trạng thái đã xử lý.
9. **Chưa thấy idempotency hoặc giới hạn riêng cho thao tác community trong service/controller.** FE khóa gửi lặp trong cùng màn; lỗi mạng sau khi server đã lưu vẫn có thể gây gửi trùng khi user retry. Cần idempotency key cho create/comment/report và giới hạn phù hợp từ BE; kiểm tra thêm middleware production trước kết luận rate-limit toàn hệ thống thiếu.

## Bằng chứng và phạm vi kiểm tra

- **Live đọc:** catalogue/community list/detail thực tế trên Render; dữ liệu ngày 04/11 có 10 bài published, 3 video đánh dấu dummy, 7 blog. Query prefix page1/page2 size2 trả các ID khác nhau. Search/sort, recipe link, deep link/refresh, trạng thái chặn dummy được kiểm qua trình duyệt.
- **Mutation kiểm thử cách ly:** `community.smoke.js` dùng DTO/response theo Swagger và service, tất cả write bị intercept; không tạo bài/bình luận/report hoặc đổi vote của người thật trên Render. Các ca gồm lỗi create/comment/delete, giữ draft, chống double-submit, report trùng409, đúng quyền xóa comment, pending restrictions, video fallback, payload recipeId integer và responsive 320/390/768/1440.
- **Unit:** `community.test.mjs` kiểm an toàn URL/YouTube, limits đúng DTO, ID recipe và optional content video; chạy cùng unit cũ.
- **Public browser:** `community-live.smoke.js`; ảnh desktop/mobile/reader trong docs/screenshots. Không dùng fixture mutation làm bằng chứng BE live ghi thành công.
- Cần nghiệm thu live mutation và quy trình mod duyệt bằng môi trường/tài khoản nội dung riêng được cho phép đăng thử. Cần kiểm video thật có nguồn hợp lệ sau BE dọn media; video dummy 404 không chứng minh player production phát được.

Source: [Community controller](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.API/Controllers/NutritionAndCommunityControllers.cs), [DTO](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Model/DTOs/CommunityDtos.cs), [service](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Service/Services/CommunityService.cs), [entities](https://github.com/kelvinn0104/SEP490_FA26_AI-Driven-Vegetarian-Meal-Assistant/blob/591426b/BE/VeggieAI.Model/Entities/CommunityEntities.cs).
