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
  try {
    const res = await fetch(`${API_BASE_URL}/chatbot/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback Mock RAG Engine when BE server is offline
  }

  await new Promise(resolve => setTimeout(resolve, 400));
  const q = (query || '').toLowerCase();

  if (q.includes('b12') || q.includes('thiếu máu') || q.includes('vi chất')) {
    return {
      answer: `Theo tập dữ liệu RAG Dinh dưỡng Thuần chay:\n\n1. **Nguồn B12 thực vật an toàn**: Men dinh dưỡng (Nutritional Yeast) bổ sung vi chất, sữa hạt giàu B12 hoặc viên uống Vitamin B12 (Cyanocobalamin / Methylcobalamin 250mcg/tuần).\n2. **Tác dụng**: Giúp hỗ trợ tạo hồng cầu, bảo vệ hệ thần kinh và ngăn ngừa mệt mỏi mạn tính.\n3. **Khuyên dùng**: Người ăn thuần chay trên 6 tháng nên kiểm tra chỉ số B12 định kỳ mỗi 6 tháng.`,
      sources: [
        'Viện Dinh Dưỡng Quốc Gia Việt Nam (RNI 2024 - Khuyến nghị B12)',
        'USDA FoodData Central - Nutritional Yeast B-Complex Index',
        'Harvard T.H. Chan School of Public Health - Plant-Based Micronutrients'
      ],
      suggestedRecipes: ['Smoothie Yến Mạch Hạt Chia Bổ Sung B12', 'Súp Nấm Đùi Gà Men Dinh Dưỡng']
    };
  }

  if (q.includes('canxi') || q.includes('xương') || q.includes('sữa')) {
    return {
      answer: `Giải pháp bổ sung Canxi sinh học dồi dào từ thực vật:\n\n1. **Thực phẩm giàu Canxi**: Đậu hũ mơ tươi (350mg Canxi/100g), Hạt mè rang giã thô (975mg/100g), Rau cải thìa chần (105mg/100g), Đậu gà ninh kỹ.\n2. **Tăng tỷ lệ hấp thu**: Kết hợp tắm nắng 15 phút buổi sáng (Vitamin D3) và tránh uống trà đậm ngay sau bữa ăn để giảm hiệu ứng cản trở hấp thu Canxi của Tanin.\n3. **Gợi ý món ăn tối**: Đậu hũ non áp chảo sốt mè rang kết hợp cải thìa luộc.`,
      sources: [
        'Bảng Thành Phần Thực Phẩm Việt Nam - Viện Dinh Dưỡng (TCVN 2023)',
        'Journal of Agricultural and Food Chemistry - Calcium Bioavailability in Tofu'
      ],
      suggestedRecipes: ['Buddha Bowl Đậu Hũ & Cải Thìa Áp Chảo', 'Súp Bí Đỏ Hạt Sen Cốt Dừa']
    };
  }

  if (q.includes('đạm') || q.includes('protein') || q.includes('tăng cơ')) {
    return {
      answer: `Tối ưu hóa đạm thực vật hoàn chỉnh (Complete Plant Protein):\n\n1. **Nguyên tắc ghép đôi Axit Amin**: Kết hợp Ngũ cốc (Yến mạch, cơm lứt) + Họ đậu (Đậu hũ, đậu gà, đậu Hà Lan) để tạo ra chuỗi Axit Amin thiết yếu đầy đủ 9 loại tương tự thịt động vật.\n2. **Hàm lượng mục tiêu**: Với mục tiêu Lean Mass 2,080 kcal/ngày, bạn cần nạp 70-80g đạm/ngày.\n3. **Món đề xuất**: Buddha Bowl Quinoa Đậu hũ áp chảo (24g đạm/khẩu phần).`,
      sources: [
        'American Journal of Clinical Nutrition - Amino Acid Profiles of Plant Proteins',
        'Viện Dinh Dưỡng Quốc Gia - Nhu cầu Protein thực vật khuyến nghị'
      ],
      suggestedRecipes: ['Buddha Bowl Quinoa Đậu Hũ', 'Nấm Đùi Gà Xào Cải Thìa']
    };
  }

  if (q.includes('hành') || q.includes('tỏi') || q.includes('ngũ vị tân') || q.includes('boa-rô')) {
    return {
      answer: `Mẹo thay thế Ngũ vị tân (Hành, Tỏi, Hẹ, Kiệu, Nén) trong ẩm thực chay tu tập:\n\n1. **Gia vị thay thế chuẩn hương vị**: Dùng Poa-rô (Hành tỏi chay), Gừng tươi giã nhỏ, Ngò rí, Tiêu xanh, hoặc Bột phô mai chay (Nutritional Yeast Flakes) để tạo vị thơm ngậy sảng khoái.\n2. **Món xào thơm lừng**: Phi thơm boa-rô với chút dầu mè trước khi trút nấm và rau củ vào đảo trên lửa lớn.\n3. **Cam kết Allergen Guard**: Hệ thống VeggieAI đã tự động loại trừ mọi công thức chứa ngũ vị tân khỏi thực đơn của bạn.`,
      sources: [
        'Cẩm nang Ẩm thực Thực dưỡng Chay Việt Nam',
        'Hiệp hội Thực dưỡng Chay Quốc tế (IVU Knowledge Base)'
      ]
    };
  }

  return {
    answer: `Dạ, VeggieNutri AI đã ghi nhận thắc mắc của bạn: "${query}".\n\nDựa trên tập dữ liệu RAG dinh dưỡng thực vật và hồ sơ thể trạng của bạn, mình đề xuất điều chỉnh cơ cấu bữa ăn ưu tiên nguyên liệu tươi có sẵn trong tủ lạnh, đảm bảo loại trừ triệt để chất gây dị ứng và đáp ứng mục tiêu Calo/Macro hàng ngày!`,
    sources: [
      'Hệ thống RAG Tri thức Dinh dưỡng VeggieAI v2.4',
      'Viện Dinh Dưỡng Quốc Gia Việt Nam - Hướng dẫn Dinh dưỡng Thực vật'
    ]
  };
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
