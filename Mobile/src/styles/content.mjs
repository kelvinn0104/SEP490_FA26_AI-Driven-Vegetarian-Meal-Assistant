export function listOf(data) {
  return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
}

export function number(value, unit = '') {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(Number(value)) + (unit ? ' ' + unit : '');
}

export function fold(text) {
  return String(text ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').trim();
}

export function isDemo(item) {
  return /\((dummy|demo|test)\)|\[(dummy|demo|test)\]/i.test(item?.title || '');
}

export function categoryName(value) {
  const labels = { Dessert: 'Tráng miệng', Soup: 'Súp', 'Main dish': 'Món chính', Breakfast: 'Bữa sáng' };
  return labels[value] || value;
}

export function today(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key).value).join('-');
}

export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T12:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value;
}

export function shortDate(value) {
  if (!validDate(value)) return '';
  return new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value + 'T12:00:00Z'));
}

export function loggedMealIds(daily, day) {
  if (!day || daily?.date !== day) return new Set();
  return new Set((daily.logs || []).filter(log => log.planItemId != null).map(log => String(log.planItemId)));
}

export const mealNames = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Bữa phụ' };
export const planNames = { draft: 'Bản nháp', active: 'Đang dùng', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

export function allowedIngredient(item) {
  return item.ingredientId != null && item.freshness !== 'spoiled' && item.isVegetarian !== false;
}

export function chatUnavailable(content) {
  return !content?.trim() || ['...', 'Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.', 'Trợ lý AI chưa được cấu hình (thiếu API key). Vui lòng liên hệ quản trị viên.'].includes(content.trim());
}
