# VeggieAI Mobile

Ứng dụng React Native / Expo SDK 58, ưu tiên Android. Khách có thể tìm công thức và đọc cộng đồng. Tài khoản người dùng có thể lưu món, xác thực email, cập nhật hồ sơ và dị ứng, lập thực đơn, ghi nhật ký, quét ảnh, trò chuyện và tham gia cộng đồng.

## Chạy trên Android

```sh
npm ci
npm run start
```

Quét mã QR bằng Expo Go tương thích SDK 58. Thiết bị và máy chạy Metro cần nhìn thấy nhau qua mạng. Nếu dùng emulator Android đã cài, chạy `npm run android`.

API mặc định là `https://veggieai-api.onrender.com/api`. Có thể đặt `EXPO_PUBLIC_API_URL` trong `.env.local` để dùng môi trường khác. Biến này được đưa vào bundle nên chỉ chứa URL công khai.

## Kiểm tra

```sh
npx expo-doctor
node --test tests/*.test.mjs
npx expo export --platform android
```

Expo export kiểm tra bundle JavaScript và assets. Cần thiết bị hoặc emulator để kiểm quyền camera, bàn phím, nút Back và cài đặt ứng dụng. Bài cộng đồng gửi media bằng liên kết HTTPS vì API bài viết nhận JSON. Video mở bằng trình phát hoặc trình duyệt hệ thống.

Ảnh bữa chay ở trang Khám phá là ảnh biên tập tạo bằng ImageGen. Ảnh trong danh sách công thức và bài viết lấy từ dữ liệu API.
