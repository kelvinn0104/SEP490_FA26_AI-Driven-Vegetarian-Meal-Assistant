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
  if ([408, 504].includes(error.status) || error.name === "AbortError")
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
export function isTestContent(item) {
  return /\((?:dummy|demo|test)\)|\[(?:dummy|demo|test)\]|(?:^|[\/_-])dummy(?:[-_.\/]|$)/i.test(
    [item?.title, item?.mediaUrl].filter(Boolean).join(" "),
  );
}
export function isUnavailableChat(text) {
  return [
    "Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.",
    "Trợ lý AI chưa được cấu hình (thiếu API key). Vui lòng liên hệ quản trị viên.",
    "...",
  ].includes(text?.trim());
}

export function vietnamDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function mealsForDate(plan, date, logs) {
  const recorded = new Set(
    (logs || [])
      .filter((log) => log.planItemId != null)
      .map((log) => String(log.planItemId)),
  );
  const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  return (plan?.days?.find((day) => day.date === date)?.meals || [])
    .filter((meal) => !isTestContent({ title: meal.recipeTitle }))
    .map((meal) => ({ ...meal, recorded: recorded.has(String(meal.id)) }))
    .sort((a, b) => (order[a.mealType] ?? 4) - (order[b.mealType] ?? 4));
}

export function nutrientProgress(value, target) {
  if (
    value == null ||
    value === "" ||
    target == null ||
    target === "" ||
    !Number.isFinite(Number(value)) ||
    !Number.isFinite(Number(target)) ||
    Number(target) <= 0 ||
    Number(value) < 0
  )
    return null;
  return Math.max(0, Math.min(100, (Number(value) / Number(target)) * 100));
}

export const mealLabels = {
  breakfast: "Bữa sáng",
  lunch: "Bữa trưa",
  dinner: "Bữa tối",
  snack: "Bữa phụ",
};
