export function listOf(data) {
  return Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
}

export function number(value, unit = '') {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return '—';
  const digits = unit === 'kcal' || unit === 'bước' ? 0 : 1;
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: digits }).format(Number(value)) + (unit ? ' ' + unit : '');
}

export function fold(text) {
  return String(text ?? '').toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').trim();
}

export function isDemo(item) {
  return /\((dummy|demo|test)\)|\[(dummy|demo|test)\]/i.test(item?.title || '');
}

export function categoryName(value) {
  const labels = {
    Dessert: 'Tráng miệng',
    Soup: 'Canh & Súp',
    'Main dish': 'Món chính',
    Breakfast: 'Bữa sáng',
    Salad: 'Gỏi & Salad',
    Appetizer: 'Khai vị',
    Snack: 'Ăn nhẹ',
    Drink: 'Thức uống',
  };
  return labels[value] || value;
}

export function dietLabel(value) {
  const map = {
    vegan: 'Thuần chay',
    vegetarian: 'Ăn chay',
    flexitarian: 'Ăn chay linh hoạt',
    lacto_ovo: 'Chay sữa & trứng',
  };
  return map[String(value ?? '').toLowerCase()] || 'Bếp chay';
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

export function fullViDate(value) {
  if (!validDate(value)) return '';
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value + 'T12:00:00Z'));
}

export function formatPostDate(iso, now = new Date()) {
  if (!iso) return '';
  const parsed = new Date(iso);
  if (!Number.isFinite(+parsed)) return '';
  const currentDay = today(now);
  const itemDay = today(parsed);
  if (itemDay === currentDay) return 'Hôm nay';
  if (itemDay === addDays(currentDay, -1)) return 'Hôm qua';
  return new Intl.DateTimeFormat('vi-VN', {
    day: 'numeric', month: 'short', year: parsed.getFullYear() === now.getFullYear() ? undefined : 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(parsed);
}

export function loggedMealIds(daily, day) {
  if (!day || daily?.date !== day) return new Set();
  return new Set((daily.logs || []).filter(log => log.planItemId != null).map(log => String(log.planItemId)));
}

export const mealNames = { breakfast: 'Bữa sáng', lunch: 'Bữa trưa', dinner: 'Bữa tối', snack: 'Bữa phụ' };
export const planNames = { draft: 'Bản nháp', active: 'Đang dùng', completed: 'Hoàn thành', cancelled: 'Đã hủy' };

export function planDisplayStatus(plan, currentDay = today()) {
  if (!plan) return { label: 'Thực đơn', expired: false };
  const expired = Boolean(plan.endDate && plan.endDate < currentDay && plan.status === 'active');
  if (expired) return { label: 'Đã kết thúc', expired: true };
  return { label: planNames[plan.status] || 'Thực đơn', expired: false };
}

export function allowedIngredient(item) {
  return item.ingredientId != null && item.freshness !== 'spoiled' && item.isVegetarian !== false;
}

export function chatUnavailable(content) {
  return !content?.trim() || [
    '...',
    'Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.',
    'Trợ lý AI chưa được cấu hình (thiếu API key). Vui lòng liên hệ quản trị viên.',
  ].includes(content.trim());
}

export function chatContent(question, attachment) {
  const text = question.trim();
  const names = [...new Set(attachment?.ingredients || [])].join(', ');
  return names && text ? text + '\n\nNguyên liệu đã xác nhận từ ảnh: ' + names : text;
}

export function addDays(date, days) {
  if (!validDate(date)) return '';
  const next = new Date(date + 'T12:00:00Z');
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function nutrientRatio(consumed, target) {
  if (consumed == null || consumed === '' || target == null || target === '') return null;
  const cVal = Number(consumed);
  const tVal = Number(target);
  if (!Number.isFinite(cVal) || !Number.isFinite(tVal) || tVal <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((cVal / tVal) * 100)));
}

export function parseSteps(instructions) {
  const raw = String(instructions ?? '').trim();
  if (!raw) return [];
  const blocks = raw
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !/^#{1,6}\s*(cách làm|cách nấu|hướng dẫn|chế biến)\s*:?$/i.test(line));

  return blocks.map(line =>
    line
      .replace(/^(?:bước\s*\d+\s*[:.-]|\d+\s*[.):-]|[-*•])\s*/i, '')
      .replace(/^#{1,6}\s+/, '')
      .trim()
  ).filter(Boolean);
}

export function initialsOf(name, fallback = 'V') {
  const clean = String(name ?? '').trim();
  if (!clean) return fallback;
  const parts = clean.split(/\s+/).filter(Boolean).slice(-2);
  return parts.map(part => Array.from(part)[0]).join('').toLocaleUpperCase('vi-VN') || fallback;
}

const usdaViMap = {
  'bean sprouts': 'Giá đỗ tươi',
  'bok choy': 'Cải thìa',
  broccoli: 'Bông cải xanh',
  carrot: 'Cà rốt',
  carrots: 'Cà rốt',
  'chia seeds': 'Hạt chia',
  cucumber: 'Dưa leo',
  edamame: 'Đậu nành lông',
  'firm tofu (calcium-set)': 'Đậu hũ cứng (giàu canxi)',
  'firm tofu': 'Đậu hũ cứng',
  'silken tofu': 'Đậu hũ non',
  'extra-firm tofu': 'Đậu hũ ép chắc',
  tofu: 'Đậu hũ',
  'soft tofu': 'Đậu hũ non',
  garlic: 'Tỏi',
  ginger: 'Gừng tươi',
  kale: 'Cải xoăn Kale',
  lentils: 'Đậu lăng',
  chickpeas: 'Đậu gà',
  'black beans': 'Đậu đen',
  'mung beans': 'Đậu xanh',
  'kidney beans': 'Đậu đỏ',
  'white beans': 'Đậu trắng',
  mushrooms: 'Nấm tươi',
  'white mushrooms': 'Nấm mỡ trắng',
  'shiitake mushrooms': 'Nấm đông cô',
  'oyster mushrooms': 'Nấm bào ngư',
  'king oyster mushrooms': 'Nấm đùi gà',
  'enoki mushrooms': 'Nấm kim châm',
  'wood ear mushrooms': 'Nấm mèo (mộc nhĩ)',
  'nutritional yeast, fortified': 'Men dinh dưỡng (bổ sung B12)',
  'nutritional yeast': 'Men dinh dưỡng',
  oats: 'Yến mạch cán dẹt',
  'rolled oats': 'Yến mạch cán dẹt',
  'olive oil': 'Dầu ô liu',
  'sesame oil': 'Dầu mè',
  'coconut milk': 'Nước cốt dừa',
  'vegetable broth': 'Nước dùng rau củ',
  orange: 'Cam tươi',
  banana: 'Chuối chín',
  avocado: 'Bơ sáp',
  lime: 'Chanh tươi',
  lemon: 'Chanh vàng',
  peanuts: 'Đậu phộng (lạc)',
  'peanut butter': 'Bơ đậu phộng',
  cashews: 'Hạt điều',
  'sunflower seeds': 'Hạt hướng dương',
  flaxseeds: 'Hạt lanh',
  'flax seeds': 'Hạt lanh',
  pumpkin: 'Bí đỏ',
  'pumpkin seeds': 'Hạt bí xanh',
  'brown rice': 'Gạo lứt',
  'white rice': 'Gạo trắng',
  'rice noodles': 'Bún tươi / bánh phở',
  quinoa: 'Hạt diêm mạch (Quinoa)',
  'sesame seeds': 'Hạt mè (vừng)',
  tahini: 'Sốt mè nghiền (Tahini)',
  'soy milk': 'Sữa đậu nành',
  'soy milk, fortified': 'Sữa đậu nành (bổ sung canxi & B12)',
  'almond milk': 'Sữa hạnh nhân',
  'soy sauce': 'Nước tương',
  spinach: 'Cải bó xôi',
  'sweet potato': 'Khoai lang',
  potato: 'Khoai tây',
  corn: 'Bắp ngọt',
  'bell pepper': 'Ớt chuông',
  'red bell pepper': 'Ớt chuông đỏ',
  onion: 'Hành tây',
  'green onion': 'Hành lá',
  scallions: 'Hành lá',
  cilantro: 'Ngò rí (rau mùi)',
  seaweed: 'Rong biển',
  nori: 'Lá rong biển Nori',
  tempeh: 'Đậu tương lên men (Tempeh)',
  tomato: 'Cà chua',
  tomatoes: 'Cà chua',
  walnuts: 'Hạt óc chó',
  almonds: 'Hạt hạnh nhân',
};

export function ingredientLabel(name) {
  const raw = String(name ?? '').trim();
  if (!raw) return '';
  const lower = raw.toLowerCase();
  if (usdaViMap[lower]) return usdaViMap[lower];

  // Handle USDA suffixes like "Black beans, cooked" or "Lentils, boiled"
  const suffixMatch = lower.match(/^(.+?),\s*(cooked|boiled|steamed|raw|fresh|dried|frozen|canned|unsalted|drained)$/);
  if (suffixMatch) {
    const baseVi = usdaViMap[suffixMatch[1].trim()];
    if (baseVi) {
      const prep = {
        cooked: 'đã nấu',
        boiled: 'đã luộc',
        steamed: 'hấp',
        dried: 'khô',
        frozen: 'cấp đông',
      }[suffixMatch[2]];
      return prep ? `${baseVi} (${prep})` : baseVi;
    }
  }
  return raw;
}

export function classifyAisle(name) {
  const f = fold(ingredientLabel(name));
  if (/nam\b|shiitake|mushroom/.test(f)) return 'mushroom';
  if (/dau hu|tofu|tempeh|sua dau|hat |me\b|vung|dau lang|dau ga|dau den|dau xanh|yen mach|quinoa|lac|bo dau/.test(f)) {
    return 'protein';
  }
  if (/cai |rau |gia do|bong cai|xa lach|ngo|hung|tia to|he\b|spinach|kale|bok choy/.test(f)) {
    return 'greens';
  }
  if (/ca rot|bi do|khoai|ca chua|dua leo|cam\b|chuoi|bo sap|chanh|ot\b|cu |bau|muop|su su|bap\b/.test(f)) {
    return 'produce';
  }
  return 'pantry';
}

const AISLE_ORDER = ['greens', 'produce', 'protein', 'mushroom', 'pantry'];

export function groupShoppingByAisle(items = []) {
  const buckets = new Map(AISLE_ORDER.map(key => [key, []]));
  for (const item of items) {
    const key = classifyAisle(item.ingredientName);
    buckets.get(key).push(item);
  }
  return AISLE_ORDER
    .map(key => ({
      key,
      items: buckets.get(key).sort((a, b) => Number(!!a.isBought) - Number(!!b.isBought)),
    }))
    .filter(group => group.items.length > 0);
}

// Detect duplicate stock image URLs reused across multiple recipes so UI can soften/suppress misleading photos
export function duplicateImageUrls(recipes = []) {
  const counts = new Map();
  for (const r of recipes) {
    const u = String(r?.imageUrl ?? '').trim();
    if (u) counts.set(u, (counts.get(u) || 0) + 1);
  }
  const dupes = new Set();
  for (const [u, count] of counts.entries()) {
    if (count > 1) dupes.add(u);
  }
  return dupes;
}

export function sortRecipes(recipes, mode = 'default') {
  const list = [...(recipes || [])];
  if (mode === 'protein') {
    return list.sort((a, b) => (Number(b.proteinG) || 0) - (Number(a.proteinG) || 0));
  }
  if (mode === 'kcal_asc') {
    return list.sort((a, b) => {
      const ka = Number(a.kcalPerServing) || Infinity;
      const kb = Number(b.kcalPerServing) || Infinity;
      return ka - kb;
    });
  }
  return list;
}
