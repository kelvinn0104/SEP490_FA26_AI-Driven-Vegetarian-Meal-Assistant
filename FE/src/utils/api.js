const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function generateMealPlan(ingredients) {
  const res = await fetch(`${API_BASE_URL}/mealplanner/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredients)
  });
  return res.json();
}

export async function detectIngredients() {
  const res = await fetch(`${API_BASE_URL}/vision/detect`, {
    method: 'POST'
  });
  return res.json();
}

export async function askChatbot(query) {
  const res = await fetch(`${API_BASE_URL}/chatbot/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

export async function fetchPendingModeration() {
  const res = await fetch(`${API_BASE_URL}/moderation/pending-posts`);
  return res.json();
}

// 3 TÀI KHOẢN MẪU CHO 3 ROLE: ADMIN, MODERATOR, USER
export const MOCK_ACCOUNTS = [
  {
    role: 'Admin',
    roleLabel: 'Admin',
    email: 'admin@veggieai.vn',
    username: 'admin',
    password: '123',
    passwords: ['123', 'admin123', '123456'],
    name: 'Admin',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    permissions: 'Toàn quyền: Quản trị hệ thống, Bảng điều khiển Admin, Duyệt bài, Thực đơn AI'
  },
  {
    role: 'Moderator',
    roleLabel: 'Kiểm duyệt viên (Mod)',
    email: 'mod@veggieai.vn',
    username: 'mod',
    password: '123',
    passwords: ['123', 'mod123', '123456'],
    name: 'Kiểm Duyệt Viên Cộng Đồng',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    permissions: 'Quyền Mod: Duyệt hàng chờ bài viết Blog, Video công thức, Thực đơn AI'
  },
  {
    role: 'AuthorizedUser',
    roleLabel: 'Thành viên chính thức (User)',
    email: 'user@veggieai.vn',
    username: 'user',
    password: '123',
    passwords: ['123', 'user123', '123456'],
    name: 'Thành Viên Thuần Chay',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    permissions: 'Quyền Thành viên: Lập thực đơn AI 7 ngày, Quét tủ lạnh, Hỏi AI không giới hạn'
  }
];

// FAKE API ĐĂNG NHẬP PHÂN QUYỀN
export async function mockLoginApi({ identifier, password }) {
  // Giả lập độ trễ mạng API 250ms cho chân thực
  await new Promise(resolve => setTimeout(resolve, 250));

  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();

  if (!cleanId) {
    throw new Error('Vui lòng nhập Email hoặc Tên đăng nhập.');
  }
  if (!cleanPass) {
    throw new Error('Vui lòng nhập Mật khẩu.');
  }

  // Khớp với 1 trong 3 tài khoản mẫu
  const matched = MOCK_ACCOUNTS.find(acc => 
    acc.email.toLowerCase() === cleanId || 
    acc.username.toLowerCase() === cleanId
  );

  if (matched) {
    if (!matched.passwords.includes(cleanPass)) {
      throw new Error(`Mật khẩu không chính xác cho tài khoản ${matched.email}. (Gợi ý: ${matched.password})`);
    }
    return {
      success: true,
      token: `mock-jwt-token-${matched.role.toLowerCase()}-${Date.now()}`,
      user: {
        name: matched.name,
        email: matched.email,
        role: matched.role,
        roleLabel: matched.roleLabel
      }
    };
  }

  // Cho phép đăng nhập linh hoạt với tài khoản tự do (mặc định role AuthorizedUser)
  return {
    success: true,
    token: `mock-jwt-token-custom-${Date.now()}`,
    user: {
      name: cleanId.includes('@') ? cleanId.split('@')[0] : cleanId,
      email: cleanId.includes('@') ? cleanId : `${cleanId}@veggieai.vn`,
      role: 'AuthorizedUser',
      roleLabel: 'Thành viên chính thức (User)'
    }
  };
}
