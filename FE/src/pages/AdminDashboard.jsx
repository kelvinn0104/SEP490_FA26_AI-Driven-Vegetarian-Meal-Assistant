import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, ShieldAlert, Utensils, Users, Layers, 
  MessageSquare, LogOut, Search, Bell, Download, Sliders, Sparkles, 
  Zap, Clock, Flag, TrendingUp, CheckCircle2, AlertTriangle, 
  XCircle, Eye, RefreshCw, FileText, Plus, Database, Activity, 
  Check, ArrowRight, ExternalLink, ShieldCheck, ChevronRight, X, Trash2, Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  // MODAL STATES
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [selectedModelLog, setSelectedModelLog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // THRESHOLD SETTINGS STATE
  const [thresholds, setThresholds] = useState({
    yoloConfidence: 75,
    llmFactuality: 90,
    nonVeganDetect: 85,
    spamFilter: 95,
    lpNutrientSlack: 98
  });

  // CAN THIỆP THỦ CÔNG AI (MANUAL INTERVENTION OVERRIDE) STATE
  const [manualOverrideData, setManualOverrideData] = useState({
    recipeName: 'Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương',
    originalProtein: '12g (AI tính thiếu)',
    overrideProtein: '21g',
    originalCalories: '510 kcal',
    overrideCalories: '420 kcal',
    reason: 'Bổ sung hàm lượng protein từ 150g nấm hương tươi hữu cơ'
  });

  // HÀNG ĐỢI KIỂM DUYỆT TIER 2 (ADMIN ESCALATION QUEUE)
  const [moderationItems, setModerationItems] = useState([
    {
      id: 'MOD-101',
      category: 'Sai lệch Dinh dưỡng',
      categoryColor: '#dc2626',
      categoryBg: '#fee2e2',
      confidence: 'Độ tin cậy AI: 94%',
      author: '@minh_triet',
      title: 'Bài viết: "Cách ăn chay kiêng khem cực đoan 0 Calo giải độc tế bào"',
      snippet: 'Khuyến khích nhịn ăn liên tục 14 ngày chỉ uống nước ép giấm táo và nước lọc... Nguy cơ toan chuyển hóa cấp tính.',
      type: 'article',
      status: 'pending' // 'pending' | 'approved' | 'removed'
    },
    {
      id: 'MOD-102',
      category: 'Vi phạm Thuần Chay (Vision)',
      categoryColor: '#d97706',
      categoryBg: '#fef3c7',
      confidence: 'Độ tin cậy AI: 89%',
      author: '@chef_an_nhien',
      title: 'Video: "Món chiên giòn sốt nấm hương"',
      snippet: 'AI phát hiện bao bì mỡ động vật công nghiệp xuất hiện tại giây 01:24 trong khung hình góc chế biến của video.',
      thumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80',
      type: 'video',
      status: 'pending'
    },
    {
      id: 'MOD-103',
      category: 'Spam/Thương mại Trái phép',
      categoryColor: '#2563eb',
      categoryBg: '#eff6ff',
      confidence: 'NLP Classifier: 98%',
      author: 'Bình luận tại: Canh Rong Biển Đậu Hũ',
      title: 'Bình luận chèn link bán TPCN không rõ nguồn gốc',
      snippet: '"Bấm vào link zalo 09xx để mua thuốc giảm cân ăn chay thần tốc hiệu quả 100% không cần tập luyện..."',
      type: 'comment',
      status: 'pending' // Đồng bộ pending
    }
  ]);

  // SỐ LIỆU ĐỒNG BỘ GIỮA SIDEBAR VÀ NỘI DUNG CHÍNH (ĐỒNG BỘ 100%)
  const pendingModerationCount = moderationItems.filter(i => i.status === 'pending').length;

  // QUẢN LÝ BÌNH LUẬN (COMMENTS MANAGEMENT) STATE
  const [commentsFilter, setCommentsFilter] = useState('all'); // 'all' | 'flagged' | 'safe'
  const [commentsSearch, setCommentsSearch] = useState('');
  const [commentsList, setCommentsList] = useState([
    {
      id: 'CMT-801',
      author: 'Lê Minh Tuấn',
      avatar: 'LM',
      content: 'Bấm vào link zalo 09xx để mua thuốc giảm cân ăn chay thần tốc hiệu quả 100% không cần tập...',
      target: 'Video: Canh Rong Biển Đậu Hũ',
      time: '14:20 Hôm nay',
      flagged: true,
      flagReason: 'Spam bán hàng & Link ngoài',
      status: 'hidden'
    },
    {
      id: 'CMT-802',
      author: 'Bích Phương',
      avatar: 'BP',
      content: 'Công thức này thay thế nấm hương bằng nấm đùi gà được không ạ? Mình sợ mùi nấm hương nồng.',
      target: 'Bài viết: Cà Rốt Nấu Nước Cốt Dừa',
      time: '13:45 Hôm nay',
      flagged: false,
      flagReason: null,
      status: 'approved'
    },
    {
      id: 'CMT-803',
      author: 'Trần Đăng',
      avatar: 'TD',
      content: 'Món này dùng thêm chút dầu hào truyền thống cho dậy mùi được không bếp ơi?',
      target: 'Bài viết: Poke Quinoa Tempeh',
      time: '12:10 Hôm nay',
      flagged: true,
      flagReason: 'Nghi vấn nguyên liệu không thuần chay (Dầu hào mặn)',
      status: 'pending'
    },
    {
      id: 'CMT-804',
      author: 'Ngọc Lan',
      avatar: 'NL',
      content: 'Thực đơn AI tuần này gợi ý bữa sáng yến mạch chuối rất vừa miệng, mình giảm được 1.2kg rồi!',
      target: 'Cộng đồng: Nhật ký ăn chay 21 ngày',
      time: '10:30 Hôm nay',
      flagged: false,
      flagReason: null,
      status: 'approved'
    }
  ]);

  // QUẢN LÝ BLOG, VIDEO & CÔNG THỨC (CONTENT MANAGEMENT) STATE
  const [contentTab, setContentTab] = useState('all');
  const [contentSearch, setContentSearch] = useState('');
  const [contentList, setContentList] = useState([
    { id: 'REC-01', title: 'Cà Rốt Nấu Nước Cốt Dừa & Nấm Hương', type: 'Công thức', author: 'Chef Tuệ Tâm', views: '14.2K', status: 'Đã xuất bản' },
    { id: 'REC-02', title: 'Poke Quinoa Tempeh Sốt Teriyaki', type: 'Công thức', author: 'Chef Tuệ Tâm', views: '18.9K', status: 'Đã xuất bản' },
    { id: 'BLG-01', title: 'Giải Mã Vi Chất B12, Kẽm & Sắt Trong Chế Độ Thuần Chay', type: 'Blog Dinh Dưỡng', author: 'BS. Minh Đức', views: '45.1K', status: 'Đã xuất bản' },
    { id: 'BLG-02', title: '5 Cạm Bẫy Dinh Dưỡng Thường Gặp Khi Mới Ăn Chay', type: 'Blog Dinh Dưỡng', author: 'Chuyên gia Thu Hằng', views: '22.8K', status: 'Đã xuất bản' },
    { id: 'VID-01', title: 'Bí Quyết Kho Nấm Đùi Gà Thấm Vị Đậm Đà Cơm Nhà', type: 'Video Nấu Ăn', author: 'Chef Minh Tú', views: '120K', status: 'Đã xuất bản' },
    { id: 'VID-02', title: 'Cách Nấu Canh Rong Biển Đậu Hũ Non Thanh Mát Chuẩn Hàn', type: 'Video Nấu Ăn', author: 'Chef Minh Tú', views: '98K', status: 'Đã xuất bản' }
  ]);

  // AUDIT LOGS STATE (ĐÃ LOẠI BỎ TÍNH NĂNG VIP / BILLING GATEWAY NGOÀI PHẠM VI)
  const [auditLogs, setAuditLogs] = useState([
    { time: '14:32:08', actor: 'Admin_01 (Operations)', action: "Cập nhật phân loại dinh dưỡng: 'Đậu nành lên men hữu cơ'", module: 'Category DB', status: 'Thành công', statusBg: '#ecfdf5', statusColor: '#047857' },
    { time: '14:30:45', actor: 'YOLO-Vision Engine', action: 'Phát hiện 12 nguyên liệu mới từ 16 ảnh quét tủ lạnh', module: 'Computer Vision', status: 'Auto-Logged', statusBg: '#eff6ff', statusColor: '#1d4ed8' },
    { time: '14:28:12', actor: 'PuLP-LP Engine', action: 'Tối ưu hóa ma trận vi chất B12 & Sắt cho 350 thực đơn cá nhân', module: 'Meal Planner', status: 'Tối ưu 100%', statusBg: '#ecfdf5', statusColor: '#047857' },
    { time: '14:25:01', actor: 'Auto-Moderator Bot', action: 'Tự động gắn cờ vi phạm: Video nghi vấn có mỡ động vật (#VID-8921)', module: 'Moderation Queue', status: 'Chờ duyệt', statusBg: '#fff7ed', statusColor: '#c2410c' }
  ]);

  // Luôn bắt đầu ở đỉnh trang khi truy cập Admin Dashboard
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleModAction = (id, action) => {
    setModerationItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, status: action };
      }
      return item;
    }));
    showToast(`Đã cập nhật xử lý cho mục ${id}: ${action === 'approved' ? 'Phê duyệt giữ lại' : action === 'removed' ? 'Gỡ & Cảnh cáo' : 'Đã thực hiện'}`);
  };

  const handleDeleteComment = (id) => {
    setCommentsList(prev => prev.filter(c => c.id !== id));
    showToast(`Đã xóa thủ công bình luận ${id} khỏi hệ thống.`);
  };

  const handleToggleHideComment = (id) => {
    setCommentsList(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'hidden' ? 'approved' : 'hidden';
        return { ...c, status: newStatus };
      }
      return c;
    }));
    showToast(`Đã thay đổi trạng thái hiển thị của bình luận.`);
  };

  const handleRetrainBatch = () => {
    showToast('🚀 Đã gửi lệnh kích hoạt Tái huấn luyện Batch (YOLOv8 + PuLP Solver + RAG)!');
  };

  return (
    <div className="admin-portal-wrapper">
      {/* TOAST ALERT */}
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

      {/* LEFT SIDEBAR (DARK OPS PORTAL) */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          {/* BRAND LOGO */}
          <div className="admin-brand-header" onClick={() => onNavigate && onNavigate('home')}>
            <span className="admin-brand-icon">🌱</span>
            <div>
              <div className="admin-brand-title">VeggieAI</div>
              <div className="admin-brand-sub">OPS & AI PORTAL</div>
            </div>
          </div>

          {/* SIDEBAR NAVIGATION GROUPS */}
          <div className="admin-sidebar-menu">
            {/* GROUP 1: ĐIỀU HÀNH & AI HUB */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">ĐIỀU HÀNH & AI HUB</div>
              
              <button 
                className={`admin-menu-link ${activeMenu === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveMenu('overview')}
              >
                <div className="admin-menu-link-inner">
                  <LayoutDashboard size={17} />
                  <span>Tổng quan Dashboard</span>
                </div>
              </button>

              <button 
                className={`admin-menu-link ${activeMenu === 'modelops' ? 'active' : ''}`}
                onClick={() => setActiveMenu('modelops')}
              >
                <div className="admin-menu-link-inner">
                  <Cpu size={17} />
                  <span>Giám sát AI & Model Ops</span>
                </div>
              </button>

              <button 
                className={`admin-menu-link ${activeMenu === 'moderation' ? 'active' : ''}`}
                onClick={() => setActiveMenu('moderation')}
              >
                <div className="admin-menu-link-inner">
                  <ShieldAlert size={17} />
                  <span>Kiểm duyệt & Can thiệp AI</span>
                </div>
                <span className="admin-menu-badge">{pendingModerationCount}</span>
              </button>
            </div>

            {/* GROUP 2: QUẢN LÝ NỘI DUNG & NGƯỜI DÙNG */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">QUẢN LÝ NỘI DUNG & NGƯỜI DÙNG</div>

              <button 
                className={`admin-menu-link ${activeMenu === 'content' ? 'active' : ''}`}
                onClick={() => setActiveMenu('content')}
              >
                <div className="admin-menu-link-inner">
                  <Utensils size={17} />
                  <span>Quản lý Blog, Video & Công thức</span>
                </div>
              </button>

              {/* MỤC MỚI: QUẢN LÝ BÌNH LUẬN (COMMENTS MANAGEMENT) */}
              <button 
                className={`admin-menu-link ${activeMenu === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveMenu('comments')}
              >
                <div className="admin-menu-link-inner">
                  <MessageSquare size={17} />
                  <span>Quản lý Bình luận</span>
                </div>
                <span style={{ fontSize: '0.68rem', background: '#334155', color: '#f1f5f9', padding: '0.1rem 0.45rem', borderRadius: '10px' }}>
                  {commentsList.length}
                </span>
              </button>

              <button 
                className={`admin-menu-link ${activeMenu === 'users' ? 'active' : ''}`}
                onClick={() => setActiveMenu('users')}
              >
                <div className="admin-menu-link-inner">
                  <Users size={17} />
                  <span>Quản trị thành viên</span>
                </div>
              </button>

              <button 
                className={`admin-menu-link ${activeMenu === 'categories' ? 'active' : ''}`}
                onClick={() => setActiveMenu('categories')}
              >
                <div className="admin-menu-link-inner">
                  <Layers size={17} />
                  <span>Danh mục thực phẩm chay</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR FOOTER (USER STATUS & LOGOUT) */}
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

      {/* MAIN CONTAINER */}
      <div className="admin-main-container">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="admin-breadcrumb">
            <span>Admin Portal</span>
            <ChevronRight size={14} />
            <span className="admin-breadcrumb-active">
              {activeMenu === 'overview' && 'Operations Center'}
              {activeMenu === 'modelops' && 'Giám sát AI & Model Ops'}
              {activeMenu === 'moderation' && 'Kiểm duyệt & Can thiệp AI (Tier 2 Escalation)'}
              {activeMenu === 'content' && 'Quản lý Blog, Video & Công thức'}
              {activeMenu === 'comments' && 'Quản lý Bình luận & Tương tác Cộng đồng'}
              {activeMenu === 'users' && 'Quản trị Thành viên'}
              {activeMenu === 'categories' && 'Danh mục Thực phẩm Chay'}
            </span>
          </div>

          <div className="admin-search-wrapper">
            <Search size={15} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input"
              placeholder="Tìm kiếm chỉ số, mô hình, dữ liệu người dùng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="admin-ctrl-k">Ctrl K</span>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-status-pill">
              <span className="admin-status-dot"></span>
              <span>AI Status: 99.8% Online</span>
            </div>

            <button 
              className="admin-topbar-btn" 
              title="Thông báo hệ thống (3 cảnh báo mới)"
              onClick={() => showToast('🔔 3 thông báo mới: 2 nội dung chờ duyệt, 1 cảnh báo vi chất.')}
            >
              <Bell size={17} />
              <span className="admin-bell-badge"></span>
            </button>

            <div className="admin-profile-pill" onClick={() => showToast('Đang đăng nhập với quyền: Admin')}>
              <div className="admin-profile-avatar">AD</div>
              <span className="admin-profile-text">Admin</span>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="admin-content-body">
          {/* =========================================================================
              VIEW 1: TỔNG QUAN DASHBOARD (OVERVIEW) & MODEL OPS
              ========================================================================= */}
          {(activeMenu === 'overview' || activeMenu === 'modelops') && (
            <>
              {/* HERO BANNER SECTION */}
              <section className="admin-hero-banner">
                <div>
                  <div className="admin-capstone-tag">
                    <Sparkles size={13} />
                    <span>CAPSTONE ENGINEERING PORTAL • Cluster HCM-DC01: Operational</span>
                  </div>
                  <h1 className="admin-hero-title">Trung tâm Điều hành VeggieAI & Giám sát Suy luận</h1>
                  <p className="admin-hero-desc">
                    Báo cáo thời gian thực về thông lượng mô hình AI, hiệu năng phi chức năng (NFR SLA) và luồng can thiệp kiểm duyệt tự động.
                  </p>
                </div>

                <div className="admin-hero-actions">
                  <button 
                    className="admin-btn-outline"
                    onClick={() => setShowExportModal(true)}
                  >
                    <Download size={16} />
                    <span>Xuất Báo Cáo Capstone</span>
                  </button>

                  <button 
                    className="admin-btn-primary"
                    onClick={() => setShowThresholdModal(true)}
                  >
                    <Sliders size={16} />
                    <span>Ngưỡng Nhạy AI</span>
                  </button>
                </div>
              </section>

              {/* 4 KPI METRIC CARDS (LOẠI BỎ VIP/BILLING THEO YÊU CẦU ĐỀ TÀI) */}
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
                    <span style={{ color: '#059669', fontWeight: 700 }}>Hồ sơ dinh dưỡng cá nhân hóa:</span> 41,250 hồ sơ
                  </div>
                </div>

                {/* Card 2: Lưu lượng suy luận AI */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">LƯU LƯỢNG SUY LUẬN AI</span>
                    <div className="admin-kpi-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
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
                    <span>• STT: <strong>16%</strong></span>
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
                    <span>Vision &lt;1.5s <em>(Hiện tại: 2.1s)</em></span> • <span>Meal Planner &lt;10s <em>(1.85s)</em></span>
                  </div>
                </div>

                {/* Card 4: Hàng đợi AI gắn cờ (Đồng bộ số liệu) */}
                <div className="admin-kpi-card">
                  <div className="admin-kpi-header">
                    <span className="admin-kpi-title">HÀNG ĐỢI AI GẮN CỜ</span>
                    <div className="admin-kpi-icon-box" style={{ background: '#ffedd5', color: '#c2410c' }}>
                      <Flag size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-val-row">
                    <span className="admin-kpi-val" style={{ color: '#ea580c' }}>{pendingModerationCount}</span>
                    <span className="admin-kpi-unit" style={{ color: '#c2410c', fontWeight: 700 }}>Cần Admin can thiệp</span>
                  </div>
                  <div className="admin-kpi-footer" style={{ display: 'flex', gap: '0.85rem' }}>
                    <span>Tự động tạm ẩn: <strong>{pendingModerationCount}</strong></span>
                    <span style={{ color: '#dc2626' }}>Nguy cơ cao: <strong>2</strong></span>
                  </div>
                </div>
              </section>

              {/* SECTION: GIÁM SÁT 5 MÔ HÌNH AI (ĐÃ BỔ SUNG AI MEAL PLANNER PULP + GENAI) */}
              <section style={{ marginBottom: '2rem' }}>
                <div className="admin-sec-header">
                  <div className="admin-sec-title-box">
                    <span className="admin-sec-bar"></span>
                    <h2 className="admin-sec-title">Giám sát & Quản trị Mô hình AI (Model Ops)</h2>
                    <span className="admin-sec-desc">Chỉ số suy luận, độ trễ và độ tin cậy 5 động cơ trí tuệ nhân tạo nòng cốt.</span>
                  </div>

                  <div className="admin-sec-actions">
                    <button className="admin-btn-sm" onClick={handleRetrainBatch}>
                      <RefreshCw size={14} />
                      <span>Tái huấn luyện theo batch</span>
                    </button>
                    <button className="admin-btn-sm" onClick={() => { setSelectedModelLog('All Engines'); setShowLogsModal(true); }}>
                      <FileText size={14} />
                      <span>Xem Logs chi tiết</span>
                    </button>
                  </div>
                </div>

                {/* 5 MODEL CARDS */}
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
                      <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('YOLOv8 Vision'); setShowLogsModal(true); }}>
                        Logs &gt;
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
                        Mới
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
                      <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('Recommendation Filter'); setShowLogsModal(true); }}>
                        Logs &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 3: AI Meal Planner (MỤC MỚI BỔ SUNG: PULP LINEAR PROGRAMMING + GENAI) */}
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
                        <span className="admin-metric-lbl">Tỷ lệ sửa đổi:</span>
                        <span className="admin-metric-val">12.3% <em style={{ fontSize: '0.68rem', color: '#059669', fontStyle: 'normal' }}>(87.7% hài lòng)</em></span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ trễ TB (NFR ≤10s):</span>
                        <span className="admin-metric-val" style={{ color: '#16a34a' }}>1.85s (PASS)</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>PuLP Solver + GenAI</span>
                      <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('PuLP Linear Solver'); setShowLogsModal(true); }}>
                        Logs &gt;
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
                      <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('Nutrition LLM'); setShowLogsModal(true); }}>
                        Logs &gt;
                      </button>
                    </div>
                  </div>

                  {/* Model 5: Video Summarizer */}
                  <div className="admin-model-card">
                    <div className="admin-model-header">
                      <div className="admin-model-icon-title">
                        <div className="admin-model-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                          <Zap size={18} />
                        </div>
                        <span className="admin-model-name">Video Summarizer</span>
                      </div>
                      <span className="admin-model-badge" style={{ background: '#d1fae5', color: '#065f46' }}>
                        Bình thường
                      </span>
                    </div>
                    <p className="admin-model-desc">Trích xuất định lượng công thức từ video ẩm thực</p>
                    <div className="admin-model-metrics">
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Độ chuẩn trích xuất:</span>
                        <span className="admin-metric-val">95.0%</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Tốc độ xử lý TB:</span>
                        <span className="admin-metric-val">0.3s / video</span>
                      </div>
                      <div className="admin-metric-row">
                        <span className="admin-metric-lbl">Số video nạp ngày:</span>
                        <span className="admin-metric-val">312 video</span>
                      </div>
                    </div>
                    <div className="admin-model-footer">
                      <span>Whisper + Extractor</span>
                      <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('Whisper Video Extractor'); setShowLogsModal(true); }}>
                        Logs &gt;
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* SECTION: 2-COLUMN WORKFLOW (MODERATION ON LEFT, CHARTS ON RIGHT) */}
              <section className="admin-workflow-grid">
                {/* LEFT COLUMN: HÀNG ĐỢI KIỂM DUYỆT TIER 2 (ADMIN ESCALATION OVERRIDE) */}
                <div className="admin-mod-panel">
                  <div className="admin-sec-header" style={{ marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>•</span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Hàng Đợi Kiểm Duyệt AI (Can Thiệp &amp; Quyết Định Cấp Cao)
                      </h3>
                    </div>
                    <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                      {pendingModerationCount} Yêu Cầu Chờ Quyết Định
                    </span>
                  </div>

                  {/* LÀM RÕ RANH GIỚI ADMIN VS MODERATOR THEO YÊU CẦU MỤC 4 */}
                  <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.75rem', color: '#92400e', lineHeight: '1.45', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong>🛡️ Cổng Giám Sát Cấp Cao (Tier 2 Escalation):</strong> Tiếp nhận các vi phạm nghiêm trọng do Moderator (Tier 1) chuyển tiếp. Quyền hạn Admin: Quyết định tối cao (Override), gỡ nội dung và khóa tài khoản vi phạm.
                    </div>
                    <button 
                      style={{ background: 'white', border: '1px solid #fde68a', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: '#b45309', cursor: 'pointer' }}
                      onClick={() => onNavigate && onNavigate('moderation')}
                    >
                      Mở Hàng đợi Mod Tuyến 1 &gt;
                    </button>
                  </div>

                  {/* LIST OF MODERATION ITEMS */}
                  <div className="admin-mod-card-list">
                    {moderationItems.map((item) => (
                      <div key={item.id} className={`admin-mod-item ${item.categoryColor === '#dc2626' ? 'danger-border' : item.categoryColor === '#d97706' ? 'warning-border' : 'info-border'}`}>
                        <div className="admin-mod-meta-row">
                          <div className="admin-mod-badge-row">
                            <span className="admin-mod-type-badge" style={{ background: item.categoryBg, color: item.categoryColor }}>
                              {item.category}
                            </span>
                            <span className="admin-mod-confidence" style={{ color: item.categoryColor }}>{item.confidence}</span>
                          </div>
                          <span className="admin-mod-author">Gửi bởi: {item.author}</span>
                        </div>

                        <div className="admin-mod-content-box">
                          {item.thumb ? (
                            <img src={item.thumb} alt="Thumbnail" className="admin-mod-thumb" />
                          ) : (
                            <div style={{ width: '40px', height: '40px', background: item.categoryBg, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.categoryColor, flexShrink: 0 }}>
                              <AlertTriangle size={20} />
                            </div>
                          )}
                          <div>
                            <div className="admin-mod-title">{item.title}</div>
                            <div className="admin-mod-snippet">{item.snippet}</div>
                          </div>
                        </div>

                        <div className="admin-mod-actions">
                          <button className="admin-mod-view-btn" onClick={() => showToast(`Đang mở chi tiết nội dung vi phạm ${item.id}`)}>
                            <Eye size={14} /> Xem chi tiết báo cáo
                          </button>
                          <div className="admin-mod-action-group">
                            <button className="admin-btn-mod-pass" onClick={() => handleModAction(item.id, 'approved')}>
                              Phê duyệt giữ lại
                            </button>
                            <button className="admin-btn-mod-danger" onClick={() => handleModAction(item.id, 'removed')}>
                              Gỡ &amp; Cảnh cáo
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN: ANALYTICS & INSIGHT CARDS */}
                <div className="admin-side-cards">
                  {/* Card 1: Phân bổ Chế độ Ăn Chay */}
                  <div className="admin-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Phân bổ Chế độ Ăn Chay
                      </h3>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>12,450 công thức</span>
                    </div>

                    <div className="admin-donut-wrapper">
                      {/* SVG Donut Chart */}
                      <div style={{ position: 'relative', width: '130px', height: '130px' }}>
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
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>64%</div>
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
                          <span>Ăn chay linh hoạt (Flexi) <strong>24%</strong></span>
                        </div>
                        <div className="admin-legend-item">
                          <span className="admin-legend-dot" style={{ background: '#f59e0b' }}></span>
                          <span>Chay thực dưỡng <strong>12%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="admin-insight-box">
                      💡 <strong>Tỷ lệ người dùng chuyển đổi</strong> từ Flexitarian sang Vegan tăng <strong>18.4%</strong> sau khi dùng Trợ lý AI thực đơn 21 ngày.
                    </div>
                  </div>

                  {/* Card 2: Tần suất Thiếu hụt Vi chất */}
                  <div className="admin-chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                          Tần suất Thiếu hụt Vi chất
                        </h3>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Dữ liệu từ 8,920 phiên tư vấn Chatbot &amp; Nhật ký ăn uống
                        </div>
                      </div>
                      <div style={{ background: '#eff6ff', color: '#2563eb', padding: '0.35rem', borderRadius: '8px' }}>
                        <Activity size={16} />
                      </div>
                    </div>

                    <div className="admin-nutr-bar-group">
                      <div>
                        <div className="admin-nutr-item-head">
                          <span>Thiếu hụt Vitamin B12</span>
                          <span style={{ color: '#ea580c' }}>42% người dùng</span>
                        </div>
                        <div className="admin-progress-track">
                          <div className="admin-progress-fill" style={{ width: '42%', background: '#f97316' }}></div>
                        </div>
                        <div className="admin-nutr-subtext">
                          Đề xuất: Tăng cường công thức Nấm men dinh dưỡng &amp; Rong biển
                        </div>
                      </div>

                      <div>
                        <div className="admin-nutr-item-head">
                          <span>Thiếu Protein Hoàn Chỉnh</span>
                          <span style={{ color: '#059669' }}>35% người dùng</span>
                        </div>
                        <div className="admin-progress-track">
                          <div className="admin-progress-fill" style={{ width: '35%', background: '#10b981' }}></div>
                        </div>
                        <div className="admin-nutr-subtext">
                          Đề xuất: Khuyến khích kết hợp Đậu lăng + Gạo lứt &amp; Tempeh
                        </div>
                      </div>

                      <div>
                        <div className="admin-nutr-item-head">
                          <span>Thiếu Sắt sinh học (Non-heme Iron)</span>
                          <span style={{ color: '#0284c7' }}>23% người dùng</span>
                        </div>
                        <div className="admin-progress-track">
                          <div className="admin-progress-fill" style={{ width: '23%', background: '#0ea5e9' }}></div>
                        </div>
                        <div className="admin-nutr-subtext">
                          Đề xuất: Bổ sung công thức Cải bó xôi kết hợp Vitamin C tự nhiên
                        </div>
                      </div>
                    </div>

                    <button 
                      style={{
                        width: '100%',
                        marginTop: '1.15rem',
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.6rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: '#047857',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.4rem'
                      }}
                      onClick={() => showToast('Đã gửi đề xuất công thức vi chất bổ sung đến ban chuyên gia dinh dưỡng.')}
                    >
                      <Sparkles size={14} /> Tạo Đề Xuất Công Thức Chuyên gia
                    </button>
                  </div>
                </div>
              </section>

              {/* SECTION: ROW 4 - AUDIT LOG & QUICK ACTIONS */}
              <section className="admin-bottom-grid">
                {/* LEFT: NHẬT KÝ VẬN HÀNH HỆ THỐNG (AUDIT LOG - ĐÃ BỎ VIP BILLING) */}
                <div className="admin-audit-card">
                  <div className="admin-sec-header" style={{ marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                        Nhật ký Vận hành Hệ thống Thời Gian Thực (Audit Log)
                      </h3>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Cập nhật mỗi 5 giây</span>
                  </div>

                  <table className="admin-audit-table">
                    <thead>
                      <tr>
                        <th>THỜI GIAN</th>
                        <th>TÁC NHÂN</th>
                        <th>HÀNH VI &amp; SỰ KIỆN</th>
                        <th>MÔ-ĐUN</th>
                        <th>TRẠNG THÁI</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 600, color: '#64748b' }}>{log.time}</td>
                          <td style={{ fontWeight: 700, color: log.actor.includes('Admin') ? '#047857' : log.actor.includes('YOLO') ? '#2563eb' : '#0f172a' }}>
                            {log.actor}
                          </td>
                          <td style={{ lineHeight: '1.4' }}>{log.action}</td>
                          <td>
                            <span style={{ background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.7rem' }}>
                              {log.module}
                            </span>
                          </td>
                          <td>
                            <span className="admin-audit-status-tag" style={{ background: log.statusBg, color: log.statusColor }}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* RIGHT: TÁC VỤ NHANH QUẢN TRỊ */}
                <div className="admin-quick-card">
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                      Tác vụ Nhanh Quản trị
                    </h3>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Lối tắt cho các quy trình điều hành hàng ngày của Administrator.
                    </div>
                  </div>

                  <div className="admin-quick-item" onClick={() => setActiveMenu('content')}>
                    <div className="admin-quick-item-left">
                      <div className="admin-quick-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                        <Utensils size={17} />
                      </div>
                      <div>
                        <div className="admin-quick-name">Quản lý Blog, Video &amp; Công thức</div>
                        <div className="admin-quick-sub">Xem và duyệt 12,450 nội dung</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#64748b" />
                  </div>

                  <div className="admin-quick-item" onClick={() => setActiveMenu('comments')}>
                    <div className="admin-quick-item-left">
                      <div className="admin-quick-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        <MessageSquare size={17} />
                      </div>
                      <div>
                        <div className="admin-quick-name">Quản lý Bình luận Cộng đồng</div>
                        <div className="admin-quick-sub">Kiểm soát tương tác &amp; spam</div>
                      </div>
                    </div>
                    <ArrowRight size={16} color="#64748b" />
                  </div>

                  <div className="admin-quick-item" onClick={() => setShowInterventionModal(true)}>
                    <div className="admin-quick-item-left">
                      <div className="admin-quick-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <Sliders size={17} />
                      </div>
                      <div>
                        <div className="admin-quick-name">Can thiệp &amp; Ghi đè AI (Manual Override)</div>
                        <div className="admin-quick-sub">Sửa khẩu phần, Macro &amp; nhãn AI tính sai</div>
                      </div>
                    </div>
                    <Edit3 size={16} color="#64748b" />
                  </div>

                  {/* CORE ENGINE PRODUCTION STATUS */}
                  <div className="admin-system-ver-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={18} color="#059669" />
                      <div>
                        <strong style={{ color: '#047857', display: 'block' }}>VeggieAI Core Engine</strong>
                        <span style={{ color: '#64748b', fontSize: '0.7rem' }}>Version 2.4.0-Production</span>
                      </div>
                    </div>
                    <span style={{ color: '#059669', fontWeight: 800, fontSize: '0.75rem' }}>100% NFR Met</span>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* =========================================================================
              VIEW 2: MÀN HÌNH QUẢN LÝ BÌNH LUẬN (COMMENTS MANAGEMENT - MỤC 1)
              ========================================================================= */}
          {activeMenu === 'comments' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    Quản lý Bình luận &amp; Tương tác Cộng đồng
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Theo dõi toàn bộ bình luận dưới bài viết Blog, Video nấu ăn và Món chay. Cho phép xóa thủ công hoặc ẩn bình luận vi phạm.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary" 
                  onClick={() => showToast('Đang quét tự động bằng mô hình NLP Toxicity Classifier...')}
                >
                  <RefreshCw size={15} /> Quét Spam Tự Động (NLP)
                </button>
              </div>

              {/* FILTER BAR */}
              <div className="admin-filter-bar">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className={`admin-subtab-btn ${commentsFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setCommentsFilter('all')}
                  >
                    Tất cả bình luận ({commentsList.length})
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
                    Bình luận an toàn ({commentsList.filter(c => !c.flagged).length})
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

              {/* COMMENTS DATA TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>TÁC GIẢ</th>
                      <th style={{ width: '38%' }}>NỘI DUNG BÌNH LUẬN</th>
                      <th style={{ width: '22%' }}>VỊ TRÍ BÀI ĐĂNG</th>
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
                              background: comment.status === 'approved' ? '#ecfdf5' : comment.status === 'hidden' ? '#fee2e2' : '#fef3c7',
                              color: comment.status === 'approved' ? '#047857' : comment.status === 'hidden' ? '#b91c1c' : '#b45309'
                            }}>
                              {comment.status === 'approved' ? 'Hiển thị' : comment.status === 'hidden' ? 'Đã ẩn' : 'Chờ duyệt'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                              <button 
                                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.35rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}
                                onClick={() => handleToggleHideComment(comment.id)}
                                title="Ẩn hoặc hiện lại bình luận"
                              >
                                {comment.status === 'hidden' ? 'Bỏ ẩn' : 'Ẩn'}
                              </button>
                              <button 
                                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '0.35rem 0.55rem', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={() => handleDeleteComment(comment.id)}
                                title="Xóa thủ công vĩnh viễn"
                              >
                                <Trash2 size={14} />
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

          {/* =========================================================================
              VIEW 3: QUẢN LÝ BLOG, VIDEO & CÔNG THỨC (MỤC 5)
              ========================================================================= */}
          {activeMenu === 'content' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    Quản lý Blog, Video &amp; Công thức
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Kiểm soát toàn bộ kho nội dung kiến thức dinh dưỡng, video nấu ăn và công thức ẩm thực thuần chay.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary"
                  onClick={() => showToast('Mở trình thêm bài viết/video/công thức mới.')}
                >
                  <Plus size={16} /> Thêm Nội Dung Mới
                </button>
              </div>

              {/* TABS */}
              <div className="admin-tab-bar">
                <button 
                  className={`admin-subtab-btn ${contentTab === 'all' ? 'active' : ''}`}
                  onClick={() => setContentTab('all')}
                >
                  Tất cả ({contentList.length})
                </button>
                <button 
                  className={`admin-subtab-btn ${contentTab === 'blog' ? 'active' : ''}`}
                  onClick={() => setContentTab('blog')}
                >
                  Blog Dinh Dưỡng ({contentList.filter(c => c.type.includes('Blog')).length})
                </button>
                <button 
                  className={`admin-subtab-btn ${contentTab === 'video' ? 'active' : ''}`}
                  onClick={() => setContentTab('video')}
                >
                  Video Nấu Ăn ({contentList.filter(c => c.type.includes('Video')).length})
                </button>
                <button 
                  className={`admin-subtab-btn ${contentTab === 'recipe' ? 'active' : ''}`}
                  onClick={() => setContentTab('recipe')}
                >
                  Công thức Món Chay ({contentList.filter(c => c.type.includes('Công thức')).length})
                </button>
              </div>

              {/* TABLE */}
              <div className="admin-table-container">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>TIÊU ĐỀ NỘI DUNG</th>
                      <th>PHÂN LOẠI</th>
                      <th>TÁC GIẢ / CHUYÊN GIA</th>
                      <th>LƯỢT XEM</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentList
                      .filter(c => {
                        if (contentTab === 'blog') return c.type.includes('Blog');
                        if (contentTab === 'video') return c.type.includes('Video');
                        if (contentTab === 'recipe') return c.type.includes('Công thức');
                        return true;
                      })
                      .map(item => (
                        <tr key={item.id}>
                          <td><strong>{item.title}</strong></td>
                          <td>
                            <span style={{ background: item.type.includes('Blog') ? '#eff6ff' : item.type.includes('Video') ? '#fef3c7' : '#ecfdf5', color: item.type.includes('Blog') ? '#2563eb' : item.type.includes('Video') ? '#d97706' : '#059669', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                              {item.type}
                            </span>
                          </td>
                          <td>{item.author}</td>
                          <td><strong>{item.views}</strong></td>
                          <td>
                            <span style={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>● {item.status}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              style={{ background: '#f1f5f9', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                              onClick={() => showToast(`Mở chỉnh sửa cho ${item.title}`)}
                            >
                              Chỉnh sửa
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* =========================================================================
              VIEW 4: KIỂM DUYỆT & CAN THIỆP AI (MODERATION & MANUAL INTERVENTION)
              ========================================================================= */}
          {activeMenu === 'moderation' && (
            <section style={{ animation: 'fadeIn 0.2s ease' }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                    Kiểm duyệt Nội dung &amp; Can thiệp Thủ công AI
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
                    Quyền hạn cấp cao (Tier 2): Quyết định các trường hợp nghi vấn phức tạp và cho phép Admin ghi đè trực tiếp kết quả suy luận AI.
                  </p>
                </div>
                <button 
                  className="admin-btn-primary"
                  onClick={() => setShowInterventionModal(true)}
                >
                  <Sliders size={16} /> Can thiệp &amp; Ghi đè AI (Override)
                </button>
              </div>

              {/* MODERATION CARDS LIST */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {moderationItems.map((item) => (
                  <div key={item.id} className="admin-mod-panel" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ background: item.categoryBg, color: item.categoryColor, fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.categoryColor }}>
                        {item.confidence}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', color: '#0f172a', margin: '0 0 0.4rem 0' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.45', marginBottom: '1rem' }}>{item.snippet}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Gửi bởi: {item.author}</span>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="admin-btn-mod-pass" onClick={() => handleModAction(item.id, 'approved')}>
                          Phê duyệt
                        </button>
                        <button className="admin-btn-mod-danger" onClick={() => handleModAction(item.id, 'removed')}>
                          Gỡ bài &amp; Phạt
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* =========================================================================
              VIEW 5: QUẢN TRỊ THÀNH VIÊN & DANH MỤC THỰC PHẨM CHAY
              ========================================================================= */}
          {(activeMenu === 'users' || activeMenu === 'categories') && (
            <section style={{ animation: 'fadeIn 0.2s ease', background: '#ffffff', padding: '2rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '50%', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                {activeMenu === 'users' ? <Users size={28} /> : <Layers size={28} />}
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>
                {activeMenu === 'users' ? 'Quản Trị Thành Viên & Phân Quyền' : 'Danh Mục Thực Phẩm Chay & Vi Chất'}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '580px', margin: '0 auto 1.5rem auto', lineHeight: '1.5' }}>
                {activeMenu === 'users' 
                  ? 'Quản lý 52,840 thành viên đã đăng ký, hỗ trợ cấp quyền Moderator hoặc khóa các tài khoản vi phạm tiêu chuẩn cộng đồng.' 
                  : 'Ontology cơ sở dữ liệu thực phẩm thuần chay: 1,240 nguyên liệu rau củ, ngũ cốc, hạt mầm được gán chỉ số dinh dưỡng chuẩn USDA & Viện Dinh Dưỡng Quốc Gia.'}
              </p>
              <button className="admin-btn-primary" style={{ margin: '0 auto' }} onClick={() => showToast('Dữ liệu đã được đồng bộ với Postgres DB.')}>
                <Check size={16} /> Đồng bộ Cơ sở dữ liệu
              </button>
            </section>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: CAN THIỆP & GHI ĐÈ KẾT QUẢ AI (MANUAL INTERVENTION CONTROL - MỤC 6)
          ========================================================================= */}
      {showInterventionModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '580px',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={20} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Can thiệp &amp; Ghi đè Kết quả AI (Manual Override)
                </h3>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowInterventionModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: '1.45' }}>
              Quyền quản trị viên cho phép sửa trực tiếp kết quả tính toán vi chất dinh dưỡng hoặc nhãn nhận diện sai lệch của mô hình AI trước khi người dùng nhìn thấy.
            </p>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                Món ăn: {manualOverrideData.recipeName}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>
                    Hàm lượng Protein Gốc (AI):
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={manualOverrideData.originalProtein} 
                    style={{ width: '100%', padding: '0.45rem', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', color: '#64748b' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', display: 'block', marginBottom: '0.25rem' }}>
                    Ghi đè Protein Thực (Admin):
                  </label>
                  <input 
                    type="text" 
                    value={manualOverrideData.overrideProtein} 
                    onChange={(e) => setManualOverrideData({ ...manualOverrideData, overrideProtein: e.target.value })}
                    style={{ width: '100%', padding: '0.45rem', background: '#ffffff', border: '1px solid #059669', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#047857' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.25rem' }}>
                  Lý do ghi đè can thiệp (Audit Trail):
                </label>
                <textarea 
                  rows="2"
                  value={manualOverrideData.reason}
                  onChange={(e) => setManualOverrideData({ ...manualOverrideData, reason: e.target.value })}
                  style={{ width: '100%', padding: '0.45rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="admin-btn-outline"
                onClick={() => setShowInterventionModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="admin-btn-primary"
                onClick={() => {
                  setShowInterventionModal(false);
                  showToast('Đã áp dụng ghi đè dinh dưỡng của Admin vào cơ sở dữ liệu!');
                }}
              >
                Lưu &amp; Cập nhật Dinh Dưỡng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CẤU HÌNH NGƯỠNG NHẠY AI (THRESHOLD CONFIGURATION)
          ========================================================================= */}
      {showThresholdModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders size={20} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Cấu hình Ngưỡng Nhạy AI (Model Ops)
                </h3>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowThresholdModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Điều chỉnh độ nhạy suy luận của các mô hình nòng cốt. Thay đổi sẽ lập tức có hiệu lực trên toàn bộ cụm Cluster Production.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Slider 1: YOLO Confidence */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>YOLOv8 Computer Vision (Độ tin cậy nhận diện):</span>
                  <span style={{ color: '#059669' }}>{thresholds.yoloConfidence}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="95" 
                  value={thresholds.yoloConfidence}
                  onChange={(e) => setThresholds({ ...thresholds, yoloConfidence: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#059669' }}
                />
              </div>

              {/* Slider 2: PuLP Meal Planner Slack */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>PuLP Linear Solver (Độ khắt khe cân bằng vi chất B12/Sắt):</span>
                  <span style={{ color: '#047857' }}>{thresholds.lpNutrientSlack}%</span>
                </div>
                <input 
                  type="range" 
                  min="85" 
                  max="99" 
                  value={thresholds.lpNutrientSlack}
                  onChange={(e) => setThresholds({ ...thresholds, lpNutrientSlack: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#047857' }}
                />
              </div>

              {/* Slider 3: Chatbot Factuality Guardrail */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Chatbot RAG Factuality (Kiểm tra dữ liệu y khoa):</span>
                  <span style={{ color: '#2563eb' }}>{thresholds.llmFactuality}%</span>
                </div>
                <input 
                  type="range" 
                  min="70" 
                  max="99" 
                  value={thresholds.llmFactuality}
                  onChange={(e) => setThresholds({ ...thresholds, llmFactuality: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              {/* Slider 4: Video Non-Vegan Filter */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  <span>Bộ lọc mỡ/thịt động vật trong Video:</span>
                  <span style={{ color: '#d97706' }}>{thresholds.nonVeganDetect}%</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="95" 
                  value={thresholds.nonVeganDetect}
                  onChange={(e) => setThresholds({ ...thresholds, nonVeganDetect: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: '#d97706' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="admin-btn-outline"
                onClick={() => setShowThresholdModal(false)}
              >
                Hủy bỏ
              </button>
              <button 
                className="admin-btn-primary"
                onClick={() => {
                  setShowThresholdModal(false);
                  showToast('Đã lưu cấu hình ngưỡng nhạy AI vào Production thành công!');
                }}
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: XUẤT BÁO CÁO CAPSTONE (CAPSTONE REPORT EXPORT)
          ========================================================================= */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '620px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Download size={20} color="#059669" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Xuất Báo Cáo Kỹ Thuật Capstone
                </h3>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                onClick={() => setShowExportModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, color: '#047857', marginBottom: '0.4rem' }}>
                Đề tài: SEP490 - AI-Driven Vegetarian Meal Assistant (VeggieAI)
              </div>
              <div style={{ color: '#475569', lineHeight: '1.5' }}>
                • <strong>NFR Benchmark SLA:</strong> 1.42s TB (Đạt chuẩn 100% tiêu chí hội đồng)<br />
                • <strong>PuLP Solver SLA:</strong> 1.85s &lt; 10s NFR<br />
                • <strong>Tổng suy luận AI:</strong> 184,200 lượt/ngày<br />
                • <strong>Tỷ lệ chính xác YOLOv8:</strong> 96.4%<br />
                • <strong>Tỷ lệ can thiệp kiểm duyệt thủ công:</strong> 0.4%<br />
                • <strong>Thời gian xuất bản:</strong> {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                className="admin-btn-outline"
                onClick={() => setShowExportModal(false)}
              >
                Đóng
              </button>
              <button 
                className="admin-btn-primary"
                onClick={() => {
                  setShowExportModal(false);
                  showToast('Đang tạo và tải xuống file báo cáo Capstone PDF...');
                }}
              >
                <Download size={16} /> Tải file PDF Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: XEM LOGS MÔ HÌNH CHI TIẾT
          ========================================================================= */}
      {showLogsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a',
            color: '#f1f5f9',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '740px',
            padding: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.2s ease',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <Cpu size={20} color="#10b981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Live Inference Stream: {selectedModelLog || 'AI Cluster Logs'}
                </h3>
              </div>
              <button 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                onClick={() => setShowLogsModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#020617',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.78rem',
              color: '#4ade80',
              height: '280px',
              overflowY: 'auto',
              lineHeight: '1.6'
            }}>
              <div>[INFO] 2026-09-13 14:32:45.102 | YOLOv8.detect() | Preprocessed 1280x720 tensor in 14ms</div>
              <div>[INFO] 2026-09-13 14:32:45.210 | Found 5 classes: [carrot: 0.98, tofu: 0.95, mushroom: 0.96]</div>
              <div>[INFO] 2026-09-13 14:32:45.890 | PuLP.LpProblem(MINIMIZE_DEFICIT) | Variables: 48, Constraints: 14 | Solved in 1.45s</div>
              <div>[PASS] 2026-09-13 14:32:46.012 | Meal Planner PuLP Solver: Latency 1.85s &lt; 10s NFR SLA [PASSED]</div>
              <div>[INFO] 2026-09-13 14:32:46.120 | RAG_Search(k=10) | Cosine similarity query time: 82ms</div>
              <div>[INFO] 2026-09-13 14:32:47.330 | LLM_Engine | Generated nutritional explanation: 245 tokens</div>
              <div>[INFO] 2026-09-13 14:33:01.002 | Auto-Moderator NLP | Scanned comment #CMT-801: Spam 0.98 [FLAGGED]</div>
              <div>[SYNC] 2026-09-13 14:33:10.890 | Worker Node 03 heartbeat OK | GPU Temp: 58C | Mem: 4.2GB/16GB</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• Streaming qua gRPC WebSocket từ cụm máy chủ HCM-DC01</span>
              <button 
                className="admin-btn-primary" 
                style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}
                onClick={() => setShowLogsModal(false)}
              >
                Đóng Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
