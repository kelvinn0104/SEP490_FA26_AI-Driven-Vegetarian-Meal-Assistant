# VeggieAI: audit thị giác và mẫu thiết kế V2

Ngày: 05/11/2026. Phạm vi: user/guest.
Audit ghi lại bản trước V2 và hai ảnh concept. Xem [bản triển khai V2](USER_UI_V2_2026-11-05.md) để đối chiếu với giao diện đã làm.

## Cơ sở đối chiếu

- Bảy ảnh tham khảo người dùng gửi: 1354, 1352, 1350, 1348, 1346, 1358, 1360. Dùng phần thiết kế ở giữa; không dùng giao diện Gallery bao quanh.
- Ảnh FE trong docs/screenshots: home-refined-desktop, redesign-today-390, redesign-planner-390, community-desktop.
- Đối chiếu mã đang có ở commit fec51a8: foundation.css, discovery.css, workspace.css, community.css; Today.jsx, ui.jsx, RecipeDetail.jsx.
- Đây là audit thị giác từ ảnh và mã, không phải một vòng kiểm thử API live mới. Các số liệu thiếu dữ liệu BE bên dưới lấy từ báo cáo audit đã có, không khẳng định vừa truy vấn lại.

## Kết luận

Bản hiện tại đúng nhóm màu nhưng chưa đúng ngôn ngữ thiết kế. Các ảnh mẫu có ảnh món nổi bật, chữ sans gọn, nhịp nội dung rõ, các lớp hình ảnh được bố trí có chủ đích. FE hiện tại dùng serif và thẻ chữ quá nhiều; nội dung hữu ích xuất hiện chậm trên mobile. Chỉ đổi màu, tăng bo góc hay thêm animation sẽ không giải quyết được.

Không chấm điểm đẹp bằng con số tùy ý. Ưu tiên dưới đây dựa trên mức ảnh hưởng đến màn hình đầu và thao tác chính.

## Vấn đề và hướng sửa

### P1 — Bếp hôm nay không cho thấy tổng quan hôm nay ngay

Bằng chứng: ảnh redesign-today-390 có tiêu đề, lời chào, nút khám phá, hai thẻ bữa ăn; phần dinh dưỡng bắt đầu gần đáy và bị dock che khuất một phần trong khung chụp. Today.jsx đặt plan trước daily; workspace.css dùng margin-bottom 38px, thẻ padding 24px và tên món serif 22px.

Sửa: tiêu đề sans 28–30px; ngày/lời chào ngắn. Mobile đặt tổng quan năng lượng trước, ba macro gọn, sau đó hai bữa ăn dạng hàng. Giữ desktop hai cột. Không suy ra đã ăn từ thực đơn; tiến độ chỉ lấy nhật ký thật. Không có mục tiêu thì hiển thị năng lượng đã ghi nhận, không vẽ tỷ lệ giả.

Nghiệm thu: ở 390×844, tài khoản có dữ liệu mẫu kiểm thử thấy tiêu đề, tổng quan và hai bữa ăn trước dock; ở 320px hoặc tên dài cho phép cuộn, không thu nhỏ chữ/nút để ép vừa.

### P1 — Mật độ thẻ chưa hợp nội dung ẩm thực

Bằng chứng: Today dùng CookingPot cho mọi món; discovery có nhiều text-first cards. Rất nhiều diện tích dùng cho viền, đệm và nền gần giống nhau.

Sửa: thẻ có ảnh dùng thumbnail thật 64–80px; thẻ thiếu ảnh dùng hàng nội dung gọn với biểu tượng nhỏ. Không tạo ô ảnh trống khổng lồ. Tên món sans 16–18px, tối đa hai dòng ở danh sách; trang chi tiết hiện đầy đủ. Phân biệt đọc công thức, đổi món và ghi nhận bữa ăn bằng tên/nút riêng.

Không tải từng chi tiết công thức cho tất cả bữa chỉ để lấy ảnh. Dùng imageUrl thật nếu payload có; nếu phải bổ sung dữ liệu, gom bằng danh mục sẵn có và ánh xạ recipeId, không theo tên. Thiếu dữ liệu vẫn dùng layout gọn.

### P1 — Hero có ảnh sai món, làm giảm độ tin cậy

Bằng chứng: ảnh home-refined-desktop có bowl đậu hũ nhưng nhãn Bánh Xèo Chay Nấm Mối Miền Tây. Đây là lỗi nội dung dễ nhìn thấy, dù nguồn ảnh đến từ BE.

Sửa: không chọn một ảnh chỉ vì đẹp rồi gắn tên món khác. Hero có thể dùng ảnh thương hiệu được ghi rõ minh họa; tách khỏi recipe card, không gắn số liệu dinh dưỡng hay ID món. Mọi tile công thức phải dùng đúng bản ghi/ảnh đã xác minh. BE cần sửa mapping ảnh.

### P2 — Typography khiến ứng dụng giống trang bài viết

Bằng chứng: foundation.css dùng Lora cho h1; workspace.css dùng serif cho tên món, section; community.css dùng serif cho title bài. Hero đầu trang chiếm nhiều chiều cao; phần thư viện mới bắt đầu ở cuối ảnh 1440×900.

Sửa: Be Vietnam Pro làm chữ chính cho toàn bộ giao diện. Desktop hero 52–60px, trang tác vụ 32–40px, mobile 28–30px; section 20–24px, thân bài 15–16px. Serif chỉ cân nhắc cho nội dung đọc dài, không rải vào mọi tiêu đề. Không thêm font mới.

### P2 — Hero thiếu chiều sâu có chức năng

Sửa: bố cục lệch 42/58, một ảnh chính có ánh sáng và chất liệu tốt; hai tile công thức thực, một lối vào thực đơn. Chỉ một CTA chính. Search là thao tác thật, không trang trí. Chuyển động xuất hiện 180–240ms, hover dịch 2–4px; không quay đĩa liên tục hoặc parallax theo con trỏ. Reduced motion tắt chuyển động không cần thiết.

Mẫu desktop có search và CTA cùng tồn tại để thử bố cục; khi triển khai cần giảm trùng thao tác nếu cả hai dẫn cùng đích.

### P2 — Thực đơn vẫn giống trang báo cáo

Sửa: tiêu đề và Tạo mới chung hàng; ngày/trạng thái ngắn; date rail thấp; ưu tiên món trong ngày. Danh sách đi chợ là tiện ích phụ mở sheet. Desktop dùng khoảng rộng cho bố cục, không phóng to nguyên mobile. Không buộc hiển thị bảy ngày nếu kế hoạch thật chỉ có hai ngày.

### P2 — Cộng đồng thiếu nhịp đọc và hình ảnh

Bằng chứng: community-desktop có các khối chữ lớn gần giống nhau, sidebar giải thích dài. Không phải mọi bài đều có cover, nên không thể giải quyết bằng gắn stock photo.

Sửa: bài có cover thật dùng thumbnail/cover phù hợp; bài không cover dùng thiết kế chữ gọn có trích đoạn thực. Một thanh viết bài ngắn cho người đã đăng nhập; guest có CTA đăng nhập rõ. Metadata tác giả/ngày và vote/bình luận gọn. Sidebar desktop chỉ giữ mục hữu ích, bỏ khẩu hiệu lặp. Mobile search gọn, lọc có chọn trạng thái rõ. Không thêm follower, xu hướng hay lượt xem nếu API không có.

### P2 — Chi tiết món và chế độ nấu chưa cùng chất lượng thị giác

Sửa: ảnh thật ở đầu nếu có, nhóm tên/khẩu phần/lưu món; nguyên liệu có thể đọc và tick rõ trong cooking mode hiện có. Dinh dưỡng hàng gọn, vi chất mở rộng. Một hành động Vào bếp nổi bật; thiếu instructions phải vô hiệu và giải thích. Không tự điền nguyên liệu, thời gian hay mức độ khó.

### P3 — Các trang phụ cần cùng hệ thống

- Scan: upload là trọng tâm; preview ảnh người dùng lớn, trạng thái phân tích rõ, kết quả/dinh dưỡng thành nhóm. Chỉ có scan frame khi đang phân tích, không animation camera giả.
- Chat: rút phần giới thiệu; hội thoại chiếm diện tích, composer dễ chạm; lịch sử trong sheet trên mobile. Lỗi/bận BE phải thể hiện đúng, không dựng câu trả lời.
- Đã lưu: dùng cùng recipe card; empty state một hướng khám phá, không danh sách gợi ý giả.
- Dinh dưỡng: cùng ngôn ngữ gauge với Today; ngày và nguồn nhật ký rõ; thiếu mục tiêu không thành 0% giả.
- Hồ sơ/cài đặt: form nhóm gọn, nhãn luôn hiện, lỗi sát trường; không gamification hoặc điểm sức khỏe tự suy diễn.
- Đăng nhập/OTP: đơn nhiệm; desktop có visual thương hiệu nhẹ, mobile tập trung biểu mẫu; không tự tạo thực đơn sau đăng ký.
- Viết/đọc bài: editor ít thanh công cụ nhưng đủ dùng; preview phản ánh nội dung thật; giữ giới hạn URL vì chưa có upload/edit API.
- Thông báo/lịch sử: hàng ngắn, trạng thái đọc và phân trang rõ; không dùng thẻ lớn cho mỗi dòng.

## Hệ thống thị giác đề xuất

- Nền #F6F4ED, chữ chính #203B2C, bề mặt #FFFEFA.
- Lime #D9ED94 cho vùng chọn/CTA có chọn lọc; peach #F4C9AB cho điểm nhấn phụ.
- Không dùng lime/peach nhạt làm chữ trên trắng; trạng thái vẫn có nhãn và icon.
- Khoảng cách theo nhịp 4/8px. Mobile lề 16–20px, desktop khung tối đa 1240px.
- Card 16–24px, nút 12–16px; pill chỉ dành cho lọc/trạng thái. Viền mảnh, bóng rất nhẹ.
- Đích chạm tối thiểu 44×44px. Duy trì focus keyboard, tương phản, safe-area và không để dock che nội dung.
- Bottom nav giữ năm điểm đến đã thống nhất; Quét ảnh là thao tác/đích phụ trong trang, không thay một tab bằng nút hành động.

## Hai mẫu đã tạo

1. [Desktop V2](design-concepts/2026-11-05/veggie-desktop-v2.png): hero và đầu thư viện.
2. [Mobile V2](design-concepts/2026-11-05/veggie-mobile-v2.png): Bếp hôm nay, Thực đơn, Khám phá món.

Dùng công cụ image_gen tích hợp. Prompt đầy đủ lưu trong cùng thư mục: prompts.md.
Ảnh món và số liệu trong concept là minh họa, không đưa vào FE như dữ liệu API. Không dùng cả ảnh mockup làm giao diện raster.

### Điểm cần sửa khi chuyển mẫu thành code

- Board mobile có ngày/thứ không khớp ở date rail: không sao chép chuỗi ngày từ ảnh; tính theo ngày thật và timezone Việt Nam.
- Ba macro trong concept không cộng đúng năng lượng ví dụ: không dùng những số đó làm fixture nghiệp vụ; tính/hiện theo API.
- Một số nhãn ngày/khẩu phần do mô hình tạo chưa tự nhiên; chuẩn hóa bằng văn bản trong code.
- Board thiếu active state đúng cho khám phá và chưa đủ mọi trạng thái lỗi/rỗng; bản code phải theo route thật, không tô tab sai.
- Icon trong ảnh chỉ gợi ý; dùng hệ lucide hiện có, thống nhất nét.
- Gauge không gán xanh = lành mạnh hay cam = có hại; chỉ phản ánh lượng đã ghi nhận/mục tiêu.
- Concept có nhiều ảnh hơn BE hiện hỗ trợ. Cần duyệt thêm layout không ảnh trước khi chốt triển khai.

## Cổng nghiệm thu cho đợt triển khai tiếp

1. Đối chiếu screenshot 390×844 và 1440×900 với concept; không chỉ kiểm tra không tràn ngang.
2. Kiểm tra 320px, 768px, tên dài, phóng chữ 200%; không cắt tên/nút hay khóa cuộn.
3. Với ảnh hợp lệ, lỗi ảnh, không ảnh: cả ba trạng thái phải có bố cục chủ đích.
4. Kiểm tra loading/empty/error/partial data riêng; thiếu dữ liệu không thay bằng số 0 hoặc dữ liệu demo.
5. Đăng ký/OTP xong cho chọn khám phá hoặc thiết lập; tạo thực đơn là hành động chủ động.
6. Xác minh navigation, focus, sheet, keyboard và reduced motion; không regress năm tab.
7. Kiểm tra hợp đồng API hiện có cho lưu món, đổi món, nhật ký, cộng đồng; không gọi endpoint chưa có.
8. Typecheck/lint/build và suite liên quan thay đổi. Đợt concept này không đổi code FE nên chưa chạy lại suite.

## Nguồn nghiên cứu

- [Samsung Food Meal Planner](https://samsungfood.com/meal-planner/): tham khảo kết nối thực đơn với danh sách mua, thay vì bày mọi tiện ích thành một trang quá dài.
- [Kitchen Stories App](https://pages.kitchenstories.com/en/app): tham khảo ảnh món và cooking mode từng bước. Không suy diễn Veggie có media từng bước khi BE chưa có.
- [Apple HIG — Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars): tab phục vụ điều hướng cấp cao, có nhãn và được duy trì nhất quán. Áp dụng nguyên tắc, không sao chép phong cách iOS lên web.

## BE ảnh hưởng trực tiếp đến chất lượng thiết kế

Báo cáo trước ghi nhận nhiều công thức không có ảnh, một số ảnh sai tên món, một số công thức thiếu nguyên liệu. Cần BE/content bổ sung ảnh đúng bản ghi, nguồn/quyền sử dụng, nguyên liệu và metadata thật. Không dùng ảnh AI để che thiếu dữ liệu catalogue.

Chi tiết API/data nằm ở BE_USER_AUDIT_2026-11-03.md và COMMUNITY_USER_AUDIT_2026-11-04.md. Đợt này không xác nhận lại tình trạng từng endpoint.
