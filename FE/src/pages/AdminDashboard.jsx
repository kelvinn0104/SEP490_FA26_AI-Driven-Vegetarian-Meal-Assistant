import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, ShieldAlert, Utensils, Users, Layers, 
  MessageSquare, LogOut, Search, Bell, Download, Sliders, Sparkles, 
  Zap, Clock, Flag, TrendingUp, CheckCircle2, AlertTriangle, 
  XCircle, Eye, RefreshCw, FileText, Plus, Database, Activity, 
  Check, ArrowRight, ExternalLink, ShieldCheck, ChevronRight, X, 
  Trash2, Edit3, Lock, Unlock, ArrowLeft, Video, Shield, UserCheck,
  Play, Tag, RotateCcw, Star, Share2, ListOrdered, List, Quote, PieChart,
  EyeOff, Ban, MoreVertical, CornerDownRight, ChevronDown, ChevronUp,
  SlidersHorizontal, ArrowUpDown, Server, Camera, Calendar, Terminal, Send, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  
  // ĐIỀU HÀNH TỔNG QUAN & 8 MÀN HÌNH CHUẨN CỦA ADMIN THEO QUY ĐỊNH:
  // 'overview' - Tổng quan Dashboard
  // 1: 'users' - Quản lý người dùng
  // 2: 'content' - Quản lý blog & video
  // 3: 'content-detail' - Quản lý bài viết/video
  // 4: 'comments' - Quản lý bình luận
  // 5: 'categories' - Quản lý danh mục món ăn
  // 6: 'ai-monitoring' - Giám sát mô hình AI (AI Monitoring)
  // 7: 'ai-override' - Can thiệp thủ công AI
  // 8: 'ai-flagged' - Nội dung bị AI gắn cờ (Flagged Content Review)
  const [activeMenu, setActiveMenu] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 1: QUẢN LÝ NGƯỜI DÙNG (USERS)
  // ĐÚNG CHUẨN 4 ACTORS: Authorized User / Unauthorized User / Mod / Admin
  // TÍCH HỢP ĐIỂM UY TÍN (TRUST SCORE) ĐỂ ĐỊNH TUYẾN KIỂM DUYỆT BÌNH LUẬN
  // =========================================================================
  const [usersList, setUsersList] = useState([
    { 
      id: 'USR-001', 
      name: 'Nguyễn Văn An', 
      email: 'an.nguyen@gmail.com', 
      role: 'Authorized User', 
      trustScore: 98,
      trustLevel: 'Rất cao (98/100)',
      trustTier: 'Đăng trực tiếp',
      diet: 'Thuần chay (Vegan)', 
      status: 'active', 
      joined: '12/08/2026', 
      aiMealPlans: 84,
      aiVisionScans: 32,
      aiChatbotQueries: 140,
      bmi: 22.1,
      height: '170 cm',
      weight: '64 kg',
      targetCalories: '2,150 kcal/ngày',
      allergies: 'Không dung nạp đậu phộng',
      keyNutrients: 'Vitamin B12 (2.4 mcg), Sắt thực vật (18mg), Kẽm (11mg)',
      recentActivities: [
        'Hôm nay 18:20 - Tạo thực đơn thuần chay 7 ngày tối ưu vi chất B12',
        'Hôm qua 12:15 - Quét ảnh tủ lạnh nhận diện: Đậu hũ, nấm hương, cà rốt',
        '09/09 - Hỏi AI Chatbot: Nguồn protein thực vật tăng cơ lành mạnh'
      ]
    },
    { 
      id: 'USR-002', 
      name: 'Trần Thị Bích', 
      email: 'bich.tran@gmail.com', 
      role: 'Mod', 
      trustScore: 100,
      trustLevel: 'Tuyệt đối (100/100)',
      trustTier: 'Đặc quyền Mod',
      diet: 'Ăn chay linh hoạt (Flexi)', 
      status: 'active', 
      joined: '05/06/2026', 
      aiMealPlans: 24,
      aiVisionScans: 15,
      aiChatbotQueries: 45,
      bmi: 20.8,
      height: '162 cm',
      weight: '54 kg',
      targetCalories: '1,850 kcal/ngày',
      allergies: 'Không có dị ứng',
      keyNutrients: 'Canxi (1,000mg), Sắt (15mg)',
      recentActivities: [
        'Hôm nay 17:45 - Phê duyệt 3 công thức nấu ăn cộng đồng (Tier 1)',
        '10/09 - Tạo thực đơn chay thanh lọc cơ thể 3 ngày'
      ]
    },
    { 
      id: 'USR-003', 
      name: 'Lê Hoàng Long', 
      email: 'long.le@spamdiet.com', 
      role: 'Unauthorized User', 
      trustScore: 32,
      trustLevel: 'Rủi ro cao (32/100)',
      trustTier: 'Tiền kiểm duyệt',
      diet: 'Chưa khảo sát dinh dưỡng', 
      status: 'warning', 
      joined: '01/09/2026', 
      aiMealPlans: 1,
      aiVisionScans: 0,
      aiChatbotQueries: 2,
      bmi: '--',
      height: '--',
      weight: '--',
      targetCalories: 'Chưa thiết lập (WF01 pending)',
      allergies: 'Chưa cập nhật',
      keyNutrients: 'Chưa thiết lập',
      recentActivities: [
        '01/09 - Đăng ký tài khoản, gửi 3 bình luận bị NLP cảnh báo spam'
      ]
    },
    { 
      id: 'USR-004', 
      name: 'Phạm Thu Thảo', 
      email: 'thao.pham@health.vn', 
      role: 'Authorized User', 
      trustScore: 95,
      trustLevel: 'Tiêu chuẩn (95/100)',
      trustTier: 'Đăng trực tiếp',
      diet: 'Thuần chay (Lacto-ovo)', 
      status: 'active', 
      joined: '20/07/2026', 
      aiMealPlans: 65,
      aiVisionScans: 40,
      aiChatbotQueries: 110,
      bmi: 21.5,
      height: '165 cm',
      weight: '58 kg',
      targetCalories: '1,950 kcal/ngày',
      allergies: 'Dị ứng phấn hoa, kiêng đậu nành biến đổi gen',
      keyNutrients: 'Vitamin D3, B12, Magie',
      recentActivities: [
        '11/09 - Quét nguyên liệu làm sữa hạt sen hạnh nhân',
        '08/09 - Lưu công thức đậu hũ sốt cà chua nấm đông cô'
      ]
    },
    { 
      id: 'USR-005', 
      name: 'Vũ Minh Đức', 
      email: 'duc.vu@modcommunity.vn', 
      role: 'Mod', 
      trustScore: 100,
      trustLevel: 'Tuyệt đối (100/100)',
      trustTier: 'Đặc quyền Mod',
      diet: 'Thuần chay (Vegan)', 
      status: 'active', 
      joined: '15/05/2026', 
      aiMealPlans: 38,
      aiVisionScans: 18,
      aiChatbotQueries: 55,
      bmi: 23.0,
      height: '175 cm',
      weight: '70 kg',
      targetCalories: '2,300 kcal/ngày',
      allergies: 'Không',
      keyNutrients: 'Protein thực vật cao, Sắt hữu cơ',
      recentActivities: [
        'Hôm nay 15:30 - Chuyển tiếp 1 bài vi phạm y tế lên Admin Tier 2',
        '12/09 - Tạo thực đơn tăng cơ thuần chay 7 ngày'
      ]
    },
    { 
      id: 'USR-006', 
      name: 'Đặng Quốc Huy', 
      email: 'huy.dang@fakead.net', 
      role: 'Unauthorized User', 
      trustScore: 15,
      trustLevel: 'Nghi vấn cao (15/100)',
      trustTier: 'Bị khóa',
      diet: 'Chưa cập nhật', 
      status: 'locked', 
      joined: '02/09/2026', 
      aiMealPlans: 0,
      aiVisionScans: 1,
      aiChatbotQueries: 1,
      bmi: '--',
      height: '--',
      weight: '--',
      targetCalories: 'Chưa thiết lập',
      allergies: 'Không',
      keyNutrients: 'Không',
      recentActivities: [
        '02/09 - Tài khoản bị khóa do cố tình đăng tải liên kết lừa đảo'
      ]
    },
    { 
      id: 'USR-007', 
      name: 'Admin', 
      email: 'admin@veggieai.vn', 
      role: 'Admin', 
      trustScore: 100,
      trustLevel: 'Quản trị (100/100)',
      trustTier: 'Toàn quyền',
      diet: 'Thuần chay (Vegan)', 
      status: 'active', 
      joined: '01/01/2026', 
      aiMealPlans: 250,
      aiVisionScans: 180,
      aiChatbotQueries: 420,
      bmi: 22.0,
      height: '172 cm',
      weight: '65 kg',
      targetCalories: '2,200 kcal/ngày',
      allergies: 'Không',
      keyNutrients: 'Đầy đủ theo chuẩn Viện Dinh Dưỡng Quốc Gia',
      recentActivities: [
        'Hôm nay 18:10 - Can thiệp ghi đè kết quả mô hình AI Meal Planner (PuLP Solver)',
        'Hôm nay 16:20 - Rà soát 4 nội dung bị AI gắn cờ vi phạm'
      ]
    }
  ]);

  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [userDietFilter, setUserDietFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // THAO TÁC HÀNG LOẠT (BULK ACTIONS)
  const handleSelectAllUsers = (e) => {
    if (e.target.checked) {
      setSelectedUserIds(usersList.map(u => u.id));
    } else {
      setSelectedUserIds([]);
    }
  };

  const handleSelectOneUser = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkLock = () => {
    if (selectedUserIds.length === 0) return;
    setUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'locked' } : u));
    showToast(`🔒 Đã khóa thành công ${selectedUserIds.length} tài khoản người dùng!`);
    setSelectedUserIds([]);
  };

  const handleBulkUnlock = () => {
    if (selectedUserIds.length === 0) return;
    setUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'active' } : u));
    showToast(`🔓 Đã mở khóa thành công ${selectedUserIds.length} tài khoản người dùng!`);
    setSelectedUserIds([]);
  };

  const handleBulkWarning = () => {
    if (selectedUserIds.length === 0) return;
    setUsersList(prev => prev.map(u => selectedUserIds.includes(u.id) ? { ...u, status: 'warning' } : u));
    showToast(`⚠️ Đã gửi cảnh báo tuân thủ tiêu chuẩn cộng đồng đến ${selectedUserIds.length} tài khoản!`);
    setSelectedUserIds([]);
  };

  // THAO TÁC TỪNG USER
  const handleToggleUserLock = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'locked' ? 'active' : 'locked';
        showToast(nextStatus === 'locked' ? `🔒 Đã khóa tài khoản ${u.name} do vi phạm tiêu chuẩn!` : `🔓 Đã mở khóa tài khoản ${u.name}!`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    if (selectedUserDetail && selectedUserDetail.id === userId) {
      setSelectedUserDetail(prev => ({ ...prev, status: prev.status === 'locked' ? 'active' : 'locked' }));
    }
  };

  const handleSendWarning = (userName) => {
    showToast(`⚠️ Đã gửi thông báo cảnh báo vi phạm tiêu chuẩn đến người dùng: ${userName}`);
  };

  const handleResetPassword = (userName) => {
    showToast(`🔑 Đã tạo liên kết đặt lại mật khẩu an toàn gửi về email của ${userName}`);
  };

  const handleExportUsersCSV = () => {
    const headers = 'Mã người dùng,Họ và tên,Email,Vai trò,Chế độ ăn chay,Trạng thái,Ngày tham gia,Số lần tạo thực đơn AI,Số lần quét tủ lạnh AI,Số lượt hỏi Chatbot AI\n';
    const rows = usersList.map(u => 
      `"${u.id}","${u.name}","${u.email}","${u.role}","${u.diet}","${u.status === 'active' ? 'Đang hoạt động' : u.status === 'warning' ? 'Tạm khóa & Cảnh báo' : 'Đã khóa'}","${u.joined}","${u.aiMealPlans}","${u.aiVisionScans}","${u.aiChatbotQueries}"`
    );
    const blob = new Blob(['\uFEFF' + headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `danh_sach_nguoi_dung_veggieai_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất thành công file CSV danh sách người dùng chuẩn nghiệp vụ!');
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 2 & 3: QUẢN LÝ BLOG & VIDEO NẤU ĂN + CHI TIẾT
  // TUÂN THỦ 100% PHẠM VI 4 ACTORS & WF07 / WF09 / WF11:
  // - Tác giả người dùng hiển thị vai trò chính thức: Authorized User
  // - Badge xác thực đơn giản: "Đã xác minh" (bỏ chức danh nghề nghiệp / đối tác KOL)
  // - Quy trình kiểm duyệt đưa về Mod duyệt Public (WF07), bỏ "kiểm định y khoa" ngoài phạm vi
  // - Lý do gắn cờ chuẩn WF09: "Nghi vấn sai lệch dinh dưỡng" (bỏ bản quyền)
  // =========================================================================
  const [contentList, setContentList] = useState([
    { 
      id: 'VID-8921', 
      title: 'Cà Ri Rau Củ Nước Cốt Dừa & Nấm Hương', 
      type: 'Video',
      typeLabel: 'Thuần Chay Chuẩn',
      category: 'Món chính | Món Nước & Sốt',
      date: 'Hôm nay 10:18',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000',
      duration: '04:25',
      readTime: null,
      tags: ['#CaRiChay', '#GiauChatXo', '#DinhDuongKhoaHoc', '#MonChayHangNgay'],
      warningTag: null,
      author: 'Bếp Chay An Lạc',
      authorSubs: '485K SUB',
      authorAvatar: 'AN',
      authorAvatarBg: '#f97316',
      authorRole: 'Authorized User',
      authorVerified: true,
      source: 'YouTube',
      channelEpisode: 'Bếp Chay An Lạc - Ep. 142',
      aiMatch: '98.4% AI Match',
      aiConfidence: '98.4% Confidence',
      aiModel: 'Whisper v3 + YOLO-Recipe',
      aiTime: '4.2s',
      aiDetails: '7 nguyên liệu bóc tách • 4 bước nấu chuẩn hóa',
      macro: '410 kcal • 14g Protein • 52g Carbs • 16g Fat',
      calories: 410,
      caloriesRni: '22.5% nhu cầu hàng ngày (RNI 1,800 kcal)',
      macroBreakdown: {
        carbs: { g: 52, pct: 55, color: '#10b981' },
        fat: { g: 16, pct: 27, color: '#f59e0b' },
        protein: { g: 14, pct: 18, color: '#06b6d4' },
        fiber: { g: 8.5, pct: 34 }
      },
      micronutrients: [
        { name: 'Vitamin A (Beta-carotene)', value: '180% RNI (Cà rốt & Khoai lang)' },
        { name: 'Sắt hữu cơ (Non-heme Iron)', value: '4.2mg (35% RNI)' },
        { name: 'Canxi tự nhiên từ đậu hũ & nấm', value: '120mg (12% RNI)' }
      ],
      aiStatus: 'extracted',
      views: '28.5K',
      saved: '1,420',
      rating: '4.9 ★',
      isFlagged: false,
      status: 'Đã xuất bản',
      verifiedMod: true,
      mediaUrl: 'https://youtube.com/watch?v=veggie-curry-coconut',
      summary: 'Món cà ri thuần chay thanh nhẹ, kết hợp khoai lang dồi dào chất xơ, nấm đông cô nâng cao hệ miễn dịch tự nhiên, béo thơm nước cốt dừa với hương cà ri ấm nồng sả nghệ hỗ trợ giảm viêm tiêu hóa.',
      content: 'Món Cà Ri Rau Củ Nước Cốt Dừa béo ngậy tự nhiên, kết hợp khoai lang mật, cà rốt và đậu hũ chiên. Công thức đã được AI bóc tách chi tiết từng bước nấu và cân bằng lượng calo.',
      editorContent: `💡 Mẹo Nấu Ăn & Bảo Quản Chuẩn Y Khoa:\n\n1. Giữ trọn vi chất: Không hầm kỹ khoai lang và cà rốt quá 20 phút ở nhiệt độ trên 100°C để bảo toàn tối đa lượng Vitamin A (Beta-carotene) hòa tan trong chất béo dừa tự nhiên.\n\n2. Bảo quản tủ lạnh: Để nguội hoàn toàn, chia vào hộp thủy tinh kín khí có thể trữ mát trong 48 giờ. Khi hâm nóng lại, thêm 2 thìa canh nước ấm và đảo lửa nhỏ.`,
      ingredientsDetailed: [
        { id: 1, name: 'Khoai lang mật', amount: '200g', tag: 'Rau củ giàu Beta-Carotene', status: 'Đã khớp CSDL' },
        { id: 2, name: 'Cà rốt Đà Lạt', amount: '150g', tag: 'Củ giàu Vitamin A', status: 'Đã khớp CSDL' },
        { id: 3, name: 'Nấm đông cô ngâm nở', amount: '100g', tag: 'Đạm thực vật & Kẽm', status: 'Đã khớp CSDL' },
        { id: 4, name: 'Nước cốt dừa tươi', amount: '250ml', tag: 'Chất béo thực vật MCT', status: 'Đã khớp CSDL' },
        { id: 5, name: 'Đậu hũ non chiên', amount: '150g', tag: 'Đạm Isoflavone', status: 'Đã khớp CSDL' },
        { id: 6, name: 'Bột cà ri hữu cơ', amount: '15g', tag: 'Gia vị thảo mộc kháng viêm', status: 'Đã khớp CSDL' },
        { id: 7, name: 'Sả cây băm nhuyễn', amount: '3 cây (30g)', tag: 'Hương liệu thảo dược', status: 'Đã khớp CSDL' }
      ],
      cookingSteps: [
        { step: 1, time: '00:15 - 01:10', title: 'Sơ chế rau củ & nấm đông cô', desc: 'Ngâm nấm đông cô với nước ấm 15 phút. Gọt vỏ khoai lang và cà rốt, cắt khúc vuông 3x3cm vừa miệng ăn.' },
        { step: 2, time: '01:11 - 02:25', title: 'Phi thơm thảo mộc & bột cà ri', desc: 'Đun nóng 1 muỗng dầu dừa trên chảo sâu lòng, phi thơm sả băm nhuyễn và cho bột cà ri hữu cơ vào xào nhanh 30 giây dậy mùi.' },
        { step: 3, time: '02:26 - 03:40', title: 'Nấu rau củ & hòa quyện nước cốt dừa', desc: 'Cho khoai, cà rốt và nấm vào đảo đều thấm gia vị. Rót 300ml nước dùng rau củ hầm sôi 10 phút, sau đó hạ nhỏ lửa và cho 250ml nước cốt dừa tươi vào khuấy đều.' },
        { step: 4, time: '03:41 - 04:25', title: 'Hoàn thiện với đậu hũ non chiên vàng', desc: 'Cho đậu hũ non đã chiên vàng vào nồi, đảo nhẹ tay tránh nát đậu. Đun liu riu thêm 3 phút, nêm muối hồng và hạt nêm nấm hữu cơ rồi tắt bếp.' }
      ],
      transcript: [
        { time: '00:15', speaker: 'Bếp Chay An Lạc', text: 'Chào các bạn, hôm nay Bếp Chay An Lạc sẽ hướng dẫn món cà ri rau củ nước cốt dừa thơm béo chuẩn vị tự nhiên...' },
        { time: '01:05', speaker: 'Bếp Chay An Lạc', text: 'Phần nấm đông cô sau khi ngâm nở chúng ta vắt ráo, khoai lang và cà rốt cắt miếng vừa ăn để giữ được độ ngọt...' },
        { time: '02:40', speaker: 'Bếp Chay An Lạc', text: 'Đoạn sôi múi cà và thêm nước cốt dừa: Hãy giảm nhỏ lửa để nước dừa hòa quyện mịn màng, không bị kết tủa...' },
        { time: '03:50', speaker: 'Bếp Chay An Lạc', text: 'Món ăn hoàn thành với màu sắc vàng ươm hấp dẫn, giàu beta-carotene và đạm thực vật lành mạnh cho cả gia đình.' }
      ],
      expertReview: {
        expertName: 'BS. CKI Nguyễn Lan Hương',
        expertRole: 'Viện Dinh Dưỡng Lâm Sàng TP. HCM',
        avatar: 'LH',
        quote: 'Công thức sở hữu tỷ lệ cân đối đạm thực vật chất lượng cao từ nấm đông cô và đậu hũ non. Hàm lượng chất béo từ nước cốt dừa đã được kiểm soát trong ngưỡng an toàn, phù hợp cho người ăn thuần chay trường kỳ và người huyết áp ổn định.',
        certId: '#NUTRI-VER-984'
      },
      dietaryChecklist: [
        { id: 'cholesterol', label: 'Thích hợp cho người kiểm soát Cholesterol', checked: true },
        { id: 'fiber', label: 'Giàu chất xơ hòa tan hỗ trợ tiêu hóa', checked: true },
        { id: 'glutenFree', label: 'Không chứa Gluten (Gluten-Free 100%)', checked: true },
        { id: 'lowSodium', label: 'Thực đơn hạn chế muối/nghiêm ngặt (Low Sodium)', checked: false }
      ],
      auditLogs: [
        { time: '14:05 Hôm nay', author: 'Admin_Master', text: 'Điều chỉnh định lượng nước cốt dừa từ 300ml xuống 250ml.' },
        { time: '11:30 Hôm nay', author: 'BS. Lan Hương', text: 'Phê duyệt chỉ số dinh dưỡng lâm sàng và ký số bảo trợ.' },
        { time: '10:18 Hôm nay', author: 'VeggieAI Engine', text: 'Whisper STT và YOLOv8 hoàn tất bóc tách 7 nguyên liệu & 4 bước nấu.' }
      ]
    },
    { 
      id: 'POST-4109', 
      title: 'Phân tích khoa học: Tối ưu B12 cho người ăn thuần chay', 
      type: 'Blog',
      typeLabel: 'Cẩm nang Y khoa',
      category: 'Cẩm nang Y khoa',
      date: 'Hôm qua 15:30',
      thumbnail: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400',
      duration: null,
      readTime: '6 phút đọc',
      tags: ['B12 Tự Nhiên', 'Kiến thức Dinh Dưỡng'],
      warningTag: null,
      author: 'BS. CKI Lan Hương',
      authorAvatar: 'LH',
      authorAvatarBg: '#10b981',
      authorRole: 'Authorized User',
      authorVerified: true,
      source: 'VeggieAI Editorial',
      aiMatch: '99.2% AI Match',
      aiDetails: 'Trích xuất 6 nguồn vi chất',
      macro: 'RDA đối chiếu: 2.4 mcg/ngày',
      aiStatus: 'extracted',
      views: '42.1k lượt xem',
      saved: '3,890 lưu cẩm nang',
      rating: '5.0 (892)',
      isFlagged: false,
      status: 'Đã xuất bản',
      verifiedMod: true,
      mediaUrl: '',
      content: 'Vitamin B12 đóng vai trò then chốt trong việc tạo hồng cầu và duy trì hệ thần kinh. Người ăn thuần chay nên bổ sung nấm men dinh dưỡng men bia (Nutritional Yeast), sữa thực vật bổ sung vi chất hoặc viên uống định kỳ theo chỉ dẫn của chuyên gia dinh dưỡng.',
      ingredients: ['Men dinh dưỡng: 5g/ngày', 'Tảo biển chlorella: 3g', 'Sữa hạt bổ sung vi chất: 250ml']
    },
    { 
      id: 'VID-3301', 
      title: 'Ram Chay Giòn Rụm Bằng Nồi Chiên Không Dầu', 
      type: 'Video',
      typeLabel: 'Món Ăn Vặt & Chiên',
      category: 'Món Ăn Vặt & Chiên',
      date: '2 ngày trước',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      duration: '01:15',
      readTime: null,
      tags: ['Ít Dầu Mỡ', 'Nhanh & Tiện'],
      warningTag: null,
      author: 'Vũ Bảo Nam',
      authorAvatar: 'BN',
      authorAvatarBg: '#1e293b',
      authorRole: 'Authorized User',
      authorVerified: false,
      source: 'TikTok',
      aiMatch: '96.2% AI Match',
      aiDetails: '7 nguyên liệu • 3 bước',
      macro: '280 kcal/phần • 9g Protein',
      aiStatus: 'extracted',
      views: '19.2k lượt xem',
      saved: '2,110 lưu món',
      rating: '4.8 (145)',
      isFlagged: false,
      status: 'Đã xuất bản',
      verifiedMod: true,
      mediaUrl: 'https://tiktok.com/@vubaonam/video/mock-ram-chay',
      content: 'Chả ram chay làm từ mộc nhĩ, cà rốt, miến dong cuốn bánh tráng đậu xanh chiên nhiệt độ 180 độ C trong 12 phút. Giảm 80% dầu mỡ so với chiên ngập dầu truyền thống.',
      ingredients: ['Bánh tráng đậu xanh: 1 gói', 'Mộc nhĩ ngâm nở: 50g', 'Cà rốt bào sợi: 1 củ', 'Miến dong: 50g']
    },
    { 
      id: 'POST-7890', 
      title: 'Thực đơn 7 ngày tăng cơ thuần chay cho người tập Gym', 
      type: 'Blog',
      typeLabel: 'Dinh Dưỡng Thể Thao',
      category: 'Dinh Dưỡng Thể Thao',
      date: '3 ngày trước',
      thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
      duration: null,
      readTime: '2 phút đọc',
      tags: ['80g+ Protein/Ngày', 'Meal Prep'],
      warningTag: null,
      author: 'Lê Thị Mai Lan',
      authorAvatar: 'ML',
      authorAvatarBg: '#3b82f6',
      authorRole: 'Authorized User',
      authorVerified: true,
      source: 'Ban Biên Tập',
      aiMatch: '21 Thực Đơn Bóc Tách',
      aiDetails: 'Tự tính Macro theo TDEE',
      macro: 'Tỷ lệ P:C:F cân bằng 30:45:25',
      aiStatus: 'extracted',
      views: '51.4k lượt xem',
      saved: '6,320 người áp dụng',
      rating: '4.9 (1.2k)',
      isFlagged: false,
      status: 'Đã xuất bản',
      verifiedMod: true,
      mediaUrl: '',
      content: 'Kế hoạch 7 ngày meal prep thuần chay cung cấp trên 80g protein mỗi ngày từ các nguồn thực vật chất lượng cao: đậu gà, hạt diêm mạch, đậu phụ nướng và bột protein thực vật cô đặc.',
      ingredients: ['Bột protein hạt gai dầu: 30g', 'Yến mạch: 80g', 'Hạt chia: 15g', 'Bơ đậu phộng: 20g']
    },
    { 
      id: 'VID-5620', 
      title: 'Lẩu Nấm Dưỡng Sinh Thanh Lọc Cơ Thể Cuối Tuần', 
      type: 'Video',
      typeLabel: 'Chay Thực Dưỡng',
      category: 'Chay Thực Dưỡng',
      date: '4 ngày trước',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
      duration: '08:20',
      readTime: null,
      tags: ['Thanh Lọc Cơ Thể', 'Nấm Dược Liệu'],
      warningTag: null,
      author: 'Ẩm Thực An Duyên',
      authorAvatar: 'AD',
      authorAvatarBg: '#0d9488',
      authorRole: 'Authorized User',
      authorVerified: true,
      source: 'YouTube',
      aiMatch: '99.1% AI Match',
      aiDetails: '14 nguyên liệu thảo mộc',
      macro: '195 kcal/bát • Đạt chuẩn Dưỡng Sinh',
      aiStatus: 'extracted',
      views: '14.8k lượt xem',
      saved: '980 lưu thực đơn',
      rating: '4.7 (95)',
      isFlagged: false,
      status: 'Đã xuất bản',
      verifiedMod: true,
      mediaUrl: 'https://youtube.com/watch?v=mock-lau-nam',
      content: 'Nước dùng lẩu hầm từ kỷ tử, táo đỏ, đẳng sâm và mía lau thanh mát. Đi kèm hơn 6 loại nấm tươi giàu polysaccharide giúp tăng cường hệ miễn dịch.',
      ingredients: ['Nấm hầu thủ: 150g', 'Nấm đùi gà: 150g', 'Kỷ tử & táo đỏ: 50g', 'Mía lau: 2 khúc']
    },
    { 
      id: 'VID-1108', 
      title: 'Bí quyết Nấu Nước Dùng Bún Bò Chay Đậm Đà Chuẩn Huế', 
      type: 'Video',
      typeLabel: 'Món Nước Truyền Thống',
      category: 'Món Nước Truyền Thống',
      date: '1 tuần trước',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      duration: '10:40',
      readTime: null,
      tags: ['Không Phụ Gia'],
      warningTag: 'Nghi vấn sai lệch dinh dưỡng',
      author: 'Ẩm Thực Chay Hương Việt',
      authorAvatar: 'HV',
      authorAvatarBg: '#ea580c',
      authorRole: 'Authorized User',
      authorVerified: false,
      source: 'YouTube',
      aiMatch: '82.4% Cần kiểm chứng',
      aiDetails: '9 nguyên liệu phát hiện',
      macro: 'Nghi vấn định lượng sai lệch gia vị',
      aiStatus: 'warning',
      views: '9.1k lượt xem',
      saved: '340 lưu thực đơn',
      rating: '4.2 (41)',
      isFlagged: true,
      status: 'Cần rà soát',
      verifiedMod: false,
      mediaUrl: 'https://youtube.com/watch?v=mock-bun-bo-hue-chay',
      content: 'Nước dùng bún bò chay ngọt thanh tự nhiên từ bắp cải, củ cải trắng và sả đập dập. Lưu ý kiểm tra lại tỷ lệ mắm ruốc chay và ớt sa tế để tránh sai lệch gia vị.',
      ingredients: ['Sả cây: 5 nhánh', 'Dứa chín: 1/2 quả', 'Chao trắng/đỏ: 2 viên', 'Nấm bào ngư: 200g']
    }
  ]);

  // Bộ lọc Màn hình 2
  const [contentTab, setContentTab] = useState('all');
  const [contentSearch, setContentSearch] = useState('');
  const [contentCategoryFilter, setContentCategoryFilter] = useState('all');
  const [contentSourceFilter, setContentSourceFilter] = useState('all');
  const [contentAiStatusFilter, setContentAiStatusFilter] = useState('all');
  const [contentVerifyFilter, setContentVerifyFilter] = useState('all');
  const [selectedContentIds, setSelectedContentIds] = useState(['VID-8921', 'POST-7890']);
  
  // Modal Đồng bộ YouTube / TikTok
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncUrl, setSyncUrl] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);

  // Chi tiết bài viết đang xem/chỉnh sửa (Màn hình 3)
  const [currentEditingContent, setCurrentEditingContent] = useState(contentList[0]);
  const [detailActiveTab, setDetailActiveTab] = useState('ingredients');
  const [detailLiveStreamSync, setDetailLiveStreamSync] = useState(false);
  const [detailRecommender, setDetailRecommender] = useState(true);
  const [detailCategory, setDetailCategory] = useState('Món chính | Món Nước & Sốt');
  const [detailDifficulty, setDetailDifficulty] = useState('Dễ (Dưới 20 phút)');
  const [detailPlayingVideo, setDetailPlayingVideo] = useState(false);
  const [detailNewTag, setDetailNewTag] = useState('');
  const [showAddTagInput, setShowAddTagInput] = useState(false);
  const [showUserPreviewModal, setShowUserPreviewModal] = useState(false);
  const [detailIngredients, setDetailIngredients] = useState(contentList[0]?.ingredientsDetailed || [
    { id: 1, name: 'Khoai lang mật', amount: '200g', tag: 'Rau củ giàu Beta-Carotene', status: 'Đã khớp CSDL' },
    { id: 2, name: 'Cà rốt Đà Lạt', amount: '150g', tag: 'Củ giàu Vitamin A', status: 'Đã khớp CSDL' },
    { id: 3, name: 'Nấm đông cô ngâm nở', amount: '100g', tag: 'Đạm thực vật & Kẽm', status: 'Đã khớp CSDL' },
    { id: 4, name: 'Nước cốt dừa tươi', amount: '250ml', tag: 'Chất béo thực vật MCT', status: 'Đã khớp CSDL' },
    { id: 5, name: 'Đậu hũ non chiên', amount: '150g', tag: 'Đạm Isoflavone', status: 'Đã khớp CSDL' },
    { id: 6, name: 'Bột cà ri hữu cơ', amount: '15g', tag: 'Gia vị thảo mộc kháng viêm', status: 'Đã khớp CSDL' },
    { id: 7, name: 'Sả cây băm nhuyễn', amount: '3 cây (30g)', tag: 'Hương liệu thảo dược', status: 'Đã khớp CSDL' }
  ]);
  const [detailDietary, setDetailDietary] = useState(contentList[0]?.dietaryChecklist || [
    { id: 'cholesterol', label: 'Thích hợp cho người kiểm soát Cholesterol', checked: true },
    { id: 'fiber', label: 'Giàu chất xơ hòa tan hỗ trợ tiêu hóa', checked: true },
    { id: 'glutenFree', label: 'Không chứa Gluten (Gluten-Free 100%)', checked: true },
    { id: 'lowSodium', label: 'Thực đơn hạn chế muối/nghiêm ngặt (Low Sodium)', checked: false }
  ]);
  const [detailTags, setDetailTags] = useState(contentList[0]?.tags || ['#CaRiChay', '#GiauChatXo', '#DinhDuongKhoaHoc', '#MonChayHangNgay']);
  const [detailBlogContent, setDetailBlogContent] = useState(
    contentList[0]?.editorContent || `💡 Mẹo Nấu Ăn & Bảo Quản Chuẩn Dinh Dưỡng Khoa Học:\n\n1. Giữ trọn vi chất: Không hầm kỹ khoai lang và cà rốt quá 20 phút ở nhiệt độ trên 100°C để bảo toàn tối đa lượng Vitamin A (Beta-carotene) hòa tan trong chất béo dừa tự nhiên.\n\n2. Bảo quản tủ lạnh: Để nguội hoàn toàn, chia vào hộp thủy tinh kín khí có thể trữ mát trong 48 giờ. Khi hâm nóng lại, thêm 2 thìa canh nước ấm và đảo lửa nhỏ.`
  );
  const [detailSummary, setDetailSummary] = useState(
    contentList[0]?.summary || 'Món cà ri thuần chay thanh nhẹ, kết hợp khoai lang dồi dào chất xơ, nấm đông cô nâng cao hệ miễn dịch tự nhiên, béo thơm nước cốt dừa với hương cà ri ấm nồng sả nghệ hỗ trợ giảm viêm tiêu hóa.'
  );
  const [detailSteps, setDetailSteps] = useState(contentList[0]?.cookingSteps || [
    { step: 1, time: '00:15 - 01:10', title: 'Sơ chế rau củ & nấm đông cô', desc: 'Ngâm nấm đông cô với nước ấm 15 phút. Gọt vỏ khoai lang và cà rốt, cắt khúc vuông 3x3cm vừa miệng ăn.' },
    { step: 2, time: '01:11 - 02:25', title: 'Phi thơm thảo mộc & bột cà ri', desc: 'Đun nóng 1 muỗng dầu dừa trên chảo sâu lòng, phi thơm sả băm nhuyễn và cho bột cà ri hữu cơ vào xào nhanh 30 giây dậy mùi.' },
    { step: 3, time: '02:26 - 03:40', title: 'Nấu rau củ & hòa quyện nước cốt dừa', desc: 'Cho khoai, cà rốt và nấm vào đảo đều thấm gia vị. Rót 300ml nước dùng rau củ hầm sôi 10 phút, sau đó hạ nhỏ lửa và cho 250ml nước cốt dừa tươi vào khuấy đều.' },
    { step: 4, time: '03:41 - 04:25', title: 'Hoàn thiện với đậu hũ non chiên vàng', desc: 'Cho đậu hũ non đã chiên vàng vào nồi, đảo nhẹ tay tránh nát đậu. Đun liu riu thêm 3 phút, nêm muối hồng và hạt nêm nấm hữu cơ rồi tắt bếp.' }
  ]);
  const [detailTranscript, setDetailTranscript] = useState(contentList[0]?.transcript || [
    { time: '00:15', speaker: 'Bếp Chay An Lạc', text: 'Chào các bạn, hôm nay Bếp Chay An Lạc sẽ hướng dẫn món cà ri rau củ nước cốt dừa thơm béo chuẩn vị tự nhiên...' },
    { time: '01:05', speaker: 'Bếp Chay An Lạc', text: 'Phần nấm đông cô sau khi ngâm nở chúng ta vắt ráo, khoai lang và cà rốt cắt miếng vừa ăn để giữ được độ ngọt...' },
    { time: '02:40', speaker: 'Bếp Chay An Lạc', text: 'Đoạn sôi múi cà và thêm nước cốt dừa: Hãy giảm nhỏ lửa để nước dừa hòa quyện mịn màng, không bị kết tủa...' },
    { time: '03:50', speaker: 'Bếp Chay An Lạc', text: 'Món ăn hoàn thành với màu sắc vàng ươm hấp dẫn, giàu beta-carotene và đạm thực vật lành mạnh cho cả gia đình.' }
  ]);

  const handleEditContent = (contentItem) => {
    setCurrentEditingContent(contentItem);
    setDetailActiveTab('ingredients');
    setDetailIngredients(contentItem.ingredientsDetailed || [
      { id: 1, name: 'Khoai lang mật', amount: '200g', tag: 'Rau củ giàu Beta-Carotene', status: 'Đã khớp CSDL' },
      { id: 2, name: 'Cà rốt Đà Lạt', amount: '150g', tag: 'Củ giàu Vitamin A', status: 'Đã khớp CSDL' },
      { id: 3, name: 'Nấm đông cô ngâm nở', amount: '100g', tag: 'Đạm thực vật & Kẽm', status: 'Đã khớp CSDL' },
      { id: 4, name: 'Nước cốt dừa tươi', amount: '250ml', tag: 'Chất béo thực vật MCT', status: 'Đã khớp CSDL' },
      { id: 5, name: 'Đậu hũ non chiên', amount: '150g', tag: 'Đạm Isoflavone', status: 'Đã khớp CSDL' },
      { id: 6, name: 'Bột cà ri hữu cơ', amount: '15g', tag: 'Gia vị thảo mộc kháng viêm', status: 'Đã khớp CSDL' },
      { id: 7, name: 'Sả cây băm nhuyễn', amount: '3 cây (30g)', tag: 'Hương liệu thảo dược', status: 'Đã khớp CSDL' }
    ]);
    setDetailDietary(contentItem.dietaryChecklist || [
      { id: 'cholesterol', label: 'Thích hợp cho người kiểm soát Cholesterol', checked: true },
      { id: 'fiber', label: 'Giàu chất xơ hòa tan hỗ trợ tiêu hóa', checked: true },
      { id: 'glutenFree', label: 'Không chứa Gluten (Gluten-Free 100%)', checked: true },
      { id: 'lowSodium', label: 'Thực đơn hạn chế muối/nghiêm ngặt (Low Sodium)', checked: false }
    ]);
    setDetailTags(contentItem.tags || ['#CaRiChay', '#GiauChatXo', '#DinhDuongKhoaHoc', '#MonChayHangNgay']);
    setDetailSummary(contentItem.summary || contentItem.content || '');
    setDetailBlogContent(
      contentItem.editorContent || `💡 Mẹo Nấu Ăn & Bảo Quản Chuẩn Y Khoa:\n\n1. Giữ trọn vi chất: Không hầm kỹ khoai lang và cà rốt quá 20 phút ở nhiệt độ trên 100°C để bảo toàn tối đa lượng Vitamin A (Beta-carotene) hòa tan trong chất béo dừa tự nhiên.\n\n2. Bảo quản tủ lạnh: Để nguội hoàn toàn, chia vào hộp thủy tinh kín khí có thể trữ mát trong 48 giờ. Khi hâm nóng lại, thêm 2 thìa canh nước ấm và đảo lửa nhỏ.`
    );
    setDetailSteps(contentItem.cookingSteps || []);
    setDetailTranscript(contentItem.transcript || []);
    setActiveMenu('content-detail');
  };

  const handleSaveContentDetail = () => {
    setContentList(prev => prev.map(c => c.id === currentEditingContent.id ? {
      ...c,
      ...currentEditingContent,
      summary: detailSummary,
      editorContent: detailBlogContent,
      tags: detailTags,
      ingredientsDetailed: detailIngredients,
      cookingSteps: detailSteps,
      dietaryChecklist: detailDietary
    } : c));
    showToast(`✅ Đã lưu thay đổi & cập nhật bài viết #${currentEditingContent.id} thành công!`);
  };

  const handleAddIngredient = () => {
    const newId = detailIngredients.length + 1;
    const sample = { id: newId, name: `Nguyên liệu chay #${newId}`, amount: '100g', tag: 'Dinh dưỡng thực vật', status: 'Đã khớp CSDL' };
    setDetailIngredients([...detailIngredients, sample]);
    showToast(`Đã thêm nguyên liệu: ${sample.name}`);
  };

  const handleRemoveIngredient = (id) => {
    setDetailIngredients(detailIngredients.filter(i => i.id !== id));
  };

  const handleAddTag = () => {
    if (!detailNewTag.trim()) return;
    const formatted = detailNewTag.startsWith('#') ? detailNewTag.trim() : `#${detailNewTag.trim().replace(/\s+/g, '')}`;
    if (!detailTags.includes(formatted)) {
      setDetailTags([...detailTags, formatted]);
    }
    setDetailNewTag('');
    setShowAddTagInput(false);
  };

  const handleRemoveTag = (tagToRemove) => {
    setDetailTags(detailTags.filter(t => t !== tagToRemove));
  };

  const handleToggleDietary = (id) => {
    setDetailDietary(detailDietary.map(d => d.id === id ? { ...d, checked: !d.checked } : d));
  };

  const handleDeleteContent = (contentId) => {
    setContentList(prev => prev.filter(c => c.id !== contentId));
    showToast(`🗑️ Đã xóa nội dung #${contentId} khỏi hệ thống.`);
    if (currentEditingContent.id === contentId) {
      setCurrentEditingContent(contentList[0]);
      setActiveMenu('content');
    }
  };

  // Checkbox handlers
  const handleSelectAllContent = (e) => {
    if (e.target.checked) {
      setSelectedContentIds(contentList.map(c => c.id));
    } else {
      setSelectedContentIds([]);
    }
  };

  const handleSelectOneContent = (id) => {
    setSelectedContentIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  // Bulk actions handlers
  const handleBulkTag = () => {
    if (selectedContentIds.length === 0) return;
    showToast(`🏷️ Đã mở hộp thoại gắn nhãn cho ${selectedContentIds.length} nội dung được chọn.`);
  };

  const handleBulkReExtractAI = () => {
    if (selectedContentIds.length === 0) return;
    showToast(`⚡ Đang gửi ${selectedContentIds.length} video/bài viết đến cụm AI Whisper & NLP để bóc tách lại công thức...`);
  };

  const handleBulkHide = () => {
    if (selectedContentIds.length === 0) return;
    setContentList(prev => prev.map(c => selectedContentIds.includes(c.id) ? { ...c, status: c.status === 'Đã ẩn' ? 'Đã xuất bản' : 'Đã ẩn' } : c));
    showToast(`👁️ Đã cập nhật trạng thái ẩn/hiện cho ${selectedContentIds.length} nội dung!`);
  };

  const handleBulkDeleteContent = () => {
    if (selectedContentIds.length === 0) return;
    setContentList(prev => prev.filter(c => !selectedContentIds.includes(c.id)));
    showToast(`🗑️ Đã xóa thành công ${selectedContentIds.length} bài viết/video khỏi hệ thống.`);
    setSelectedContentIds([]);
  };

  const handleExportContentCSV = () => {
    const headers = ['Mã', 'Tiêu đề', 'Phân loại', 'Tác giả', 'Nguồn', 'Độ khớp AI', 'Macro Calo', 'Lượt xem', 'Trạng thái'];
    const rows = contentList.map(c => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.typeLabel}"`,
      `"${c.author}"`,
      `"${c.source}"`,
      `"${c.aiMatch}"`,
      `"${c.macro}"`,
      `"${c.views}"`,
      `"${c.status}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VeggieAI_Blog_Video_List_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📥 Đã xuất thành công file CSV danh sách Blog & Video nấu ăn!');
  };

  const handleStartSync = () => {
    setIsSyncing(true);
    setSyncStep(1);
    setTimeout(() => {
      setSyncStep(2);
      setTimeout(() => {
        setSyncStep(3);
        setTimeout(() => {
          setIsSyncing(false);
          setShowSyncModal(false);
          setSyncStep(0);
          showToast('🎉 Đồng bộ & bóc tách AI thành công 1 video ẩm thực mới từ YouTube!');
        }, 1200);
      }, 1200);
    }, 1000);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 4: QUẢN LÝ BÌNH LUẬN (COMMENTS & COMMUNITY MODERATION)
  // =========================================================================
  const [commentsList, setCommentsList] = useState([
    {
      id: 'CMT-88912',
      recordId: 'REV-2026-88912',
      author: 'Minh Tuấn Bùi',
      email: 'tuanntri88@gmail.com',
      handle: '@tuanntri88',
      avatar: 'MT',
      avatarBg: '#3b82f6',
      reputation: 32,
      violationCount: 'Vi phạm lần 2',
      joined: '3 tháng trước',
      content: 'Mọi người đừng nghe bác sĩ tây y, bệnh tiểu đường type 2 chỉ cần nhịn ăn tuyệt đối 21 ngày chỉ uống nước mía là tế bào tự thực diệt khuẩn và khỏi dứt điểm 100%!',
      highlightWord: 'nhịn ăn tuyệt đối 21 ngày chỉ uống nước mía',
      time: '5 phút trước',
      editStatus: 'Chưa qua chỉnh sửa',
      targetTitle: 'Thực đơn chay 7 ngày cho người tiểu đường',
      targetType: 'Blog Dinh Dưỡng',
      targetThumb: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      status: 'flagged',
      category: 'misinformation',
      riskLevel: 'high',
      riskLabel: 'Mức Nguy Hiểm',
      aiAnalysis: {
        title: 'Sai lệch nghiêm trọng',
        desc: 'Tuyên truyền nhịn ăn uống nước mía chữa khỏi đái tháo đường đi ngược phác đồ dinh dưỡng chuẩn khoa học.',
        riskDesc: 'Tăng đường huyết đột ngột từ nước mía có thể gây hôn mê nhiễm toan ceton đối với bệnh nhân tiểu đường.',
        confidence: '99.4% tương đồng với mẫu tin giả y tế đã phân loại trong từ điển cấm VeggieAI.'
      }
    },
    {
      id: 'CMT-88913',
      recordId: 'REV-2026-88913',
      author: 'Thảo Dược Vegan',
      email: 'thaoduoc_xanh@gmail.com',
      handle: '@thaoduoc_xanh',
      avatar: 'TD',
      avatarBg: '#10b981',
      reputation: 15,
      violationCount: 'Mới tạo (2 ngày)',
      joined: '2 ngày trước',
      content: 'Ai muốn bổ sung canxi và b12 chuẩn tự nhiên không cần ăn đậu nành thì kết bạn Zalo 0988.xxx.899 mình gửi viên thảo dược gia truyền cam kết giảm đau xương khớp sau 3 ngày!',
      highlightWord: 'kết bạn Zalo 0988.xxx.899',
      time: '18 phút trước',
      editStatus: 'Chưa qua chỉnh sửa',
      targetTitle: 'Cà Ri Đậu Lăng Kem Dừa Khoai Lang',
      targetType: 'Video Nấu Ăn',
      targetThumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      status: 'flagged',
      category: 'spam',
      riskLevel: 'medium',
      riskLabel: 'Cảnh Báo Spam',
      aiAnalysis: {
        title: 'Spam bán hàng & Lừa đảo TPCN',
        desc: 'Phát hiện điều hướng sang Zalo cá nhân kinh doanh thực phẩm bổ sung không rõ nguồn gốc, cam kết chữa dứt điểm sai sự thật.',
        riskDesc: 'Có dấu hiệu chiếm đoạt tài sản người dùng và phân phối sản phẩm chưa qua kiểm nghiệm an toàn.',
        confidence: '98.8% khớp với mẫu Spam Telegram/Zalo trong cơ sở dữ liệu anti-spam.'
      }
    },
    {
      id: 'CMT-88914',
      recordId: 'REV-2026-88914',
      author: 'Hoàng Nam Vũ',
      email: 'namvu_kitchen@gmail.com',
      handle: '@namvu_kitchen',
      avatar: 'HN',
      avatarBg: '#f59e0b',
      reputation: 78,
      violationCount: 'Cảnh cáo lần 1',
      joined: '1 năm trước',
      content: 'Nấu ăn kiểu này mà cũng đăng lên làm đầu bếp? Nhìn như đồ ăn cho lợn, ngu ngốc thế mà cũng đòi dạy dinh dưỡng chay!',
      highlightWord: 'đồ ăn cho lợn, ngu ngốc thế mà cũng đòi dạy',
      time: '1 giờ trước',
      editStatus: 'Chưa qua chỉnh sửa',
      targetTitle: 'Gỏi Cuốn Bơ Sốt Đậu Phộng Chay',
      targetType: 'Video Nấu Ăn',
      targetThumb: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      status: 'flagged',
      category: 'toxic',
      riskLevel: 'medium',
      riskLabel: 'Ngôn Từ Thô Tục',
      aiAnalysis: {
        title: 'Ngôn từ xúc phạm & Công kích cá nhân',
        desc: 'Sử dụng từ ngữ miệt thị, thô tục (so sánh xúc phạm) vi phạm bộ tiêu chuẩn ứng xử văn minh cộng đồng ẩm thực VeggieAI.',
        riskDesc: 'Tạo môi trường thảo luận tiêu cực, gây thù ghét giữa các thành viên.',
        confidence: '96.5% xác định là Toxicity Comment bởi mô hình NLP Transformer.'
      }
    },
    {
      id: 'CMT-88915',
      recordId: 'REV-2026-88915',
      author: 'Lê Điệp',
      email: 'dieple_user@gmail.com',
      handle: '@dieple_member',
      avatar: 'LD',
      avatarBg: '#6366f1',
      reputation: 98,
      violationCount: 'Authorized User',
      joined: '2 năm trước',
      content: 'Lưu ý người bệnh thận giai đoạn 3 cần tham khảo bác sĩ trước khi dùng quá nhiều nấm đông cô vì hàm lượng kali và purin cao có thể gây tăng axit uric.',
      highlightWord: null,
      time: '2 giờ trước',
      editStatus: 'Đã kiểm duyệt',
      targetTitle: 'Kho Tộ Nấm Dinh Dưỡng Đậm Đà',
      targetType: 'Blog Dinh Dưỡng',
      targetThumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      status: 'approved',
      category: 'safe',
      riskLevel: 'low',
      riskLabel: 'An Toàn',
      aiAnalysis: {
        title: 'Nhận diện nhầm (False Positive)',
        desc: 'Bình luận mang tính chất chia sẻ lưu ý sức khỏe thận trọng cho người có bệnh lý nền, dẫn chứng purin và kali phù hợp khoa học.',
        riskDesc: 'Không có rủi ro phát tán thông tin sai lệch hay phản cảm.',
        confidence: 'AI phân loại False Positive: Đủ điều kiện phê duyệt hiển thị ngay.'
      }
    },
    {
      id: 'CMT-88916',
      recordId: 'REV-2026-88916',
      author: 'Nguyễn Thu Trang',
      email: 'thutrang.vegan@gmail.com',
      handle: '@thutrang_vegan',
      avatar: 'TT',
      avatarBg: '#ec4899',
      reputation: 92,
      violationCount: 'Authorized User',
      joined: '8 tháng trước',
      content: 'Cảm ơn công thức rất chi tiết! Mình đã nấu thử cho cả nhà ăn ngày rằm và ai cũng khen nước dùng cà ri thanh ngọt tự nhiên.',
      highlightWord: null,
      time: '3 giờ trước',
      editStatus: 'Đã kiểm duyệt',
      targetTitle: 'Cà Ri Đậu Lăng Kem Dừa Khoai Lang',
      targetType: 'Video Nấu Ăn',
      targetThumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      status: 'approved',
      category: 'safe',
      riskLevel: 'low',
      riskLabel: 'An Toàn',
      aiAnalysis: null
    }
  ]);

  const [commentsFilter, setCommentsFilter] = useState('flagged');
  const [commentsSearch, setCommentsSearch] = useState('');
  const [commentsRiskFilter, setCommentsRiskFilter] = useState('all');
  const [commentsSourceFilter, setCommentsSourceFilter] = useState('all');
  const [selectedCommentIds, setSelectedCommentIds] = useState(['CMT-88912', 'CMT-88913']);
  const [activeInspectingCommentId, setActiveInspectingCommentId] = useState('CMT-88912');
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [bannedKeywords, setBannedKeywords] = useState([
    'nhịn ăn tuyệt đối',
    'uống nước mía chữa khỏi',
    'kết bạn Zalo 09',
    'thuốc giảm cân cấp tốc',
    'đồ ăn cho lợn',
    'thảo dược gia truyền',
    'chữa khỏi 100% ung thư'
  ]);
  const [newBannedKeyword, setNewBannedKeyword] = useState('');

  const activeInspectingComment = commentsList.find(c => c.id === activeInspectingCommentId) || commentsList[0];

  const handleToggleSelectComment = (id) => {
    setSelectedCommentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllComments = (items) => {
    const itemIds = items.map(i => i.id);
    const allSelected = itemIds.length > 0 && itemIds.every(id => selectedCommentIds.includes(id));
    if (allSelected) {
      setSelectedCommentIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedCommentIds(prev => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleBatchHide = () => {
    if (selectedCommentIds.length === 0) return;
    setCommentsList(prev => prev.map(c => 
      selectedCommentIds.includes(c.id) ? { ...c, status: 'hidden' } : c
    ));
    showToast(`👁️ Đã ẩn ${selectedCommentIds.length} bình luận đã chọn khỏi hệ thống!`);
  };

  const handleBatchApproveSafe = () => {
    if (selectedCommentIds.length === 0) return;
    setCommentsList(prev => prev.map(c => 
      selectedCommentIds.includes(c.id) ? { ...c, status: 'approved', riskLevel: 'low', riskLabel: 'An Toàn' } : c
    ));
    showToast(`✅ Đã đánh dấu an toàn & hiển thị cho ${selectedCommentIds.length} bình luận!`);
  };

  const handleBatchDelete = () => {
    if (selectedCommentIds.length === 0) return;
    const count = selectedCommentIds.length;
    setCommentsList(prev => prev.filter(c => !selectedCommentIds.includes(c.id)));
    setSelectedCommentIds([]);
    showToast(`🗑️ Đã xóa vĩnh viễn ${count} bình luận đã chọn.`);
  };

  const handleQuickApproveSafe = () => {
    showToast('🛡️ Duyệt nhanh an toàn: Đã tự động phê duyệt 28 bình luận có độ tin cậy NLP > 99%!');
  };

  const handleSingleDelete = (comment) => {
    setCommentsList(prev => prev.filter(c => c.id !== comment.id));
    setSelectedCommentIds(prev => prev.filter(id => id !== comment.id));
    showToast(`🗑️ Đã xóa bình luận #${comment.id} và gửi cảnh báo vi phạm tới ${comment.author}!`);
  };

  const handleSingleBanUser = (comment) => {
    showToast(`⛔ Đã khóa tính năng bình luận của tài khoản ${comment.author} (${comment.handle}) trong 7 ngày!`);
  };

  const handleSingleMarkFalsePositive = (comment) => {
    setCommentsList(prev => prev.map(c => 
      c.id === comment.id ? { ...c, status: 'approved', riskLevel: 'low', riskLabel: 'An Toàn' } : c
    ));
    showToast(`✓ Đã bỏ qua cờ vi phạm: Bình luận #${comment.id} đã được đánh dấu nhận diện nhầm & hiển thị.`);
  };

  const handleExportCSV = () => {
    showToast('📥 Đang xuất báo cáo kiểm duyệt bình luận (CSV)... Tải xuống hoàn tất!');
  };

  const handleAddBannedKeyword = () => {
    if (!newBannedKeyword.trim()) return;
    setBannedKeywords(prev => [...prev, newBannedKeyword.trim()]);
    setNewBannedKeyword('');
    showToast(`➕ Đã thêm từ khóa cấm mới: "${newBannedKeyword.trim()}"`);
  };

  const handleRemoveBannedKeyword = (kw) => {
    setBannedKeywords(prev => prev.filter(k => k !== kw));
    showToast(`Đã xóa từ khóa "${kw}" khỏi bộ lọc.`);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 5: QUẢN LÝ DANH MỤC MÓN ĂN (2 TẦNG ĐƠN GIẢN HÓA)
  // Rút gọn chuẩn CRUD cho Meal Planner VeggieAI, bỏ tầng Y khoa và rule-engine phức tạp
  // =========================================================================
  const PRESET_CAT_ICONS = ['🥗', '🍲', '🥣', '🥑', '🥛', '🌱', '🍱', '🥘', '🌯', '🧁', '🥬', '🥕', '🥦', '🫘', '🧀', '🍵'];

  const [categoriesTaxonomy, setCategoriesTaxonomy] = useState([
    {
      id: 'CAT-GRP-01',
      name: 'Trường phái ăn chay',
      icon: '🌱',
      count: 10610,
      active: true,
      expanded: true,
      tabCategory: 'schools',
      description: 'Phân loại các trường phái ăn chay phổ biến theo mức độ sử dụng nguyên liệu thực vật.',
      children: [
        {
          id: 'CAT-VEGAN-01',
          parentId: 'CAT-GRP-01',
          name: 'Thuần Chay Tuyệt Đối',
          icon: '🥗',
          count: 4520,
          active: true,
          tabCategory: 'schools',
          description: 'Loại bỏ hoàn toàn thịt động vật, trứng, sữa và mật ong, 100% nguồn gốc thực vật tự nhiên.'
        },
        {
          id: 'CAT-LACTO-OVO',
          parentId: 'CAT-GRP-01',
          name: 'Chay Có Trứng & Sữa',
          icon: '🥛',
          count: 3890,
          active: true,
          tabCategory: 'schools',
          description: 'Cho phép sử dụng sản phẩm từ sữa và trứng gà sạch kiểm định kết hợp thực vật.'
        },
        {
          id: 'CAT-LACTO-01',
          parentId: 'CAT-GRP-01',
          name: 'Chay Có Sữa (Lacto-Vegetarian)',
          icon: '🧀',
          count: 1250,
          active: true,
          tabCategory: 'schools',
          description: 'Sử dụng sữa tươi, sữa chua, bơ thực vật, không sử dụng trứng.'
        },
        {
          id: 'CAT-FLEXI-01',
          parentId: 'CAT-GRP-01',
          name: 'Chay Bán Phần (Flexitarian)',
          icon: '🥑',
          count: 950,
          active: true,
          tabCategory: 'schools',
          description: 'Chế độ ăn linh hoạt chủ yếu là thực vật, phù hợp cho người mới bắt đầu ăn chay.'
        }
      ]
    },
    {
      id: 'CAT-GRP-02',
      name: 'Loại món ăn',
      icon: '🍲',
      count: 5160,
      active: true,
      expanded: true,
      tabCategory: 'meals',
      description: 'Phân loại theo vai trò và cách dùng bữa: món chính, canh súp, salad khai vị, món kho, tráng miệng.',
      children: [
        {
          id: 'CAT-MAIN-01',
          parentId: 'CAT-GRP-02',
          name: 'Món Chính',
          icon: '🍱',
          count: 1840,
          active: true,
          tabCategory: 'meals',
          description: 'Các món ăn no cho bữa trưa và tối kết hợp cơm gạo lứt, bún, mì và rau củ xào kho.'
        },
        {
          id: 'CAT-SOUP-01',
          parentId: 'CAT-GRP-02',
          name: 'Canh & Súp',
          icon: '🥣',
          count: 920,
          active: true,
          tabCategory: 'meals',
          description: 'Canh rong biển, súp bí đỏ, canh củ sen bổ dưỡng thanh lọc cơ thể.'
        },
        {
          id: 'CAT-SALAD-01',
          parentId: 'CAT-GRP-02',
          name: 'Salad & Khai Vị',
          icon: '🥗',
          count: 640,
          active: true,
          tabCategory: 'meals',
          description: 'Salad rau củ hữu cơ trộn sốt chanh leo, dầu ô liu và hạt chia thanh mát.'
        },
        {
          id: 'CAT-STIR-01',
          parentId: 'CAT-GRP-02',
          name: 'Món Xào & Kho',
          icon: '🥘',
          count: 810,
          active: true,
          tabCategory: 'meals',
          description: 'Đậu hũ kho nấm, cà tím xào tía tô, củ cải kho tiêu thơm ngon đậm đà.'
        },
        {
          id: 'CAT-ROLL-01',
          parentId: 'CAT-GRP-02',
          name: 'Món Cuốn Thực Vật',
          icon: '🌯',
          count: 520,
          active: true,
          tabCategory: 'meals',
          description: 'Gỏi cuốn chay, phở cuốn nấm đậu phụ, bò bía chay dùng kèm nước chấm thanh vị.'
        },
        {
          id: 'CAT-DESSERT-01',
          parentId: 'CAT-GRP-02',
          name: 'Tráng Miệng & Bánh Chay',
          icon: '🧁',
          count: 430,
          active: true,
          tabCategory: 'meals',
          description: 'Chè hạt sen long nhãn, pudding hạt chia, bánh chuối nướng không trứng sữa.'
        }
      ]
    },
    {
      id: 'CAT-GRP-03',
      name: 'Nhóm dinh dưỡng nổi bật',
      icon: '💪',
      count: 4460,
      active: true,
      expanded: true,
      tabCategory: 'nutrition',
      description: 'Phân loại theo mục tiêu sức khỏe và hàm lượng vi chất dinh dưỡng thiết yếu.',
      children: [
        {
          id: 'CAT-VEG-PROT',
          parentId: 'CAT-GRP-03',
          name: 'Giàu Đạm Thực Vật',
          icon: '🥣',
          count: 1840,
          active: true,
          tabCategory: 'nutrition',
          description: 'Cung cấp tối thiểu 18g protein/khẩu phần từ tempeh, đậu hũ hữu cơ, đậu gà và các loại hạt.'
        },
        {
          id: 'CAT-VEG-OILFREE',
          parentId: 'CAT-GRP-03',
          name: 'Ít Dầu Mỡ (Oil-Free)',
          icon: '🥑',
          count: 920,
          active: true,
          tabCategory: 'nutrition',
          description: 'Chế biến phương pháp hấp luộc hoặc xào nước, không dùng dầu mỡ chiên rán nhiệt cao.'
        },
        {
          id: 'CAT-SUGAR-CONTROL',
          parentId: 'CAT-GRP-03',
          name: 'Ít đường / Phù hợp kiểm soát đường huyết',
          icon: '🥗',
          count: 860,
          active: true,
          tabCategory: 'nutrition',
          description: 'Món ăn có chỉ số đường huyết thấp (Low GI), nhiều chất xơ hòa tan giúp giữ đường huyết ổn định.'
        },
        {
          id: 'CAT-IRON-RICH',
          parentId: 'CAT-GRP-03',
          name: 'Giàu Sắt & Khoáng Chất',
          icon: '🥬',
          count: 840,
          active: true,
          tabCategory: 'nutrition',
          description: 'Giàu chất sắt thực vật và vitamin C tăng hấp thu từ rau chân vịt, củ dền, mè đen và mộc nhĩ.'
        }
      ]
    }
  ]);

  // Node đang chọn để hiển thị chi tiết ở panel bên phải
  const [selectedCatNodeId, setSelectedCatNodeId] = useState('CAT-VEG-PROT');

  // Form chỉnh sửa cấu hình ở cột phải (rút gọn mạnh)
  const [editCatName, setEditCatName] = useState('Giàu Đạm Thực Vật');
  const [editCatParentId, setEditCatParentId] = useState('CAT-GRP-03');
  const [editCatDesc, setEditCatDesc] = useState(
    'Cung cấp tối thiểu 18g protein/khẩu phần từ tempeh, đậu hũ hữu cơ, đậu gà và các loại hạt.'
  );
  const [editCatIcon, setEditCatIcon] = useState('🥣');

  // Bộ lọc danh mục
  const [catActiveTab, setCatActiveTab] = useState('all'); // 'all', 'schools', 'meals', 'nutrition'
  const [catSearchQuery, setCatSearchQuery] = useState('');

  // Modal thêm danh mục mới
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatParentId, setNewCatParentId] = useState('CAT-GRP-01');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🥗');

  // Tìm node bất kỳ (cha hoặc con)
  const findCatNode = (id) => {
    for (const parent of categoriesTaxonomy) {
      if (parent.id === id) return { ...parent, isChild: false };
      if (parent.children) {
        for (const child of parent.children) {
          if (child.id === id) return { ...child, isChild: true, parentName: parent.name };
        }
      }
    }
    return null;
  };

  // Chọn node để xem/sửa cấu hình
  const handleSelectCategoryNode = (node) => {
    setSelectedCatNodeId(node.id);
    setEditCatName(node.name);
    setEditCatParentId(node.parentId || '');
    setEditCatDesc(node.description || '');
    setEditCatIcon(node.icon || '🥗');
  };

  // Lưu cấu hình từ cột phải
  const handleSaveCategoryConfig = () => {
    if (!editCatName.trim()) {
      showToast('Vui lòng nhập tên danh mục!');
      return;
    }

    setCategoriesTaxonomy(prev => prev.map(parent => {
      if (parent.id === selectedCatNodeId) {
        return {
          ...parent,
          name: editCatName.trim(),
          icon: editCatIcon,
          description: editCatDesc.trim()
        };
      }
      if (parent.children && parent.children.length > 0) {
        return {
          ...parent,
          children: parent.children.map(child => {
            if (child.id === selectedCatNodeId) {
              return {
                ...child,
                name: editCatName.trim(),
                icon: editCatIcon,
                description: editCatDesc.trim()
              };
            }
            return child;
          })
        };
      }
      return parent;
    }));
    showToast(`✅ Đã lưu thay đổi cho danh mục "${editCatName}"!`);
  };

  // Hủy chỉnh sửa & khôi phục dữ liệu ban đầu của node
  const handleCancelCategoryConfig = () => {
    const node = findCatNode(selectedCatNodeId);
    if (node) {
      handleSelectCategoryNode(node);
      showToast(`Đã khôi phục thông tin gốc của danh mục.`);
    }
  };

  // Đóng/mở rộng nhánh cha
  const handleToggleExpandParent = (parentId) => {
    setCategoriesTaxonomy(prev => prev.map(p => p.id === parentId ? { ...p, expanded: !p.expanded } : p));
  };

  // Mở rộng tất cả
  const handleExpandAllNodes = () => {
    setCategoriesTaxonomy(prev => prev.map(p => ({ ...p, expanded: true })));
    showToast(`Đã mở rộng toàn bộ cây danh mục.`);
  };

  // Thu gọn tất cả
  const handleCollapseAllNodes = () => {
    setCategoriesTaxonomy(prev => prev.map(p => ({ ...p, expanded: false })));
    showToast(`Đã thu gọn toàn bộ cây danh mục.`);
  };

  // Sắp xếp theo số lượng món ăn
  const handleSortByPopularity = () => {
    setCategoriesTaxonomy(prev => [...prev].sort((a, b) => b.count - a.count));
    showToast(`Đã sắp xếp danh mục theo số lượng món ăn.`);
  };

  // Bật/tắt trạng thái hoạt động của danh mục
  const handleToggleCategoryActive = (nodeId, e) => {
    if (e) e.stopPropagation();
    setCategoriesTaxonomy(prev => prev.map(p => {
      if (p.id === nodeId) return { ...p, active: !p.active };
      if (p.children) {
        return {
          ...p,
          children: p.children.map(c => c.id === nodeId ? { ...c, active: !c.active } : c)
        };
      }
      return p;
    }));
    showToast(`Đã thay đổi trạng thái hoạt động.`);
  };

  // Xóa danh mục (cha hoặc con)
  const handleDeleteCategoryNode = (nodeId, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}" không?`)) {
      return;
    }

    setCategoriesTaxonomy(prev => {
      // Nếu là node cha
      const isParent = prev.some(p => p.id === nodeId);
      if (isParent) {
        return prev.filter(p => p.id !== nodeId);
      }
      // Nếu là node con
      return prev.map(p => ({
        ...p,
        children: p.children ? p.children.filter(c => c.id !== nodeId) : []
      }));
    });

    if (selectedCatNodeId === nodeId) {
      setSelectedCatNodeId('CAT-VEGAN-01');
      setEditCatName('Thuần Chay Tuyệt Đối');
      setEditCatParentId('CAT-GRP-01');
      setEditCatDesc('Loại bỏ hoàn toàn thịt động vật, trứng, sữa và mật ong.');
      setEditCatIcon('🥗');
    }

    showToast(`🗑️ Đã xóa danh mục "${name}".`);
  };

  // Xuất dữ liệu Taxonomies JSON/CSV
  const handleExportTaxonomies = () => {
    showToast(`📥 Đã xuất tệp danh mục món ăn (dạng JSON/CSV) thành công.`);
  };

  // Thêm danh mục mới từ Modal
  const handleCreateNewCategory = () => {
    if (!newCatName.trim()) {
      showToast('Vui lòng nhập tên danh mục!');
      return;
    }
    const newId = `CAT-${Date.now()}`;

    if (newCatParentId) {
      // Thêm làm con của nhóm cha
      setCategoriesTaxonomy(prev => prev.map(p => {
        if (p.id === newCatParentId) {
          const newChild = {
            id: newId,
            parentId: p.id,
            name: newCatName.trim(),
            icon: newCatIcon || '🥗',
            count: 0,
            active: true,
            tabCategory: p.tabCategory || 'schools',
            description: newCatDesc.trim() || 'Mô tả danh mục món ăn mới.'
          };
          return {
            ...p,
            expanded: true,
            children: [...(p.children || []), newChild]
          };
        }
        return p;
      }));
    } else {
      // Thêm làm nhóm cha mới
      const newParent = {
        id: newId,
        name: newCatName.trim(),
        icon: newCatIcon || '🌱',
        count: 0,
        active: true,
        expanded: true,
        tabCategory: 'schools',
        description: newCatDesc.trim() || 'Nhóm danh mục món ăn mới.',
        children: []
      };
      setCategoriesTaxonomy([newParent, ...categoriesTaxonomy]);
    }

    setNewCatName('');
    setNewCatDesc('');
    setShowAddCatModal(false);
    showToast(`✅ Đã tạo thành công danh mục: ${newCatName.trim()}`);
  };

  // =========================================================================
  // DỮ LIỆU & TRẠNG THÁI MÀN HÌNH 6: GIÁM SÁT & QUẢN TRỊ MÔ HÌNH AI (MLOPS)
  // =========================================================================
  const [mlopsTimeRange, setMlopsTimeRange] = useState('24h');
  const [mlopsSearchQuery, setMlopsSearchQuery] = useState('');
  const [mlopsModelFilter, setMlopsModelFilter] = useState('all');
  const [mlopsLogLevelFilter, setMlopsLogLevelFilter] = useState('all');
  const [mlopsStatusFilter, setMlopsStatusFilter] = useState('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [mlopsCurrentPage, setMlopsCurrentPage] = useState(1);

  // Modals state
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [thresholdConfig, setThresholdConfig] = useState({
    latencyP95: 450,
    driftRate: 3.0,
    hallucinationRate: 0.2,
    notifySlack: true,
    notifyEmail: true,
    autoRollback: true
  });

  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState(0);
  const [benchmarkResult, setBenchmarkResult] = useState(null);

  const [showTestPromptModal, setShowTestPromptModal] = useState(false);
  const [testPromptModel, setTestPromptModel] = useState('meal-planner');
  const [testPromptInput, setTestPromptInput] = useState('Tủ lạnh có: đậu hũ non, nấm đùi gà, cải thìa, cà rốt. Cần bữa tối thuần chay giàu protein > 25g, calo < 480 kcal.');
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [testPromptResult, setTestPromptResult] = useState(null);

  const [showRetrainModal, setShowRetrainModal] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);

  const [showSampleDialogModal, setShowSampleDialogModal] = useState(false);
  const [sampleDialogModel, setSampleDialogModel] = useState(null);

  // 4 Core AI Models (Matching Mockup)
  const [mlopsModels, setMlopsModels] = useState([
    {
      id: 'meal-planner',
      name: 'AI Meal Planner Engine',
      version: 'v2.4',
      badge: 'Tối ưu',
      badgeType: 'optimal',
      arch: 'Transformer Recommender v2.4',
      desc: 'Cá nhân hóa thực đơn ăn chay linh hoạt theo chỉ số TDEE, tiền sử dị ứng thực phẩm và chỉ số đường huyết y khoa.',
      metrics: [
        { label: 'Accuracy', value: '99.2%', color: '#0f172a' },
        { label: 'Latency', value: '320ms', color: '#0f172a' },
        { label: 'Tokens / req', value: '850 tokens', color: '#0f172a' },
        { label: 'Tỉ lệ lỗi (Error)', value: '0.04%', color: '#059669' }
      ],
      driftNote: null
    },
    {
      id: 'vision-extractor',
      name: 'Vision Recipe Extractor',
      version: 'v2.4',
      badge: 'Drift Alert',
      badgeType: 'drift',
      arch: 'YOLOv8 + Whisper-v3',
      desc: 'Nhận diện nguyên liệu trong tủ lạnh từ ảnh thực tế, bóc tách audio video TikTok/Reels thành công thức món chay.',
      metrics: [
        { label: 'IoU / F1-Score', value: '97.8%', color: '#0f172a' },
        { label: 'Latency', value: '1.8s', color: '#0f172a' },
        { label: 'Ảnh quét / ngày', value: '12,400 ảnh', color: '#0f172a' },
        { label: 'Lệch nhận diện', value: '3.1%', color: '#ea580c' }
      ],
      driftNote: '* Nhầm rau dền đỏ với mồng tơi (3.1%) do phản quang đèn bếp.'
    },
    {
      id: 'nutrition-chatbot',
      name: 'Nutrition Advisory Chatbot',
      version: 'v2.4',
      badge: 'Xuất sắc',
      badgeType: 'optimal',
      arch: 'Gemini-1.5-Pro Veg-Tuned',
      desc: 'Tư vấn dinh dưỡng chuyên sâu, cân bằng vi chất (B12, Sắt, Kẽm), tương tác ngôn ngữ tự nhiên theo ngữ cảnh cá nhân.',
      metrics: [
        { label: 'Hallucination Rate', value: '0.12%', color: '#059669' },
        { label: 'Latency TB', value: '680ms', color: '#0f172a' },
        { label: 'Hài lòng người dùng', value: '4.9 / 5.0 ★', color: '#0f172a' },
        { label: 'Phiên active', value: '1,432', color: '#0f172a' }
      ],
      driftNote: null
    },
    {
      id: 'nlp-moderation',
      name: 'NLP Toxicity Moderation',
      version: '2.0',
      badge: 'Bảo vệ 24/7',
      badgeType: 'optimal',
      arch: 'DistilBERT-MedGuard 2.0',
      desc: 'Tự động quét và phát hiện thông tin giả mạo về dinh dưỡng, phác đồ ăn chay cực đoan phi khoa học và bình luận độc hại.',
      metrics: [
        { label: 'Precision / Recall', value: '99.4% / 98.1%', color: '#0f172a' },
        { label: 'Đã xử lý chặn', value: '1,840 mục', color: '#0f172a' },
        { label: 'False Positive', value: '0.21%', color: '#059669' },
        { label: 'Scan Time', value: '85ms', color: '#0f172a' }
      ],
      driftNote: null
    }
  ]);

  // Backward-compatible alias
  const aiModels = mlopsModels;

  // Inference Logs matching mockup
  const [mlopsLogs, setMlopsLogs] = useState([
    {
      id: 'REQ-98421',
      timestamp: '14:28:12.410',
      modelId: 'meal-planner',
      modelName: 'Meal Planner',
      modelIcon: 'utensils',
      modelColor: '#059669',
      modelBg: '#ecfdf5',
      input: '“Tủ lạnh có: đậu hũ, nấm kim châm, cà chua, boa...”',
      userMeta: 'User: #USR-4412 • Chế độ: Thuần chay Vegan',
      output: 'Đậu hũ sốt cà chua nấm & Canh rong biển thanh ...',
      latency: '290ms',
      status: '200 OK',
      statusCode: '200',
      logLevel: 'INFO',
      statusColor: '#059669',
      statusBg: '#ecfdf5'
    },
    {
      id: 'REQ-98420',
      timestamp: '14:27:55.108',
      modelId: 'vision-extractor',
      modelName: 'Vision Extractor',
      modelIcon: 'camera',
      modelColor: '#ea580c',
      modelBg: '#fff7ed',
      input: '[Ảnh 1080x1920] Đĩa rau luộc sẫm màu có cọng ...',
      userMeta: 'User: #USR-8902 • Camera Upload',
      output: 'Phát hiện: Rau dền đỏ (78.5%) / Mồng tơi tím (6...',
      latency: '1,720ms',
      status: 'Drift Warn',
      statusCode: 'warn',
      logLevel: 'WARN',
      statusColor: '#ea580c',
      statusBg: '#fff7ed'
    },
    {
      id: 'REQ-98419',
      timestamp: '14:26:40.892',
      modelId: 'nutrition-chatbot',
      modelName: 'Nutrition Chatbot',
      modelIcon: 'message-square',
      modelColor: '#0891b2',
      modelBg: '#ecfeff',
      input: '“Tôi tập gym ăn chay thì bổ sung creatine và prot...”',
      userMeta: 'User: #USR-1029 • Chat Trực tiếp',
      output: 'Khuyên dùng đạm từ tempeh, pea protein kết hợ...',
      latency: '610ms',
      status: '200 OK',
      statusCode: '200',
      logLevel: 'INFO',
      statusColor: '#059669',
      statusBg: '#ecfdf5'
    },
    {
      id: 'REQ-98418',
      timestamp: '14:24:19.004',
      modelId: 'nlp-moderation',
      modelName: 'Moderation',
      modelIcon: 'shield',
      modelColor: '#dc2626',
      modelBg: '#fef2f2',
      input: '“Ăn kiêng 14 ngày chỉ uống nước ép để trị dứt điể...”',
      userMeta: 'Community Post #POST-5591',
      output: 'Tự động chặn: Thông tin y tế sai lệch nguy hại (H...',
      latency: '74ms',
      status: 'Blocked 403',
      statusCode: '403',
      logLevel: 'ERROR',
      statusColor: '#dc2626',
      statusBg: '#fef2f2'
    },
    {
      id: 'REQ-98417',
      timestamp: '14:22:05.612',
      modelId: 'vision-extractor',
      modelName: 'Vision Extractor',
      modelIcon: 'camera',
      modelColor: '#ea580c',
      modelBg: '#fff7ed',
      input: 'Video 45s: TikTok URL bóc tách quy trình nướng ...',
      userMeta: 'Crawler Hook #CRW-901',
      output: 'Trích xuất thành công 6 nguyên liệu & 4 bước nấu',
      latency: '2,150ms',
      status: '200 OK',
      statusCode: '200',
      logLevel: 'INFO',
      statusColor: '#059669',
      statusBg: '#ecfdf5'
    },
    {
      id: 'REQ-98416',
      timestamp: '14:20:02.155',
      modelId: 'meal-planner',
      modelName: 'Meal Planner',
      modelIcon: 'utensils',
      modelColor: '#059669',
      modelBg: '#ecfdf5',
      input: '“Tối ưu thực đơn chay giàu Sắt và Vitamin C cho mẹ bầu 3 tháng đầu...”',
      userMeta: 'User: #USR-3012 • Khảo sát Dinh dưỡng',
      output: 'Canh rau ngót đậu hũ non & Bông cải xanh áp chảo hạt điều',
      latency: '340ms',
      status: '200 OK',
      statusCode: '200',
      logLevel: 'INFO',
      statusColor: '#059669',
      statusBg: '#ecfdf5'
    }
  ]);

  // Handlers for MLOps operations
  const handleRunBenchmark = () => {
    setShowBenchmarkModal(true);
    setIsBenchmarking(true);
    setBenchmarkProgress(18);
    setTimeout(() => setBenchmarkProgress(52), 250);
    setTimeout(() => setBenchmarkProgress(86), 500);
    setTimeout(() => {
      setBenchmarkProgress(100);
      setIsBenchmarking(false);
      setBenchmarkResult({
        totalSamples: 1000,
        passRate: '99.8%',
        avgLatency: '418ms',
        p95Latency: '420ms',
        overallAccuracy: '98.6%',
        driftStatus: 'Đã kiểm soát (0.8% sai số)',
        timestamp: new Date().toLocaleTimeString('vi-VN')
      });
      showToast('🚀 Đã hoàn tất chạy benchmark đánh giá 1,000 requests. 4 cụm mô hình đều vượt chuẩn SLA!');
    }, 750);
  };

  const handleExportMLOpsReport = () => {
    try {
      const csvHeader = "Request_ID,Timestamp,Model,Input_Snippet,Output_Decision,Latency,Status,Log_Level\n";
      const csvRows = mlopsLogs.map(l => 
        `"${l.id}","${l.timestamp}","${l.modelName}","${l.input.replace(/"/g, '""')}","${l.output.replace(/"/g, '""')}","${l.latency}","${l.status}","${l.logLevel}"`
      ).join("\n");
      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `MLOps_Performance_Audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
    showToast('📥 Đã xuất báo cáo MLOps (MLOps_Performance_Audit.csv) thành công!');
  };

  const handleStartRetrain = () => {
    setIsRetraining(true);
    setTimeout(() => {
      setIsRetraining(false);
      setShowRetrainModal(false);
      setMlopsModels(prev => prev.map(m => m.id === 'vision-extractor' ? {
        ...m,
        badge: 'Tối ưu',
        badgeType: 'optimal',
        driftNote: null,
        metrics: m.metrics.map(met => met.label === 'Lệch nhận diện' ? { ...met, value: '0.4%', color: '#059669' } : met)
      } : m));
      showToast('⚡ Huấn luyện lại hoàn tất! Đã tích hợp 350 mẫu rau tiến vua, măng tây, nấm tuyết vào weight v2.4.');
    }, 1200);
  };

  const handleRunTestPrompt = () => {
    setIsTestingPrompt(true);
    setTimeout(() => {
      setIsTestingPrompt(false);
      if (testPromptModel === 'meal-planner') {
        setTestPromptResult({
          latency: '315ms',
          tokens: '840 tokens',
          decision: 'Quy hoạch tuyến tính PuLP: Đậu hũ sốt nấm đùi gà (18g Protein) + Canh cải thìa cà rốt (8g Protein) = 26g Protein thực vật, 440 kcal. Đạt chuẩn TDEE cá nhân hóa.',
          rawJson: '{"recipe": "Đậu hũ sốt nấm đùi gà", "protein_g": 26, "calories": 440, "tdee_match": 0.992}'
        });
      } else if (testPromptModel === 'vision-extractor') {
        setTestPromptResult({
          latency: '1.2s',
          tokens: 'N/A (YOLOv8 Bounding Boxes)',
          decision: 'Nhận diện thành công 4 nhãn: [Đậu hũ: 98.2%], [Nấm đùi gà: 96.5%], [Cải thìa: 97.1%], [Cà rốt: 99.4%]. Không phát hiện concept drift.',
          rawJson: '{"detected_objects": 4, "f1_score": 0.978, "drift_detected": false}'
        });
      } else if (testPromptModel === 'nutrition-chatbot') {
        setTestPromptResult({
          latency: '640ms',
          tokens: '320 tokens',
          decision: 'Tư vấn dinh dưỡng VeggieAI: Sự kết hợp đậu hũ và nấm đùi gà cung cấp đủ 9 axit amin thiết yếu. Khuyên dùng thêm mè rang hoặc hạt lanh để hấp thu tối đa kẽm và sắt tự nhiên.',
          rawJson: '{"hallucination_score": 0.001, "sentiment": "positive_informative", "rag_sources": ["Viện Dinh Dưỡng Quốc Gia"]}'
        });
      } else {
        setTestPromptResult({
          latency: '78ms',
          tokens: '60 tokens',
          decision: 'NLP Filter PASS: Nội dung an toàn, không chứa thông tin y tế sai lệch hay ngôn từ công kích.',
          rawJson: '{"toxic_prob": 0.002, "medical_misinfo": 0.001, "action": "ALLOW"}'
        });
      }
      showToast('🧪 Đã thực thi suy luận test prompt thành công!');
    }, 600);
  };

  const handleSaveThresholds = (e) => {
    if (e) e.preventDefault();
    setShowThresholdModal(false);
    showToast('✅ Đã cập nhật cấu hình ngưỡng SLA & cảnh báo MLOps thành công!');
  };

  const handleOpenSampleDialog = (modelId) => {
    setSampleDialogModel(modelId);
    setShowSampleDialogModal(true);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 7: CAN THIỆP THỦ CÔNG AI (MANUAL OVERRIDE)
  // =========================================================================
  const [overrideData, setOverrideData] = useState({
    recipeName: 'Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương',
    originalProtein: '12g (AI tính thiếu)',
    overrideProtein: '21g',
    originalCalories: '510 kcal',
    overrideCalories: '420 kcal',
    originalB12: '0.2 mcg (AI nhận nhầm)',
    overrideB12: '1.8 mcg',
    reason: 'Bổ sung hàm lượng protein và vi chất từ 150g nấm hương tươi hữu cơ'
  });

  const [overrideHistory, setOverrideHistory] = useState([
    { id: 'OVR-89', target: 'Thực đơn 7 ngày cho người tiểu đường', field: 'Lượng Đường Tự Nhiên', oldVal: '48g/ngày', newVal: '22g/ngày', admin: 'Admin', time: 'Hôm nay 14:20', status: 'Đã áp dụng' },
    { id: 'OVR-88', target: 'Món: Đậu Hũ Sốt Nấm Đông Cô', field: 'Hàm lượng Sắt Thực Vật', oldVal: '2.1 mg', newVal: '4.8 mg', admin: 'Admin', time: 'Hôm qua 09:15', status: 'Đã áp dụng' },
    { id: 'OVR-87', target: 'Nhận diện ảnh: Củ Dền Tươi', field: 'Nhãn YOLOv8', oldVal: 'Khoai lang tím (82%)', newVal: 'Củ dền đỏ (100%)', admin: 'Admin', time: '10/09/2026', status: 'Đã áp dụng' }
  ]);

  const handleApplyOverride = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `OVR-${overrideHistory.length + 90}`,
      target: overrideData.recipeName,
      field: `Protein (${overrideData.overrideProtein}) & Calories (${overrideData.overrideCalories})`,
      oldVal: `${overrideData.originalProtein}, ${overrideData.originalCalories}`,
      newVal: `${overrideData.overrideProtein}, ${overrideData.overrideCalories}`,
      admin: 'Admin',
      time: 'Vừa xong',
      status: 'Đã áp dụng'
    };
    setOverrideHistory([newRecord, ...overrideHistory]);
    showToast('🚀 Đã lưu và kích hoạt Ghi đè kết quả AI thành công vào Cơ sở Dữ liệu!');
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 8: NỘI DUNG BỊ AI GẮN CỜ (FLAGGED CONTENT REVIEW)
  // =========================================================================
  const [flaggedItems, setFlaggedItems] = useState([
    {
      id: 'FLG-401',
      title: 'Công thức Lẩu Thái Chay sử dụng Mật Ong Rừng & Dầu Hào Đậm Vị',
      author: 'NguyenThiL',
      type: 'Công thức nấu ăn',
      aiFlagReason: 'Chứa thành phần không thuần chay (Mật ong rừng & Dầu hào động vật)',
      confidence: '96.4%',
      riskLevel: 'high',
      snippet: 'Để nước lẩu thơm ngọt tự nhiên, các bạn nêm 2 muỗng dầu hào Maggi và 3 muỗng mật ong rừng nguyên chất thay cho đường cát...',
      status: 'pending'
    },
    {
      id: 'FLG-402',
      title: 'Tuyệt chiêu nhịn ăn 21 ngày chỉ uống nước lọc để chữa lành ung thư',
      author: 'DoctorThaoDuoc',
      type: 'Blog dinh dưỡng',
      aiFlagReason: 'Tuyên bố y khoa sai lệch nguy hiểm, thiếu kiểm chứng khoa học',
      confidence: '94.8%',
      riskLevel: 'critical',
      snippet: 'Tế bào ung thư sẽ chết đói nếu bạn hoàn toàn không ăn bất kỳ chất đạm hay tinh bột nào trong 21 ngày liên tiếp...',
      status: 'pending'
    },
    {
      id: 'FLG-403',
      title: 'Hướng dẫn làm Gelatin từ da heo để làm thạch dừa chay',
      author: 'HoangGiaCooking',
      type: 'Video hướng dẫn',
      aiFlagReason: 'Vi phạm nghiêm trọng định nghĩa món chay (Sử dụng da heo)',
      confidence: '99.1%',
      riskLevel: 'critical',
      snippet: 'Gelatin mua ngoài tiệm không rõ nguồn gốc, các bạn cứ ninh da heo lấy nước cốt để làm thạch rau câu chay cho thanh mát...',
      status: 'pending'
    },
    {
      id: 'FLG-404',
      title: 'Bổ sung Whey Protein cô đặc từ sữa bò cho người ăn thuần chay',
      author: 'GymVeganPro',
      type: 'Blog dinh dưỡng',
      aiFlagReason: 'Nhầm lẫn khái niệm Vegan (Thuần thực vật) với sản phẩm từ sữa bò',
      confidence: '88.5%',
      riskLevel: 'medium',
      snippet: 'Whey Protein Isolate chiết xuất từ sữa bò tươi nguyên chất là nguồn đạm tốt nhất cho anh em ăn chay trường muốn nở cơ...',
      status: 'pending'
    }
  ]);

  const handleFlagAction = (id, action) => {
    setFlaggedItems(prev => prev.filter(item => item.id !== id));
    if (action === 'dismiss') {
      showToast(`✅ Đã phê duyệt và bỏ cờ AI cho mục #${id} (Nhận diện nhầm - False Positive).`);
    } else if (action === 'remove') {
      showToast(`🚫 Đã xác nhận vi phạm và xóa vĩnh viễn nội dung #${id}.`);
    } else if (action === 'ban') {
      showToast(`🔒 Đã xóa nội dung #${id} và khóa tài khoản tác giả vi phạm nghiêm trọng!`);
    }
  };

  const pendingModerationCount = flaggedItems.length;

  return (
    <div className="admin-portal-wrapper">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#065f46',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          LEFT SIDEBAR (DARK OPS PORTAL) - 8 MÀN HÌNH CHUẨN CỦA ADMIN
          ========================================================================= */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          {/* BRAND LOGO */}
          <div className="admin-brand-header" onClick={() => onNavigate && onNavigate('home')} title="Về trang chủ">
            <span className="admin-brand-icon">🌱</span>
            <div>
              <div className="admin-brand-title">VeggieAI</div>
              <div className="admin-brand-sub">ADMIN PORTAL</div>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION: TỔNG QUAN DASHBOARD + 8 MÀN HÌNH QUẢN TRỊ */}
          <div className="admin-sidebar-menu">
            {/* NHÓM TỔNG QUAN HỆ THỐNG */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">ĐIỀU HÀNH &amp; TỔNG QUAN</div>

              {/* Tổng quan Dashboard */}
              <button 
                className={`admin-menu-link ${activeMenu === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveMenu('overview')}
              >
                <div className="admin-menu-link-inner">
                  <LayoutDashboard size={17} />
                  <span>Tổng quan Dashboard</span>
                </div>
              </button>
            </div>

            {/* NHÓM 1: HỆ THỐNG & NỘI DUNG (MỤC 1 -> 5) */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">HỆ THỐNG &amp; NỘI DUNG</div>

              {/* 1. Quản lý người dùng */}
              <button 
                className={`admin-menu-link ${activeMenu === 'users' ? 'active' : ''}`}
                onClick={() => setActiveMenu('users')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">1</span>
                  <Users size={16} />
                  <span>Quản lý người dùng</span>
                </div>
              </button>

              {/* 2. Quản lý blog & video */}
              <button 
                className={`admin-menu-link ${activeMenu === 'content' ? 'active' : ''}`}
                onClick={() => setActiveMenu('content')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">2</span>
                  <FileText size={16} />
                  <span>Quản lý blog & video</span>
                </div>
              </button>

              {/* 3. Quản lý bài viết/video */}
              <button 
                className={`admin-menu-link ${activeMenu === 'content-detail' ? 'active' : ''}`}
                onClick={() => setActiveMenu('content-detail')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">3</span>
                  <Edit3 size={16} />
                  <span>Quản lý bài viết/video</span>
                </div>
              </button>

              {/* 4. Quản lý bình luận */}
              <button 
                className={`admin-menu-link ${activeMenu === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveMenu('comments')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">4</span>
                  <MessageSquare size={16} />
                  <span>Quản lý bình luận</span>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#334155', color: '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                  {commentsList.length}
                </span>
              </button>

              {/* 5. Quản lý danh mục món ăn */}
              <button 
                className={`admin-menu-link ${activeMenu === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveMenu('categories')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">5</span>
                  <Layers size={16} />
                  <span>Quản lý danh mục món ăn</span>
                </div>
              </button>
            </div>

            {/* NHÓM 2: TRÍ TUỆ NHÂN TẠO (AI) (MỤC 6 -> 8) */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">GIÁM SÁT & VẬN HÀNH AI</div>

              {/* 6. Giám sát mô hình AI */}
              <button 
                className={`admin-menu-link ${activeMenu === 'ai-monitoring' ? 'active' : ''}`}
                onClick={() => setActiveMenu('ai-monitoring')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">6</span>
                  <Cpu size={16} />
                  <span>Giám sát mô hình AI</span>
                </div>
              </button>

              {/* 7. Can thiệp thủ công AI */}
              <button 
                className={`admin-menu-link ${activeMenu === 'ai-override' ? 'active' : ''}`}
                onClick={() => setActiveMenu('ai-override')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">7</span>
                  <Sliders size={16} />
                  <span>Can thiệp thủ công AI</span>
                </div>
              </button>

              {/* 8. Nội dung bị AI gắn cờ */}
              <button 
                className={`admin-menu-link ${activeMenu === 'ai-flagged' ? 'active' : ''}`}
                onClick={() => setActiveMenu('ai-flagged')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">8</span>
                  <ShieldAlert size={16} />
                  <span>Nội dung bị AI gắn cờ</span>
                </div>
                {pendingModerationCount > 0 && (
                  <span className="admin-menu-badge">{pendingModerationCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOOTER (ADMIN PROFILE & LOGOUT) */}
        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-user">
            <div className="admin-user-avatar">AD</div>
            <div>
              <div className="admin-user-name">Admin</div>
              <div className="admin-user-role">Quản trị viên</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button 
              className="admin-exit-btn" 
              onClick={() => onNavigate && onNavigate('home')} 
              title="Quay lại trang chủ người dùng"
            >
              <ExternalLink size={16} />
            </button>
            <button 
              className="admin-exit-btn" 
              onClick={() => { logout(); if (onNavigate) onNavigate('home'); }} 
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN CONTAINER & TOPBAR
          ========================================================================= */}
      <div className="admin-main-container">
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className="admin-breadcrumb-active">
              {activeMenu === 'overview' && 'Tổng quan Dashboard'}
              {activeMenu === 'users' && '1. Quản lý người dùng'}
              {activeMenu === 'content' && '2. Quản lý blog & video'}
              {activeMenu === 'content-detail' && '3. Quản lý bài viết/video'}
              {activeMenu === 'comments' && '4. Quản lý bình luận'}
              {activeMenu === 'categories' && '5. Quản lý danh mục món ăn'}
              {activeMenu === 'ai-monitoring' && '6. Giám sát mô hình AI (AI Monitoring)'}
              {activeMenu === 'ai-override' && '7. Can thiệp thủ công AI'}
              {activeMenu === 'ai-flagged' && '8. Nội dung bị AI gắn cờ (Flagged Content Review)'}
            </span>
          </div>

          <div className="admin-search-wrapper">
            <Search size={15} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input"
              placeholder="Tìm kiếm tài nguyên, mô hình AI, bài viết..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="admin-ctrl-k">⌘K</span>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status-pill">
              <span className="admin-status-dot"></span>
              <span>Cluster Live</span>
            </div>

            <button 
              className="admin-topbar-btn" 
              title="Thông báo hệ thống"
              onClick={() => showToast(`🔔 Thông báo: Có ${pendingModerationCount} nội dung bị AI gắn cờ chờ xử lý.`)}
            >
              <Bell size={17} />
              {pendingModerationCount > 0 && <span className="admin-bell-badge"></span>}
            </button>

            <div className="admin-profile-pill" onClick={() => showToast('Đang đăng nhập với quyền: Admin')}>
              <div className="admin-profile-avatar">AD</div>
              <span className="admin-profile-text">Admin</span>
            </div>
          </div>
        </header>

        {/* =========================================================================
            CONTENT BODY: 8 MÀN HÌNH CHI TIẾT
            ========================================================================= */}
        <main className="admin-content-body">

          {/* =====================================================================
              MÀN HÌNH TỔNG QUAN: EXECUTIVE DASHBOARD (OVERVIEW)
              TRUNG TÂM ĐIỀU HÀNH VEGGIEAI & GIÁM SÁT HỆ THỐNG
              TUÂN THỦ 100% PHẠM VI CAPSTONE:
              - ĐẦY ĐỦ KPI TỔNG QUAN, NFR SLA BENCHMARK, MODEL OPS
              - PHÍM TẮT TRUY CẬP NHANH 8 MÀN HÌNH QUẢN TRỊ
              - KHÔNG CÓ VIP / GÓI TRẢ PHÍ / MRR / VNPAY
              ===================================================================== */}
          {activeMenu === 'overview' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              {/* HERO BANNER */}
              <section className="admin-hero-banner">
                <div>
                  <div className="admin-capstone-tag">
                    <Sparkles size={13} />
                    <span>CAPSTONE ENGINEERING PORTAL • Cluster Live: HCM-DC01</span>
                  </div>
                  <h1 className="admin-hero-title">Trung tâm Điều hành VeggieAI &amp; Giám sát Hệ thống</h1>
                  <p className="admin-hero-desc">
                    Báo cáo thời gian thực về lưu lượng suy luận 5 mô hình AI, hiệu năng phi chức năng (NFR SLA ≤1.42s) và tình trạng kiểm duyệt toàn hệ thống.
                  </p>
                </div>

                <div className="admin-hero-actions">
                  <button 
                    className="admin-btn-outline"
                    onClick={() => showToast('📄 Đang xuất file báo cáo tổng quan VeggieAI Capstone (CSV/PDF)...')}
                  >
                    <Download size={16} />
                    <span>Xuất Báo Cáo</span>
                  </button>

                  <button 
                    className="admin-btn-primary"
                    onClick={() => showToast('⚡ Đã kiểm tra cụm AI: 5 mô hình hoạt động ổn định, SLA trung bình 1.42s đạt 100% NFR!')}
                  >
                    <RefreshCw size={16} />
                    <span>Quét Trạng Thái AI</span>
                  </button>
                </div>
              </section>

              {/* 4 KPI METRIC CARDS CHUẨN ĐỀ TÀI (KHÔNG CÓ VIP / BILLING) */}
              <section className="admin-kpi-grid">
                {/* Card 1: Thành viên hoạt động */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">THÀNH VIÊN HOẠT ĐỘNG</span>
                    <div className="admin-kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <Users size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-val-row">
                    <span className="admin-kpi-val">52,840</span>
                    <span className="admin-kpi-trend">↑ 12.5%</span>
                  </div>
                  <div className="admin-kpi-footer">
                    <span style={{ color: '#059669', fontWeight: 700 }}>Hồ sơ dinh dưỡng cá nhân hóa:</span> 41,250 hồ sơ (WF01)
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.74rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem' }}>
                    🌱 48.1K Authorized • 👤 4.7K Unauth • 🛡️ 14 Mod • 👑 1 Admin
                  </div>
                </div>

                {/* Card 2: Lưu lượng suy luận AI */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯU LƯỢNG SUY LUẬN AI</span>
                    <div className="admin-kpi-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
                      <Zap size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-val-row">
                    <span className="admin-kpi-val">184.2K</span>
                    <span className="admin-kpi-unit">lượt/ngày</span>
                  </div>
                  <div className="admin-kpi-footer" style={{ display: 'flex', gap: '0.65rem' }}>
                    <span>• Vision: <strong>46%</strong></span>
                    <span>• LLM: <strong>38%</strong></span>
                    <span>• Solver: <strong>16%</strong></span>
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.74rem', color: '#059669', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', fontWeight: 600 }}>
                    ● 100% Cụm GPU hoạt động liên tục không gián đoạn
                  </div>
                </div>

                {/* Card 3: Thời gian phản hồi TB (SLA) */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">THỜI GIAN PHẢN HỒI TB (SLA)</span>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                      PASS 100%
                    </span>
                  </div>
                  <div className="admin-kpi-val-row">
                    <span className="admin-kpi-val">1.42s</span>
                    <span className="admin-kpi-unit">NFR Benchmark</span>
                  </div>
                  <div className="admin-kpi-footer">
                    <span>Vision: <strong>2.1s</strong></span> • <span>PuLP Solver: <strong>1.85s &lt; 10s NFR</strong></span>
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.74rem', color: '#16a34a', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', fontWeight: 600 }}>
                    ✓ Đạt chuẩn 100% tiêu chí hiệu năng đánh giá đồ án
                  </div>
                </div>

                {/* Card 4: Hàng đợi cần xử lý */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">HÀNG ĐỢI CẦN XỬ LÝ</span>
                    <div className="admin-kpi-icon-box" style={{ background: '#ffedd5', color: '#c2410c' }}>
                      <Flag size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-val-row">
                    <span className="admin-kpi-val" style={{ color: '#ea580c' }}>
                      {pendingModerationCount + commentsList.filter(c => c.flagged).length}
                    </span>
                    <span className="admin-kpi-unit" style={{ color: '#c2410c', fontWeight: 700 }}>Cần can thiệp</span>
                  </div>
                  <div className="admin-kpi-footer" style={{ display: 'flex', gap: '0.85rem' }}>
                    <span>Bài viết gắn cờ: <strong>{pendingModerationCount}</strong></span>
                    <span style={{ color: '#dc2626' }}>Bình luận độc hại: <strong>{commentsList.filter(c => c.flagged).length}</strong></span>
                  </div>
                  <div style={{ marginTop: '0.45rem', fontSize: '0.74rem', color: '#d97706', borderTop: '1px dashed #e2e8f0', paddingTop: '0.4rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => setActiveMenu('ai-flagged')}>
                    Xem và giải quyết ngay &rarr;
                  </div>
                </div>
              </section>

              {/* LỐI TẮT TRUY CẬP NHANH 8 MÀN HÌNH QUẢN TRỊ */}
              <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      Danh Mục 8 Màn Hình Quản Trị Hệ Thống
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                      Nhấp trực tiếp vào màn hình bên dưới để chuyển nhanh đến phân hệ tác vụ tương ứng:
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                  {/* Shortcut 1 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('users')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>1</div>
                        <Users size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý người dùng</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Theo dõi 4 vai trò, hồ sơ dinh dưỡng WF01, khóa &amp; mở khóa tài khoản.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                      ● 52,840 người dùng (+142 hôm nay)
                    </div>
                  </div>

                  {/* Shortcut 2 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('content')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>2</div>
                        <FileText size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý blog &amp; video</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Toàn bộ bài viết dinh dưỡng, video ẩm thực và công thức nấu chay.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                      ● {contentList.length} bài viết &amp; công thức công khai
                    </div>
                  </div>

                  {/* Shortcut 3 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('content-detail')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>3</div>
                        <Edit3 size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý bài viết/video</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Soạn thảo WYSIWYG, chỉnh sửa thành phần dinh dưỡng và xuất bản.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>
                      ✎ Trình soạn thảo &amp; Xem trước trực quan
                    </div>
                  </div>

                  {/* Shortcut 4 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('comments')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>4</div>
                        <MessageSquare size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý bình luận</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Kiểm duyệt phản hồi cộng đồng, phát hiện từ khóa thô tục và spam.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: commentsList.some(c => c.flagged) ? '#dc2626' : '#047857' }}>
                      ● {commentsList.length} bình luận ({commentsList.filter(c => c.flagged).length} bị NLP gắn cờ)
                    </div>
                  </div>

                  {/* Shortcut 5 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('categories')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>5</div>
                        <Layers size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý danh mục món ăn</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Phân loại nhóm món chay: Thuần chay, Thực dưỡng, Giàu Protein, v.v.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                      ● 68 danh mục ẩm thực &amp; dinh dưỡng đã chuẩn hóa
                    </div>
                  </div>

                  {/* Shortcut 6 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('ai-monitoring')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>6</div>
                        <Cpu size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Giám sát mô hình AI</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Chi tiết thông lượng, độ trễ và độ chính xác 5 mô hình AI nòng cốt.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                      ⚡ 5/5 AI Engines Đạt chuẩn NFR SLA
                    </div>
                  </div>

                  {/* Shortcut 7 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('ai-override')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>7</div>
                        <Sliders size={18} color="#059669" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Can thiệp thủ công AI</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Quyền hạn Admin: Ghi đè kết quả mô hình, điều chỉnh vi chất, sửa khẩu phần.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>
                      🛠️ Quyền ghi đè tham số tối cao (Admin Override)
                    </div>
                  </div>

                  {/* Shortcut 8 */}
                  <div 
                    style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.15rem', cursor: 'pointer', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}
                    onClick={() => setActiveMenu('ai-flagged')}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>8</div>
                        <ShieldAlert size={18} color="#dc2626" />
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Nội dung bị AI gắn cờ</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Rà soát nghi vấn vi phạm tiêu chuẩn thuần chay, false positive và xóa bài.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>
                      ⚠️ {pendingModerationCount} nội dung đang chờ giải quyết
                    </div>
                  </div>
                </div>
              </section>

              {/* GIÁM SÁT 5 MÔ HÌNH AI NÒNG CỐT (MODEL OPS) */}
              <section style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>
                      Giám Sát Vận Hành 5 Mô Hình AI (Model Ops Overview)
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                      Chỉ số hiệu năng, độ trễ và độ chính xác thực tế của toàn bộ các tác vụ trí tuệ nhân tạo.
                    </p>
                  </div>
                  <button 
                    className="admin-btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                    onClick={() => setActiveMenu('ai-monitoring')}
                  >
                    Xem chi tiết Màn hình 6 &rarr;
                  </button>
                </div>

                <div className="admin-models-grid">
                  {/* Model 1: Computer Vision */}
                  <div className="admin-model-card">
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                          <Activity size={18} />
                        </div>
                        <span className="admin-model-name">Computer Vision</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                        Ổn định
                      </span>
                    </div>
                    <p className="admin-model-desc">Nhận diện rau củ &amp; độ tươi trong tủ lạnh</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ chính xác:</span>
                        <span className="admin-metric-val">96.4%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ trễ TB:</span>
                        <span className="admin-metric-val">2.1s</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Đã quét hôm nay:</span>
                        <span className="admin-metric-val">24,150 ảnh</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>v3.4 - YOLOv8-Custom</span>
                      <button className="admin-model-log-link" onClick={() => setActiveMenu('ai-monitoring')}>
                        Chi tiết &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 2: Recommendation Engine */}
                  <div className="admin-model-card">
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          <Sparkles size={18} />
                        </div>
                        <span className="admin-model-name">Recommendation</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                        Tối ưu
                      </span>
                    </div>
                    <p className="admin-model-desc">Đề xuất thực đơn Macro &amp; định vị ẩm thực</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ khớp dinh dưỡng:</span>
                        <span className="admin-metric-val">96.2%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Tỷ lệ CTR gợi ý:</span>
                        <span className="admin-metric-val">41.8%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Quy đổi bữa ăn:</span>
                        <span className="admin-metric-val">19,840 món</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>Graph-Collab-Filter</span>
                      <button className="admin-model-log-link" onClick={() => setActiveMenu('ai-monitoring')}>
                        Chi tiết &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 3: AI Meal Planner (PuLP Solver) */}
                  <div className="admin-model-card" style={{ borderColor: '#a7f3d0', boxShadow: '0 4px 12px rgba(5,150,105,0.08)' }}>
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                          <Utensils size={18} />
                        </div>
                        <span className="admin-model-name" style={{ color: '#047857' }}>AI Meal Planner</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#047857', color: '#ffffff' }}>
                        Cốt lõi
                      </span>
                    </div>
                    <p className="admin-model-desc">Tối ưu hóa thực đơn 7 ngày PuLP LP + GenAI</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Cân bằng Macro/Micro:</span>
                        <span className="admin-metric-val" style={{ color: '#047857' }}>98.6%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Thực đơn tạo/ngày:</span>
                        <span className="admin-metric-val">14,210</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ trễ TB (NFR ≤10s):</span>
                        <span className="admin-metric-val" style={{ color: '#16a34a' }}>1.85s (PASS)</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>PuLP Solver + GenAI</span>
                      <button className="admin-model-log-link" onClick={() => setActiveMenu('ai-monitoring')}>
                        Chi tiết &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 4: Nutrition Chatbot */}
                  <div className="admin-model-card">
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                          <Cpu size={18} />
                        </div>
                        <span className="admin-model-name">Nutrition Chatbot</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                        Tốt
                      </span>
                    </div>
                    <p className="admin-model-desc">Trợ lý cố vấn dinh dưỡng thuần chay tự nhiên</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Hài lòng người dùng:</span>
                        <span className="admin-metric-val">4.8 / 5.0</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Tổng phiên đối thoại:</span>
                        <span className="admin-metric-val">8,920</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Can thiệp Mod/Admin:</span>
                        <span className="admin-metric-val">Chỉ 0.4%</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>Fine-tuned LLM 8B</span>
                      <button className="admin-model-log-link" onClick={() => setActiveMenu('ai-monitoring')}>
                        Chi tiết &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 5: Video Summarizer */}
                  <div className="admin-model-card">
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>
                          <Video size={18} />
                        </div>
                        <span className="admin-model-name">Video Summarizer</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#fae8ff', color: '#a21caf' }}>
                        Tự động
                      </span>
                    </div>
                    <p className="admin-model-desc">Trích xuất công thức &amp; kiểm duyệt nguyên liệu</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ chính xác bóc tách:</span>
                        <span className="admin-metric-val">94.8%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Video đã xử lý:</span>
                        <span className="admin-metric-val">1,420 clips</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Tự động phát hiện non-vegan:</span>
                        <span className="admin-metric-val">100%</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>Whisper + Extractive NLP</span>
                      <button className="admin-model-log-link" onClick={() => setActiveMenu('ai-monitoring')}>
                        Chi tiết &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: 2-COLUMN OPERATIONAL GRID */}
              <section className="admin-workflow-grid">
                {/* LEFT COLUMN: HÀNG ĐỢI KIỂM DUYỆT CẤP BÁCH */}
                <div className="admin-mod-panel">
                  <div className="admin-sec-header" style={{ marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>•</span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Hàng Đợi Nội Dung Bị AI Gắn Cờ Cần Xử Lý
                      </h3>
                    </div>
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      {pendingModerationCount} Mục chờ duyệt
                    </span>
                  </div>

                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.45', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>🛡️ Quyền hạn Quyết định Tối cao của Admin:</strong> Phê duyệt giữ lại bài viết (nếu AI nhận diện nhầm) hoặc xóa bỏ và khóa tài khoản vi phạm.
                    </div>
                    <button 
                      style={{ background: 'white', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}
                      onClick={() => setActiveMenu('ai-flagged')}
                    >
                      Mở Màn hình 8 &gt;
                    </button>
                  </div>

                  {/* LIST 2 QUICK ITEMS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {flaggedItems.slice(0, 2).map((item) => (
                      <div key={item.id} style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '10px', padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#fee2e2', color: '#b91c1c', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                              {item.id}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Đăng bởi: <strong>{item.author}</strong></span>
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#d97706', fontWeight: 700 }}>AI Conf: {item.confidence}</span>
                        </div>
                        <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.95rem', color: '#0f172a' }}>{item.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#b91c1c', background: '#fef2f2', padding: '0.35rem 0.6rem', borderRadius: '6px', marginBottom: '0.75rem', fontWeight: 600 }}>
                          ⚠️ {item.aiFlagReason}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => handleFlagAction(item.id, 'dismiss')}
                          >
                            Phê Duyệt Giữ Lại
                          </button>
                          <button 
                            style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => handleFlagAction(item.id, 'remove')}
                          >
                            Xác Nhận Vi Phạm &amp; Gỡ Bài
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    style={{ width: '100%', marginTop: '1rem', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.65rem', borderRadius: '8px', color: '#047857', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                    onClick={() => setActiveMenu('ai-flagged')}
                  >
                    Xem toàn bộ {pendingModerationCount} nội dung bị AI gắn cờ (Màn hình 8) &rarr;
                  </button>
                </div>

                {/* RIGHT COLUMN: ANALYTICS & INSIGHT CARDS */}
                <div className="admin-side-cards">
                  {/* Card 1: Phân bổ Chế độ Ăn Chay */}
                  <div className="admin-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Phân bổ Chế độ Ăn Chay
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>52,840 tài khoản</span>
                    </div>

                    <div className="admin-donut-wrapper">
                      {/* SVG Donut Chart */}
                      <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#059669" strokeWidth="4" strokeDasharray="56.2 87.9" strokeDashoffset="0" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="21.1 87.9" strokeDashoffset="-56.2" />
                          <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10.5 87.9" strokeDashoffset="-77.3" />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>64%</div>
                          <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700 }}>Thuần chay</div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="admin-donut-legend">
                        <div className="admin-legend-item">
                          <span className="admin-legend-dot" style={{ background: '#059669' }}></span>
                          <span>Thuần chay (Vegan) <strong>64%</strong></span>
                        </div>
                        <div className="admin-legend-item">
                          <span className="admin-legend-dot" style={{ background: '#34d399' }}></span>
                          <span>Chay có trứng &amp; sữa <strong>24%</strong></span>
                        </div>
                        <div className="admin-legend-item">
                          <span className="admin-legend-dot" style={{ background: '#f59e0b' }}></span>
                          <span>Ăn chay linh hoạt (Flexi) <strong>12%</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Cân bằng Macro Trung bình Thực đơn AI */}
                  <div className="admin-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Cân Bằng Dinh Dưỡng Thực Đơn AI (PuLP Solver)
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>Đạt chuẩn NIN</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#475569' }}>🌾 Carbohydrates phức tạp (Tinh bột chậm)</span>
                          <strong style={{ color: '#0f172a' }}>55% (Chuẩn 50-60%)</strong>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '55%', height: '100%', background: '#059669', borderRadius: '3px' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#475569' }}>🌱 Protein thực vật hoàn chỉnh</span>
                          <strong style={{ color: '#0f172a' }}>20% (Chuẩn 15-25%)</strong>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '68%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                          <span style={{ color: '#475569' }}>🥑 Chất béo không bão hòa đơn/đa</span>
                          <strong style={{ color: '#0f172a' }}>25% (Chuẩn 20-30%)</strong>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '80%', height: '100%', background: '#f59e0b', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem', padding: '0.55rem 0.75rem', background: '#f8fafc', borderRadius: '6px', fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Hoàn tất khảo sát WF01:</span>
                      <strong style={{ color: '#047857' }}>91.2% người dùng</strong>
                    </div>
                  </div>
                </div>
              </section>
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 1: QUẢN LÝ NGƯỜI DÙNG (USERS MANAGEMENT)
              TUÂN THỦ 100% QUY ĐỊNH CAPSTONE:
              - KHÔNG CÓ VIP / GÓI TRẢ PHÍ / MRR / VNPAY / ĐIỂM UY TÍN
              - CỘT VAI TRÒ CHỈ CÓ 4 ACTORS: Authorized User / Unauthorized User / Mod / Admin
              - ĐẦY ĐỦ: Khóa hàng loạt, Đăng ký mới +142, Tạm khóa 18, AI Stats thật, Dinh dưỡng WF01
              ===================================================================== */}
          {activeMenu === 'users' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    1. Quản lý Người Dùng &amp; Phân Quyền Hệ Thống
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Theo dõi tài khoản 4 nhóm vai trò (Actors), giám sát hồ sơ dinh dưỡng cá nhân hóa và quản trị can thiệp khóa/mở khóa.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary" 
                  onClick={handleExportUsersCSV}
                  title="Xuất dữ liệu người dùng đúng chuẩn các trường nghiệp vụ"
                >
                  <Download size={15} /> Xuất Dữ Liệu User (CSV)
                </button>
              </div>

              {/* 4 STAT CARDS ĐÚNG CHUẨN NGHIỆP VỤ (KHÔNG CÓ VIP / BILLING) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TỔNG SỐ NGƯỜI DÙNG</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginTop: '0.2rem' }}>52,840</div>
                  <div style={{ fontSize: '0.76rem', color: '#059669', marginTop: '0.35rem', fontWeight: 600 }}>● 51,210 đang hoạt động (96.9%)</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>ĐĂNG KÝ MỚI HÔM NAY</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#059669', marginTop: '0.2rem' }}>+142</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '0.35rem' }}>Người dùng hoàn tất khảo sát dinh dưỡng</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TẠM KHÓA &amp; CẢNH BÁO</div>
                  <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#d97706', marginTop: '0.2rem' }}>18</div>
                  <div style={{ fontSize: '0.76rem', color: '#d97706', marginTop: '0.35rem', fontWeight: 600 }}>Cần rà soát vi phạm tiêu chuẩn cộng đồng</div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PHÂN BỔ VAI TRÒ (4 ACTORS)</div>
                  <div style={{ fontSize: '0.85rem', color: '#334155', marginTop: '0.5rem', lineHeight: 1.6 }}>
                    <div>🌱 <strong>Authorized User:</strong> 48,120</div>
                    <div>👤 <strong>Unauthorized User:</strong> 4,705</div>
                    <div>🛡️ <strong>Mod:</strong> 14 &nbsp;•&nbsp; 👑 <strong>Admin:</strong> 1</div>
                  </div>
                </div>
              </div>

              {/* FLOATING BULK ACTIONS BAR (KHI CÓ USER ĐƯỢC CHỌN) */}
              {selectedUserIds.length > 0 && (
                <div style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  animation: 'fadeIn 0.2s ease',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem', fontWeight: 700 }}>
                    <span>Đã chọn <strong style={{ color: '#34d399' }}>{selectedUserIds.length}</strong> tài khoản người dùng</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button
                      onClick={handleBulkLock}
                      style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Lock size={14} /> Khóa hàng loạt
                    </button>
                    <button
                      onClick={handleBulkUnlock}
                      style={{ background: '#059669', color: '#ffffff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Unlock size={14} /> Mở khóa hàng loạt
                    </button>
                    <button
                      onClick={handleBulkWarning}
                      style={{ background: '#d97706', color: '#ffffff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <AlertTriangle size={14} /> Gửi cảnh báo hàng loạt
                    </button>
                    <button
                      onClick={() => setSelectedUserIds([])}
                      style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '0.4rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              )}

              {/* MULTI-DIMENSIONAL FILTER BAR */}
              <div className="admin-filter-bar">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* BỘ LỌC VAI TRÒ (4 ACTORS) */}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>Vai trò:</span>
                  {[
                    { id: 'all', label: `Tất cả (${usersList.length})` },
                    { id: 'Authorized User', label: 'Authorized User' },
                    { id: 'Unauthorized User', label: 'Unauthorized User' },
                    { id: 'Mod', label: 'Mod' },
                    { id: 'Admin', label: 'Admin' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`admin-subtab-btn ${userRoleFilter === tab.id ? 'active' : ''}`}
                      onClick={() => setUserRoleFilter(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {/* BỘ LỌC TRẠNG THÁI */}
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', marginLeft: '0.5rem' }}>Trạng thái:</span>
                  <select
                    value={userStatusFilter}
                    onChange={(e) => setUserStatusFilter(e.target.value)}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="warning">Tạm khóa &amp; Cảnh báo</option>
                    <option value="locked">Bị khóa</option>
                  </select>

                  {/* BỘ LỌC CHẾ ĐỘ ĂN */}
                  <select
                    value={userDietFilter}
                    onChange={(e) => setUserDietFilter(e.target.value)}
                    style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="all">Tất cả trường phái ăn chay</option>
                    <option value="Thuần chay (Vegan)">Thuần chay (Vegan)</option>
                    <option value="Ăn chay linh hoạt (Flexi)">Ăn chay linh hoạt (Flexi)</option>
                    <option value="Chay thực dưỡng">Chay thực dưỡng</option>
                    <option value="Thuần chay (Lacto-ovo)">Lacto-Ovo</option>
                  </select>
                </div>

                <input 
                  type="text" 
                  className="admin-filter-input"
                  placeholder="Tìm theo tên, email, ID..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {/* USER DATA TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedUserIds.length === usersList.length && usersList.length > 0}
                          onChange={handleSelectAllUsers}
                        />
                      </th>
                      <th style={{ width: '20%' }}>THÀNH VIÊN</th>
                      <th style={{ width: '15%' }}>VAI TRÒ (4 ACTORS)</th>
                      <th style={{ width: '13%' }}>ĐIỂM UY TÍN (NLP)</th>
                      <th style={{ width: '16%' }}>CHẾ ĐỘ ĂN CHAY (WF01)</th>
                      <th style={{ width: '14%' }}>SỬ DỤNG TÍNH NĂNG AI THẬT</th>
                      <th style={{ width: '8%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => userRoleFilter === 'all' ? true : u.role === userRoleFilter)
                      .filter(u => userStatusFilter === 'all' ? true : u.status === userStatusFilter)
                      .filter(u => userDietFilter === 'all' ? true : u.diet.includes(userDietFilter))
                      .filter(u => {
                        if (!userSearch) return true;
                        const q = userSearch.toLowerCase();
                        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
                      })
                      .map(u => (
                        <tr key={u.id}>
                          <td>
                            <input 
                              type="checkbox"
                              checked={selectedUserIds.includes(u.id)}
                              onChange={() => handleSelectOneUser(u.id)}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong 
                                  style={{ color: '#0f172a', display: 'block', cursor: 'pointer' }}
                                  onClick={() => setSelectedUserDetail(u)}
                                  title="Bấm để xem hồ sơ chi tiết"
                                >
                                  {u.name}
                                </strong>
                                <small style={{ color: '#64748b' }}>{u.email}</small>
                              </div>
                            </div>
                          </td>

                          {/* CỘT VAI TRÒ CHỈ CÓ 4 ACTORS */}
                          <td>
                            <span style={{
                              padding: '0.25rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              background: 
                                u.role === 'Admin' ? '#fee2e2' :
                                u.role === 'Mod' ? '#fef3c7' :
                                u.role === 'Authorized User' ? '#ecfdf5' : '#f1f5f9',
                              color: 
                                u.role === 'Admin' ? '#b91c1c' :
                                u.role === 'Mod' ? '#b45309' :
                                u.role === 'Authorized User' ? '#047857' : '#475569'
                            }}>
                              {u.role === 'Admin' && '👑 Admin'}
                              {u.role === 'Mod' && '🛡️ Mod'}
                              {u.role === 'Authorized User' && '🌱 Authorized User'}
                              {u.role === 'Unauthorized User' && '👤 Unauthorized User'}
                            </span>
                          </td>

                          {/* ĐIỂM UY TÍN HỆ THỐNG */}
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                width: 'fit-content',
                                background: u.trustScore >= 80 ? '#ecfdf5' : (u.trustScore >= 50 ? '#fff7ed' : '#fee2e2'),
                                color: u.trustScore >= 80 ? '#047857' : (u.trustScore >= 50 ? '#c2410c' : '#b91c1c')
                              }}>
                                <ShieldCheck size={12} /> {u.trustScore}/100
                              </span>
                              <small style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                {u.trustTier}
                              </small>
                            </div>
                          </td>

                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#334155' }}>{u.diet}</span>
                          </td>

                          {/* SỐ LIỆU TÍNH NĂNG AI THẬT (WF02/04/05) */}
                          <td>
                            <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                              <div>🥗 <strong>{u.aiMealPlans}</strong> thực đơn AI</div>
                              <div>📸 <strong>{u.aiVisionScans}</strong> quét tủ lạnh • 💬 <strong>{u.aiChatbotQueries}</strong> chatbot</div>
                            </div>
                          </td>

                          <td>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: u.status === 'active' ? '#ecfdf5' : u.status === 'warning' ? '#fef3c7' : '#fee2e2',
                              color: u.status === 'active' ? '#047857' : u.status === 'warning' ? '#b45309' : '#b91c1c'
                            }}>
                              {u.status === 'active' ? '● Hoạt động' : u.status === 'warning' ? '⚠️ Cần rà soát' : '🔒 Đã khóa'}
                            </span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                              <button
                                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                                onClick={() => setSelectedUserDetail(u)}
                                title="Xem hồ sơ chi tiết, số liệu AI và chỉ số dinh dưỡng"
                              >
                                Chi tiết
                              </button>

                              <button
                                style={{
                                  background: u.status === 'locked' ? '#ecfdf5' : '#fee2e2',
                                  border: '1px solid',
                                  borderColor: u.status === 'locked' ? '#a7f3d0' : '#fca5a5',
                                  color: u.status === 'locked' ? '#047857' : '#b91c1c',
                                  padding: '0.3rem 0.55rem',
                                  borderRadius: '6px',
                                  fontSize: '0.74rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleToggleUserLock(u.id)}
                              >
                                {u.status === 'locked' ? 'Mở khóa' : 'Khóa'}
                              </button>

                              <button
                                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#475569', padding: '0.3rem 0.55rem', borderRadius: '6px', fontSize: '0.74rem', cursor: 'pointer' }}
                                onClick={() => handleSendWarning(u.name)}
                                title="Gửi cảnh báo vi phạm"
                              >
                                Cảnh báo
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* =====================================================================
                  MODAL HỒ SƠ CHI TIẾT NGƯỜI DÙNG (USER PROFILE DETAIL MODAL)
                  CHUẨN HÓA 100% THEO ĐÚNG ĐẶC TẢ CAPSTONE:
                  - BỎ HOÀN TOÀN: VIP, Gói dịch vụ, Cổng VNPay, Điểm uy tín 100/100, Tặng 14 ngày VIP
                  - CÓ ĐỦ: Hồ sơ dinh dưỡng WF01 (BMI, Calo, Vi chất B12/Sắt, Dị ứng), 
                           Số liệu AI thật WF02/04/05 (84 thực đơn, 32 tủ lạnh, 140 chatbot)
                  ===================================================================== */}
              {selectedUserDetail && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1.5rem'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    maxWidth: '680px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '2rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                    position: 'relative',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <button
                      onClick={() => setSelectedUserDetail(null)}
                      style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        background: '#f1f5f9',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={18} color="#64748b" />
                    </button>

                    {/* HEADER MODAL */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                        {selectedUserDetail.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                          {selectedUserDetail.name}
                        </h2>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Mã ID: <strong>{selectedUserDetail.id}</strong> • Email: {selectedUserDetail.email}
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: 
                            selectedUserDetail.role === 'Admin' ? '#fee2e2' :
                            selectedUserDetail.role === 'Mod' ? '#fef3c7' :
                            selectedUserDetail.role === 'Authorized User' ? '#ecfdf5' : '#f1f5f9',
                          color: 
                            selectedUserDetail.role === 'Admin' ? '#b91c1c' :
                            selectedUserDetail.role === 'Mod' ? '#b45309' :
                            selectedUserDetail.role === 'Authorized User' ? '#047857' : '#475569'
                        }}>
                          {selectedUserDetail.role}
                        </span>
                        <span style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          background: selectedUserDetail.status === 'active' ? '#ecfdf5' : selectedUserDetail.status === 'warning' ? '#fef3c7' : '#fee2e2',
                          color: selectedUserDetail.status === 'active' ? '#047857' : selectedUserDetail.status === 'warning' ? '#b45309' : '#b91c1c'
                        }}>
                          {selectedUserDetail.status === 'active' ? '● Hoạt động' : selectedUserDetail.status === 'warning' ? '⚠️ Cần rà soát' : '🔒 Bị khóa'}
                        </span>
                      </div>
                    </div>

                    {/* PHẦN 1: ĐIỂM UY TÍN HỆ THỐNG & ĐỊNH TUYẾN KIỂM DUYỆT BÌNH LUẬN */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#047857', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <ShieldCheck size={16} color="#059669" /> Điểm Uy Tín Hệ Thống &amp; Định Tuyến Kiểm Duyệt
                        </h4>
                        <span style={{
                          background: selectedUserDetail.trustScore >= 80 ? '#dcfce7' : (selectedUserDetail.trustScore >= 50 ? '#ffedd5' : '#fee2e2'),
                          color: selectedUserDetail.trustScore >= 80 ? '#15803d' : (selectedUserDetail.trustScore >= 50 ? '#c2410c' : '#b91c1c'),
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '8px'
                        }}>
                          {selectedUserDetail.trustScore}/100 &bull; {selectedUserDetail.trustTier}
                        </span>
                      </div>

                      <p style={{ margin: '0 0 0.65rem 0', fontSize: '0.8rem', color: '#166534', lineHeight: 1.5 }}>
                        <strong>Mục đích nghiệp vụ:</strong> Tín hiệu phân loại độ tin cậy để tự động định tuyến kiểm duyệt bình luận và bài viết (WF07 &amp; WF09). Thành viên uy tín thấp (&lt; 50) sẽ tự động bị chuyển vào hàng đợi kiểm duyệt trước khi hiển thị cho cộng đồng.
                      </p>

                      <div style={{ background: '#ffffff', border: '1px solid #dcfce7', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.76rem', color: '#475569', lineHeight: 1.55 }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>Công thức tính điểm minh bạch (Transparency Algorithm):</div>
                        <div>&bull; <strong>Điểm khởi tạo:</strong> 100/100 khi kích hoạt tài khoản.</div>
                        <div>&bull; <strong>Trừ điểm vi phạm:</strong> -35 điểm/lần vi phạm sai lệch y khoa nghiêm trọng; -20 điểm/lần spam quảng cáo; -15 điểm/lần ngôn từ công kích thô tục.</div>
                        <div>&bull; <strong>Cộng điểm thâm niên &amp; an toàn:</strong> +5 điểm cho mỗi 30 ngày tham gia không phát sinh vi phạm (tối đa 100).</div>
                      </div>
                    </div>

                    {/* PHẦN 2: HỒ SƠ DINH DƯỠNG CÁ NHÂN HÓA (WF01) */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        🥗 Hồ Sơ Dinh Dưỡng Cá Nhân Hóa (Khớp WF01)
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.84rem' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Trường phái ẩm thực:</span>
                          <strong style={{ display: 'block', color: '#0f172a', marginTop: '0.15rem' }}>{selectedUserDetail.diet}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Chỉ số thể trạng:</span>
                          <strong style={{ display: 'block', color: '#0f172a', marginTop: '0.15rem' }}>
                            {selectedUserDetail.height} • {selectedUserDetail.weight} • BMI: {selectedUserDetail.bmi}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Năng lượng khuyến nghị:</span>
                          <strong style={{ display: 'block', color: '#059669', marginTop: '0.15rem' }}>{selectedUserDetail.targetCalories}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Vi chất trọng tâm cần tối ưu:</span>
                          <strong style={{ display: 'block', color: '#0f172a', marginTop: '0.15rem' }}>{selectedUserDetail.keyNutrients}</strong>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: '#64748b' }}>Dị ứng thực phẩm &amp; Kiêng kỵ:</span>
                          <strong style={{ display: 'block', color: '#b91c1c', marginTop: '0.15rem' }}>{selectedUserDetail.allergies}</strong>
                        </div>
                      </div>
                    </div>

                    {/* PHẦN 2: SỐ LIỆU SỬ DỤNG TÍNH NĂNG AI THẬT (WF02/WF04/WF05) */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        ⚡ Thống Kê Sử Dụng Tính Năng AI Thật
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#059669' }}>{selectedUserDetail.aiMealPlans}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', marginTop: '0.2rem' }}>Tạo Thực Đơn AI</div>
                          <div style={{ fontSize: '0.68rem', color: '#059669' }}>(PuLP + GenAI - WF02)</div>
                        </div>

                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>{selectedUserDetail.aiVisionScans}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', marginTop: '0.2rem' }}>Quét Tủ Lạnh</div>
                          <div style={{ fontSize: '0.68rem', color: '#2563eb' }}>(YOLOv8 Vision - WF04)</div>
                        </div>

                        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.85rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d97706' }}>{selectedUserDetail.aiChatbotQueries}</div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309', marginTop: '0.2rem' }}>Hỏi Đáp Chatbot</div>
                          <div style={{ fontSize: '0.68rem', color: '#d97706' }}>(RAG Nutrition - WF05)</div>
                        </div>
                      </div>
                    </div>

                    {/* PHẦN 3: NHẬT KÝ HOẠT ĐỘNG GẦN ĐÂY */}
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.6rem 0', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        🕒 Nhật Ký Hoạt Động Gần Đây (Audit Trail)
                      </h4>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
                        {selectedUserDetail.recentActivities.map((act, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', color: '#475569', padding: '0.35rem 0', borderBottom: i < selectedUserDetail.recentActivities.length - 1 ? '1px dashed #e2e8f0' : 'none' }}>
                            • {act}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FOOTER ACTIONS */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          style={{
                            background: selectedUserDetail.status === 'locked' ? '#ecfdf5' : '#fee2e2',
                            border: '1px solid',
                            borderColor: selectedUserDetail.status === 'locked' ? '#a7f3d0' : '#fca5a5',
                            color: selectedUserDetail.status === 'locked' ? '#047857' : '#b91c1c',
                            padding: '0.55rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleToggleUserLock(selectedUserDetail.id)}
                        >
                          {selectedUserDetail.status === 'locked' ? '🔓 Mở Khóa Tài Khoản' : '🔒 Khóa Tài Khoản Này'}
                        </button>

                        <button
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => handleSendWarning(selectedUserDetail.name)}
                        >
                          Gửi Cảnh Báo
                        </button>

                        <button
                          style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => handleResetPassword(selectedUserDetail.name)}
                        >
                          Reset Mật Khẩu
                        </button>
                      </div>

                      <button
                        style={{ background: '#0f172a', color: '#ffffff', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => setSelectedUserDetail(null)}
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 2: QUẢN LÝ BLOG & VIDEO
              ===================================================================== */}
          {/* =====================================================================
              MÀN HÌNH 2: QUẢN LÝ BLOG & VIDEO NẤU ĂN
              CHUẨN 100% THEO GIAO DIỆN HÌNH ẢNH THIẾT KẾ:
              - 4 THẺ CHỈ SỐ: Tổng nội dung, Video bóc tách AI, Kiểm định Y khoa, Gắn cờ
              - HỆ THỐNG PILLS TAB LỌC (Tất cả, Blog, Video, Y khoa, Chờ bóc tách, Nháp & Ẩn)
              - THANH TÌM KIẾM & 4 BỘ LỌC DROPDOWN (Thể loại, Nguồn, Trạng thái AI, Kiểm định)
              - THANH BULK ACTIONS: Gắn nhãn, Trích xuất AI lại, Ẩn, Xóa
              - BẢNG NỘI DUNG CHI TIẾT: Thumbnail video/blog, Tác giả xác minh, Bóc tách AI, Tương tác
              - PHÂN TRANG: Hiển thị 10 / 14,820 nội dung
              ===================================================================== */}
          {activeMenu === 'content' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              {/* HEADER ROW */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    Quản lý Blog &amp; Video Nấu Ăn
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0, maxWidth: '840px', lineHeight: '1.5' }}>
                    Quản lý toàn bộ 14.820 bài viết cẩm nang dinh dưỡng chay và video nấu ăn bóc tách công thức tự động bởi AI trên hệ sinh thái VeggieAI.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    className="admin-btn-outline" 
                    onClick={handleExportContentCSV}
                    title="Xuất dữ liệu toàn bộ blog và video ra file CSV"
                  >
                    <Download size={15} /> Xuất CSV
                  </button>

                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onClick={() => setShowSyncModal(true)}
                    title="Công cụ nội bộ Admin bulk-import video vào kho hệ thống (khác với WF11 User dán link)"
                  >
                    <RotateCcw size={15} color="#2563eb" /> Nhập liệu Video AI (Admin Import)
                  </button>

                  <button 
                    className="admin-btn-primary"
                    onClick={() => {
                      const newBlank = {
                        id: `POST-0${contentList.length + 1}`,
                        title: 'Bài viết dinh dưỡng mới chưa đặt tên',
                        type: 'Blog',
                        typeLabel: 'Blog Dinh Dưỡng',
                        category: 'Cẩm nang Ăn Chay',
                        author: 'Admin',
                        authorAvatar: 'AD',
                        authorAvatarBg: '#059669',
                        authorRole: 'Authorized User',
                        authorVerified: true,
                        source: 'VeggieAI Editorial',
                        views: '0 lượt xem',
                        saved: '0 lưu',
                        rating: '5.0 (0)',
                        status: 'Bản nháp',
                        date: 'Hôm nay',
                        mediaUrl: '',
                        thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
                        duration: null,
                        readTime: '3 phút đọc',
                        tags: ['Mới'],
                        warningTag: null,
                        aiMatch: 'Chờ phân tích',
                        aiDetails: 'Đang chuẩn bị mô hình',
                        macro: 'Chưa bóc tách calo',
                        aiStatus: 'pending',
                        isFlagged: false,
                        verifiedMod: true,
                        content: 'Nhập nội dung bài viết chia sẻ kiến thức dinh dưỡng chay tại đây...',
                        ingredients: ['Nguyên liệu mẫu 1']
                      };
                      setContentList([newBlank, ...contentList]);
                      handleEditContent(newBlank);
                    }}
                  >
                    <Plus size={16} /> Thêm bài viết / video
                  </button>
                </div>
              </div>

              {/* 4 STATS CARDS CHUẨN XÁC THEO HÌNH ẢNH */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.15rem', marginBottom: '1.5rem' }}>
                {/* Card 1: Tổng nội dung hệ thống */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Layers size={20} />
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      ↗ +8.6%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>TỔNG NỘI DUNG HỆ THỐNG</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                    14,820 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>mục</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.76rem', color: '#475569', marginTop: '0.45rem', borderTop: '1px dashed #f1f5f9', paddingTop: '0.45rem' }}>
                    <span><strong style={{ color: '#0f172a' }}>● 9,460</strong> Blog</span>
                    <span><strong style={{ color: '#ea580c' }}>● 5,370</strong> Video</span>
                  </div>
                </div>

                {/* Card 2: Video bóc tách AI thành công */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Cpu size={20} />
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      97.0% Tự động
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>VIDEO BÓC TÁCH AI THÀNH CÔNG</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                    5,210 <span style={{ fontSize: '1.05rem', color: '#94a3b8', fontWeight: 500 }}>/ 5,370</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#059669', marginTop: '0.45rem', borderTop: '1px dashed #f1f5f9', paddingTop: '0.45rem', fontWeight: 600 }}>
                    Đạt chuẩn calo, gia vị &amp; định lượng (WF11)
                  </div>
                </div>

                {/* Card 3: Nội dung đã phê duyệt (Mod Tuyến 1) */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      Đã duyệt Public (WF07)
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NỘI DUNG ĐÃ PHÊ DUYỆT (MOD)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                    8,940 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>bài duyệt</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#059669', marginTop: '0.45rem', borderTop: '1px dashed #f1f5f9', paddingTop: '0.45rem', fontWeight: 600 }}>
                    ✓ Phê duyệt hiển thị bởi Moderator (WF07)
                  </div>
                </div>

                {/* Card 4: Nội dung gắn cờ rà soát */}
                <div style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(220,38,38,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flag size={20} />
                    </div>
                    <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '0.74rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      Cần xử lý
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NỘI DUNG GẮN CỜ RÀ SOÁT</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: '#dc2626', margin: '0.2rem 0' }}>
                    24 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>bài/video</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#b91c1c', marginTop: '0.45rem', borderTop: '1px dashed #fee2e2', paddingTop: '0.45rem', fontWeight: 600 }}>
                    ⚠️ Nghi vấn sai lệch dinh dưỡng &amp; thuần chay (WF09)
                  </div>
                </div>
              </div>

              {/* TABS LỌC (SUBTABS PILLS) */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.15rem', flexWrap: 'wrap' }}>
                <button 
                  style={{
                    background: contentTab === 'all' ? '#047857' : '#ffffff',
                    color: contentTab === 'all' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'all' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('all')}
                >
                  Tất cả (14,820)
                </button>

                <button 
                  style={{
                    background: contentTab === 'blog' ? '#047857' : '#ffffff',
                    color: contentTab === 'blog' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'blog' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('blog')}
                >
                  Bài viết Blog (9,450)
                </button>

                <button 
                  style={{
                    background: contentTab === 'video' ? '#047857' : '#ffffff',
                    color: contentTab === 'video' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'video' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('video')}
                >
                  Video Nấu Ăn (5,370)
                </button>

                <button 
                  style={{
                    background: contentTab === 'verified' ? '#047857' : '#ffffff',
                    color: contentTab === 'verified' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'verified' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('verified')}
                >
                  Đã duyệt Public (8,940)
                </button>

                <button 
                  style={{
                    background: contentTab === 'pending_ai' ? '#047857' : '#ffffff',
                    color: contentTab === 'pending_ai' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'pending_ai' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('pending_ai')}
                >
                  <span>Chờ AI bóc tách</span>
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '10px' }}>48</span>
                </button>

                <button 
                  style={{
                    background: contentTab === 'draft' ? '#047857' : '#ffffff',
                    color: contentTab === 'draft' ? '#ffffff' : '#475569',
                    border: '1px solid',
                    borderColor: contentTab === 'draft' ? '#047857' : '#e2e8f0',
                    padding: '0.45rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                  onClick={() => setContentTab('draft')}
                >
                  Nháp &amp; Ẩn (112)
                </button>
              </div>

              {/* SEARCH & SELECT FILTERS ROW */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* SEARCH INPUT */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.65rem 1rem 0.65rem 2.4rem',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none'
                    }}
                    placeholder="Tìm theo tiêu đề, tác giả, nguyên liệu..." 
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                  />
                </div>

                {/* 4 DROPDOWNS & RESET BUTTON */}
                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    value={contentCategoryFilter}
                    onChange={(e) => setContentCategoryFilter(e.target.value)}
                  >
                    <option value="all">Thể loại: Tất cả</option>
                    <option value="Chay Thuần Vegan">Chay Thuần Vegan</option>
                    <option value="Cẩm nang Y khoa">Cẩm nang Dinh Dưỡng</option>
                    <option value="Món Ăn Vặt & Chiên">Món Ăn Vặt &amp; Chiên</option>
                    <option value="Dinh Dưỡng Thể Thao">Dinh Dưỡng Thể Thao</option>
                    <option value="Chay Thực Dưỡng">Chay Thực Dưỡng</option>
                    <option value="Món Nước Truyền Thống">Món Nước Truyền Thống</option>
                  </select>

                  <select 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    value={contentSourceFilter}
                    onChange={(e) => setContentSourceFilter(e.target.value)}
                  >
                    <option value="all">Nguồn: Tất cả kênh</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="VeggieAI Editorial">VeggieAI Editorial</option>
                    <option value="Authorized User">Thành viên cộng đồng</option>
                  </select>

                  <select 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    value={contentAiStatusFilter}
                    onChange={(e) => setContentAiStatusFilter(e.target.value)}
                  >
                    <option value="all">Trạng thái AI: Tất cả</option>
                    <option value="extracted">Đã bóc tách thành công</option>
                    <option value="warning">Nghi vấn sai lệch / Cảnh báo</option>
                  </select>

                  <select 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.82rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    value={contentVerifyFilter}
                    onChange={(e) => setContentVerifyFilter(e.target.value)}
                  >
                    <option value="all">Kiểm duyệt (WF07): Tất cả</option>
                    <option value="verified">Đã duyệt Public (Mod)</option>
                    <option value="unverified">Chờ duyệt / Cần rà soát</option>
                  </select>

                  <button 
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.65rem' }}
                    onClick={() => {
                      setContentSearch('');
                      setContentTab('all');
                      setContentCategoryFilter('all');
                      setContentSourceFilter('all');
                      setContentAiStatusFilter('all');
                      setContentVerifyFilter('all');
                    }}
                  >
                    <RotateCcw size={14} /> Đặt lại bộ lọc
                  </button>
                </div>
              </div>


              {/* FLOATING BULK ACTIONS BAR (KHI CÓ ITEMS ĐƯỢC CHỌN) */}
              {selectedContentIds.length > 0 && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                    Đã chọn: <strong style={{ color: '#047857' }}>{selectedContentIds.length}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button 
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleBulkTag}
                    >
                      <Tag size={13} /> Gắn nhãn
                    </button>

                    <button 
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleBulkReExtractAI}
                    >
                      <Zap size={13} color="#059669" /> Trích xuất AI lại
                    </button>

                    <button 
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                      onClick={handleBulkHide}
                    >
                      <Eye size={13} /> Ẩn
                    </button>

                    <button 
                      style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '0.4rem 0.65rem', color: '#b91c1c', cursor: 'pointer' }}
                      onClick={handleBulkDeleteContent}
                      title="Xóa nội dung đã chọn"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* DATA TABLE CHUẨN XÁC THEO HÌNH ẢNH */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '4%', textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedContentIds.length === contentList.length && contentList.length > 0}
                          onChange={handleSelectAllContent}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#047857' }}
                        />
                      </th>
                      <th style={{ width: '40%' }}>NỘI DUNG &amp; HÌNH ẢNH</th>
                      <th style={{ width: '22%' }}>TÁC GIẢ / NGUỒN</th>
                      <th style={{ width: '22%' }}>BÓC TÁCH AI (CÔNG THỨC &amp; MACRO)</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>TƯƠNG TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentList
                      .filter(c => {
                        if (contentTab === 'blog') return c.type === 'Blog';
                        if (contentTab === 'video') return c.type === 'Video';
                        if (contentTab === 'verified') return c.verifiedMod;
                        if (contentTab === 'pending_ai') return c.aiStatus === 'warning' || c.aiStatus === 'pending';
                        if (contentTab === 'draft') return c.status !== 'Đã xuất bản';
                        return true;
                      })
                      .filter(c => {
                        if (contentCategoryFilter !== 'all' && c.category !== contentCategoryFilter) return false;
                        if (contentSourceFilter !== 'all' && c.source !== contentSourceFilter) return false;
                        if (contentAiStatusFilter !== 'all' && c.aiStatus !== contentAiStatusFilter) return false;
                        if (contentVerifyFilter === 'verified' && !c.verifiedMod) return false;
                        if (contentVerifyFilter === 'unverified' && c.verifiedMod) return false;
                        if (!contentSearch) return true;
                        const s = contentSearch.toLowerCase();
                        return c.title.toLowerCase().includes(s) || 
                               c.author.toLowerCase().includes(s) || 
                               (c.ingredients && c.ingredients.some(i => i.toLowerCase().includes(s))) ||
                               (c.tags && c.tags.some(t => t.toLowerCase().includes(s)));
                      })
                      .map((item) => (
                        <tr 
                          key={item.id}
                          style={{ 
                            background: selectedContentIds.includes(item.id) ? '#f0fdf4' : 'transparent',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          {/* CHECKBOX */}
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedContentIds.includes(item.id)}
                              onChange={() => handleSelectOneContent(item.id)}
                              style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#047857' }}
                            />
                          </td>

                          {/* CỘT 1: NỘI DUNG & HÌNH ẢNH */}
                          <td>
                            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                              {/* THUMBNAIL BOX */}
                              <div 
                                style={{ 
                                  position: 'relative', 
                                  width: '96px', 
                                  height: '62px', 
                                  borderRadius: '8px', 
                                  overflow: 'hidden', 
                                  flexShrink: 0,
                                  background: '#0f172a',
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                }}
                                onClick={() => handleEditContent(item)}
                              >
                                <img 
                                  src={item.thumbnail} 
                                  alt={item.title} 
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                {item.type === 'Video' ? (
                                  <>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Play size={11} color="#0f172a" fill="#0f172a" style={{ marginLeft: '1px' }} />
                                      </div>
                                    </div>
                                    <span style={{ position: 'absolute', right: '4px', bottom: '4px', background: 'rgba(0,0,0,0.75)', color: '#ffffff', fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                      {item.duration || '03:15'}
                                    </span>
                                  </>
                                ) : (
                                  <span style={{ position: 'absolute', right: '4px', bottom: '4px', background: 'rgba(15,23,42,0.85)', color: '#34d399', fontSize: '0.62rem', fontWeight: 700, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                                    {item.readTime || '5 phút đọc'}
                                  </span>
                                )}
                              </div>

                              {/* TITLE & META */}
                              <div style={{ flex: 1 }}>
                                <div 
                                  style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem', lineHeight: '1.35', cursor: 'pointer' }}
                                  onClick={() => handleEditContent(item)}
                                  title="Nhấp để xem và sửa chi tiết ở Màn hình 3"
                                >
                                  {item.title}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: '#64748b', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                  <strong style={{ color: '#475569' }}>{item.id}</strong>
                                  <span>•</span>
                                  <span style={{ color: '#059669', fontWeight: 600 }}>{item.category}</span>
                                  <span>•</span>
                                  <span>{item.date}</span>
                                </div>

                                {/* TAG PILLS */}
                                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  {item.tags && item.tags.map((tg, i) => (
                                    <span key={i} style={{ background: '#f0f9ff', color: '#0369a1', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                      {tg}
                                    </span>
                                  ))}
                                  {item.warningTag && (
                                    <span style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.68rem', fontWeight: 700, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                                      {item.warningTag}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CỘT 2: TÁC GIẢ / NGUỒN (CHỈ DÙNG 4 ACTORS: AUTHORIZED USER + BADGE ĐÃ XÁC MINH) */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ 
                                width: '34px', 
                                height: '34px', 
                                borderRadius: '50%', 
                                background: item.authorAvatarBg || '#047857', 
                                color: '#ffffff', 
                                fontWeight: 800, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '0.75rem',
                                flexShrink: 0
                              }}>
                                {item.authorAvatar}
                              </div>

                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                                  <strong style={{ fontSize: '0.84rem', color: '#0f172a' }}>{item.author}</strong>
                                  {item.authorVerified && (
                                    <span title="Đã xác minh chuyên môn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#059669', fontSize: '0.7rem', fontWeight: 700 }}>
                                      <CheckCircle2 size={12} color="#059669" /> Đã xác minh
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.1rem' }}>
                                  {item.authorRole || 'Authorized User'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* CỘT 3: BÓC TÁCH AI (CÔNG THỨC & MACRO) */}
                          <td>
                            <div>
                              {/* BADGE BÓC TÁCH */}
                              <div style={{ marginBottom: '0.3rem' }}>
                                {item.aiStatus === 'warning' ? (
                                  <span style={{ background: '#fefce8', border: '1px solid #fef08a', color: '#a16207', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <AlertTriangle size={12} /> {item.aiMatch}
                                  </span>
                                ) : (
                                  <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Zap size={11} /> {item.aiMatch}
                                  </span>
                                )}
                              </div>

                              <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginBottom: '0.15rem' }}>
                                {item.aiDetails}
                              </div>

                              <div style={{ fontSize: '0.74rem', color: item.aiStatus === 'warning' ? '#dc2626' : '#64748b', fontWeight: item.aiStatus === 'warning' ? 700 : 500 }}>
                                {item.macro}
                              </div>
                            </div>
                          </td>

                          {/* CỘT 4: TƯƠNG TÁC */}
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.views}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b', margin: '0.15rem 0' }}>
                              {item.saved}
                            </div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                              <span>★</span>
                              <span>{item.rating}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>Hiển thị</span>
                  <select style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', outline: 'none' }}>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                  </select>
                  <span>trên tổng số <strong>14,820</strong> nội dung</span>
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <button style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    &lt;
                  </button>
                  <button style={{ width: '32px', height: '32px', border: '1px solid #047857', background: '#047857', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                    1
                  </button>
                  <button style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                    2
                  </button>
                  <button style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#334155' }}>
                    3
                  </button>
                  <span style={{ padding: '0 0.3rem', color: '#94a3b8' }}>...</span>
                  <button style={{ width: '40px', height: '32px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', color: '#334155' }}>
                    1482
                  </button>
                  <button style={{ width: '32px', height: '32px', border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    &gt;
                  </button>
                </div>
              </div>

              {/* MODAL: ĐỒNG BỘ YOUTUBE & TIKTOK + BÓC TÁCH CÔNG THỨC TỰ ĐỘNG BỞI AI */}
              {showSyncModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '560px',
                    padding: '1.75rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RotateCcw size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                            Nhập Liệu Video Hàng Loạt (Admin Bulk-Import)
                          </h3>
                          <span style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>
                            Công cụ quản trị nội bộ hệ thống (Internal Admin Tool)
                          </span>
                        </div>
                      </div>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        onClick={() => setShowSyncModal(false)}
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0 0 1.25rem 0', lineHeight: '1.5' }}>
                      <strong>Lưu ý nghiệp vụ:</strong> Đây là công cụ nội bộ dành cho Quản trị viên (Admin) nhập nguồn video số lượng lớn để xây dựng kho dữ liệu nền. Khác với <em>WF11</em> (người dùng tự dán link cá nhân để AI trích xuất công thức).
                    </p>

                    <div style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>
                        ĐƯỜNG DẪN VIDEO YOUTUBE / TIKTOK HOẶC TÊN KÊNH:
                      </label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.85rem',
                          color: '#0f172a',
                          outline: 'none'
                        }}
                        placeholder="https://www.youtube.com/watch?v=... hoặc @kenhchay"
                        value={syncUrl}
                        onChange={(e) => setSyncUrl(e.target.value)}
                      />
                    </div>

                    {/* LIVE PIPELINE PROGRESS */}
                    {isSyncing && (
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 700, color: '#047857', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <RefreshCw size={14} className="animate-spin" /> Đang xử lý bóc tách trí tuệ nhân tạo:
                        </div>
                        <div style={{ color: syncStep >= 1 ? '#059669' : '#94a3b8', marginBottom: '0.25rem' }}>
                          {syncStep >= 1 ? '✓' : '○'} Bước 1: Trích xuất phụ đề &amp; nhận dạng giọng nói Whisper STT...
                        </div>
                        <div style={{ color: syncStep >= 2 ? '#059669' : '#94a3b8', marginBottom: '0.25rem' }}>
                          {syncStep >= 2 ? '✓' : '○'} Bước 2: Bóc tách nguyên liệu &amp; kiểm tra đạt chuẩn Thuần Chay (NLP Engine)...
                        </div>
                        <div style={{ color: syncStep >= 3 ? '#059669' : '#94a3b8' }}>
                          {syncStep >= 3 ? '✓' : '○'} Bước 3: Tính toán Calo, Carbs, Protein, Chất béo và lưu vào hệ thống!
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button 
                        className="admin-btn-outline"
                        onClick={() => setShowSyncModal(false)}
                        disabled={isSyncing}
                      >
                        Hủy
                      </button>
                      <button 
                        className="admin-btn-primary"
                        onClick={handleStartSync}
                        disabled={isSyncing}
                      >
                        {isSyncing ? 'Đang bóc tách...' : 'Bắt đầu Bóc Tách AI'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 3: QUẢN LÝ BÀI VIẾT & VIDEO (HIGH FIDELITY)
              ===================================================================== */}
          {activeMenu === 'content-detail' && currentEditingContent && (
            <section style={{ animation: 'fadeIn 0.2s ease', paddingBottom: '3rem' }}>
              {/* BREADCRUMB & TOP HEADER */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.65rem' }}>
                  <span style={{ cursor: 'pointer', color: '#047857', fontWeight: 600 }} onClick={() => setActiveMenu('overview')}>Admin Portal</span>
                  <ChevronRight size={13} />
                  <span>Quản lý nội dung &amp; cộng đồng</span>
                  <ChevronRight size={13} />
                  <span style={{ cursor: 'pointer', color: '#047857', fontWeight: 600 }} onClick={() => setActiveMenu('content')}>Quản lý Blog &amp; Video</span>
                  <ChevronRight size={13} />
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{currentEditingContent.id}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: '1.3' }}>
                      Quản lý bài viết &amp; Video: {currentEditingContent.title}
                    </h1>
                    
                    {/* BADGES ROW */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.2rem 0.65rem', borderRadius: '14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <ShieldCheck size={13} /> Đã duyệt Public (WF07)
                      </span>
                      <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.2rem 0.65rem', borderRadius: '14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Zap size={13} /> AI Trích xuất 98.4%
                      </span>
                      <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '0.2rem 0.65rem', borderRadius: '14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Video size={13} /> Nguồn: YouTube
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', fontWeight: 700, marginLeft: '0.2rem' }}>
                        ID: #{currentEditingContent.id}-VN
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS TOP RIGHT */}
                  <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                      onClick={() => showToast('🔄 Đang gửi yêu cầu Whisper STT & YOLO-Recipe... Bóc tách lại thành công!')}
                      title="Chạy lại pipeline bóc tách AI"
                    >
                      <RefreshCw size={14} /> Chạy lại AI
                    </button>

                    <button 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                      onClick={() => setShowUserPreviewModal(true)}
                      title="Xem giao diện hiển thị cho người dùng"
                    >
                      <Eye size={14} /> Xem trước User
                    </button>

                    <button 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer', transition: 'all 0.15s' }}
                      onClick={() => handleDeleteContent(currentEditingContent.id)}
                      title="Xóa bài viết/video này"
                    >
                      <Trash2 size={14} /> Xóa
                    </button>

                    <button 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#047857', border: 'none', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4,120,87,0.25)', transition: 'all 0.15s' }}
                      onClick={handleSaveContentDetail}
                    >
                      <Check size={15} /> Lưu thay đổi &amp; Cập nhật
                    </button>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT 2-COLUMN GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.9fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
                {/* ================= LEFT COLUMN ================= */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* CARD 1: VIDEO NGUỒN & THÔNG TIN BÀI ĐĂNG */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* CARD HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Video size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            Video Nguồn &amp; Thông Tin Bài Đăng
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Thông tin video nấu ăn và công thức bóc tách AI
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* VIDEO PLAYER PREVIEW */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: '#090d16',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.12)',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ position: 'relative', width: '100%', paddingTop: '48%', background: '#090d16' }}>
                        <img 
                          src={currentEditingContent.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000'}
                          alt={currentEditingContent.title}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: detailPlayingVideo ? 0.95 : 0.85
                          }}
                        />

                        {/* Top bar overlay */}
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          padding: '0.75rem 1rem',
                          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          zIndex: 2
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ background: '#dc2626', color: '#ffffff', fontSize: '0.68rem', fontWeight: 900, padding: '0.15rem 0.45rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
                              YOUTUBE 4K
                            </span>
                            <span style={{ color: '#ffffff', fontSize: '0.86rem', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                              {currentEditingContent.channelEpisode || 'Bếp Chay An Lạc - Ep. 142'}
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff' }}>
                            <Layers size={16} style={{ cursor: 'pointer', opacity: 0.85 }} />
                            <ExternalLink size={16} style={{ cursor: 'pointer', opacity: 0.85 }} />
                          </div>
                        </div>

                        {/* Center Play button */}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
                          <button 
                            style={{
                              width: '56px',
                              height: '56px',
                              borderRadius: '50%',
                              background: '#047857',
                              border: '3px solid rgba(255,255,255,0.9)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 4px 20px rgba(4, 120, 87, 0.6)',
                              transition: 'transform 0.15s ease'
                            }}
                            onClick={() => {
                              setDetailPlayingVideo(!detailPlayingVideo);
                              showToast(detailPlayingVideo ? 'Tạm dừng video' : 'Đang phát video mô phỏng');
                            }}
                          >
                            <Play size={22} color="#ffffff" fill="#ffffff" style={{ marginLeft: '3px' }} />
                          </button>
                        </div>

                        {/* Bottom bar overlay with Segmented Timeline */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '0.6rem 1rem',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                          zIndex: 2
                        }}>
                          {/* Segmented Timeline */}
                          <div style={{ display: 'flex', gap: '3px', height: '4px', width: '100%', marginBottom: '0.45rem', borderRadius: '2px', overflow: 'hidden', background: 'rgba(255,255,255,0.25)' }}>
                            <div style={{ width: '25%', background: '#10b981' }} title="00:15 - Sơ chế" />
                            <div style={{ width: '35%', background: '#3b82f6' }} title="01:11 - Phi thơm" />
                            <div style={{ width: '25%', background: '#f59e0b' }} title="02:26 - Nước cốt dừa" />
                            <div style={{ width: '15%', background: '#ec4899' }} title="03:41 - Đậu hũ" />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <span>
                              <strong style={{ color: '#ffffff' }}>02:40 / 04:25</strong> - Phân đoạn AI: Đoạn sôi múi cà &amp; Thêm nước cốt dừa
                            </span>
                            <span style={{ color: '#94a3b8', fontSize: '0.68rem', fontStyle: 'italic' }}>
                              Auto-segmented by vision YOLOv8
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* INPUTS ROW 1: TÁC GIẢ & LINK VIDEO */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                          Tác giả
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem 0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircle2 size={14} color="#059669" />
                            <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>{currentEditingContent.author}</strong>
                          </div>
                          <span style={{ background: '#e2e8f0', color: '#475569', fontSize: '0.7rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                            Authorized User
                          </span>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                          Liên kết Video Gốc
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.35rem 0.5rem 0.35rem 0.85rem' }}>
                          <input 
                            type="text"
                            value={currentEditingContent.mediaUrl || 'https://youtube.com/watch?v=veggie-curry-coconut'}
                            onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, mediaUrl: e.target.value })}
                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.82rem', color: '#334155', outline: 'none' }}
                          />
                          <a 
                            href={currentEditingContent.mediaUrl || '#'} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.76rem', fontWeight: 700, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                          >
                            Mở <ExternalLink size={11} />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* INPUT ROW 2: TIÊU ĐỀ HIỂN THỊ */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                        Tiêu đề bài viết / video hiển thị
                      </label>
                      <input 
                        type="text"
                        value={currentEditingContent.title}
                        onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, title: e.target.value })}
                        style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.65rem 0.85rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* INPUT ROW 3: MÔ TẢ TÓM TẮT & CÔNG NĂNG Y HỌC */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '0.35rem' }}>
                        Mô tả tóm tắt &amp; Công năng y học
                      </label>
                      <textarea 
                        rows={3}
                        value={detailSummary}
                        onChange={(e) => setDetailSummary(e.target.value)}
                        style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.75rem', fontSize: '0.86rem', lineHeight: '1.55', color: '#334155', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  {/* CARD 2: KẾT QUẢ BÓC TÁCH AI TỰ ĐỘNG */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* CARD HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Sparkles size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            Kết quả Bóc tách AI tự động
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Trích xuất tự động qua xử lý âm thanh &amp; nhận diện hình ảnh khung hình
                          </div>
                        </div>
                      </div>

                      {/* BADGES ON RIGHT */}
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                          Whisper v3 + YOLO-Recipe
                        </span>
                        <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          Độ tin cậy: 98.4% Confidence <Check size={11} />
                        </span>
                        <span style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}>
                          Thời gian: 4.2s
                        </span>
                      </div>
                    </div>

                    {/* 3 SUBTABS */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                      <button 
                        style={{
                          background: detailActiveTab === 'ingredients' ? '#ecfdf5' : 'transparent',
                          color: detailActiveTab === 'ingredients' ? '#047857' : '#64748b',
                          border: 'none',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s'
                        }}
                        onClick={() => setDetailActiveTab('ingredients')}
                      >
                        <Utensils size={14} /> Danh sách Nguyên liệu ({detailIngredients.length})
                      </button>

                      <button 
                        style={{
                          background: detailActiveTab === 'steps' ? '#ecfdf5' : 'transparent',
                          color: detailActiveTab === 'steps' ? '#047857' : '#64748b',
                          border: 'none',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s'
                        }}
                        onClick={() => setDetailActiveTab('steps')}
                      >
                        <ListOrdered size={14} /> Các bước chế biến (4 bước)
                      </button>

                      <button 
                        style={{
                          background: detailActiveTab === 'transcript' ? '#ecfdf5' : 'transparent',
                          color: detailActiveTab === 'transcript' ? '#047857' : '#64748b',
                          border: 'none',
                          padding: '0.45rem 0.95rem',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          transition: 'all 0.15s'
                        }}
                        onClick={() => setDetailActiveTab('transcript')}
                      >
                        <FileText size={14} /> Băng ghi STT Transcript
                      </button>
                    </div>

                    {/* TAB 1: INGREDIENTS TABLE */}
                    {detailActiveTab === 'ingredients' && (
                      <div>
                        <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>TÊN NGUYÊN LIỆU</th>
                                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>ĐỊNH LƯỢNG</th>
                                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>AI DETECT TAG &amp; PHÂN LOẠI</th>
                                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700 }}>TRẠNG THÁI</th>
                                <th style={{ padding: '0.5rem 0.75rem', fontWeight: 700, textAlign: 'center' }}>HÀNH ĐỘNG</th>
                              </tr>
                            </thead>
                            <tbody>
                              {detailIngredients.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '0.65rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>
                                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', marginRight: '0.5rem' }} />
                                    {item.name}
                                  </td>
                                  <td style={{ padding: '0.65rem 0.75rem' }}>
                                    <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, color: '#334155' }}>
                                      {item.amount}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.65rem 0.75rem' }}>
                                    <span style={{ background: '#ecfeff', border: '1px solid #a5f3fc', color: '#0891b2', padding: '0.2rem 0.55rem', borderRadius: '6px', fontWeight: 700, fontSize: '0.74rem' }}>
                                      {item.tag}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.65rem 0.75rem', color: '#059669', fontWeight: 700 }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Check size={13} /> {item.status}
                                    </span>
                                  </td>
                                  <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                                    <button 
                                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem', borderRadius: '4px' }}
                                      onClick={() => handleRemoveIngredient(item.id)}
                                      title="Xóa nguyên liệu này"
                                    >
                                      <X size={15} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* ADD INGREDIENT FOOTER */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                          <button 
                            style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', color: '#047857', padding: '0.45rem 0.95rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                            onClick={handleAddIngredient}
                          >
                            <Plus size={14} /> + Thêm nguyên liệu thủ công
                          </button>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic' }}>
                            Tự động gắn mã dinh dưỡng FDC - USDA &amp; Viện Dinh Dưỡng Quốc Gia
                          </span>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: COOKING STEPS */}
                    {detailActiveTab === 'steps' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        {detailSteps.map((s) => (
                          <div key={s.step} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#047857', color: '#ffffff', fontWeight: 800, fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {s.step}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                                <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{s.title}</strong>
                                <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                                  ⏱ {s.time}
                                </span>
                              </div>
                              <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: '1.55' }}>
                                {s.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TAB 3: STT TRANSCRIPT */}
                    {detailActiveTab === 'transcript' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {detailTranscript.map((t, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '0.75rem', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', minWidth: '42px' }}>{t.time}</span>
                            <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5' }}>
                              <strong style={{ color: '#0f172a' }}>{t.speaker}: </strong>
                              {t.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CARD 3: TRÌNH BIÊN SOẠN CHI TIẾT BÀI VIẾT (BLOG CONTENT) */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    {/* CARD HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            Trình biên soạn Chi tiết Bài viết (Blog Content)
                          </h3>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            Nội dung hiển thị trên ứng dụng VeggieAI &amp; Công thức dinh dưỡng
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        Lưu nháp: Tự động <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
                      </div>
                    </div>

                    {/* FORMATTING TOOLBAR */}
                    <div style={{ display: 'flex', gap: '0.35rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem', marginBottom: '0.85rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', fontWeight: 900, cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Định dạng in đậm')}>B</button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', fontStyle: 'italic', fontWeight: 700, cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Định dạng in nghiêng')}>I</button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Định dạng gạch chân')}>U</button>
                      <span style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 0.2rem' }} />
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Tiêu đề H1')}>H1</button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Tiêu đề H2')}>H2</button>
                      <span style={{ width: '1px', height: '16px', background: '#cbd5e1', margin: '0 0.2rem' }} />
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Danh sách chấm')}><List size={15} /></button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Danh sách số')}><ListOrdered size={15} /></button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Trích dẫn')}><Quote size={14} /></button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Chèn liên kết')}><ExternalLink size={14} /></button>
                      <button style={{ background: 'transparent', border: 'none', padding: '0.25rem 0.55rem', cursor: 'pointer', color: '#334155' }} onClick={() => showToast('Chèn bảng')}><Layers size={14} /></button>
                    </div>

                    {/* EDITABLE CONTENT BOX */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', minHeight: '140px' }}>
                      <textarea 
                        rows={7}
                        value={detailBlogContent}
                        onChange={(e) => setDetailBlogContent(e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          fontSize: '0.86rem',
                          lineHeight: '1.65',
                          color: '#1e293b',
                          fontFamily: 'inherit',
                          outline: 'none',
                          resize: 'vertical',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* ================= RIGHT COLUMN (SIDEBAR WIDGETS) ================= */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* WIDGET 1: PHÂN TÍCH MACRO TỰ ĐỘNG */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PieChart size={18} color="#059669" />
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Phân Tích Macro Tự Động
                        </h3>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.55rem', borderRadius: '4px' }}>
                        1 Khẩu Phần
                      </span>
                    </div>

                    {/* CALORIES STAT */}
                    <div style={{ marginBottom: '1.15rem' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        TỔNG NĂNG LƯỢNG
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.2rem 0' }}>
                        <div style={{ fontSize: '2.3rem', fontWeight: 900, color: '#047857', letterSpacing: '-0.5px' }}>
                          410 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>kcal</span>
                        </div>
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={20} />
                        </div>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Chiếm 22.5% nhu cầu hàng ngày (RNI 1,800 kcal)
                      </div>
                    </div>

                    {/* DONUT CHART & MACRO LEGEND */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1rem 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', marginBottom: '1.15rem' }}>
                      {/* SVG DONUT CHART */}
                      <div style={{ position: 'relative', width: '108px', height: '108px', flexShrink: 0 }}>
                        <svg width="108" height="108" viewBox="0 0 108 108" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="54" cy="54" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                          {/* Carbs 55%: 0.55 * 264 = 145 */}
                          <circle cx="54" cy="54" r="42" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="145 119" strokeDashoffset="0" />
                          {/* Fat 27%: 0.27 * 264 = 71 */}
                          <circle cx="54" cy="54" r="42" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="71 193" strokeDashoffset="-145" />
                          {/* Protein 18%: 0.18 * 264 = 48 */}
                          <circle cx="54" cy="54" r="42" fill="none" stroke="#06b6d4" strokeWidth="12" strokeDasharray="48 216" strokeDashoffset="-216" />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>100%</span>
                          <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 600 }}>Macros</span>
                        </div>
                      </div>

                      {/* MACRO BREAKDOWN LIST */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            Carbs (55%)
                          </span>
                          <strong style={{ color: '#0f172a' }}>52g</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                            Fat MCT (27%)
                          </span>
                          <strong style={{ color: '#0f172a' }}>16g</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
                            Đạm thực vật (18%)
                          </span>
                          <strong style={{ color: '#0f172a' }}>14g</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem', paddingTop: '0.25rem', borderTop: '1px solid #f1f5f9', color: '#059669', fontWeight: 700 }}>
                          <span>Chất xơ hòa tan:</span>
                          <strong>8.5g (34% RNI)</strong>
                        </div>
                      </div>
                    </div>

                    {/* HÀM LƯỢNG VI CHẤT THIẾT YẾU */}
                    <div style={{ marginBottom: '1.15rem' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.65rem' }}>
                        HÀM LƯỢNG VI CHẤT THIẾT YẾU
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>Vitamin A (Beta-carotene)</span>
                          <strong style={{ color: '#059669' }}>180% RNI (Cà rốt &amp; Khoai lang)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>Sắt hữu cơ (Non-heme Iron)</span>
                          <strong style={{ color: '#0f172a' }}>4.2mg (35% RNI)</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '6px' }}>
                          <span style={{ color: '#334155' }}>Canxi tự nhiên từ đậu hũ &amp; nấm</span>
                          <strong style={{ color: '#0f172a' }}>120mg (12% RNI)</strong>
                        </div>
                      </div>
                    </div>

                    <button 
                      style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.55rem', fontSize: '0.8rem', fontWeight: 700, color: '#047857', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', transition: 'all 0.15s' }}
                      onClick={() => showToast('Mô hình Macro Engine đã tái tính toán bảng dinh dưỡng!')}
                    >
                      <RefreshCw size={13} /> Tính toán lại Macro theo nguyên liệu
                    </button>
                  </div>

                  {/* WIDGET 2: TRẠNG THÁI DUYỆT (MOD - WF07) */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ShieldCheck size={18} color="#059669" />
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Trạng Thái Duyệt (Mod)
                        </h3>
                      </div>
                      <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                        ✓ Đã duyệt Public (WF07)
                      </span>
                    </div>

                    {/* MODERATOR CARD */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.9rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#047857', color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          HN
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <strong style={{ fontSize: '0.86rem', color: '#0f172a' }}>Mod_HoangNam</strong>
                            <span style={{ background: '#dcfce7', color: '#166534', fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Moderator</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                            Kiểm duyệt viên Tuyến 1 &bull; Quyền phê duyệt Public (WF07)
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.65rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Thời gian duyệt:</span>
                          <strong style={{ color: '#0f172a' }}>11:30 Hôm nay</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Quy trình thực thi:</span>
                          <span style={{ color: '#047857', fontWeight: 700 }}>WF07 - Kiểm duyệt trước Public</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748b' }}>Đánh giá tuân thủ:</span>
                          <span style={{ color: '#059669', fontWeight: 700 }}>100% Thuần chay (Không vi phạm)</span>
                        </div>
                      </div>
                    </div>

                    {/* GHI CHÚ KIỂM DUYỆT (MODERATOR NOTE) */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.35rem' }}>
                        GHI CHÚ KIỂM DUYỆT (MODERATOR):
                      </label>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: '#166534', lineHeight: '1.5' }}>
                        &ldquo;Công thức nấu và video đã được kiểm tra kỹ lưỡng. Nguyên liệu thuần chay đạt chuẩn, tỷ lệ calo và phân bổ dinh dưỡng do AI bóc tách khớp với định lượng thực tế. Đủ điều kiện hiển thị công khai trên ứng dụng VeggieAI.&rdquo;
                      </div>
                    </div>

                    {/* TIÊU CHÍ ĐÃ XÁC NHẬN */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                        TIÊU CHÍ ĐÃ KIỂM TRA TRƯỚC PUBLIC
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Nguyên liệu &amp; quy trình đạt chuẩn thuần chay</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Không phát hiện sai lệch dinh dưỡng (WF09)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#059669', fontWeight: 600 }}>
                          <CheckCircle2 size={14} color="#059669" />
                          <span>Không có nội dung spam hoặc quảng cáo vi phạm</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WIDGET 3: THIẾT LẬP MÔ HÌNH & TAGS */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                      <Sliders size={18} color="#059669" />
                      <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        Thiết Lập Mô Hình &amp; Tags
                      </h3>
                    </div>

                    {/* TOGGLE SWITCH: AI MEAL PLANNER RECOMMENDER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem', marginBottom: '1rem' }}>
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.82rem', color: '#0f172a' }}>AI Meal Planner Recommender</strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Đưa vào thực đơn tự động</span>
                      </div>
                      <button 
                        style={{
                          width: '42px',
                          height: '24px',
                          borderRadius: '12px',
                          background: detailRecommender ? '#047857' : '#cbd5e1',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'background 0.2s ease'
                        }}
                        onClick={() => {
                          setDetailRecommender(!detailRecommender);
                          showToast(detailRecommender ? 'Đã tắt tự động đề xuất' : 'Đã bật AI tự động đưa vào thực đơn');
                        }}
                      >
                        <span style={{
                          position: 'absolute',
                          top: '3px',
                          left: detailRecommender ? '21px' : '3px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#ffffff',
                          transition: 'left 0.2s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </div>

                    {/* DROPDOWNS */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.15rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>
                          Danh mục chính
                        </label>
                        <select 
                          value={detailCategory}
                          onChange={(e) => setDetailCategory(e.target.value)}
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem', fontSize: '0.78rem', outline: 'none', color: '#334155', fontWeight: 600 }}
                        >
                          <option value="Món chính | Món Nước & Sốt">Món chính | M...</option>
                          <option value="Món Kho & Xào">Món Kho &amp; Xào</option>
                          <option value="Canh & Lẩu Chay">Canh &amp; Lẩu Chay</option>
                          <option value="Ăn Sáng Dinh Dưỡng">Ăn Sáng Dinh Dưỡng</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>
                          Độ khó nấu
                        </label>
                        <select 
                          value={detailDifficulty}
                          onChange={(e) => setDetailDifficulty(e.target.value)}
                          style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem', fontSize: '0.78rem', outline: 'none', color: '#334155', fontWeight: 600 }}
                        >
                          <option value="Dễ (Dưới 20 phút)">Dễ (Dưới 20 p)</option>
                          <option value="Trung bình (20-40 phút)">Trung bình</option>
                          <option value="Nâng cao (> 40 phút)">Nâng cao</option>
                        </select>
                      </div>
                    </div>

                    {/* SEMANTIC TAGS */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.55rem' }}>
                        THẺ PHÂN LOẠI AI (SEMANTIC TAGS)
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                        {detailTags.map((tag, i) => (
                          <span 
                            key={i} 
                            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '0.25rem 0.55rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          >
                            {tag}
                            <X size={12} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => handleRemoveTag(tag)} />
                          </span>
                        ))}

                        {showAddTagInput ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <input 
                              type="text"
                              value={detailNewTag}
                              onChange={(e) => setDetailNewTag(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                              placeholder="#TagMoi"
                              style={{ padding: '0.2rem 0.45rem', border: '1px solid #059669', borderRadius: '6px', fontSize: '0.74rem', outline: 'none', width: '90px' }}
                              autoFocus
                            />
                            <button style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.2rem 0.4rem', fontSize: '0.7rem', cursor: 'pointer' }} onClick={handleAddTag}>Lưu</button>
                          </div>
                        ) : (
                          <button 
                            style={{ background: '#ffffff', border: '1px dashed #cbd5e1', color: '#047857', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                            onClick={() => setShowAddTagInput(true)}
                          >
                            + Thêm tag
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* WIDGET 4: TƯƠNG TÁC & LỊCH SỬ BẢN GHI */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} color="#059669" />
                        <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Tương Tác &amp; Lịch Sử Bản Ghi
                        </h3>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                        v2.3
                      </span>
                    </div>

                    {/* 3 STATS BOXES */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1.15rem', textAlign: 'center' }}>
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.35rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Lượt xem</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.15rem' }}>28.5K</div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.35rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Lưu món</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#047857', marginTop: '0.15rem' }}>1,420</div>
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.35rem' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700 }}>Đánh giá</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706', marginTop: '0.15rem' }}>4.9 ★</div>
                      </div>
                    </div>

                    {/* NHẬT KÝ THAY ĐỔI GẦN NHẤT */}
                    <div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.65rem' }}>
                        NHẬT KÝ THAY ĐỔI GẦN NHẤT
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', marginTop: '0.35rem', flexShrink: 0 }} />
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 700 }}>
                              14:05 Hôm nay &bull; Admin
                            </div>
                            <div style={{ color: '#64748b', lineHeight: '1.45' }}>
                              Điều chỉnh định lượng nước cốt dừa từ 300ml xuống 250ml.
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginTop: '0.35rem', flexShrink: 0 }} />
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 700 }}>
                              11:30 Hôm nay &bull; Mod_HoangNam
                            </div>
                            <div style={{ color: '#64748b', lineHeight: '1.45' }}>
                              Phê duyệt nội dung hợp lệ chuẩn thuần chay (WF07).
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginTop: '0.35rem', flexShrink: 0 }} />
                          <div>
                            <div style={{ color: '#0f172a', fontWeight: 700 }}>
                              10:18 Hôm nay &bull; VeggieAI Engine
                            </div>
                            <div style={{ color: '#64748b', lineHeight: '1.45' }}>
                              Whisper STT và YOLOv8 hoàn tất bóc tách 7 nguyên liệu &amp; 4 bước nấu.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODAL: XEM TRƯỚC USER (MÔ PHỎNG GIAO DIỆN APP NGƯỜI DÙNG) */}
              {showUserPreviewModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '460px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                    animation: 'fadeIn 0.2s ease',
                    position: 'relative'
                  }}>
                    {/* MODAL HEADER */}
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <img 
                        src={currentEditingContent.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000'}
                        alt="Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button 
                        style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15,23,42,0.75)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        onClick={() => setShowUserPreviewModal(false)}
                      >
                        <X size={18} />
                      </button>
                      <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(4,120,87,0.9)', color: '#ffffff', fontSize: '0.72rem', fontWeight: 800, padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                        Preview: VeggieAI Mobile App
                      </span>
                    </div>

                    <div style={{ padding: '1.25rem' }}>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        {currentEditingContent.title}
                      </h2>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          ⚡ 410 kcal
                        </span>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Đạm 14g
                        </span>
                        <span style={{ background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                          Carbs 52g
                        </span>
                      </div>

                      <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: '1.55', marginBottom: '1rem' }}>
                        {detailSummary}
                      </p>

                      <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                        Nguyên liệu chuẩn bị:
                      </h4>
                      <ul style={{ paddingLeft: '1.2rem', margin: '0 0 1rem 0', fontSize: '0.82rem', color: '#334155' }}>
                        {detailIngredients.map(i => (
                          <li key={i.id} style={{ marginBottom: '0.25rem' }}>
                            <strong>{i.name}</strong> - {i.amount}
                          </li>
                        ))}
                      </ul>

                      <button 
                        style={{ width: '100%', background: '#047857', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                        onClick={() => setShowUserPreviewModal(false)}
                      >
                        Đóng Xem Trước
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
          {/* =====================================================================
              MÀN HÌNH 4: QUẢN LÝ BÌNH LUẬN & TƯƠNG TÁC CỘNG ĐỒNG (HIGH FIDELITY)
              ===================================================================== */}
          {activeMenu === 'comments' && (
            <section style={{ animation: 'fadeIn 0.2s ease', paddingBottom: '3rem' }}>
              {/* TOP HEADER */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  {/* BADGES ROW */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem', flexWrap: 'wrap' }}>
                    <span style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.2rem 0.65rem', borderRadius: '14px', fontSize: '0.74rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      AUTOMATED MODERATION v3.2
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>
                      NLP Transformer Model <strong style={{ color: '#0f172a' }}>#VEG-TOX-89</strong>
                    </span>
                  </div>

                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.45rem 0', lineHeight: '1.25' }}>
                    Quản lý Bình luận &amp; Tương tác Cộng đồng
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0, maxWidth: '780px', lineHeight: '1.5' }}>
                    Giám sát 128,450 bình luận trên toàn hệ thống blog &amp; video công thức chay. Tự động bảo vệ chất lượng nội dung bằng mô hình NLP Toxicity và chuẩn kiểm định an toàn dinh dưỡng thuần chay.
                  </p>
                </div>

                {/* HEADER ACTION BUTTONS */}
                <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={handleExportCSV}
                    title="Xuất danh sách kiểm duyệt ra tệp CSV"
                  >
                    <Download size={14} /> Xuất báo cáo (CSV)
                  </button>

                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.55rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }}
                    onClick={() => setShowKeywordModal(true)}
                    title="Cấu hình danh sách từ khóa cấm quét tự động"
                  >
                    <Sliders size={14} /> Bộ lọc từ khóa cấm
                  </button>

                  <button 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#047857', border: 'none', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer', boxShadow: '0 2px 4px rgba(4,120,87,0.25)', transition: 'all 0.15s' }}
                    onClick={handleQuickApproveSafe}
                  >
                    <ShieldCheck size={15} /> Duyệt nhanh an toàn (28)
                  </button>
                </div>
              </div>

              {/* 4 STATS METRIC CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* METRIC 1 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Tổng bình luận hệ thống</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: '1.1', marginBottom: '0.65rem' }}>
                    128,450
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '10px' }}>
                      &uarr; +8.4%
                    </span>
                    <span style={{ color: '#64748b' }}>so với tuần trước</span>
                  </div>
                </div>

                {/* METRIC 2 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ea580c' }} />
                      <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>AI gắn cờ nghi vấn</span>
                    </div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flag size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', lineHeight: '1.1', marginBottom: '0.65rem' }}>
                    42
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem' }}>
                    <span style={{ color: '#64748b' }}>Chờ kiểm duyệt gấp:</span>
                    <span style={{ background: '#7f1d1d', color: '#ffffff', fontWeight: 800, padding: '0.12rem 0.45rem', borderRadius: '6px', fontSize: '0.68rem' }}>
                      14 High Risk
                    </span>
                  </div>
                </div>

                {/* METRIC 3 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Đã gỡ &amp; Khóa vi phạm</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ban size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#dc2626', lineHeight: '1.1', marginBottom: '0.65rem' }}>
                    318
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Spam TPCN (210) &bull; Sai lệch (108)
                  </div>
                </div>

                {/* METRIC 4 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>Tỷ lệ tương tác an toàn</span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#047857', lineHeight: '1.1', marginBottom: '0.65rem' }}>
                    94.2%
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Độ chuẩn NLP: <strong>98.7%</strong></span>
                    <div style={{ flex: 1, height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '98.7%', height: '100%', background: '#059669', borderRadius: '3px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN CONTENT 2-COLUMN GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(320px, 1.15fr)', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* ================= LEFT COLUMN: TABLE & FILTERS ================= */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  
                  {/* SUBTABS FILTER BAR */}
                  <div style={{ display: 'flex', gap: '0.45rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '1rem', overflowX: 'auto' }}>
                    <button 
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: commentsFilter === 'all' ? '#047857' : 'transparent',
                        color: commentsFilter === 'all' ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => setCommentsFilter('all')}
                    >
                      Tất cả <span style={{ opacity: 0.85, fontSize: '0.74rem' }}>128,450</span>
                    </button>

                    <button 
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: commentsFilter === 'flagged' ? '#047857' : 'transparent',
                        color: commentsFilter === 'flagged' ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => setCommentsFilter('flagged')}
                    >
                      AI gắn cờ <span style={{ background: commentsFilter === 'flagged' ? '#065f46' : '#f1f5f9', color: commentsFilter === 'flagged' ? '#fff' : '#475569', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem' }}>42</span>
                    </button>

                    <button 
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: commentsFilter === 'spam' ? '#047857' : 'transparent',
                        color: commentsFilter === 'spam' ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => setCommentsFilter('spam')}
                    >
                      Spam &amp; Quảng cáo <span style={{ opacity: 0.85, fontSize: '0.74rem' }}>18</span>
                    </button>

                    <button 
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: commentsFilter === 'misinformation' ? '#047857' : 'transparent',
                        color: commentsFilter === 'misinformation' ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => setCommentsFilter('misinformation')}
                    >
                      Sai lệch dinh dưỡng <span style={{ opacity: 0.85, fontSize: '0.74rem' }}>15</span>
                    </button>

                    <button 
                      style={{
                        padding: '0.45rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: commentsFilter === 'hidden' ? '#047857' : 'transparent',
                        color: commentsFilter === 'hidden' ? '#ffffff' : '#64748b',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s'
                      }}
                      onClick={() => setCommentsFilter('hidden')}
                    >
                      Đã ẩn/Xóa <span style={{ opacity: 0.85, fontSize: '0.74rem' }}>318</span>
                    </button>
                  </div>

                  {/* SEARCH & SECONDARY FILTERS ROW */}
                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input 
                        type="text"
                        placeholder="Tìm theo từ khóa, tài khoản, bài viết..."
                        value={commentsSearch}
                        onChange={(e) => setCommentsSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          color: '#1e293b',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <select 
                      value={commentsRiskFilter}
                      onChange={(e) => setCommentsRiskFilter(e.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.8rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    >
                      <option value="all">Mức độ: Tất cả rủi ro</option>
                      <option value="high">Rủi ro cao (High Risk)</option>
                      <option value="medium">Rủi ro trung bình</option>
                      <option value="low">Rủi ro thấp / An toàn</option>
                    </select>

                    <select 
                      value={commentsSourceFilter}
                      onChange={(e) => setCommentsSourceFilter(e.target.value)}
                      style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 0.65rem', fontSize: '0.8rem', color: '#334155', fontWeight: 600, outline: 'none' }}
                    >
                      <option value="all">Nguồn: Tất cả bài viết</option>
                      <option value="blog">Blog Dinh Dưỡng</option>
                      <option value="video">Video Nấu Ăn</option>
                    </select>

                    <button 
                      style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
                      onClick={() => {
                        setCommentsSearch('');
                        setCommentsRiskFilter('all');
                        setCommentsSourceFilter('all');
                        showToast('Đã làm mới bộ lọc danh sách bình luận.');
                      }}
                      title="Làm mới bộ lọc"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>

                  {/* BATCH ACTION BAR (WHEN SELECTED) */}
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '0.65rem 0.95rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.65rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.82rem', color: '#1e40af', fontWeight: 700 }}>
                      <input 
                        type="checkbox"
                        checked={selectedCommentIds.length > 0}
                        onChange={() => handleSelectAllComments(commentsList)}
                        style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                      />
                      <span>Đang chọn {selectedCommentIds.length}/42 bình luận nghi vấn</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                        onClick={handleBatchHide}
                        title="Ẩn khỏi hiển thị công khai"
                      >
                        <EyeOff size={13} /> Ẩn đã chọn
                      </button>

                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#047857', cursor: 'pointer' }}
                        onClick={handleBatchApproveSafe}
                        title="Đánh dấu an toàn"
                      >
                        <CheckCircle2 size={13} /> Đánh dấu An toàn
                      </button>

                      <button 
                        style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#fee2e2', border: '1px solid #fca5a5', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#b91c1c', cursor: 'pointer' }}
                        onClick={handleBatchDelete}
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={13} /> Xóa vĩnh viễn
                      </button>
                    </div>
                  </div>

                  {/* DATA TABLE */}
                  <div style={{ overflowX: 'auto', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '0.65rem 0.5rem', width: '36px', textAlign: 'center' }}>
                            <input 
                              type="checkbox"
                              checked={commentsList.length > 0 && commentsList.every(c => selectedCommentIds.includes(c.id))}
                              onChange={() => handleSelectAllComments(commentsList)}
                              style={{ accentColor: '#047857', cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ padding: '0.65rem 0.75rem', width: '22%' }}>Người gửi &amp; Tín nhiệm</th>
                          <th style={{ padding: '0.65rem 0.75rem', width: '48%' }}>Nội dung bình luận</th>
                          <th style={{ padding: '0.65rem 0.75rem', width: '26%' }}>Bài viết ngữ cảnh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commentsList
                          .filter(c => {
                            if (commentsFilter === 'flagged') return c.status === 'flagged';
                            if (commentsFilter === 'spam') return c.category === 'spam';
                            if (commentsFilter === 'misinformation') return c.category === 'misinformation';
                            if (commentsFilter === 'hidden') return c.status === 'hidden';
                            return true;
                          })
                          .filter(c => {
                            if (commentsRiskFilter === 'high') return c.riskLevel === 'high';
                            if (commentsRiskFilter === 'medium') return c.riskLevel === 'medium';
                            if (commentsRiskFilter === 'low') return c.riskLevel === 'low';
                            return true;
                          })
                          .filter(c => {
                            if (commentsSourceFilter === 'blog') return c.targetType === 'Blog Dinh Dưỡng';
                            if (commentsSourceFilter === 'video') return c.targetType === 'Video Nấu Ăn';
                            return true;
                          })
                          .filter(c => {
                            if (!commentsSearch) return true;
                            const q = commentsSearch.toLowerCase();
                            return c.content.toLowerCase().includes(q) ||
                                   c.author.toLowerCase().includes(q) ||
                                   c.handle.toLowerCase().includes(q) ||
                                   c.targetTitle.toLowerCase().includes(q);
                          })
                          .map((comment) => {
                            const isSelected = selectedCommentIds.includes(comment.id);
                            const isInspecting = activeInspectingComment?.id === comment.id;

                            return (
                              <tr 
                                key={comment.id}
                                onClick={() => setActiveInspectingCommentId(comment.id)}
                                style={{
                                  borderBottom: '1px solid #f1f5f9',
                                  background: isInspecting ? '#f0fdf4' : (isSelected ? '#f8fafc' : '#ffffff'),
                                  cursor: 'pointer',
                                  transition: 'background 0.12s'
                                }}
                              >
                                <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                  <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectComment(comment.id)}
                                    style={{ accentColor: '#047857', cursor: 'pointer' }}
                                  />
                                </td>

                                <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'top' }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: comment.avatarBg, color: '#ffffff', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      {comment.avatar}
                                    </div>
                                    <div>
                                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{comment.author}</strong>
                                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{comment.handle}</span>
                                      
                                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                        <span style={{
                                          fontSize: '0.68rem',
                                          fontWeight: 700,
                                          padding: '0.1rem 0.35rem',
                                          borderRadius: '4px',
                                          background: comment.reputation < 50 ? '#fee2e2' : (comment.reputation < 80 ? '#fff7ed' : '#ecfdf5'),
                                          color: comment.reputation < 50 ? '#b91c1c' : (comment.reputation < 80 ? '#c2410c' : '#047857')
                                        }}>
                                          Uy tín: {comment.reputation}/100
                                        </span>
                                        {comment.violationCount && (
                                          <span style={{
                                            fontSize: '0.68rem',
                                            fontWeight: 700,
                                            padding: '0.1rem 0.35rem',
                                            borderRadius: '4px',
                                            background: comment.violationCount.includes('Vi phạm') ? '#fee2e2' : (comment.violationCount.includes('Mới') ? '#ffedd5' : '#f1f5f9'),
                                            color: comment.violationCount.includes('Vi phạm') ? '#dc2626' : (comment.violationCount.includes('Mới') ? '#ea580c' : '#475569')
                                          }}>
                                            {comment.violationCount}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'top' }}>
                                  <div style={{ fontSize: '0.84rem', color: '#1e293b', lineHeight: '1.55', marginBottom: '0.4rem' }}>
                                    &ldquo;
                                    {comment.highlightWord ? (
                                      <>
                                        {comment.content.split(comment.highlightWord)[0]}
                                        <mark style={{
                                          background: comment.riskLevel === 'high' ? '#fee2e2' : '#ffedd5',
                                          color: comment.riskLevel === 'high' ? '#b91c1c' : '#c2410c',
                                          padding: '0.1rem 0.3rem',
                                          borderRadius: '4px',
                                          fontWeight: 700
                                        }}>
                                          {comment.highlightWord}
                                        </mark>
                                        {comment.content.split(comment.highlightWord)[1]}
                                      </>
                                    ) : (
                                      comment.content
                                    )}
                                    &rdquo;
                                  </div>

                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.72rem', color: '#94a3b8' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                      <Clock size={12} /> {comment.time}
                                    </span>
                                    <span>&bull;</span>
                                    <span>{comment.editStatus}</span>
                                  </div>
                                </td>

                                <td style={{ padding: '0.85rem 0.75rem', verticalAlign: 'top' }}>
                                  <div style={{ display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
                                    <img 
                                      src={comment.targetThumb}
                                      alt={comment.targetTitle}
                                      style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div>
                                      <strong style={{ display: 'block', fontSize: '0.78rem', color: '#0f172a', lineHeight: '1.35', marginBottom: '0.2rem' }}>
                                        {comment.targetTitle}
                                      </strong>
                                      <span style={{
                                        fontSize: '0.68rem',
                                        fontWeight: 700,
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        background: comment.targetType.includes('Video') ? '#eff6ff' : '#f0fdf4',
                                        color: comment.targetType.includes('Video') ? '#2563eb' : '#059669'
                                      }}>
                                        {comment.targetType}
                                      </span>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                    <span>Hiển thị 1-4 trên tổng số 42 bình luận nghi vấn</span>
                    
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}>&lt;</button>
                      <button style={{ background: '#047857', border: 'none', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: '#ffffff', fontWeight: 800 }}>1</button>
                      <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}>2</button>
                      <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}>3</button>
                      <button style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.75rem', cursor: 'pointer', color: '#64748b' }}>&gt;</button>
                    </div>
                  </div>
                </div>

                {/* ================= RIGHT COLUMN: CHI TIẾT KIỂM DUYỆT AI ================= */}
                <div style={{ position: 'sticky', top: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeInspectingComment ? (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      {/* DRAWER HEADER */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <ShieldAlert size={18} color="#dc2626" />
                            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                              Chi tiết Kiểm duyệt AI
                            </h3>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem', display: 'block' }}>
                            Mã bản ghi: #{activeInspectingComment.recordId}
                          </span>
                        </div>

                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '8px',
                          background: activeInspectingComment.riskLevel === 'high' ? '#fee2e2' : (activeInspectingComment.riskLevel === 'medium' ? '#ffedd5' : '#ecfdf5'),
                          color: activeInspectingComment.riskLevel === 'high' ? '#b91c1c' : (activeInspectingComment.riskLevel === 'medium' ? '#c2410c' : '#047857'),
                          border: activeInspectingComment.riskLevel === 'high' ? '1px solid #fca5a5' : '1px solid #fdba74'
                        }}>
                          {activeInspectingComment.riskLabel}
                        </span>
                      </div>

                      {/* USER INFO MINI CARD */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: activeInspectingComment.avatarBg, color: '#ffffff', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                            {activeInspectingComment.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{activeInspectingComment.author}</strong>
                              <span style={{ color: '#dc2626', fontSize: '0.72rem', fontWeight: 800 }}>{activeInspectingComment.violationCount}</span>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{activeInspectingComment.email}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
                          <span style={{ color: '#64748b' }}>Tham gia: <strong>{activeInspectingComment.joined}</strong></span>
                          <span style={{ color: '#b91c1c', fontWeight: 700 }}>Tín nhiệm: {activeInspectingComment.reputation}/100</span>
                        </div>
                      </div>

                      {/* ORIGINAL COMMENT BOX */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#64748b', marginBottom: '0.35rem' }}>
                          NỘI DUNG BÌNH LUẬN GỐC:
                        </label>
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.82rem', lineHeight: '1.55', color: '#1e293b', fontStyle: 'italic' }}>
                          &ldquo;
                          {activeInspectingComment.highlightWord ? (
                            <>
                              {activeInspectingComment.content.split(activeInspectingComment.highlightWord)[0]}
                              <mark style={{
                                background: activeInspectingComment.riskLevel === 'high' ? '#fee2e2' : '#ffedd5',
                                color: activeInspectingComment.riskLevel === 'high' ? '#b91c1c' : '#c2410c',
                                padding: '0.15rem 0.35rem',
                                borderRadius: '4px',
                                fontWeight: 800
                              }}>
                                {activeInspectingComment.highlightWord}
                              </mark>
                              {activeInspectingComment.content.split(activeInspectingComment.highlightWord)[1]}
                            </>
                          ) : (
                            activeInspectingComment.content
                          )}
                          &rdquo;
                        </div>
                      </div>

                      {/* AI NLP ANALYSIS BOX */}
                      {activeInspectingComment.aiAnalysis && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.85rem', marginBottom: '1rem' }}>
                          <div style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 800, marginBottom: '0.55rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Zap size={14} color="#d97706" /> PHÂN TÍCH TỰ ĐỘNG TỪ VEGGIE-NLP
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.78rem' }}>
                            <div>
                              <strong style={{ color: '#b91c1c', display: 'block', marginBottom: '0.1rem' }}>
                                &bull; {activeInspectingComment.aiAnalysis.title}:
                              </strong>
                              <span style={{ color: '#451a03', lineHeight: '1.45' }}>
                                {activeInspectingComment.aiAnalysis.desc}
                              </span>
                            </div>

                            <div>
                              <strong style={{ color: '#ea580c', display: 'block', marginBottom: '0.1rem' }}>
                                &bull; Rủi ro tiềm tàng:
                              </strong>
                              <span style={{ color: '#451a03', lineHeight: '1.45' }}>
                                {activeInspectingComment.aiAnalysis.riskDesc}
                              </span>
                            </div>

                            <div style={{ borderTop: '1px dashed #fcd34d', paddingTop: '0.45rem', fontSize: '0.72rem', color: '#78350f' }}>
                              Mức tin cậy mô hình: <strong>{activeInspectingComment.aiAnalysis.confidence}</strong>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CONTEXT POST BOX */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.75rem', marginBottom: '1.15rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                          <img 
                            src={activeInspectingComment.targetThumb}
                            alt={activeInspectingComment.targetTitle}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Đăng tại bài viết:</div>
                            <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>{activeInspectingComment.targetTitle}</strong>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          Xem <ExternalLink size={12} />
                        </span>
                      </div>

                      {/* ACTION BUTTONS (ADMIN INTERVENTION) */}
                      <div style={{ marginBottom: '1.15rem' }}>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                          HÀNH ĐỘNG CAN THIỆP CỦA QUẢN TRỊ VIÊN:
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button 
                            style={{
                              width: '100%',
                              background: '#b91c1c',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              boxShadow: '0 2px 4px rgba(185,28,28,0.25)',
                              transition: 'all 0.15s'
                            }}
                            onClick={() => handleSingleDelete(activeInspectingComment)}
                          >
                            <Trash2 size={15} /> Xóa bình luận &amp; Gửi cảnh báo vi phạm
                          </button>

                          <button 
                            style={{
                              width: '100%',
                              background: '#78350f',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              boxShadow: '0 2px 4px rgba(120,53,15,0.25)',
                              transition: 'all 0.15s'
                            }}
                            onClick={() => handleSingleBanUser(activeInspectingComment)}
                          >
                            <Ban size={15} /> Khóa tính năng bình luận của User (7 ngày)
                          </button>

                          <button 
                            style={{
                              width: '100%',
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              borderRadius: '8px',
                              padding: '0.65rem',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.45rem',
                              transition: 'all 0.15s'
                            }}
                            onClick={() => handleSingleMarkFalsePositive(activeInspectingComment)}
                          >
                            <CheckCircle2 size={15} /> Bỏ qua cờ / Đánh dấu Nhận diện nhầm (False Positive)
                          </button>
                        </div>
                      </div>

                      {/* POLICY DISCLAIMER BOX */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.75rem', fontSize: '0.75rem', color: '#166534', lineHeight: '1.45' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800, marginBottom: '0.25rem' }}>
                          <ShieldCheck size={14} color="#059669" /> Quy tắc an toàn VeggieAI
                        </div>
                        Các bình luận tuyên truyền nhịn ăn cực đoan, sai lệch dinh dưỡng, bôi nhọ hoặc buôn bán TPCN không rõ nguồn gốc sẽ bị gỡ bỏ theo Điều lệ Bảo vệ Sức khỏe Cộng đồng.
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                      <MessageSquare size={36} color="#cbd5e1" style={{ margin: '0 auto 0.5rem auto' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>Chọn một bình luận trong bảng để xem chi tiết phân tích AI</p>
                    </div>
                  )}
                </div>
              </div>

              {/* MODAL: BỘ LỌC TỪ KHÓA CẤM (KEYWORD BLACKLIST) */}
              {showKeywordModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(3px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '520px',
                    padding: '1.5rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sliders size={18} color="#047857" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                          Bộ Lọc Từ Khóa Cấm (NLP Blacklist)
                        </h3>
                      </div>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        onClick={() => setShowKeywordModal(false)}
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: '1.5' }}>
                      Mô hình Veggie-NLP tự động phát hiện và gắn cờ các bình luận có chứa các từ ngữ thuộc từ điển cấm này trước khi hiển thị cho cộng đồng.
                    </p>

                    {/* ADD KEYWORD FORM */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                      <input 
                        type="text"
                        placeholder="Nhập từ khóa cấm cần bổ sung..."
                        value={newBannedKeyword}
                        onChange={(e) => setNewBannedKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddBannedKeyword()}
                        style={{
                          flex: 1,
                          padding: '0.55rem 0.75rem',
                          border: '1px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '0.82rem',
                          outline: 'none'
                        }}
                      />
                      <button 
                        style={{ background: '#047857', border: 'none', borderRadius: '8px', color: '#ffffff', padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                        onClick={handleAddBannedKeyword}
                      >
                        + Thêm từ khóa
                      </button>
                    </div>

                    {/* KEYWORDS TAGS LIST */}
                    <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
                      DANH SÁCH TỪ KHÓA ĐANG KÍCH HOẠT ({bannedKeywords.length}):
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', maxHeight: '200px', overflowY: 'auto', padding: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1.25rem' }}>
                      {bannedKeywords.map((kw, i) => (
                        <span 
                          key={i}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#b91c1c',
                            padding: '0.25rem 0.55rem',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          {kw}
                          <X 
                            size={13} 
                            style={{ cursor: 'pointer', color: '#dc2626' }}
                            onClick={() => handleRemoveBannedKeyword(kw)}
                          />
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
                        &bull; Độ chính xác phân loại NLP: 98.7%
                      </span>
                      <button 
                        style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                        onClick={() => setShowKeywordModal(false)}
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 5: QUẢN LÝ DANH MỤC MÓN ĂN (ĐÃ ĐƠN GIẢN HÓA 2 TẦNG)
              ===================================================================== */}
          {activeMenu === 'categories' && (
            <section style={{ animation: 'fadeIn 0.25s ease' }}>
              {/* BREADCRUMB & HEADER TOP */}
              <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    <span>Admin Portal</span>
                    <ChevronRight size={12} />
                    <span>Operations Center</span>
                    <ChevronRight size={12} />
                    <span style={{ color: '#047857', fontWeight: 600 }}>Quản lý danh mục món ăn</span>
                  </div>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0', letterSpacing: '-0.02em' }}>
                    Quản lý Danh mục Món Ăn
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0, maxWidth: '820px', lineHeight: 1.5 }}>
                    Tạo và quản lý danh mục để phân loại món ăn, công thức trong hệ thống VeggieAI.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={handleExportTaxonomies}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      color: '#334155',
                      padding: '0.55rem 0.95rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem'
                    }}
                  >
                    <Download size={15} /> Xuất JSON/CSV
                  </button>

                  <button 
                    className="admin-btn-primary"
                    onClick={() => setShowAddCatModal(true)}
                    style={{
                      background: '#047857',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '8px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)'
                    }}
                  >
                    <Plus size={16} /> Thêm danh mục mới
                  </button>
                </div>
              </div>

              {/* 3 THẺ METRICS STATS (ĐÃ BỎ THẺ Y KHOA) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* METRIC 1 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>TỔNG SỐ DANH MỤC</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Layers size={16} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>28</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                        +4 mới tháng này
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      2 cấp phân nhánh (3 nhóm cha, 25 danh mục con)
                    </div>
                  </div>
                  <div style={{ height: '4px', background: '#10b981', borderRadius: '2px', marginTop: '1rem', width: '100%' }} />
                </div>

                {/* METRIC 2 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>MÓN ĂN LIÊN KẾT</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Utensils size={16} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>14,820</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                        100% Gắn nhãn
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Đã phân loại vào hệ thống
                    </div>
                  </div>
                  <div style={{ height: '4px', background: '#047857', borderRadius: '2px', marginTop: '1rem', width: '100%' }} />
                </div>

                {/* METRIC 3 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem 1.25rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>ĐỘ CHÍNH XÁC AI MAPPING</span>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={16} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>99.1%</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', background: '#dbeafe', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
                        +0.4% MoM
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Gợi ý thực đơn chính xác
                    </div>
                  </div>
                  <div style={{ height: '4px', background: '#3b82f6', borderRadius: '2px', marginTop: '1rem', width: '100%' }} />
                </div>
              </div>

              {/* SUBTABS PILL NAVIGATION (KHÔNG CÒN TAB Y KHOA) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <button
                  onClick={() => setCatActiveTab('all')}
                  style={{
                    background: catActiveTab === 'all' ? '#064e3b' : '#f1f5f9',
                    color: catActiveTab === 'all' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Tất cả danh mục <span style={{ opacity: 0.85, fontSize: '0.75rem' }}>28</span>
                </button>

                <button
                  onClick={() => setCatActiveTab('schools')}
                  style={{
                    background: catActiveTab === 'schools' ? '#064e3b' : '#f1f5f9',
                    color: catActiveTab === 'schools' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Trường phái ăn chay
                </button>

                <button
                  onClick={() => setCatActiveTab('meals')}
                  style={{
                    background: catActiveTab === 'meals' ? '#064e3b' : '#f1f5f9',
                    color: catActiveTab === 'meals' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Loại món ăn
                </button>

                <button
                  onClick={() => setCatActiveTab('nutrition')}
                  style={{
                    background: catActiveTab === 'nutrition' ? '#064e3b' : '#f1f5f9',
                    color: catActiveTab === 'nutrition' ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Nhóm dinh dưỡng nổi bật
                </button>
              </div>

              {/* BỘ LỌC TÌM KIẾM & ĐIỀU KHIỂN CÂY DANH MỤC */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 320px', position: 'relative' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm tên danh mục..."
                    value={catSearchQuery}
                    onChange={(e) => setCatSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {catSearchQuery && (
                    <button
                      onClick={() => setCatSearchQuery('')}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.8rem', color: '#475569' }}>
                  <button
                    onClick={handleExpandAllNodes}
                    style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, padding: 0 }}
                  >
                    <ArrowUpDown size={14} /> Mở rộng tất cả
                  </button>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <button
                    onClick={handleCollapseAllNodes}
                    style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, padding: 0 }}
                  >
                    <SlidersHorizontal size={14} /> Thu gọn
                  </button>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                  <button
                    onClick={handleSortByPopularity}
                    style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, padding: 0 }}
                  >
                    <TrendingUp size={14} /> Sắp xếp theo số lượng món
                  </button>
                </div>
              </div>

              {/* BỐ CỤC 2 CỘT: CÂY DANH MỤC 2 TẦNG (TRÁI) & CHI TIẾT CẤU HÌNH RÚT GỌN (PHẢI) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 0.95fr)', gap: '1.25rem', alignItems: 'start' }}>
                
                {/* CỘT TRÁI: DANH SÁCH DANH MỤC 2 TẦNG — ĐƠN GIẢN HÓA TỪNG DÒNG */}
                <div>
                  {categoriesTaxonomy
                    .filter(parent => {
                      if (catActiveTab !== 'all' && parent.tabCategory !== catActiveTab) {
                        return false;
                      }
                      if (catSearchQuery) {
                        const q = catSearchQuery.toLowerCase();
                        const matchParent = parent.name.toLowerCase().includes(q);
                        const matchChild = parent.children?.some(c => c.name.toLowerCase().includes(q));
                        return matchParent || matchChild;
                      }
                      return true;
                    })
                    .map(parent => {
                      const isParentSelected = selectedCatNodeId === parent.id;
                      return (
                        <div key={parent.id} style={{ marginBottom: '0.9rem' }}>
                          {/* DÒNG DANH MỤC CHA */}
                          <div 
                            onClick={() => handleSelectCategoryNode(parent)}
                            style={{
                              background: isParentSelected ? '#f0fdf4' : '#ffffff',
                              border: isParentSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                              borderRadius: '12px',
                              padding: '1rem 1.15rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              boxShadow: isParentSelected ? '0 4px 14px rgba(16, 185, 129, 0.12)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                {/* NÚT MỞ RỘNG / THU GỌN */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleExpandParent(parent.id);
                                  }}
                                  style={{
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    width: '26px',
                                    height: '26px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: '#64748b'
                                  }}
                                  title="Đóng/Mở nhánh con"
                                >
                                  {parent.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>

                                {/* ICON */}
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: '#f1f5f9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '1.25rem'
                                }}>
                                  {parent.icon}
                                </div>

                                {/* TÊN & SỐ LƯỢNG MÓN ĂN (ĐƠN GIẢN HÓA) */}
                                <div>
                                  <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                                    {parent.name}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                                    {parent.count.toLocaleString()} món ăn
                                  </div>
                                </div>
                              </div>

                              {/* HÀNH ĐỘNG: TOGGLE BẬT/TẮT, SỬA, XÓA */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                {/* TOGGLE BẬT / TẮT */}
                                <button
                                  onClick={(e) => handleToggleCategoryActive(parent.id, e)}
                                  style={{
                                    width: '36px',
                                    height: '20px',
                                    borderRadius: '10px',
                                    background: parent.active ? '#047857' : '#cbd5e1',
                                    border: 'none',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    padding: 0
                                  }}
                                  title={parent.active ? 'Đang bật' : 'Đang tắt'}
                                >
                                  <div
                                    style={{
                                      width: '14px',
                                      height: '14px',
                                      borderRadius: '50%',
                                      background: '#ffffff',
                                      position: 'absolute',
                                      top: '3px',
                                      left: parent.active ? '18px' : '3px',
                                      transition: 'left 0.2s ease'
                                    }}
                                  />
                                </button>

                                {/* NÚT SỬA */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCategoryNode(parent);
                                  }}
                                  style={{
                                    background: '#f1f5f9',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.65rem',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    color: '#334155',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Sửa
                                </button>

                                {/* NÚT XÓA */}
                                <button
                                  onClick={(e) => handleDeleteCategoryNode(parent.id, parent.name, e)}
                                  style={{
                                    background: '#fee2e2',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.3rem 0.65rem',
                                    fontSize: '0.76rem',
                                    fontWeight: 700,
                                    color: '#b91c1c',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* DANH SÁCH DANH MỤC CON (CẤP 2) */}
                          {parent.expanded && parent.children && parent.children.length > 0 && (
                            <div style={{ marginLeft: '1.75rem', marginTop: '0.45rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                              {parent.children.map(child => {
                                const isChildSelected = selectedCatNodeId === child.id;
                                return (
                                  <div
                                    key={child.id}
                                    onClick={() => handleSelectCategoryNode(child)}
                                    style={{
                                      background: isChildSelected ? '#ecfdf5' : '#ffffff',
                                      border: isChildSelected ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                      borderRadius: '10px',
                                      padding: '0.8rem 1rem',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s ease',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      boxShadow: isChildSelected ? '0 4px 12px rgba(16, 185, 129, 0.12)' : 'none'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                      <CornerDownRight size={15} color="#94a3b8" />
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: isChildSelected ? '#d1fae5' : '#f8fafc',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.1rem'
                                      }}>
                                        {child.icon}
                                      </div>
                                      <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isChildSelected ? '#065f46' : '#0f172a' }}>
                                            {child.name}
                                          </span>
                                          {isChildSelected && (
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#10b981', color: '#ffffff', padding: '0.1rem 0.4rem', borderRadius: '6px' }}>
                                              Đang chọn
                                            </span>
                                          )}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                                          {child.count.toLocaleString()} món ăn
                                        </div>
                                      </div>
                                    </div>

                                    {/* HÀNH ĐỘNG CHO CON: TOGGLE BẬT/TẮT, SỬA, XÓA */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                                      <button
                                        onClick={(e) => handleToggleCategoryActive(child.id, e)}
                                        style={{
                                          width: '32px',
                                          height: '18px',
                                          borderRadius: '9px',
                                          background: child.active ? '#047857' : '#cbd5e1',
                                          border: 'none',
                                          position: 'relative',
                                          cursor: 'pointer',
                                          padding: 0
                                        }}
                                        title={child.active ? 'Đang bật' : 'Đang tắt'}
                                      >
                                        <div
                                          style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            background: '#ffffff',
                                            position: 'absolute',
                                            top: '3px',
                                            left: child.active ? '17px' : '3px',
                                            transition: 'left 0.2s ease'
                                          }}
                                        />
                                      </button>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSelectCategoryNode(child);
                                        }}
                                        style={{
                                          background: '#f1f5f9',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.25rem 0.6rem',
                                          fontSize: '0.74rem',
                                          fontWeight: 700,
                                          color: '#334155',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Sửa
                                      </button>

                                      <button
                                        onClick={(e) => handleDeleteCategoryNode(child.id, child.name, e)}
                                        style={{
                                          background: '#fee2e2',
                                          border: 'none',
                                          borderRadius: '6px',
                                          padding: '0.25rem 0.6rem',
                                          fontSize: '0.74rem',
                                          fontWeight: 700,
                                          color: '#b91c1c',
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Xóa
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* PHÂN TRANG DƯỚI CÙNG BÊN TRÁI */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', padding: '0.75rem 0.25rem', borderTop: '1px solid #f1f5f9', fontSize: '0.8rem', color: '#64748b' }}>
                    <span>Hiển thị 3 nhóm phân loại lớn (28 danh mục món ăn)</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ background: '#f1f5f9', borderRadius: '6px', padding: '0.35rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                        1 / 1
                      </span>
                    </div>
                  </div>
                </div>

                {/* CỘT PHẢI: PANEL "CHI TIẾT CẤU HÌNH DANH MỤC" — RÚT GỌN MẠNH */}
                <div style={{ position: 'sticky', top: '1.5rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
                    
                    {/* TIÊU ĐỀ PANEL */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem 0' }}>
                          Chi tiết danh mục
                        </h3>
                        <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                          Chỉnh sửa thông tin danh mục hiển thị trên hệ thống
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={handleCancelCategoryConfig}
                          style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '0.45rem 0.75rem' }}
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSaveCategoryConfig}
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1.1rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            boxShadow: '0 2px 6px rgba(4, 120, 87, 0.25)'
                          }}
                        >
                          <Check size={14} /> Lưu thay đổi
                        </button>
                      </div>
                    </div>

                    {/* FORM RÚT GỌN CHỈ VỚI 4 TRƯỜNG CỐT LÕI */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                      
                      {/* TRƯỜNG 1: TÊN DANH MỤC */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Tên danh mục (Tiếng Việt) *
                        </label>
                        <input
                          type="text"
                          value={editCatName}
                          onChange={(e) => setEditCatName(e.target.value)}
                          placeholder="Ví dụ: Món Giàu Đạm Thực Vật"
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.88rem',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>

                      {/* TRƯỜNG 2: THUỘC DANH MỤC CHA */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Thuộc danh mục cha
                        </label>
                        <select
                          value={editCatParentId}
                          onChange={(e) => setEditCatParentId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.86rem',
                            background: '#ffffff',
                            color: '#334155',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        >
                          <option value="">Không có (Danh mục cha gốc)</option>
                          <option value="CAT-GRP-01">🌱 Trường phái ăn chay</option>
                          <option value="CAT-GRP-02">🍲 Loại món ăn</option>
                          <option value="CAT-GRP-03">💪 Nhóm dinh dưỡng nổi bật</option>
                        </select>
                      </div>

                      {/* TRƯỜNG 3: MÔ TẢ NGẮN */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Mô tả ngắn
                        </label>
                        <textarea
                          rows={3}
                          value={editCatDesc}
                          onChange={(e) => setEditCatDesc(e.target.value)}
                          placeholder="Mô tả để hiển thị cho user..."
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.84rem',
                            lineHeight: 1.5,
                            outline: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box',
                            background: '#fafafa'
                          }}
                        />
                      </div>

                      {/* TRƯỜNG 4: BIỂU TƯỢNG (CHỌN ICON CÓ SẴN) */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          Biểu tượng:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '10px',
                            background: '#f0fdf4',
                            border: '1.5px solid #10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem'
                          }}>
                            {editCatIcon}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Chọn biểu tượng phù hợp từ danh sách icon có sẵn bên dưới:
                          </div>
                        </div>

                        {/* DANH SÁCH ICON CÓ SẴN ĐỂ CLICK CHỌN NHANH */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.4rem' }}>
                          {PRESET_CAT_ICONS.map(icon => (
                            <button
                              key={icon}
                              onClick={() => setEditCatIcon(icon)}
                              style={{
                                background: editCatIcon === icon ? '#dcfce7' : '#f8fafc',
                                border: editCatIcon === icon ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                padding: '0.45rem 0',
                                fontSize: '1.25rem',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                              title={`Chọn icon ${icon}`}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>

              {/* MODAL THÊM CATEGORY MỚI (RÚT GỌN ĐỒNG BỘ) */}
              {showAddCatModal && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(15, 23, 42, 0.65)',
                  backdropFilter: 'blur(4px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999,
                  padding: '1rem'
                }}>
                  <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                        Thêm Danh Mục Món Ăn Mới
                      </h3>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddCatModal(false)}>
                        <X size={20} color="#64748b" />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                          Tên danh mục (Tiếng Việt) *
                        </label>
                        <input 
                          type="text" 
                          placeholder="Ví dụ: Món Giàu Sắt &amp; Khoáng Chất"
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                          Thuộc danh mục cha
                        </label>
                        <select
                          value={newCatParentId}
                          onChange={(e) => setNewCatParentId(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                        >
                          <option value="">Không có (Tạo nhóm cha mới)</option>
                          <option value="CAT-GRP-01">🌱 Trường phái ăn chay</option>
                          <option value="CAT-GRP-02">🍲 Loại món ăn</option>
                          <option value="CAT-GRP-03">💪 Nhóm dinh dưỡng nổi bật</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                          Biểu tượng
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '0.35rem' }}>
                          {PRESET_CAT_ICONS.map(icon => (
                            <button
                              key={icon}
                              onClick={() => setNewCatIcon(icon)}
                              style={{
                                background: newCatIcon === icon ? '#dcfce7' : '#f8fafc',
                                border: newCatIcon === icon ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                                borderRadius: '6px',
                                padding: '0.35rem 0',
                                fontSize: '1.2rem',
                                cursor: 'pointer'
                              }}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem', color: '#334155' }}>
                          Mô tả ngắn:
                        </label>
                        <textarea 
                          rows={3}
                          placeholder="Mô tả danh mục để hiển thị cho người dùng..."
                          value={newCatDesc}
                          onChange={(e) => setNewCatDesc(e.target.value)}
                          style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                      <button 
                        style={{ background: '#f1f5f9', border: 'none', padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#475569' }} 
                        onClick={() => setShowAddCatModal(false)}
                      >
                        Hủy
                      </button>
                      <button 
                        className="admin-btn-primary" 
                        onClick={handleCreateNewCategory}
                        style={{ background: '#047857', color: '#ffffff', border: 'none', padding: '0.55rem 1.35rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Tạo Danh Mục
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 6: GIÁM SÁT & QUẢN TRỊ HỆ THỐNG MÔ HÌNH AI (AI MONITORING & MLOPS)
              ===================================================================== */}
          {activeMenu === 'ai-monitoring' && (
            <section style={{ animation: 'fadeIn 0.2s ease', paddingBottom: '3rem' }}>
              {/* BREADCRUMB */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span style={{ cursor: 'pointer', color: '#047857', fontWeight: 600 }} onClick={() => setActiveMenu('overview')}>Admin Portal</span>
                <ChevronRight size={13} />
                <span>Điều hành &amp; AI Hub</span>
                <ChevronRight size={13} />
                <span style={{ color: '#047857', fontWeight: 700 }}>Giám sát AI &amp; Model Ops</span>
              </div>

              {/* TITLE & SUBTITLE */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
                  Giám sát &amp; Quản trị Hệ thống Mô hình AI (AI Monitoring &amp; MLOps)
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 0.85rem 0', lineHeight: 1.5, maxWidth: '1000px' }}>
                  Theo dõi thời gian thực hiệu năng, độ trễ, độ chính xác và log suy luận của 4 cụm mô hình cốt lõi: AI Meal Planner, Vision Recipe Extractor, Nutrition Chatbot và NLP Content Moderation.
                </p>

                {/* INFRASTRUCTURE STATUS BADGE */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.4rem 0.95rem', borderRadius: '9999px', color: '#065f46', fontSize: '0.8rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)' }}></span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 800, letterSpacing: '0.04em', color: '#047857' }}>TRẠNG THÁI HẠ TẦNG MLOPS:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>All 4 Models Healthy &amp; Serving</span>
                </div>
              </div>

              {/* TIME FILTER & ACTION BUTTONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* Time Range Pills */}
                <div style={{ display: 'inline-flex', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.25rem', gap: '0.25rem' }}>
                  {[
                    { id: '24h', label: '24 Giờ qua' },
                    { id: '7d', label: '7 Ngày qua' },
                    { id: '30d', label: '30 Ngày' },
                    { id: 'custom', label: 'Tùy chỉnh 📅' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setMlopsTimeRange(tab.id);
                        showToast(`Đã lọc phạm vi dữ liệu: ${tab.label}`);
                      }}
                      style={{
                        background: mlopsTimeRange === tab.id ? '#ecfdf5' : 'transparent',
                        color: mlopsTimeRange === tab.id ? '#047857' : '#64748b',
                        border: mlopsTimeRange === tab.id ? '1px solid #10b981' : '1px solid transparent',
                        padding: '0.42rem 0.9rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: mlopsTimeRange === tab.id ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => setShowThresholdModal(true)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.52rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#94a3b8'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <SlidersHorizontal size={14} color="#64748b" /> Cấu hình Ngưỡng &amp; Cảnh báo
                  </button>

                  <button 
                    onClick={handleRunBenchmark}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.52rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#047857', cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                  >
                    <RefreshCw size={14} color="#059669" /> Chạy Benchmark Đánh Giá
                  </button>

                  <button 
                    onClick={handleExportMLOpsReport}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: '#047857', color: '#ffffff', border: 'none', padding: '0.52rem 1.1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 4px rgba(4, 120, 87, 0.2)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#065f46'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#047857'}
                  >
                    <Download size={14} /> Xuất báo cáo MLOps
                  </button>
                </div>
              </div>

              {/* 4 TOP KPI CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
                {/* Card 1: Độ chính xác trung bình */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      ĐỘ CHÍNH XÁC TRUNG BÌNH
                    </span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={18} color="#059669" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>98.6%</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                      ↑ +0.3%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                    <div style={{ width: '98.6%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Đo lường trên 450,000 requests
                  </div>
                </div>

                {/* Card 2: Thời gian phản hồi P95 */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      THỜI GIAN PHẢN HỒI P95
                    </span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={18} color="#64748b" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>420</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#64748b' }}>ms</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                      ↓ -35ms
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ width: '12px', height: '6px', background: '#10b981', borderRadius: '3px' }}></span>
                    <span style={{ width: '12px', height: '6px', background: '#10b981', borderRadius: '3px' }}></span>
                    <span style={{ width: '12px', height: '6px', background: '#10b981', borderRadius: '3px' }}></span>
                    <span style={{ width: '12px', height: '6px', background: '#10b981', borderRadius: '3px' }}></span>
                    <span style={{ width: '12px', height: '6px', background: '#cbd5e1', borderRadius: '3px' }}></span>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Đã tối ưu hóa Redis Layer Cache
                  </div>
                </div>

                {/* Card 3: Suy luận trong ngày */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      SUY LUẬN TRONG NGÀY
                    </span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={18} color="#ea580c" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>84,920</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', background: '#fff7ed', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                      Peak 120 req/s
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                    <div style={{ width: '74%', height: '100%', background: '#f97316', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Đỉnh lưu lượng: 11:30 - 12:45 sáng
                  </div>
                </div>

                {/* Card 4: Cảnh báo lệch dữ liệu */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      CẢNH BÁO LỆCH DỮ LIỆU
                    </span>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle size={18} color="#ea580c" />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.45rem' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 900, color: '#c2410c', letterSpacing: '-0.03em', lineHeight: 1 }}>2</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#c2410c', background: '#fff7ed', padding: '0.15rem 0.45rem', borderRadius: '6px' }}>
                      Mức độ nhẹ
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                    Dataset rau củ mùa hè n...
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Cần gắn nhãn kiểm tra 350 mẫu mới
                  </div>
                </div>
              </div>

              {/* MAIN 2-COLUMN SECTION */}
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.85fr) minmax(0, 1.15fr)', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
                {/* LEFT COLUMN: TRẠNG THÁI 4 CỤM MÔ HÌNH AI */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                        Trạng thái 4 Cụm Mô hình AI
                      </h3>
                      <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                        Production v2.4
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Tự động đồng bộ mỗi 10 giây
                    </span>
                  </div>

                  {/* 2x2 Model Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {mlopsModels.map(model => (
                      <div 
                        key={model.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div>
                          {/* Top row: Icon + Title + Status Badge */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: model.id === 'meal-planner' ? '#ecfdf5' : model.id === 'vision-extractor' ? '#fff7ed' : model.id === 'nutrition-chatbot' ? '#ecfeff' : '#fef2f2',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {model.id === 'meal-planner' && <Utensils size={18} color="#059669" />}
                                {model.id === 'vision-extractor' && <Camera size={18} color="#ea580c" />}
                                {model.id === 'nutrition-chatbot' && <MessageSquare size={18} color="#0891b2" />}
                                {model.id === 'nlp-moderation' && <Shield size={18} color="#dc2626" />}
                              </div>
                              <div>
                                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>{model.name}</h4>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{model.arch}</div>
                              </div>
                            </div>

                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              color: model.badgeType === 'drift' ? '#c2410c' : '#047857',
                              background: model.badgeType === 'drift' ? '#fff7ed' : '#ecfdf5',
                              border: model.badgeType === 'drift' ? '1px solid #fed7aa' : '1px solid #a7f3d0',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              ● {model.badge}
                            </span>
                          </div>

                          {/* Description */}
                          <p style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45, margin: '0 0 0.85rem 0', minHeight: '44px' }}>
                            {model.desc}
                          </p>

                          {/* Metrics 2x2 */}
                          <div style={{
                            background: '#f8fafc',
                            border: '1px solid #f1f5f9',
                            borderRadius: '8px',
                            padding: '0.65rem 0.75rem',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '0.6rem',
                            marginBottom: model.driftNote ? '0.5rem' : '0.85rem'
                          }}>
                            {model.metrics.map((met, idx) => (
                              <div key={idx}>
                                <div style={{ fontSize: '0.66rem', color: '#94a3b8', fontWeight: 700 }}>{met.label}</div>
                                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: met.color }}>{met.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Drift Warning Note (if any) */}
                          {model.driftNote && (
                            <div style={{ fontSize: '0.7rem', color: '#ea580c', fontStyle: 'italic', marginBottom: '0.85rem', lineHeight: 1.35 }}>
                              {model.driftNote}
                            </div>
                          )}
                        </div>

                        {/* Action buttons footer */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {model.id === 'meal-planner' && (
                            <>
                              <button 
                                onClick={() => {
                                  setMlopsModelFilter('meal-planner');
                                  showToast('🔍 Đã lọc log suy luận của AI Meal Planner!');
                                }}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                              >
                                Xem Log Suy Luận
                              </button>
                              <button 
                                onClick={() => {
                                  setTestPromptModel('meal-planner');
                                  setShowTestPromptModal(true);
                                }}
                                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#047857', cursor: 'pointer' }}
                              >
                                🧪 Test Prompt
                              </button>
                            </>
                          )}

                          {model.id === 'vision-extractor' && (
                            <>
                              <button 
                                onClick={() => {
                                  setMlopsModelFilter('vision-extractor');
                                  showToast('🔍 Đã lọc mẫu nhận diện Vision Extractor!');
                                }}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                              >
                                Xem Mẫu Nhận Diện
                              </button>
                              <button 
                                onClick={() => setShowRetrainModal(true)}
                                style={{ background: '#c2410c', border: 'none', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                              >
                                <RefreshCw size={12} /> Re-train Dataset
                              </button>
                            </>
                          )}

                          {model.id === 'nutrition-chatbot' && (
                            <>
                              <button 
                                onClick={() => handleOpenSampleDialog('nutrition-chatbot')}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                              >
                                Hội thoại mẫu
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveMenu('comments');
                                  showToast('Đang điều hướng sang Quản lý Bình luận / Chặn từ khóa blacklist!');
                                }}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', cursor: 'pointer' }}
                              >
                                🚫 Chặn từ khóa
                              </button>
                            </>
                          )}

                          {model.id === 'nlp-moderation' && (
                            <>
                              <button 
                                onClick={() => {
                                  setActiveMenu('comments');
                                  showToast('Đang mở Cấu hình Blacklist từ khóa!');
                                }}
                                style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                              >
                                Cấu hình Blacklist
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveMenu('ai-flagged');
                                  showToast('Đang chuyển đến Hàng đợi nội dung bị AI gắn cờ!');
                                }}
                                style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.45rem 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}
                              >
                                🚩 Flagged Queue (12)
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: TÀI NGUYÊN MLOPS & CONCEPT DRIFT */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* CARD A: PHÂN BỔ TÀI NGUYÊN MLOPS */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        Phân bổ Tài nguyên MLOps
                      </h4>
                      <Server size={18} color="#059669" />
                    </div>

                    {/* Hardware Box (Dark Slate) */}
                    <div style={{ background: '#0f172a', borderRadius: '10px', padding: '1.15rem', color: '#ffffff', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Cpu size={16} color="#34d399" />
                          <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>NVIDIA A10G Cluster</strong>
                        </div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                          Node-04 Active
                        </span>
                      </div>

                      {/* VRAM Progress */}
                      <div style={{ marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          <span>VRAM đã cấp phát (16.3 GB / 24 GB)</span>
                          <strong style={{ color: '#34d399' }}>68%</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '68%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
                        </div>
                      </div>

                      {/* GPU Compute Progress */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                          <span>GPU Compute Utilization</span>
                          <strong style={{ color: '#38bdf8' }}>84%</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#334155', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '84%', height: '100%', background: '#0284c7', borderRadius: '3px' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Cluster Details List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.78rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                        <span style={{ color: '#64748b' }}>Docker Containers</span>
                        <strong style={{ color: '#0f172a' }}>4 Services Running (Docker Compose)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                        <span style={{ color: '#64748b' }}>Throughput trung bình</span>
                        <strong style={{ color: '#0f172a' }}>1,240 req/phút</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.45rem' }}>
                        <span style={{ color: '#64748b' }}>PostgreSQL (pgvector)</span>
                        <strong style={{ color: '#059669' }}>Healthy (4.2ms query)</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Redis In-Memory Cache</span>
                        <strong style={{ color: '#059669' }}>Hit Rate: 94.6%</strong>
                      </div>
                    </div>

                    {/* Bottom Pipeline Notification */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <Zap size={15} color="#059669" />
                      <div style={{ fontSize: '0.73rem', color: '#334155', lineHeight: 1.35 }}>
                        <strong>Pipeline Huấn luyện Định kỳ:</strong> Tự động Fine-tune kế tiếp: <strong>Chủ Nhật lúc 02:00</strong>
                      </div>
                    </div>
                  </div>

                  {/* CARD B: CẢNH BÁO CONCEPT DRIFT */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        Cảnh báo Concept Drift
                      </h4>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }}></span>
                    </div>

                    {/* Alert Content Box */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '0.85rem 1rem', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                        <AlertTriangle size={15} color="#d97706" />
                        <strong style={{ fontSize: '0.84rem', color: '#92400e' }}>Rau Củ Nhiệt Đới Mùa Mới</strong>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: '#78350f', lineHeight: 1.45, margin: 0 }}>
                        Model Vision phát hiện gia tăng ảnh chứa rau tiến vua tươi, măng tây xanh và nấm tuyết khô chưa có trong weight cốt lõi v2.4.
                      </p>
                    </div>

                    {/* Action link */}
                    <button 
                      onClick={() => setShowRetrainModal(true)}
                      style={{
                        width: '100%',
                        background: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#047857'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
                    >
                      <span>Gắn nhãn kiểm chứng bổ sung (350 mẫu)</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: LIVE STREAMING INFERENCE LOGS TABLE */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      Nhật ký Suy luận &amp; Bắt lỗi Thời gian thực
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                      Cập nhật luồng dữ liệu stream trực tiếp từ Kafka Ingestion Log
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <button 
                      onClick={() => {
                        setIsLiveStreaming(!isLiveStreaming);
                        showToast(isLiveStreaming ? '⏸️ Đã tạm dừng Live Stream Logs' : '▶️ Đã bật lại Live Streaming Logs');
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        background: isLiveStreaming ? '#ecfdf5' : '#f1f5f9',
                        border: isLiveStreaming ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: isLiveStreaming ? '#047857' : '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isLiveStreaming ? '#10b981' : '#94a3b8' }}></span>
                      <span>{isLiveStreaming ? 'Live Streaming Logs' : 'Stream Paused'}</span>
                    </button>

                    <button 
                      onClick={() => showToast('🔄 Đã làm mới luồng log suy luận từ Kafka!')}
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      title="Làm mới log"
                    >
                      <RefreshCw size={14} color="#64748b" />
                    </button>
                  </div>
                </div>

                {/* Filter Toolbar */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.65rem', marginBottom: '1rem' }}>
                  {/* Search Input */}
                  <div style={{ position: 'relative', flex: '1 1 280px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm theo Request ID (REQ-xxx), User ID hoặc từ khóa..."
                      value={mlopsSearchQuery}
                      onChange={(e) => setMlopsSearchQuery(e.target.value)}
                      style={{ width: '100%', padding: '0.45rem 0.75rem 0.45rem 2.2rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', color: '#0f172a', background: '#ffffff', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Model Dropdown */}
                  <select 
                    value={mlopsModelFilter}
                    onChange={(e) => setMlopsModelFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="all">Tất cả Mô hình (4/4)</option>
                    <option value="meal-planner">AI Meal Planner</option>
                    <option value="vision-extractor">Vision Extractor</option>
                    <option value="nutrition-chatbot">Nutrition Chatbot</option>
                    <option value="nlp-moderation">NLP Moderation</option>
                  </select>

                  {/* Log Level Dropdown */}
                  <select 
                    value={mlopsLogLevelFilter}
                    onChange={(e) => setMlopsLogLevelFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="all">Mức độ Log: Tất cả</option>
                    <option value="INFO">INFO (Thành công)</option>
                    <option value="WARN">WARN (Drift / Chậm)</option>
                    <option value="ERROR">ERROR (Chặn 403)</option>
                  </select>

                  {/* Status Dropdown */}
                  <select 
                    value={mlopsStatusFilter}
                    onChange={(e) => setMlopsStatusFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', color: '#334155', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <option value="all">Trạng thái: Tất cả</option>
                    <option value="200">200 OK</option>
                    <option value="warn">Drift Warn</option>
                    <option value="403">Blocked 403</option>
                  </select>

                  {/* Reset Button */}
                  <button 
                    onClick={() => {
                      setMlopsSearchQuery('');
                      setMlopsModelFilter('all');
                      setMlopsLogLevelFilter('all');
                      setMlopsStatusFilter('all');
                      showToast('Đã đặt lại bộ lọc log suy luận.');
                    }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', background: '#ffffff', cursor: 'pointer' }}
                  >
                    <RotateCcw size={13} /> Đặt lại
                  </button>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        <th style={{ padding: '0.75rem 0.85rem' }}>MÃ REQUEST / THỜI GIAN</th>
                        <th style={{ padding: '0.75rem 0.85rem' }}>CỤM MODEL</th>
                        <th style={{ padding: '0.75rem 0.85rem' }}>DỮ LIỆU ĐẦU VÀO (INPUT SNIPPET)</th>
                        <th style={{ padding: '0.75rem 0.85rem' }}>KẾT QUẢ ĐẦU RA (OUTPUT / DECISION)</th>
                        <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>ĐỘ TRỄ / TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mlopsLogs
                        .filter(log => {
                          if (mlopsModelFilter !== 'all' && log.modelId !== mlopsModelFilter) return false;
                          if (mlopsLogLevelFilter !== 'all' && log.logLevel !== mlopsLogLevelFilter) return false;
                          if (mlopsStatusFilter !== 'all' && log.statusCode !== mlopsStatusFilter) return false;
                          if (mlopsSearchQuery.trim()) {
                            const q = mlopsSearchQuery.toLowerCase();
                            return log.id.toLowerCase().includes(q) || log.input.toLowerCase().includes(q) || log.userMeta.toLowerCase().includes(q) || log.output.toLowerCase().includes(q);
                          }
                          return true;
                        })
                        .map((row, idx) => (
                          <tr key={row.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                            {/* Request ID / Time */}
                            <td style={{ padding: '0.85rem' }}>
                              <strong style={{ color: '#0f172a', display: 'block', fontSize: '0.82rem' }}>{row.id}</strong>
                              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{row.timestamp}</span>
                            </td>

                            {/* Model */}
                            <td style={{ padding: '0.85rem' }}>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '12px',
                                fontSize: '0.73rem',
                                fontWeight: 700,
                                color: row.modelColor,
                                background: row.modelBg
                              }}>
                                {row.modelIcon === 'utensils' && <Utensils size={12} />}
                                {row.modelIcon === 'camera' && <Camera size={12} />}
                                {row.modelIcon === 'message-square' && <MessageSquare size={12} />}
                                {row.modelIcon === 'shield' && <Shield size={12} />}
                                <span>{row.modelName}</span>
                              </span>
                            </td>

                            {/* Input snippet */}
                            <td style={{ padding: '0.85rem', maxWidth: '320px' }}>
                              <div style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.78rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {row.input}
                              </div>
                              <div style={{ color: '#64748b', fontSize: '0.71rem' }}>
                                {row.userMeta}
                              </div>
                            </td>

                            {/* Output / decision */}
                            <td style={{ padding: '0.85rem', maxWidth: '320px' }}>
                              <div style={{ color: '#334155', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {row.output}
                              </div>
                            </td>

                            {/* Latency / Status */}
                            <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                                {row.latency}
                              </div>
                              <span style={{
                                display: 'inline-block',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: row.statusColor,
                                background: row.statusBg,
                                padding: '0.15rem 0.45rem',
                                borderRadius: '6px'
                              }}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', fontSize: '0.78rem', color: '#64748b' }}>
                  <div>
                    Hiển thị <strong>1 - 5</strong> trên tổng số <strong>84,920</strong> lượt suy luận hôm nay
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>|&lt;</button>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>&lt;</button>
                    <button style={{ border: 'none', background: '#047857', color: '#ffffff', borderRadius: '6px', width: '28px', height: '28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem' }}>1</button>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}>2</button>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', fontSize: '0.75rem' }}>3</button>
                    <span style={{ padding: '0 0.2rem' }}>...</span>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>16,984</button>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>&gt;</button>
                    <button style={{ border: '1px solid #e2e8f0', background: '#ffffff', borderRadius: '6px', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>&gt;|</button>
                  </div>
                </div>
              </div>

              {/* =========================================================================
                  MODALS FOR MLOPS SCREEN
                  ========================================================================= */}
              {/* 1. THRESHOLDS & ALERTS MODAL */}
              {showThresholdModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '540px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <SlidersHorizontal size={18} color="#059669" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Cấu hình Ngưỡng &amp; Cảnh báo MLOps</h3>
                      </div>
                      <button onClick={() => setShowThresholdModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSaveThresholds} style={{ padding: '1.5rem' }}>
                      <div style={{ marginBottom: '1.15rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          <span>Ngưỡng cảnh báo Độ trễ P95 (SLA limit):</span>
                          <strong style={{ color: '#059669' }}>{thresholdConfig.latencyP95} ms</strong>
                        </label>
                        <input 
                          type="range" 
                          min="200" 
                          max="2000" 
                          step="50"
                          value={thresholdConfig.latencyP95}
                          onChange={(e) => setThresholdConfig({ ...thresholdConfig, latencyP95: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: '#059669' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                          <span>200 ms</span>
                          <span>Chuẩn NFR: ≤10,000 ms</span>
                          <span>2,000 ms</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.15rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          <span>Ngưỡng sai lệch nhận diện (Concept Drift):</span>
                          <strong style={{ color: '#ea580c' }}>{thresholdConfig.driftRate}%</strong>
                        </label>
                        <input 
                          type="range" 
                          min="1.0" 
                          max="10.0" 
                          step="0.5"
                          value={thresholdConfig.driftRate}
                          onChange={(e) => setThresholdConfig({ ...thresholdConfig, driftRate: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: '#ea580c' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8' }}>
                          <span>1.0% (Khắt khe)</span>
                          <span>Hiện tại: 3.1% (Cảnh báo nhẹ)</span>
                          <span>10.0%</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                          <span>Ngưỡng ảo giác Chatbot (Hallucination Limit):</span>
                          <strong style={{ color: '#059669' }}>{thresholdConfig.hallucinationRate}%</strong>
                        </label>
                        <input 
                          type="range" 
                          min="0.05" 
                          max="2.0" 
                          step="0.05"
                          value={thresholdConfig.hallucinationRate}
                          onChange={(e) => setThresholdConfig({ ...thresholdConfig, hallucinationRate: Number(e.target.value) })}
                          style={{ width: '100%', accentColor: '#059669' }}
                        />
                      </div>

                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Kênh nhận cảnh báo sự cố:</div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', marginBottom: '0.4rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={thresholdConfig.notifySlack} 
                            onChange={(e) => setThresholdConfig({ ...thresholdConfig, notifySlack: e.target.checked })} 
                            style={{ accentColor: '#059669' }} 
                          />
                          <span>Webhook Discord / Slack Dev Channel (#alerts-mlops)</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#334155', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={thresholdConfig.notifyEmail} 
                            onChange={(e) => setThresholdConfig({ ...thresholdConfig, notifyEmail: e.target.checked })} 
                            style={{ accentColor: '#059669' }} 
                          />
                          <span>Email khẩn cấp tới Quản trị viên (admin@veggieai.vn)</span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                        <button type="button" onClick={() => setShowThresholdModal(false)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                          Hủy
                        </button>
                        <button type="submit" style={{ background: '#047857', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}>
                          Lưu Cấu Hình
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 2. BENCHMARK MODAL */}
              {showBenchmarkModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={18} color="#059669" className={isBenchmarking ? 'animate-spin' : ''} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                          {isBenchmarking ? 'Đang chạy Benchmark Đánh giá...' : 'Kết quả Benchmark 4 Mô hình AI'}
                        </h3>
                      </div>
                      {!isBenchmarking && (
                        <button onClick={() => setShowBenchmarkModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      {isBenchmarking ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                            Đang kiểm thử song song 1,000 requests trên Cluster NVIDIA A10G...
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                            <div style={{ width: `${benchmarkProgress}%`, height: '100%', background: '#059669', transition: 'width 0.2s ease' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Tiến độ: {benchmarkProgress}% (Batch 24/32)</span>
                        </div>
                      ) : benchmarkResult ? (
                        <div>
                          <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
                            <CheckCircle2 size={20} color="#059669" />
                            <div>
                              <strong style={{ color: '#065f46', fontSize: '0.86rem', display: 'block' }}>Toàn bộ 4 cụm mô hình vượt chuẩn SLA &amp; NFR!</strong>
                              <span style={{ color: '#047857', fontSize: '0.75rem' }}>Thời điểm hoàn tất: {benchmarkResult.timestamp}</span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TỔNG MẪU KIỂM TRA</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{benchmarkResult.totalSamples} reqs</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TỈ LỆ ĐẠT (PASS RATE)</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669' }}>{benchmarkResult.passRate}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>ĐỘ TRỄ P95 THỰC TẾ</div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{benchmarkResult.p95Latency}</div>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>TRẠNG THÁI DRIFT</div>
                              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ea580c' }}>{benchmarkResult.driftStatus}</div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                            <button onClick={() => setShowBenchmarkModal(false)} style={{ background: '#047857', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}>
                              Đóng
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. TEST PROMPT MODAL */}
              {showTestPromptModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '620px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Terminal size={18} color="#059669" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Interactive Test Prompt - Playground</h3>
                      </div>
                      <button onClick={() => setShowTestPromptModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      {/* Select Model Tabs */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Chọn Mô hình kiểm thử:</label>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          {[
                            { id: 'meal-planner', label: 'AI Meal Planner' },
                            { id: 'vision-extractor', label: 'Vision Extractor' },
                            { id: 'nutrition-chatbot', label: 'Nutrition Chatbot' },
                            { id: 'nlp-moderation', label: 'NLP Moderation' }
                          ].map(m => (
                            <button
                              key={m.id}
                              onClick={() => {
                                setTestPromptModel(m.id);
                                setTestPromptResult(null);
                                if (m.id === 'meal-planner') setTestPromptInput('Tủ lạnh có: đậu hũ non, nấm đùi gà, cải thìa, cà rốt. Cần bữa tối thuần chay giàu protein > 25g, calo < 480 kcal.');
                                if (m.id === 'vision-extractor') setTestPromptInput('Simulate Image Upload: [Plate_Vegetables_Dinner_Kitchen_Light.jpg - 1080x1920]');
                                if (m.id === 'nutrition-chatbot') setTestPromptInput('Người ăn chay trường thì bổ sung vi chất B12 và Sắt bằng thực phẩm nào tốt nhất?');
                                if (m.id === 'nlp-moderation') setTestPromptInput('Ăn chay tuyệt đối không uống thuốc tây sẽ tự khỏi bệnh tiểu đường sau 1 tuần.');
                              }}
                              style={{
                                background: testPromptModel === m.id ? '#ecfdf5' : '#f8fafc',
                                color: testPromptModel === m.id ? '#047857' : '#475569',
                                border: testPromptModel === m.id ? '1px solid #10b981' : '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '0.35rem 0.65rem',
                                fontSize: '0.78rem',
                                fontWeight: testPromptModel === m.id ? 700 : 500,
                                cursor: 'pointer'
                              }}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Prompt Input */}
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.4rem' }}>Nội dung đầu vào (Input Snippet / Prompt):</label>
                        <textarea 
                          rows={3}
                          value={testPromptInput}
                          onChange={(e) => setTestPromptInput(e.target.value)}
                          style={{ width: '100%', padding: '0.65rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', color: '#0f172a', resize: 'vertical', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button 
                          onClick={handleRunTestPrompt}
                          disabled={isTestingPrompt}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#047857', border: 'none', borderRadius: '8px', padding: '0.5rem 1.1rem', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', cursor: isTestingPrompt ? 'not-allowed' : 'pointer' }}
                        >
                          <Zap size={14} /> {isTestingPrompt ? 'Đang suy luận...' : 'Thực thi suy luận'}
                        </button>
                      </div>

                      {/* Result Box */}
                      {testPromptResult && (
                        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.4rem' }}>
                            <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>KẾT QUẢ SUY LUẬN (INFERENCE OUTPUT):</strong>
                            <div style={{ display: 'flex', gap: '0.65rem', fontSize: '0.72rem', color: '#64748b' }}>
                              <span>Độ trễ: <strong style={{ color: '#059669' }}>{testPromptResult.latency}</strong></span>
                              <span>Tokens: <strong style={{ color: '#0f172a' }}>{testPromptResult.tokens}</strong></span>
                            </div>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5, marginBottom: '0.6rem' }}>
                            {testPromptResult.decision}
                          </div>
                          <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '0.6rem', borderRadius: '6px', fontSize: '0.72rem', margin: 0, overflowX: 'auto' }}>
                            {testPromptResult.rawJson}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. RETRAIN MODAL */}
              {showRetrainModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <RefreshCw size={18} color="#c2410c" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Tái huấn luyện Vision Dataset</h3>
                      </div>
                      {!isRetraining && (
                        <button onClick={() => setShowRetrainModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                          <X size={18} />
                        </button>
                      )}
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '0.85rem', marginBottom: '1.15rem' }}>
                        <strong style={{ fontSize: '0.84rem', color: '#c2410c', display: 'block', marginBottom: '0.35rem' }}>
                          ⚠️ Xử lý Cảnh báo Concept Drift (350 mẫu mới)
                        </strong>
                        <p style={{ fontSize: '0.76rem', color: '#9a3412', margin: 0, lineHeight: 1.45 }}>
                          Model Vision YOLOv8 hiện đang ghi nhận 3.1% sai lệch khi người dùng chụp rau tiến vua tươi, măng tây xanh và nấm tuyết khô do chưa có nhãn trong core weight v2.4.
                        </p>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: '#334155', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                        <div>● Cụm GPU thực thi: <strong>NVIDIA A10G (Node-04 Active)</strong></div>
                        <div>● Phương pháp: <strong>Transfer Learning LoRA Fine-tune (10 Epochs)</strong></div>
                        <div>● Dự kiến thời gian: <strong>~45 giây</strong> (không làm gián đoạn luồng suy luận)</div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                        <button 
                          disabled={isRetraining}
                          onClick={() => setShowRetrainModal(false)} 
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: '#475569', cursor: isRetraining ? 'not-allowed' : 'pointer' }}
                        >
                          Hủy bỏ
                        </button>
                        <button 
                          disabled={isRetraining}
                          onClick={handleStartRetrain}
                          style={{ background: '#c2410c', border: 'none', borderRadius: '8px', padding: '0.5rem 1.25rem', fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', cursor: isRetraining ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <RefreshCw size={14} className={isRetraining ? 'animate-spin' : ''} />
                          {isRetraining ? 'Đang Fine-tune weight...' : 'Kích hoạt Fine-tune ngay'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. SAMPLE DIALOG MODAL */}
              {showSampleDialogModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                  <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '580px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquare size={18} color="#0891b2" />
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Hội thoại mẫu - Nutrition Advisory Chatbot</h3>
                      </div>
                      <button onClick={() => setShowSampleDialogModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                        <X size={18} />
                      </button>
                    </div>

                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                        <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', borderRadius: '12px 12px 12px 2px', maxWidth: '85%', fontSize: '0.8rem', color: '#1e293b' }}>
                          <strong>Người dùng (#USR-1029):</strong> Tôi tập gym ăn thuần chay thì bổ sung creatine và protein thế nào để tăng cơ không bị thiếu hụt vi chất?
                        </div>
                        <div style={{ background: '#ecfeff', border: '1px solid #cffafe', padding: '0.75rem 1rem', borderRadius: '12px 12px 2px 12px', maxWidth: '90%', marginLeft: 'auto', fontSize: '0.8rem', color: '#155e75' }}>
                          <strong>Nutrition Chatbot (Gemini-1.5-Pro):</strong> Chào bạn! Đối với người tập gym ăn thuần chay, nguồn đạm chất lượng cao có thể kết hợp giữa tempeh, đậu hũ non và bột protein đậu Hà Lan (Pea Protein) để đảm bảo đầy đủ axit amin thiết yếu. Creatine thực vật có thể bổ sung qua thực phẩm bổ sung thuần chay được chứng nhận. Đồng thời hãy bổ sung thêm Vitamin B12 (2.4 mcg/ngày) để duy trì năng lượng tập luyện!
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>Đánh giá người dùng: <strong style={{ color: '#0f172a' }}>5.0 / 5.0 ★</strong></span>
                        <button onClick={() => setShowSampleDialogModal(false)} style={{ background: '#0891b2', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.45rem 1rem', fontWeight: 700, cursor: 'pointer' }}>
                          Đóng
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 7: CAN THIỆP THỦ CÔNG AI (AI OVERRIDE)
              ===================================================================== */}
          {activeMenu === 'ai-override' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                  7. Can thiệp Thủ công AI (Manual Intervention)
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                  Cho phép Admin ghi đè trực tiếp kết quả vi chất, khẩu phần hoặc nhãn AI khi phát hiện sai lệch trước khi người dùng nhìn thấy.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* FORM GHI ĐÈ TRỰC TIẾP */}
                <form onSubmit={handleApplyOverride} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sliders size={18} color="#059669" /> Biểu Mẫu Ghi Đè Chỉ Số AI
                  </h3>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Đối tượng / Món ăn cần can thiệp:
                    </label>
                    <input 
                      type="text" 
                      value={overrideData.recipeName}
                      onChange={(e) => setOverrideData({ ...overrideData, recipeName: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>
                        Hàm lượng Protein Gốc (AI):
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        value={overrideData.originalProtein}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.82rem', color: '#64748b', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#047857', marginBottom: '0.25rem' }}>
                        Ghi đè Protein Đúng (Admin):
                      </label>
                      <input 
                        type="text" 
                        value={overrideData.overrideProtein}
                        onChange={(e) => setOverrideData({ ...overrideData, overrideProtein: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: '#ffffff', border: '1px solid #059669', fontSize: '0.82rem', fontWeight: 700, color: '#047857', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.25rem' }}>
                        Calories Gốc (AI):
                      </label>
                      <input 
                        type="text" 
                        readOnly 
                        value={overrideData.originalCalories}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontSize: '0.82rem', color: '#64748b', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#047857', marginBottom: '0.25rem' }}>
                        Ghi đè Calories Đúng (Admin):
                      </label>
                      <input 
                        type="text" 
                        value={overrideData.overrideCalories}
                        onChange={(e) => setOverrideData({ ...overrideData, overrideCalories: e.target.value })}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', background: '#ffffff', border: '1px solid #059669', fontSize: '0.82rem', fontWeight: 700, color: '#047857', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                      Lý do can thiệp (Bắt buộc cho Audit Trail):
                    </label>
                    <textarea 
                      rows={3}
                      value={overrideData.reason}
                      onChange={(e) => setOverrideData({ ...overrideData, reason: e.target.value })}
                      style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button type="submit" className="admin-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    <Check size={16} /> Lưu &amp; Áp Dụng Ghi Đè Vào Hệ Thống
                  </button>
                </form>

                {/* THÔNG TIN NGUYÊN TẮC CAN THIỆP */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      Nguyên Tắc Can Thiệp &amp; Ghi Đè (Override Policy)
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6', margin: '0 0 1rem 0' }}>
                      Theo đặc tả yêu cầu Functional Requirements (FR), Admin chỉ được phép can thiệp khi:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', lineHeight: '1.8' }}>
                      <li>Mô hình Computer Vision YOLOv8 nhận diện nhầm loại hạt/nguyên liệu (sai lệch &gt; 15%).</li>
                      <li>Thuật toán quy hoạch tuyến tính PuLP tính dư hoặc thiếu vi chất B12, Kẽm, Canxi so với chuẩn RNI Việt Nam.</li>
                      <li>Người dùng gửi khiếu nại về công thức tính Calo không chính xác.</li>
                    </ul>
                  </div>

                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '1rem', marginTop: '1rem' }}>
                    <strong style={{ color: '#065f46', fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                      🛡️ Bảo Toàn Tính Toàn Vẹn Hệ Thống
                    </strong>
                    <span style={{ fontSize: '0.78rem', color: '#047857' }}>
                      Mọi hành động can thiệp đều được tự động gắn mã hash SHA-256 vào Audit Log để đối soát kiểm thử đồ án Capstone.
                    </span>
                  </div>
                </div>
              </div>

              {/* BẢNG LỊCH SỬ GHI ĐÈ */}
              <div className="admin-table-container">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Nhật Ký Can Thiệp Gần Đây (Audit History)</strong>
                </div>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>MÃ SỰ KIỆN</th>
                      <th>ĐỐI TƯỢNG CAN THIỆP</th>
                      <th>GIÁ TRỊ CŨ (AI)</th>
                      <th>GIÁ TRỊ MỚI (ADMIN)</th>
                      <th>THỜI GIAN</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overrideHistory.map(item => (
                      <tr key={item.id}>
                        <td><strong style={{ color: '#059669' }}>{item.id}</strong></td>
                        <td>{item.target}</td>
                        <td><span style={{ color: '#ef4444' }}>{item.oldVal}</span></td>
                        <td><strong style={{ color: '#059669' }}>{item.newVal}</strong></td>
                        <td><small style={{ color: '#64748b' }}>{item.time}</small></td>
                        <td><span style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>● {item.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 8: NỘI DUNG BỊ AI GẮN CỜ (FLAGGED CONTENT REVIEW)
              ===================================================================== */}
          {activeMenu === 'ai-flagged' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    8. Nội Dung Bị AI Gắn Cờ (Flagged Content Review)
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Hàng đợi duyệt/xóa các bài viết, video, công thức do AI tự động phát hiện nghi vấn vi phạm tiêu chuẩn thuần chay và an toàn dinh dưỡng.
                  </p>
                </div>
                <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.45rem 1rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800 }}>
                  {pendingModerationCount} Nội dung cần giải quyết
                </span>
              </div>

              {/* LIST FLAGGED ITEMS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {flaggedItems.length === 0 ? (
                  <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
                    <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Không có nội dung nào bị gắn cờ!</h3>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Tất cả các bài viết do người dùng đăng tải đều đã an toàn và được duyệt.</p>
                  </div>
                ) : (
                  flaggedItems.map(item => (
                    <div key={item.id} style={{ background: '#ffffff', border: '1px solid #fee2e2', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(220, 38, 38, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b91c1c', background: '#fee2e2', padding: '0.2rem 0.55rem', borderRadius: '6px' }}>
                              {item.id}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Phân loại: {item.type}</span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>• Đăng bởi: <strong>{item.author}</strong></span>
                          </div>
                          <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</h3>
                        </div>

                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.4rem 0.75rem', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.7rem', color: '#b45309', fontWeight: 700 }}>AI CONFIDENCE</div>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706' }}>{item.confidence}</div>
                        </div>
                      </div>

                      {/* LÝ DO AI GẮN CỜ */}
                      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontSize: '0.85rem', fontWeight: 700 }}>
                        <AlertTriangle size={16} />
                        <span>Cảnh báo AI: {item.aiFlagReason}</span>
                      </div>

                      {/* ĐOẠN TRÍCH NỘI DUNG */}
                      <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.85rem 1rem', fontSize: '0.88rem', color: '#475569', lineHeight: '1.6', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                        &quot;{item.snippet}&quot;
                      </div>

                      {/* HÀNH ĐỘNG CỦA ADMIN */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '0.45rem 0.95rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => handleFlagAction(item.id, 'dismiss')}
                          title="Xác nhận AI cảnh báo nhầm, bài viết đạt chuẩn thuần chay"
                        >
                          Phê Duyệt (Bỏ Cờ AI)
                        </button>
                        <button
                          style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => handleFlagAction(item.id, 'remove')}
                          title="Xóa nội dung vi phạm này"
                        >
                          Xác Nhận Vi Phạm &amp; Xóa Bài
                        </button>
                        <button
                          style={{ background: '#991b1b', border: 'none', color: '#ffffff', padding: '0.45rem 1rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => handleFlagAction(item.id, 'ban')}
                          title="Xóa bài và khóa luôn tài khoản tác giả"
                        >
                          Xóa &amp; Khóa Tài Khoản
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}
