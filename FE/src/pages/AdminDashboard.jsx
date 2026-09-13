import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, ShieldAlert, Utensils, Users, Layers, 
  MessageSquare, LogOut, Search, Bell, Download, Sliders, Sparkles, 
  Zap, Clock, Flag, TrendingUp, CheckCircle2, AlertTriangle, 
  XCircle, Eye, RefreshCw, FileText, Plus, Database, Activity, 
  Check, ArrowRight, ExternalLink, ShieldCheck, ChevronRight, X, 
  Trash2, Edit3, Lock, Unlock, ArrowLeft, Video, Shield, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  
  // ĐIỀU HÀNH TỔNG QUAN & 8 MÀN HÌNH CHUẨN CỦA ADMIN THEO QUY ĐỊNH:
  // 'overview' - Tổng quan Dashboard
  // 1: 'users' - Quản lý người dùng
  // 2: 'content' - Quản lý blog & video
  // 3: 'content-detail' - Chi tiết bài viết/video
  // 4: 'comments' - Quản lý bình luận
  // 5: 'categories' - Quản lý category
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
  // KHÔNG CÓ VIP, KHÔNG CÓ BILLING, KHÔNG CÓ ĐIỂM UY TÍN
  // =========================================================================
  const [usersList, setUsersList] = useState([
    { 
      id: 'USR-001', 
      name: 'Nguyễn Văn An', 
      email: 'an.nguyen@gmail.com', 
      role: 'Authorized User', 
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
  // DỮ LIỆU MÀN HÌNH 2 & 3: QUẢN LÝ BLOG & VIDEO + CHI TIẾT
  // =========================================================================
  const [contentList, setContentList] = useState([
    { 
      id: 'C-01', 
      title: 'Top 5 Nguồn Protein Thuần Chay Tăng Cơ Vượt Trội Cho Người Tập Gym', 
      type: 'Blog',
      typeLabel: 'Blog Dinh Dưỡng', 
      author: 'BS. Lê Minh Tuấn', 
      views: '24,510', 
      status: 'Đã xuất bản', 
      date: '10/09/2026',
      mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      content: 'Chế độ ăn thuần chay hoàn toàn có thể đáp ứng từ 1.6g - 2.2g protein/kg thể trọng cho vận động viên nhờ sự kết hợp giữa đậu nành lên men (tempeh), hạt diêm mạch (quinoa), đậu lăng đỏ và tảo xoắn spirulina. Các axit amin chuỗi nhánh (BCAA) có trong thực vật giúp tổng hợp cơ bắp tương đương đạm động vật mà không gây áp lực lên thận.',
      ingredients: ['Tempeh hữu cơ: 200g', 'Hạt diêm mạch (Quinoa): 100g', 'Đậu gà ngâm nở: 150g', 'Bột tảo Spirulina: 1 muỗng cà phê'],
      tags: ['Protein Thực Vật', 'Tập Gym', 'Thuần Chay', 'BCAA']
    },
    { 
      id: 'C-02', 
      title: 'Video: Hướng Dẫn Nấu Đậu Hũ Sốt Cà Chua & Nấm Đông Cô Chuẩn Vị Nhà Hàng', 
      type: 'Video',
      typeLabel: 'Video Nấu Ăn', 
      author: 'Chef Mai Anh', 
      views: '18,920', 
      status: 'Đã xuất bản', 
      date: '08/09/2026',
      mediaUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
      content: 'Bí quyết chiên đậu hũ vàng giòn không bị khô và sốt cà chua nấm đông cô đậm đà không cần bột ngọt. Dùng dầu hạt cải và nước tương tamari lên men tự nhiên giúp món ăn thanh mát, thơm ngon bổ dưỡng.',
      ingredients: ['Đậu hũ mơ: 3 bìa', 'Nấm đông cô tươi: 100g', 'Cà chua chín mọng: 4 quả', 'Hành baro: 1 nhánh', 'Nước tương Tamari: 2 thìa'],
      tags: ['Món Xào', 'Nấm Đông Cô', 'Dễ Làm', 'Cơm Gia Đình']
    },
    { 
      id: 'C-03', 
      title: 'Video: Tự Làm Sữa Hạt Sen & Hạt Điều Béo Mịn Không Bị Tách Nước', 
      type: 'Video',
      typeLabel: 'Video Nấu Ăn', 
      author: 'Trần Bích Thảo', 
      views: '12,300', 
      status: 'Đã xuất bản', 
      date: '06/09/2026',
      mediaUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800',
      content: 'Công thức sữa hạt giàu Magie, Sắt và Vitamin nhóm B. Hướng dẫn nhiệt độ xay nấu lý tưởng ở 80 độ C để bảo toàn dinh dưỡng và tạo độ sánh mịn tự nhiên từ chất béo lành mạnh trong hạt điều.',
      ingredients: ['Hạt sen tươi: 120g', 'Hạt điều rang mộc: 80g', 'Quả chà là tạo ngọt: 3 quả', 'Nước tinh khiết: 1.2 lít'],
      tags: ['Sữa Hạt', 'Giàu Magie', 'Thuần Thực Vật', 'Không Đường Tinh Luyện']
    },
    { 
      id: 'C-04', 
      title: 'Công Thức Cà Rốt Hầm Nước Cốt Dừa & Nấm Đùi Gà Thơm Nức Mũi', 
      type: 'Recipe',
      typeLabel: 'Công Thức Món Chay', 
      author: 'VeggieAI Kitchen Team', 
      views: '35,120', 
      status: 'Đã xuất bản', 
      date: '02/09/2026',
      mediaUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
      content: 'Món hầm sánh đậm kết hợp beta-carotene từ cà rốt tươi và axit béo chuỗi trung bình (MCT) từ nước cốt dừa hữu cơ. Nấm đùi gà dai ngọt tự nhiên tạo cảm giác ngon miệng như món hầm truyền thống.',
      ingredients: ['Cà rốt Đà Lạt: 2 củ lớn', 'Nấm đùi gà tươi: 200g', 'Nước cốt dừa ép tươi: 150ml', 'Khoai tây: 1 củ', 'Tiêu xanh: 2 nhánh'],
      tags: ['Món Hầm', 'Beta-Carotene', 'MCT Oil', 'Ấm Bụng']
    }
  ]);
  const [contentTab, setContentTab] = useState('all');
  const [contentSearch, setContentSearch] = useState('');
  
  // Chi tiết bài viết đang xem/chỉnh sửa (Màn hình 3)
  const [currentEditingContent, setCurrentEditingContent] = useState(contentList[0]);

  const handleEditContent = (contentItem) => {
    setCurrentEditingContent(contentItem);
    setActiveMenu('content-detail');
  };

  const handleSaveContentDetail = () => {
    setContentList(prev => prev.map(c => c.id === currentEditingContent.id ? currentEditingContent : c));
    showToast(`✅ Đã lưu thay đổi nội dung bài viết #${currentEditingContent.id} thành công!`);
  };

  const handleDeleteContent = (contentId) => {
    setContentList(prev => prev.filter(c => c.id !== contentId));
    showToast(`🗑️ Đã xóa nội dung #${contentId} khỏi hệ thống.`);
    if (currentEditingContent.id === contentId) {
      setCurrentEditingContent(contentList[0]);
      setActiveMenu('content');
    }
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 4: QUẢN LÝ BÌNH LUẬN (COMMENTS)
  // =========================================================================
  const [commentsList, setCommentsList] = useState([
    { id: 'CMT-101', author: 'LeVanCuong', avatar: 'LC', content: 'Bài viết chia sẻ rất khoa học! Tôi áp dụng bổ sung đậu gà ngâm nở thấy không còn bị đầy hơi nữa.', target: 'Blog: Top 5 Nguồn Protein', time: '10 phút trước', status: 'approved', flagged: false },
    { id: 'CMT-102', author: 'BotQuangCao99', avatar: 'BQ', content: 'Cần gì ăn đậu hũ cho mệt, inbox Zalo 0909xxx mua thuốc tăng cơ giảm mỡ cấp tốc 3 ngày cam kết!', target: 'Video: Đậu Hũ Sốt Cà', time: '25 phút trước', status: 'hidden', flagged: true, flagReason: 'Spam bán hàng & lừa đảo (NLP Confidence 98%)' },
    { id: 'CMT-103', author: 'HoangYenPham', avatar: 'HY', content: 'Sữa hạt sen điều béo ngậy uống vào buổi tối ngủ rất ngon giấc, cảm ơn VeggieAI đã gợi ý!', target: 'Video: Sữa Hạt Sen Điều', time: '1 giờ trước', status: 'approved', flagged: false },
    { id: 'CMT-104', author: 'NguyenMinhTri', avatar: 'MT', content: 'Uống nước ép cần tây sống chữa khỏi 100% ung thư dạ dày nha mọi người, đừng đi bệnh viện uổng tiền.', target: 'Blog: Nước Ép & Giải Độc', time: '2 giờ trước', status: 'hidden', flagged: true, flagReason: 'Sai lệch kiến thức y tế nghiêm trọng (NLP Confidence 94%)' }
  ]);
  const [commentsFilter, setCommentsFilter] = useState('all');
  const [commentsSearch, setCommentsSearch] = useState('');

  const handleToggleHideComment = (id) => {
    setCommentsList(prev => prev.map(c => {
      if (c.id === id) {
        const next = c.status === 'approved' ? 'hidden' : 'approved';
        showToast(next === 'hidden' ? `Đã ẩn bình luận #${id} khỏi giao diện công khai.` : `Đã cho phép hiển thị bình luận #${id}.`);
        return { ...c, status: next };
      }
      return c;
    }));
  };

  const handleDeleteComment = (id) => {
    setCommentsList(prev => prev.filter(c => c.id !== id));
    showToast(`🗑️ Đã xóa vĩnh viễn bình luận #${id} khỏi cơ sở dữ liệu.`);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 5: QUẢN LÝ CATEGORY (DANH MỤC)
  // =========================================================================
  const [categoriesList, setCategoriesList] = useState([
    { id: 'CAT-01', name: 'Món Chính Thuần Chay', slug: 'mon-chinh-thuan-chay', count: 420, icon: '🍲', desc: 'Các món xào, kho, hấp giàu protein từ đậu hũ, tempeh, nấm', status: 'active' },
    { id: 'CAT-02', name: 'Canh & Súp Thanh Đạm', slug: 'canh-sup-thanh-dam', count: 185, icon: '🥣', desc: 'Canh rong biển, súp bí đỏ, canh củ sen bổ dưỡng thanh lọc cơ thể', status: 'active' },
    { id: 'CAT-03', name: 'Sữa Hạt & Nước Ép Tươi', slug: 'sua-hat-nuoc-ep', count: 124, icon: '🥛', desc: 'Sữa hạnh nhân, sữa hạt sen, sinh tố xanh giàu chất chống oxy hóa', status: 'active' },
    { id: 'CAT-04', name: 'Salad & Khai Vị Thanh Mát', slug: 'salad-khai-vi', count: 96, icon: '🥗', desc: 'Salad rau củ hữu cơ trộn sốt chanh leo, dầu ô liu và hạt chia', status: 'active' },
    { id: 'CAT-05', name: 'Thực Đơn Tăng Cơ & Giảm Mỡ', slug: 'thuc-don-gym-fitness', count: 140, icon: '💪', desc: 'Thực đơn giàu đạm thực vật trên 65g/ngày cho người tập luyện', status: 'active' },
    { id: 'CAT-06', name: 'Bánh Ngọt & Tráng Miệng Chay', slug: 'trang-mieng-thuan-chay', count: 78, icon: '🧁', desc: 'Bánh chuối nướng yến mạch, pudding hạt chia không trứng sữa', status: 'active' }
  ]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🥗');
  const [showAddCatModal, setShowAddCatModal] = useState(false);

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = {
      id: `CAT-0${categoriesList.length + 1}`,
      name: newCatName,
      slug: newCatName.toLowerCase().replace(/\s+/g, '-'),
      count: 0,
      icon: newCatIcon || '🌱',
      desc: newCatDesc || 'Danh mục món ăn chay mới khởi tạo.',
      status: 'active'
    };
    setCategoriesList([newCat, ...categoriesList]);
    setNewCatName('');
    setNewCatDesc('');
    setShowAddCatModal(false);
    showToast(`✅ Đã tạo thành công danh mục mới: ${newCat.name}`);
  };

  const handleDeleteCategory = (id) => {
    setCategoriesList(prev => prev.filter(c => c.id !== id));
    showToast(`🗑️ Đã xóa danh mục #${id}.`);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 6: GIÁM SÁT MÔ HÌNH AI (AI MONITORING)
  // =========================================================================
  const aiModels = [
    {
      id: 'vision',
      name: 'Computer Vision YOLOv8',
      type: 'Nhận diện nguyên liệu tủ lạnh & đánh giá độ tươi',
      accuracy: '94.2%',
      latency: '342ms',
      throughput: '1,420 req/phút',
      status: 'Operational',
      trend: '+1.8% tuần qua'
    },
    {
      id: 'recommender',
      name: 'Hybrid Recommender Engine',
      type: 'Collaborative Filtering + Content-Based',
      accuracy: '91.8%',
      latency: '118ms',
      throughput: '3,890 req/phút',
      status: 'Operational',
      trend: '+0.5% tuần qua'
    },
    {
      id: 'chatbot',
      name: 'Nutrition Chatbot (RAG)',
      type: 'LangChain + ChromaDB + Viện Dinh Dưỡng',
      accuracy: '96.5%',
      latency: '820ms',
      throughput: '980 req/phút',
      status: 'Operational',
      trend: '+2.1% tuần qua'
    },
    {
      id: 'summarizer',
      name: 'Video Step Summarizer',
      type: 'Tóm tắt công đoạn video & trích xuất nguyên liệu',
      accuracy: '89.2%',
      latency: '1,450ms',
      throughput: '320 req/phút',
      status: 'Operational',
      trend: '+3.4% tuần qua'
    },
    {
      id: 'planner',
      name: 'AI Meal Planner (PuLP + GenAI)',
      type: 'Quy hoạch tuyến tính (LP Solver) & Cân bằng vi chất',
      accuracy: '98.6%',
      latency: '1,850ms',
      throughput: '890 req/phút',
      status: 'Operational',
      trend: 'SLA NFR ≤10s (ĐẠT)'
    }
  ];

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

              {/* 3. Chi tiết bài viết/video */}
              <button 
                className={`admin-menu-link ${activeMenu === 'content-detail' ? 'active' : ''}`}
                onClick={() => setActiveMenu('content-detail')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">3</span>
                  <Edit3 size={16} />
                  <span>Chi tiết bài viết/video</span>
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

              {/* 5. Quản lý category */}
              <button 
                className={`admin-menu-link ${activeMenu === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveMenu('categories')}
              >
                <div className="admin-menu-link-inner">
                  <span className="admin-menu-num">5</span>
                  <Layers size={16} />
                  <span>Quản lý category</span>
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
              {activeMenu === 'content-detail' && '3. Chi tiết bài viết/video'}
              {activeMenu === 'comments' && '4. Quản lý bình luận'}
              {activeMenu === 'categories' && '5. Quản lý category'}
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
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Chi tiết bài viết/video</strong>
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
                        <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>Quản lý category</strong>
                      </div>
                      <ChevronRight size={16} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem 0' }}>
                      Phân loại nhóm món chay: Thuần chay, Thực dưỡng, Giàu Protein, v.v.
                    </p>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857' }}>
                      ● {categoriesList.length} danh mục ẩm thực đã chuẩn hóa
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
                        <span className="admin-metric-lbl">Can thiệp chuyên gia:</span>
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
                      <th style={{ width: '22%' }}>THÀNH VIÊN</th>
                      <th style={{ width: '16%' }}>VAI TRÒ (4 ACTORS)</th>
                      <th style={{ width: '18%' }}>CHẾ ĐỘ ĂN CHAY (WF01)</th>
                      <th style={{ width: '16%' }}>SỬ DỤNG TÍNH NĂNG AI THẬT</th>
                      <th style={{ width: '10%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '14%', textAlign: 'center' }}>THAO TÁC QUẢN TRỊ</th>
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

                    {/* PHẦN 1: HỒ SƠ DINH DƯỠNG CÁ NHÂN HÓA (WF01) */}
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
          {activeMenu === 'content' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    2. Quản lý Blog &amp; Video
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Danh sách toàn bộ bài viết dinh dưỡng, video nấu ăn và công thức ẩm thực trên hệ thống.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary"
                  onClick={() => {
                    const newBlank = {
                      id: `C-0${contentList.length + 1}`,
                      title: 'Bài viết dinh dưỡng mới chưa đặt tên',
                      type: 'Blog',
                      typeLabel: 'Blog Dinh Dưỡng',
                      author: 'Admin',
                      views: '0',
                      status: 'Bản nháp',
                      date: 'Hôm nay',
                      mediaUrl: '',
                      content: 'Nhập nội dung bài viết chia sẻ kiến thức dinh dưỡng chay tại đây...',
                      ingredients: ['Nguyên liệu 1'],
                      tags: ['Mới']
                    };
                    setContentList([newBlank, ...contentList]);
                    handleEditContent(newBlank);
                  }}
                >
                  <Plus size={16} /> Thêm Bài Viết / Video Mới
                </button>
              </div>

              {/* TABS & SEARCH */}
              <div className="admin-filter-bar">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className={`admin-subtab-btn ${contentTab === 'all' ? 'active' : ''}`} onClick={() => setContentTab('all')}>
                    Tất cả ({contentList.length})
                  </button>
                  <button className={`admin-subtab-btn ${contentTab === 'Blog' ? 'active' : ''}`} onClick={() => setContentTab('Blog')}>
                    Blog Dinh Dưỡng ({contentList.filter(c => c.type === 'Blog').length})
                  </button>
                  <button className={`admin-subtab-btn ${contentTab === 'Video' ? 'active' : ''}`} onClick={() => setContentTab('Video')}>
                    Video Nấu Ăn ({contentList.filter(c => c.type === 'Video').length})
                  </button>
                  <button className={`admin-subtab-btn ${contentTab === 'Recipe' ? 'active' : ''}`} onClick={() => setContentTab('Recipe')}>
                    Công thức Món Chay ({contentList.filter(c => c.type === 'Recipe').length})
                  </button>
                </div>

                <input 
                  type="text" 
                  className="admin-filter-input"
                  placeholder="Tìm bài viết, tác giả..." 
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                />
              </div>

              {/* TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>TIÊU ĐỀ BÀI VIẾT / VIDEO</th>
                      <th style={{ width: '15%' }}>PHÂN LOẠI</th>
                      <th style={{ width: '15%' }}>TÁC GIẢ</th>
                      <th style={{ width: '10%' }}>LƯỢT XEM</th>
                      <th style={{ width: '10%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '10%', textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentList
                      .filter(c => contentTab === 'all' ? true : c.type === contentTab)
                      .filter(c => !contentSearch ? true : c.title.toLowerCase().includes(contentSearch.toLowerCase()) || c.author.toLowerCase().includes(contentSearch.toLowerCase()))
                      .map(item => (
                        <tr key={item.id}>
                          <td>
                            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '0.2rem' }}>{item.title}</strong>
                            <small style={{ color: '#94a3b8' }}>Mã bài: {item.id} • Đăng ngày {item.date}</small>
                          </td>
                          <td>
                            <span style={{ 
                              background: item.type === 'Blog' ? '#eff6ff' : item.type === 'Video' ? '#fef3c7' : '#ecfdf5', 
                              color: item.type === 'Blog' ? '#2563eb' : item.type === 'Video' ? '#d97706' : '#059669', 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '6px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700 
                            }}>
                              {item.typeLabel}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.85rem', color: '#334155' }}>{item.author}</span>
                          </td>
                          <td>
                            <strong>{item.views}</strong>
                          </td>
                          <td>
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>● {item.status}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button 
                                style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                                onClick={() => handleEditContent(item)}
                                title="Xem và chỉnh sửa chi tiết (Màn hình 3)"
                              >
                                Xem &amp; Sửa
                              </button>
                              <button 
                                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => handleDeleteContent(item.id)}
                                title="Xóa nội dung"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 3: CHI TIẾT BÀI VIẾT/VIDEO
              ===================================================================== */}
          {activeMenu === 'content-detail' && currentEditingContent && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setActiveMenu('content')}
                    style={{ background: '#f1f5f9', border: 'none', padding: '0.5rem 0.75rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, fontSize: '0.82rem', color: '#475569' }}
                  >
                    <ArrowLeft size={16} /> Quay lại danh sách
                  </button>
                  <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      3. Chi tiết &amp; Chỉnh sửa Nội Dung (#{currentEditingContent.id})
                    </h1>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.55rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    onClick={() => handleDeleteContent(currentEditingContent.id)}
                  >
                    <Trash2 size={16} /> Xóa Bài Này
                  </button>
                  <button 
                    className="admin-btn-primary"
                    onClick={handleSaveContentDetail}
                  >
                    <Check size={16} /> Lưu Thay Đổi
                  </button>
                </div>
              </div>

              {/* EDIT FORM CONTAINER */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* LEFT: MAIN FORM */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.75rem' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Tiêu đề bài viết / video:
                    </label>
                    <input 
                      type="text"
                      value={currentEditingContent.title}
                      onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, title: e.target.value })}
                      style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Phân loại nội dung:
                      </label>
                      <select
                        value={currentEditingContent.type}
                        onChange={(e) => setCurrentEditingContent({ 
                          ...currentEditingContent, 
                          type: e.target.value,
                          typeLabel: e.target.value === 'Blog' ? 'Blog Dinh Dưỡng' : e.target.value === 'Video' ? 'Video Nấu Ăn' : 'Công Thức Món Chay'
                        })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                      >
                        <option value="Blog">Blog Dinh Dưỡng</option>
                        <option value="Video">Video Nấu Ăn</option>
                        <option value="Recipe">Công Thức Món Chay</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                        Tác giả / Chuyên gia:
                      </label>
                      <input 
                        type="text"
                        value={currentEditingContent.author}
                        onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, author: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Nội dung bài viết / Mô tả video:
                    </label>
                    <textarea 
                      rows={8}
                      value={currentEditingContent.content}
                      onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, content: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', lineHeight: '1.6', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>
                      Danh sách nguyên liệu &amp; định lượng:
                    </label>
                    {currentEditingContent.ingredients.map((ing, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem' }}>
                        <input 
                          type="text"
                          value={ing}
                          onChange={(e) => {
                            const next = [...currentEditingContent.ingredients];
                            next[idx] = e.target.value;
                            setCurrentEditingContent({ ...currentEditingContent, ingredients: next });
                          }}
                          style={{ flex: 1, padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                        />
                        <button
                          style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#ef4444', cursor: 'pointer' }}
                          onClick={() => {
                            const next = currentEditingContent.ingredients.filter((_, i) => i !== idx);
                            setCurrentEditingContent({ ...currentEditingContent, ingredients: next });
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      style={{ background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 600, color: '#047857', cursor: 'pointer', marginTop: '0.4rem' }}
                      onClick={() => setCurrentEditingContent({ ...currentEditingContent, ingredients: [...currentEditingContent.ingredients, 'Nguyên liệu mới: 50g'] })}
                    >
                      + Thêm nguyên liệu
                    </button>
                  </div>
                </div>

                {/* RIGHT: MEDIA & METADATA PREVIEW */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: '#0f172a' }}>Ảnh đại diện / Video URL:</h4>
                    {currentEditingContent.mediaUrl && (
                      <img 
                        src={currentEditingContent.mediaUrl} 
                        alt="Preview" 
                        style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }}
                      />
                    )}
                    <input 
                      type="text"
                      placeholder="Dán link ảnh hoặc video YouTube..."
                      value={currentEditingContent.mediaUrl}
                      onChange={(e) => setCurrentEditingContent({ ...currentEditingContent, mediaUrl: e.target.value })}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.92rem', color: '#0f172a' }}>Thẻ phân loại dinh dưỡng:</h4>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {currentEditingContent.tags.map((tag, i) => (
                        <span key={i} style={{ background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 4: QUẢN LÝ BÌNH LUẬN
              ===================================================================== */}
          {activeMenu === 'comments' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    4. Quản lý Bình luận
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Danh sách toàn bộ tương tác người dùng, phát hiện từ khóa thô tục và xóa bình luận vi phạm tiêu chuẩn.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary" 
                  onClick={() => showToast('Mô hình NLP Toxicity vừa quét xong: Không phát hiện vi phạm mới.')}
                >
                  <RefreshCw size={15} /> Quét Tự Động NLP
                </button>
              </div>

              {/* FILTER BAR */}
              <div className="admin-filter-bar">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`admin-subtab-btn ${commentsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCommentsFilter('all')}
                  >
                    Tất cả ({commentsList.length})
                  </button>
                  <button 
                    className={`admin-subtab-btn ${commentsFilter === 'flagged' ? 'active' : ''}`}
                    onClick={() => setCommentsFilter('flagged')}
                  >
                    Bị gắn cờ vi phạm ({commentsList.filter(c => c.flagged).length})
                  </button>
                  <button 
                    className={`admin-subtab-btn ${commentsFilter === 'safe' ? 'active' : ''}`}
                    onClick={() => setCommentsFilter('safe')}
                  >
                    An toàn ({commentsList.filter(c => !c.flagged).length})
                  </button>
                </div>

                <input 
                  type="text" 
                  className="admin-filter-input"
                  placeholder="Tìm kiếm nội dung, tác giả, bài viết..." 
                  value={commentsSearch}
                  onChange={(e) => setCommentsSearch(e.target.value)}
                />
              </div>

              {/* COMMENTS TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>TÁC GIẢ</th>
                      <th style={{ width: '40%' }}>NỘI DUNG BÌNH LUẬN</th>
                      <th style={{ width: '20%' }}>VỊ TRÍ BÀI VIẾT</th>
                      <th style={{ width: '10%' }}>TRẠNG THÁI</th>
                      <th style={{ width: '12%', textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commentsList
                      .filter(c => {
                        if (commentsFilter === 'flagged') return c.flagged;
                        if (commentsFilter === 'safe') return !c.flagged;
                        return true;
                      })
                      .filter(c => {
                        if (!commentsSearch) return true;
                        return c.content.toLowerCase().includes(commentsSearch.toLowerCase()) || 
                               c.author.toLowerCase().includes(commentsSearch.toLowerCase()) ||
                               c.target.toLowerCase().includes(commentsSearch.toLowerCase());
                      })
                      .map((comment) => (
                        <tr key={comment.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                                {comment.avatar}
                              </div>
                              <div>
                                <strong style={{ display: 'block', color: '#0f172a' }}>{comment.author}</strong>
                                <small style={{ color: '#94a3b8' }}>{comment.time}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ lineHeight: '1.45', color: '#334155' }}>{comment.content}</div>
                            {comment.flagged && (
                              <div style={{ marginTop: '0.35rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '6px' }}>
                                <AlertTriangle size={12} /> {comment.flagReason}
                              </div>
                            )}
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 600 }}>{comment.target}</span>
                          </td>
                          <td>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              background: comment.status === 'approved' ? '#ecfdf5' : '#fee2e2',
                              color: comment.status === 'approved' ? '#047857' : '#b91c1c'
                            }}>
                              {comment.status === 'approved' ? 'Hiển thị' : 'Đã ẩn'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button 
                                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                                onClick={() => handleToggleHideComment(comment.id)}
                              >
                                {comment.status === 'hidden' ? 'Hiện' : 'Ẩn'}
                              </button>
                              <button 
                                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Xóa vĩnh viễn"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 5: QUẢN LÝ CATEGORY
              ===================================================================== */}
          {activeMenu === 'categories' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    5. Quản lý Category (Danh Mục)
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Tạo mới, chỉnh sửa thông tin và xóa danh mục phân loại món ăn, công thức ẩm thực thuần chay.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary"
                  onClick={() => setShowAddCatModal(true)}
                >
                  <Plus size={16} /> Thêm Danh Mục Mới
                </button>
              </div>

              {/* GRID DANH MỤC */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {categoriesList.map(cat => (
                  <div key={cat.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '2rem' }}>{cat.icon}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                          {cat.count} Món ăn
                        </span>
                      </div>
                      <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{cat.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.75rem' }}>Slug: /{cat.slug}</div>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{cat.desc}</p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>● Đang hoạt động</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          style={{ background: '#f1f5f9', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          onClick={() => showToast(`Chỉnh sửa danh mục ${cat.name}`)}
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          style={{ background: '#fee2e2', border: 'none', padding: '0.35rem 0.55rem', borderRadius: '6px', color: '#b91c1c', cursor: 'pointer' }}
                          onClick={() => handleDeleteCategory(cat.id)}
                          title="Xóa danh mục"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL THÊM CATEGORY MỚI */}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Tạo Danh Mục Món Ăn Mới</h3>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setShowAddCatModal(false)}>
                        <X size={20} color="#64748b" />
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Tên danh mục:</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Món Cuốn &amp; Bánh Chay Dân Gian"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Biểu tượng Emoji:</label>
                      <input 
                        type="text" 
                        value={newCatIcon}
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        style={{ width: '80px', padding: '0.5rem', textAlign: 'center', fontSize: '1.2rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.35rem' }}>Mô tả dinh dưỡng:</label>
                      <textarea 
                        rows={3}
                        placeholder="Mô tả nhóm món ăn và giá trị dinh dưỡng thuần thực vật..."
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button style={{ background: '#f1f5f9', border: 'none', padding: '0.55rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setShowAddCatModal(false)}>
                        Hủy
                      </button>
                      <button className="admin-btn-primary" onClick={handleAddCategory}>
                        Tạo Danh Mục
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* =====================================================================
              MÀN HÌNH 6: GIÁM SÁT MÔ HÌNH AI (AI MONITORING)
              ===================================================================== */}
          {activeMenu === 'ai-monitoring' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    6. Giám sát Mô hình AI (AI Monitoring)
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Theo dõi thời gian thực độ chính xác, SLA độ trễ (NFR ≤10s) và nhật ký suy luận của 5 mô hình cốt lõi.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary"
                  onClick={() => showToast('🚀 Đã gửi lệnh kích hoạt Tái huấn luyện Batch (YOLOv8 + PuLP Solver + RAG)!')}
                >
                  <RefreshCw size={15} /> Kích hoạt Batch Retrain
                </button>
              </div>

              {/* 5 AI MODEL CARDS */}
              <div className="admin-models-grid">
                {aiModels.map(model => (
                  <div key={model.id} className="admin-model-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#047857', background: '#ecfdf5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                        ● {model.status}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>{model.trend}</span>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>{model.name}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.4', margin: '0 0 1rem 0', minHeight: '32px' }}>{model.type}</p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>ĐỘ CHÍNH XÁC</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>{model.accuracy}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 700 }}>ĐỘ TRỄ (LATENCY)</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{model.latency}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LOGS TABLE */}
              <div className="admin-table-container">
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>Nhật ký Suy luận Mô hình AI (Inference Logs)</strong>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>Cluster HCM-DC01 • 100% SLA PASS</span>
                </div>
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>MÔ HÌNH AI</th>
                      <th>LOẠI TÁC VỤ</th>
                      <th>THỜI GIAN XỬ LÝ</th>
                      <th>ĐỘ TỰ TIN</th>
                      <th>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>18:14:02</td>
                      <td><strong>AI Meal Planner</strong></td>
                      <td>Quy hoạch tuyến tính PuLP (Tối ưu B12 + Sắt)</td>
                      <td>1.82s (NFR ≤10s)</td>
                      <td>98.9%</td>
                      <td><span style={{ color: '#059669', fontWeight: 700 }}>200 OK</span></td>
                    </tr>
                    <tr>
                      <td>18:12:45</td>
                      <td><strong>YOLOv8 Vision</strong></td>
                      <td>Phát hiện cà rốt, nấm hương, bí đỏ</td>
                      <td>320ms</td>
                      <td>95.4%</td>
                      <td><span style={{ color: '#059669', fontWeight: 700 }}>200 OK</span></td>
                    </tr>
                    <tr>
                      <td>18:09:12</td>
                      <td><strong>Nutrition Chatbot</strong></td>
                      <td>RAG Query: &quot;Bổ sung kẽm cho bé ăn chay&quot;</td>
                      <td>810ms</td>
                      <td>96.8%</td>
                      <td><span style={{ color: '#059669', fontWeight: 700 }}>200 OK</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
