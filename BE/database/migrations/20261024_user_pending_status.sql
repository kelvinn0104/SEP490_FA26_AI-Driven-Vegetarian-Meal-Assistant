-- =====================================================================
-- Migration 2026-10-24: Xác thực email bằng OTP
-- Thêm trạng thái 'pending' (chờ xác thực email) cho bảng "User".
-- Backend cũng tự chạy lệnh này khi khởi động (Program.cs), file này để chạy tay bằng pgAdmin nếu cần.
-- =====================================================================
SET search_path TO veggieai;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_Status_check";
ALTER TABLE "User" ADD CONSTRAINT "User_Status_check"
    CHECK ("Status" IN ('pending', 'active', 'locked'));

-- (Tùy chọn) Dọn các tài khoản đăng ký nhưng bỏ dở quá 7 ngày:
-- DELETE FROM "User" WHERE "Status" = 'pending' AND "CreatedAt" < now() - interval '7 days';
