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
  
  // 8 MÀN HÌNH CHUẨN CỦA ADMIN THEO QUY ĐỊNH:
  // 1: 'users' - Quản lý người dùng
  // 2: 'content' - Quản lý blog & video
  // 3: 'content-detail' - Chi tiết bài viết/video
  // 4: 'comments' - Quản lý bình luận
  // 5: 'categories' - Quản lý category
  // 6: 'ai-monitoring' - Giám sát mô hình AI (AI Monitoring)
  // 7: 'ai-override' - Can thiệp thủ công AI
  // 8: 'ai-flagged' - Nội dung bị AI gắn cờ (Flagged Content Review)
  const [activeMenu, setActiveMenu] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // DỮ LIỆU MÀN HÌNH 1: QUẢN LÝ NGƯỜI DÙNG (USERS)
  // =========================================================================
  const [usersList, setUsersList] = useState([
    { id: 'USR-001', name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', role: 'User', diet: 'Thuần chay (Vegan)', status: 'active', joined: '12/08/2026', reports: 0 },
    { id: 'USR-002', name: 'Trần Thị Bích', email: 'bich.tran@gmail.com', role: 'Moderator', diet: 'Ăn chay linh hoạt (Flexi)', status: 'active', joined: '05/06/2026', reports: 0 },
    { id: 'USR-003', name: 'Lê Hoàng Long', email: 'long.le@spamdiet.com', role: 'User', diet: 'Chay thực dưỡng', status: 'locked', joined: '01/09/2026', reports: 5 },
    { id: 'USR-004', name: 'Phạm Thu Thảo', email: 'thao.pham@health.vn', role: 'User', diet: 'Thuần chay (Lacto-ovo)', status: 'active', joined: '20/07/2026', reports: 0 },
    { id: 'USR-005', name: 'Vũ Minh Đức', email: 'duc.vu@modcommunity.vn', role: 'Moderator', diet: 'Thuần chay (Vegan)', status: 'active', joined: '15/05/2026', reports: 0 },
    { id: 'USR-006', name: 'Đặng Quốc Huy', email: 'huy.dang@fakead.net', role: 'User', diet: 'Chưa cập nhật', status: 'locked', joined: '02/09/2026', reports: 8 }
  ]);
  const [userFilter, setUserFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);

  const handleToggleUserLock = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'locked' : 'active';
        showToast(nextStatus === 'locked' ? `🔒 Đã khóa tài khoản ${u.name} do vi phạm tiêu chuẩn!` : `🔓 Đã mở khóa tài khoản ${u.name}!`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleToggleUserRole = (userId) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextRole = u.role === 'User' ? 'Moderator' : 'User';
        showToast(`👑 Đã cập nhật vai trò của ${u.name} thành: ${nextRole}`);
        return { ...u, role: nextRole };
      }
      return u;
    }));
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

          {/* SIDEBAR NAVIGATION: 8 MÀN HÌNH RIÊNG BIỆT */}
          <div className="admin-sidebar-menu">
            {/* NHÓM 1: HỆ THỐNG & NỘI DUNG (MỤC 1 -> 5) */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">HỆ THỐNG & NỘI DUNG</div>

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
              MÀN HÌNH 1: QUẢN LÝ NGƯỜI DÙNG
              ===================================================================== */}
          {activeMenu === 'users' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    1. Quản lý Người Dùng
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Danh sách tài khoản, hồ sơ dinh dưỡng, cấp quyền Moderator và khóa/mở khóa tài khoản vi phạm.
                  </p>
                </div>
                <button className="admin-btn-primary" onClick={() => showToast('Đã xuất danh sách 52,840 người dùng dạng CSV.')}>
                  <Download size={15} /> Xuất Dữ Liệu User (CSV)
                </button>
              </div>

              {/* STAT CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TỔNG THÀNH VIÊN</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>52,840</div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>+120 thành viên tuần này</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>ĐANG HOẠT ĐỘNG</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>51,210</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Tỷ lệ hoạt động 96.9%</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>KIỂM DUYỆT VIÊN (MOD)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706' }}>15</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Hỗ trợ kiểm duyệt tuyến đầu</div>
                </div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>TÀI KHOẢN BỊ KHÓA</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>120</div>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>Vi phạm spam / sai dinh dưỡng</div>
                </div>
              </div>

              {/* FILTER BAR */}
              <div className="admin-filter-bar">
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button className={`admin-subtab-btn ${userFilter === 'all' ? 'active' : ''}`} onClick={() => setUserFilter('all')}>
                    Tất cả ({usersList.length})
                  </button>
                  <button className={`admin-subtab-btn ${userFilter === 'active' ? 'active' : ''}`} onClick={() => setUserFilter('active')}>
                    Đang hoạt động ({usersList.filter(u => u.status === 'active').length})
                  </button>
                  <button className={`admin-subtab-btn ${userFilter === 'locked' ? 'active' : ''}`} onClick={() => setUserFilter('locked')}>
                    Bị khóa ({usersList.filter(u => u.status === 'locked').length})
                  </button>
                  <button className={`admin-subtab-btn ${userFilter === 'moderator' ? 'active' : ''}`} onClick={() => setUserFilter('moderator')}>
                    Moderator ({usersList.filter(u => u.role === 'Moderator').length})
                  </button>
                </div>

                <input 
                  type="text" 
                  className="admin-filter-input"
                  placeholder="Tìm theo tên, email, ID..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              {/* USER TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>THÀNH VIÊN</th>
                      <th>VAI TRÒ</th>
                      <th>CHẾ ĐỘ ĂN CHAY</th>
                      <th>NGÀY GIA NHẬP</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: 'center' }}>THAO TÁC QUẢN TRỊ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList
                      .filter(u => {
                        if (userFilter === 'active') return u.status === 'active';
                        if (userFilter === 'locked') return u.status === 'locked';
                        if (userFilter === 'moderator') return u.role === 'Moderator';
                        return true;
                      })
                      .filter(u => {
                        if (!userSearch) return true;
                        const q = userSearch.toLowerCase();
                        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
                      })
                      .map(u => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#ecfdf5', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                {u.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: '#0f172a', display: 'block' }}>{u.name}</strong>
                                <small style={{ color: '#64748b' }}>{u.email}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: u.role === 'Moderator' ? '#fef3c7' : '#f1f5f9',
                              color: u.role === 'Moderator' ? '#b45309' : '#475569'
                            }}>
                              {u.role === 'Moderator' ? '🛡️ Moderator' : '🌱 Thành viên'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.82rem', color: '#334155' }}>{u.diet}</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{u.joined}</span>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.2rem 0.55rem',
                              borderRadius: '12px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: u.status === 'active' ? '#ecfdf5' : '#fee2e2',
                              color: u.status === 'active' ? '#047857' : '#b91c1c'
                            }}>
                              {u.status === 'active' ? '● Đang hoạt động' : '🔒 Đã khóa'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button
                                style={{
                                  background: u.status === 'active' ? '#fee2e2' : '#ecfdf5',
                                  border: '1px solid',
                                  borderColor: u.status === 'active' ? '#fca5a5' : '#a7f3d0',
                                  color: u.status === 'active' ? '#b91c1c' : '#047857',
                                  padding: '0.35rem 0.7rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.3rem'
                                }}
                                onClick={() => handleToggleUserLock(u.id)}
                              >
                                {u.status === 'active' ? <><Lock size={13} /> Khóa</> : <><Unlock size={13} /> Mở khóa</>}
                              </button>

                              <button
                                style={{
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '0.35rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  fontWeight: 600
                                }}
                                onClick={() => handleToggleUserRole(u.id)}
                                title="Thay đổi vai trò User <-> Mod"
                              >
                                {u.role === 'User' ? '+ Quyền Mod' : '- Hạ quyền'}
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
