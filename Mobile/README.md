# 🥦 VeggieAI Mobile App (Role: User)
> **Ứng dụng di động dành riêng cho người dùng cá nhân (End-User) của hệ sinh thái VeggieAI**  
> **Tech Stack:** React Native (Expo) + JavaScript (.jsx) + TanStack Query + Zustand + Axios  
> **API Backend:** ASP.NET Core (.NET 8/9) deployed at `https://veggieai-api.onrender.com/api`

---

## 📌 Tính năng cốt lõi trên Mobile
1. **🏠 Khám phá món chay (Home & Discover):** Gợi ý công thức nổi bật, tìm kiếm theo nguyên liệu/calo, xem chi tiết công thức (nguyên liệu, cách nấu, bảng vi chất dinh dưỡng), lưu món yêu thích.
2. **📸 Quét tủ lạnh bằng AI (Vision Scan):** Tận dụng Camera điện thoại chụp ảnh tủ lạnh -> Gửi ảnh lên mô hình YOLOv8 ONNX trên BE để nhận diện nguyên liệu -> Đề xuất món chay "Zero-waste".
3. **💬 Trợ lý AI (VeggieBot):** Trò chuyện trực tiếp với AI trợ lý dinh dưỡng, tư vấn món ăn thay thế và giải đáp vi chất.
4. **📅 Kế hoạch dinh dưỡng (Meal Planner):** Lập thực đơn tuần thông minh (bởi Linear Programming solver), theo dõi tiến trình calo và đánh dấu bữa đã ăn.
5. **👥 Cộng đồng thuần chay (Community):** Xem bảng tin, chụp ảnh đăng bài trực tiếp từ điện thoại, thả tim, bình luận.
6. **👤 Hồ sơ sức khỏe (Health Profile):** Tính chỉ số BMI, quản lý mục tiêu thể hình và danh mục món đã lưu.

---

## 🚀 Hướng dẫn Cài đặt & Chạy ứng dụng

### 1. Cài đặt thư viện dependencies
Mở terminal tại thư mục `Mobile`:
```bash
cd Mobile
npm install
```

### 2. Khởi chạy ứng dụng với Expo
```bash
npx expo start
```

### 3. Xem và trải nghiệm trực tiếp trên Điện thoại thật
1. Cài đặt app **Expo Go** trên điện thoại (từ Google Play hoặc Apple App Store).
2. Mở camera hoặc app Expo Go trên điện thoại để quét mã **QR Code** xuất hiện trên terminal máy tính.
3. Ứng dụng sẽ tự động tải và chạy mượt mà ngay trên điện thoại của bạn!
