# VeggieAI — UI/UX user và guest, 05/11/2026

## Hướng hình ảnh

Triển khai hướng đã thống nhất: ẩm thực × công nghệ, nền kem/mint, xanh rừng/xanh chanh, nét đất nung cho dinh dưỡng. Tham chiếu 7 ảnh người dùng gửi: ảnh món dạng đĩa, card có chiều sâu, lịch ngày, panel dinh dưỡng và vùng quét ảnh. Không đưa ảnh mockup, rating, follower, calo hoặc biểu đồ mẫu từ ảnh tham khảo vào website.

- Typography Be Vietnam Pro + Lora hỗ trợ tiếng Việt; 10 WOFF2 subset Latin/Vietnamese được self-host, khoảng 193 KB tổng tài nguyên, có giấy phép OFL tại public/fonts/veggie.
- SVG đĩa/lá/quỹ đạo do FE tạo là đồ họa thương hiệu, không phải ảnh món hoặc kết quả AI.
- Font, token, foundation, discovery, workspace, account, community và motion có stylesheet riêng. portal.css là entrypoint, thay cấu trúc override cũ.
- Motion ngắn: hero mở đầu, chuyển màn/ngày, indicator bottom nav và dialog/sheet. Không scroll-jacking; prefers-reduced-motion vô hiệu chuyển động. Hiệu ứng quét chỉ chạy trong lúc request đang xử lý.

## Thay đổi theo trang

| Khu vực | Kết quả |
| --- | --- |
| Guest / | Hero sáng bất đối xứng, ảnh live trong khung đĩa, thẻ gợi ý chồng lớp; CTA khám phá và lên thực đơn |
| /discover và /blog | Thư viện riêng, tìm/lọc/sort; card thiếu ảnh có bố cục chữ, không tạo ảnh món thay thế |
| User / | Bếp hôm nay: thực đơn ngày Việt Nam, ghi bữa qua planItemId, dinh dưỡng thật, công cụ và đường vào khám phá |
| Recipe detail / Vào bếp | Ảnh/nội dung, nguyên liệu trước cách làm, khẩu phần và vi chất mở thêm; dialog nấu dùng primitive focus/scroll chung |
| Planner / create / history | Lịch ngày có trạng thái chọn, một ngày mỗi lần trên mobile; form tạo tách rõ; số ngày chọn nhanh; đi chợ thành drawer desktop/sheet mobile |
| Nutrition | Thanh mục tiêu lấy consumed/target thật, nhật ký dạng timeline; thiếu dữ liệu/mục tiêu không dựng tỷ lệ |
| Vision | Chọn ảnh, kiểm tra nguyên liệu, tìm món; trạng thái ba bước, chip lựa chọn, gợi ý mở sau xác nhận |
| Chat | Hội thoại tập trung, lịch sử desktop và sheet mobile; scroll trong vùng tin nhắn; giữ xử lý busy fallback BE |
| Community / reader / compose / mine | Giữ chức năng đợt trước, chuyển typography và nền/card theo hệ thống mới; đọc bài, viết/preview/draft, report và quản lý vẫn nối API |
| Saved / personal / profile / settings | Bộ sưu tập, trung tâm cá nhân và nhóm công cụ; profile hai bước; settings chia nhóm; responsive theo kích thước |
| Login / register / OTP / welcome | Mảng thương hiệu riêng desktop, form tập trung mobile; xác thực và lưu hồ sơ không tự tạo thực đơn |
| Notifications | Phân biệt đã đọc/chưa đọc, hành động và trạng thái lỗi/rỗng cùng hệ thống |

Bottom nav 5 mục: Hôm nay (guest: Khám phá), Thực đơn, Cộng đồng, Đã lưu, Cá nhân. /discover truy cập trực tiếp được; mục khám phá trong chào mừng/hồ sơ dẫn đúng thư viện.

## Dữ liệu và độ tin cậy

- Bếp hôm nay gọi current plan và daily nutrition độc lập, có abort theo vòng đời; lỗi một nguồn không làm mất nguồn còn lại. Current 204 có màn bắt đầu thật, không tạo plan ngầm.
- Ngày dùng Asia/Ho_Chi_Minh, cập nhật khi qua ngày hoặc tab trở lại. Bữa đã ghi chỉ đối chiếu planItemId, không đoán từ tên món. Khi chưa biết nhật ký, khóa ghi bữa để tránh lặp.
- Tiến độ dinh dưỡng dùng consumed/target, giữ đúng zero; null/thiếu target không biến thành 0 hay tỷ lệ giả. Gauge năng lượng ở Bếp hôm nay lấy cùng dữ liệu thật.
- Draft cộng đồng vẫn chỉ là nội dung người dùng đang soạn, không trộn vào feed. Chặn marker test hiện có; lỗi API không tạo kết quả thành công thay thế.
- Báo cáo BE vẫn áp dụng: [User/API/data](BE_USER_AUDIT_2026-11-03.md), [Community](COMMUNITY_USER_AUDIT_2026-11-04.md). Chưa có API edit/upload community; chat provider còn busy; nguồn ảnh BE có thiếu và có ảnh không khớp món. FE không tự sửa nguồn dữ liệu.

## Tải trang và phạm vi quản trị

- User feature screens tải theo route; Markdown/cooking/chat/planner không cùng tải vào guest home.
- Admin markup chuyển nguyên trạng vào AdminView để chỉ tải JS, theme CSS và font quản trị khi vào admin/mod. Đã so sánh JSX biên dịch bằng esbuild với markup trước thay đổi: tương đương. Không sửa source màn admin/mod hoặc BE.
- Root JS build từ khoảng 414,5 KB còn 225,2 KB; user shell khoảng 101,7 KB, các trang khác thành chunk nhỏ theo nhu cầu. CSS quản trị khoảng 222 KB và hai Google font stylesheet không chặn trang user nữa. Không thêm dependency vào package.json.

## Kiểm chứng

- 12 unit tests: định lượng, dữ liệu thiếu/zero, HTTP/auth/OTP, media, marker test, ngày Việt Nam, planItemId, tỷ lệ dinh dưỡng.
- redesign.smoke: 19 route × 5 độ rộng 320/390/768/1024/1440; Bếp hôm nay, lỗi từng nguồn, plan204, không tự generate, đổi ngày, đi chợ, focus/Escape, chat history sheet, reduced motion.
- Hồi quy design/onboarding/portal/contracts/workflows/OTP/community và community-live. Các mutation trong smoke bị intercept; không dùng fixture làm bằng chứng BE live ghi thành công.
- Build production và lint user. Ảnh live trang public và ảnh fixture các trạng thái authenticated được lưu trong docs/screenshots; ảnh fixture không chứa hồ sơ người thật.
- Lighthouse mobile local production build, 3 lượt sau tối ưu: performance 79/87/80, accessibility 100/100/100, LCP 4,261/3,862/4,273 giây, CLS khoảng 0,0044; TBT 270/9/241 ms. Trước tách tải: performance60, LCP6,632 giây. Đây là lab với API Render/ảnh ngoài live, không phải field Core Web Vitals. Mục tiêu LCP2,5 giây chưa đạt; không ghi thành đã đạt. Cần tiếp tục tối ưu nguồn ảnh/API và kiểm tra trên điều kiện thiết bị/mạng thực tế. Chrome cleanup trên Windows có EPERM sau khi đã ghi report; report đủ dữ liệu, không có runtimeError Lighthouse.

Nguồn font: [Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro), [Lora](https://github.com/google/fonts/tree/main/ofl/lora). Nghiên cứu nền tảng: [Ottolenghi](https://ottolenghi.co.uk/), [Kitchen Stories](https://www.kitchenstories.com/en/stories/new-on-kitchen-stories-upload-your-own-recipes), [Linear UI](https://linear.app/now/behind-the-latest-design-refresh).
