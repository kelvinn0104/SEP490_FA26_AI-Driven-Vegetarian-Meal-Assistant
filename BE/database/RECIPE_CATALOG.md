# Kho công thức VeggieAI

[VeggieAI_RecipeCatalog_100.sql](VeggieAI_RecipeCatalog_100.sql) nhập 100 công thức chay tiếng Việt, mỗi nhóm 20 món gồm bữa sáng, món chính, món nước, salad và tráng miệng. Mỗi công thức có khẩu phần, định lượng cho cả mẻ, ba bước nấu và dinh dưỡng trên một phần.

76 nguyên liệu có mã FDC và trạng thái cân cụ thể trong [USDA FoodData Central SR Legacy](https://fdc.nal.usda.gov/download-datasets/). Phép tính dùng 8 chỉ số trên 100 g gồm năng lượng, đạm, carbohydrate, chất béo, sắt, B12, canxi và kẽm. Giá trị trên món là ước tính từ thành phần nguyên liệu. Nước ngâm, luộc hoặc trụng rồi bỏ đi nằm ngoài định lượng. B12 và canxi trong thực phẩm tăng cường phụ thuộc vào nhãn sản phẩm thực tế.

## Nhập và duyệt

1. Trên staging có schema `veggieai`, áp dụng [migration trigger dinh dưỡng](migrations/20261128_catalog_nutrition_search_path.sql) rồi chạy file nhập kho. File giữ các công thức cũ và có thể chạy lại mà không nhân đôi món theo cùng tác giả và tên. Không chạy `VeggieAI_Database.sql` trên cơ sở dữ liệu đang phục vụ vì file đó xóa schema.
2. Moderator lọc `pending_verification` trong quản lý công thức. Rà định lượng, thao tác nấu, thông tin dị ứng, tên món trùng và ảnh thật nếu có. Với nguyên liệu đóng gói, đọc nhãn về thành phần và nhiễm chéo. Bản nhập đặt yến mạch thông thường trong bộ lọc gluten để tránh giả định đã được chứng nhận.
3. Xuất bản từng món đạt yêu cầu bằng luồng duyệt công thức hiện có. Các món bắt đầu ở `pending_verification` và chưa có người duyệt. Hướng dẫn là nội dung biên soạn và chưa được bếp thử món hoặc chuyên gia duyệt. Ảnh món được để trống.
4. Trước khi đưa bộ lọc mới lên live, kiểm tra kho đã có đủ món được duyệt cho từng bữa và thử tạo thực đơn với hồ sơ có dị ứng. Kho công khai loại công thức thiếu nguyên liệu, có ngày duyệt trước ngày tạo hoặc được tự duyệt bởi tài khoản seed demo. Công thức cũ cần được đội kiểm duyệt rà riêng.

Khám phá, món đã lưu, chọn món cho thực đơn, đổi món, gợi ý từ ảnh, chat và công thức gắn vào bài viết cùng dùng kho đã duyệt. Duyệt bài cộng đồng chỉ tác động đến bài. Dữ liệu lịch sử lưu trong thực đơn trước đó vẫn được giữ.
