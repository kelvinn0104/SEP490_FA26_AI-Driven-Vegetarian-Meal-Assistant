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
    roleLabel: 'Moderator',
    email: 'mod@veggieai.vn',
    username: 'mod',
    password: '123',
    passwords: ['123', 'mod123', '123456'],
    name: 'Lê Tuệ Tâm',
    badgeColor: '#d97706',
    badgeBg: '#fef3c7',
    permissions: 'Quyền Mod: Bảng điều khiển kiểm duyệt, Duyệt bài viết Blog, Video, Công thức'
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

// TẤT CẢ TÀI KHOẢN HỆ THỐNG (BAO GỒM TÀI KHOẢN NHÂN SỰ & NGƯỜI DÙNG CƠ SỞ DỮ LIỆU)
export const ALL_SYSTEM_ACCOUNTS = [
  ...MOCK_ACCOUNTS,
  {
    role: 'AuthorizedUser',
    roleLabel: 'Thành viên chính thức',
    email: 'an.nguyen@gmail.com',
    username: 'an.nguyen',
    password: '123',
    passwords: ['123', '123456'],
    name: 'Nguyễn Văn An',
    trustScore: 98,
    status: 'active'
  },
  {
    role: 'Moderator',
    roleLabel: 'Moderator',
    email: 'bich.tran@gmail.com',
    username: 'bich.tran',
    password: '123',
    passwords: ['123', '123456'],
    name: 'Trần Thị Bích',
    trustScore: 100,
    status: 'active'
  },
  {
    role: 'Moderator',
    roleLabel: 'Moderator',
    email: 'duc.vu@modcommunity.vn',
    username: 'duc.vu',
    password: '123',
    passwords: ['123', '123456'],
    name: 'Vũ Minh Đức',
    trustScore: 100,
    status: 'active'
  },
  {
    role: 'AuthorizedUser',
    roleLabel: 'Thành viên chính thức',
    email: 'thao.pham@health.vn',
    username: 'thao.pham',
    password: '123',
    passwords: ['123', '123456'],
    name: 'Phạm Thu Thảo',
    trustScore: 95,
    status: 'active'
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

  // 1. Khớp với tài khoản hệ thống (Admin, Mod, User mẫu và thành viên mẫu)
  const matched = ALL_SYSTEM_ACCOUNTS.find(acc => 
    acc.email.toLowerCase() === cleanId || 
    acc.username.toLowerCase() === cleanId
  );

  if (matched) {
    if (!matched.passwords.includes(cleanPass)) {
      throw new Error(`Mật khẩu không chính xác cho tài khoản ${matched.email}. (Gợi ý mật khẩu mẫu: ${matched.password})`);
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

  // 2. Khớp với tài khoản người dùng đã tự đăng ký qua trang Đăng Ký (lưu trong localStorage)
  try {
    const registeredStr = localStorage.getItem('veggieai_registered_users');
    const registeredUsers = registeredStr ? JSON.parse(registeredStr) : [];
    const registeredMatch = registeredUsers.find(u => 
      (u.email && u.email.toLowerCase() === cleanId) || 
      (u.phone && u.phone.trim() === cleanId)
    );

    if (registeredMatch) {
      if (registeredMatch.password !== cleanPass) {
        throw new Error('Mật khẩu không chính xác. Vui lòng thử lại.');
      }
      return {
        success: true,
        token: `mock-jwt-token-registered-${Date.now()}`,
        user: {
          name: registeredMatch.name,
          email: registeredMatch.email,
          role: registeredMatch.role || 'AuthorizedUser',
          roleLabel: registeredMatch.roleLabel || 'Thành viên chính thức (User)'
        }
      };
    }
  } catch (err) {
    if (err.message && err.message.includes('Mật khẩu không chính xác')) {
      throw err;
    }
  }

  // 3. Nếu tài khoản không có thật trong danh sách và chưa từng đăng ký: TỪ CHỐI ĐĂNG NHẬP
  throw new Error('Tài khoản không tồn tại trên hệ thống. Vui lòng kiểm tra lại thông tin hoặc Đăng ký tài khoản mới.');
}
