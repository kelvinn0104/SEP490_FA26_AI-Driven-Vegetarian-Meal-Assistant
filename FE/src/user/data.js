export function listOf(value) {
  return Array.isArray(value)
    ? value
    : Array.isArray(value?.items)
      ? value.items
      : [];
}
export function amount(value, factor = 1) {
  return value == null || value === "" || !Number.isFinite(Number(value))
    ? "—"
    : new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 }).format(
        Number(value) * factor,
      );
}
export function safeImage(value) {
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://veggieai-api.onrender.com");
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
export function userError(error) {
  if (error.status === 404 || error.status === 405)
    return "Tính năng này hiện chưa sẵn sàng. Vui lòng quay lại sau.";
  if (error.status === 401)
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (error.status === 403)
    return "Tài khoản chưa được phép thực hiện thao tác này.";
  if (error.status === 408 || error.name === "AbortError")
    return "Máy chủ phản hồi chậm. Vui lòng thử lại sau ít phút.";
  if (error instanceof TypeError)
    return "Không thể kết nối. Kiểm tra mạng rồi thử lại.";
  return error.message?.startsWith("<")
    ? "Dịch vụ tạm thời không khả dụng."
    : error.message || "Không thể hoàn tất. Vui lòng thử lại.";
}
export function validatePhoto(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    return "Chọn ảnh JPG, PNG hoặc WebP.";
  if (file.size > 8 * 1024 * 1024) return "Ảnh tối đa 8 MB.";
  return "";
}
export function statusLabel(value) {
  return (
    {
      draft: "Bản nháp",
      active: "Đang dùng",
      completed: "Đã hoàn thành",
      cancelled: "Đã hủy",
      pending: "Chờ duyệt",
      pending_verification: "Chờ duyệt",
      published: "Đã đăng",
      flagged: "Đang xem xét",
      removed: "Đã gỡ",
      hidden: "Đã ẩn",
    }[value] || "Chưa rõ trạng thái"
  );
}
export function categoryLabel(value) {
  return (
    {
      Dessert: "Món tráng miệng",
      Soup: "Súp",
      "Main dish": "Món chính",
      Breakfast: "Bữa sáng",
    }[value] || value
  );
}
