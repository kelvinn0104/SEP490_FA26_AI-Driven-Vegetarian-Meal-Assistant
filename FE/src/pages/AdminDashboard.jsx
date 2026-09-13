import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Cpu, ShieldAlert, Utensils, Users, Layers, 
  Settings, LogOut, Search, Bell, Download, Sliders, Sparkles, 
  Zap, Clock, Flag, TrendingUp, CheckCircle2, AlertTriangle, 
  XCircle, Eye, RefreshCw, FileText, Plus, Database, Activity, 
  Check, ArrowRight, ExternalLink, ShieldCheck, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onNavigate }) {
  const { user, logout } = useAuth();
  const [activeMenu, setActiveMenu] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Luôn bắt đầu ở đỉnh trang khi truy cập Admin Dashboard
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
  
  // MODAL STATES
  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedModelLog, setSelectedModelLog] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // THRESHOLD SETTINGS STATE
  const [thresholds, setThresholds] = useState({
    yoloConfidence: 75,
    llmFactuality: 90,
    nonVeganDetect: 85,
    spamFilter: 95
  });

  // MODERATION QUEUE STATE
  const [moderationItems, setModerationItems] = useState([
    {
      id: 'MOD-101',
      category: 'Sai lệch Dinh dưỡng',
      categoryColor: '#dc2626',
      categoryBg: '#fee2e2',
      confidence: 'Độ tin cậy AI: 94%',
      author: '@minh_triet',
      title: 'Bài viết: "Cách ăn chay kiêng khem cực đoan 0 Calo giải độc tế bào"',
      snippet: 'Khuyến khích nhịn ăn liên tục 14 ngày chỉ uống nước ép giấm... Nguy cơ toan chuyển hóa và hạ đường huyết cấp tính.',
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
      snippet: 'AI phát hiện bao bì mỡ động vật công nghiệp xuất hiện tại giây 01:24 trong khung hình góc chế biến.',
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
      status: 'hidden' // 'hidden' | 'active' | 'deleted'
    }
  ]);

  // AUDIT LOGS STATE
  const [auditLogs, setAuditLogs] = useState([
    { time: '14:32:08', actor: 'Admin_01 (Operations)', action: "Cập nhật phân loại dinh dưỡng: 'Đậu nành lên men hữu cơ'", module: 'Category DB', status: 'Thành công', statusBg: '#ecfdf5', statusColor: '#047857' },
    { time: '14:30:45', actor: 'YOLO-Vision Engine', action: 'Phát hiện 12 nguyên liệu mới từ 16 ảnh quét tủ lạnh', module: 'Computer Vision', status: 'Auto-Logged', statusBg: '#eff6ff', statusColor: '#1d4ed8' },
    { time: '14:28:12', actor: 'Billing Gateway', action: 'Thành viên VIP @lan_anh gia hạn thành công gói Năm (599,000 VND)', module: 'Payment Service', status: 'Đã thu tiền', statusBg: '#f0fdf4', statusColor: '#15803d' },
    { time: '14:25:01', actor: 'Auto-Moderator Bot', action: 'Tự động gắn cờ vi phạm: Video nghi vấn có mỡ động vật (#VID-8921)', module: 'Moderation Queue', status: 'Chờ duyệt', statusBg: '#fff7ed', statusColor: '#c2410c' }
  ]);

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

  const handleRetrainBatch = () => {
    showToast('🚀 Đã gửi lệnh kích hoạt Tái huấn luyện Batch (YOLOv8 + RAG Vector DB)!');
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
                  <span>Kiểm duyệt nội dung AI</span>
                </div>
                <span className="admin-menu-badge">12</span>
              </button>
            </div>

            {/* GROUP 2: QUẢN LÝ NỘI DUNG & NGƯỜI DÙNG */}
            <div className="admin-sidebar-group">
              <div className="admin-group-label">QUẢN LÝ NỘI DUNG & NGƯỜI DÙNG</div>

              <button 
                className={`admin-menu-link ${activeMenu === 'recipes' ? 'active' : ''}`}
                onClick={() => setActiveMenu('recipes')}
              >
                <div className="admin-menu-link-inner">
                  <Utensils size={17} />
                  <span>Quản lý Công thức & Video</span>
                </div>
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

              <button 
                className={`admin-menu-link ${activeMenu === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveMenu('settings')}
              >
                <div className="admin-menu-link-inner">
                  <Settings size={17} />
                  <span>Cài đặt hệ thống</span>
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
              <div className="admin-user-name">Operations Team</div>
              <div className="admin-user-role">Super Admin</div>
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
            <span className="admin-breadcrumb-active">Operations Center</span>
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
              onClick={() => showToast('🔔 3 thông báo mới: 2 video chờ duyệt, 1 thanh toán VIP.')}
            >
              <Bell size={17} />
              <span className="admin-bell-badge"></span>
            </button>

            <div className="admin-profile-pill" onClick={() => showToast('Đang đăng nhập với quyền: Admin Master (Super Admin)')}>
              <div className="admin-profile-avatar">AM</div>
              <span className="admin-profile-text">Admin Master (Super Admin)</span>
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <main className="admin-content-body">
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

          {/* 4 KPI METRIC CARDS */}
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
                <span style={{ color: '#059669', fontWeight: 700 }}>VIP Gói Đăng Ký Trả Phí:</span> 3,420 thành viên
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
                <span>Vision &lt;1.5s <em>(Hiện tại: 2.1s)</em></span> • <span>Meal Planner &lt;10s</span>
              </div>
            </div>

            {/* Card 4: Hàng đợi AI gắn cờ */}
            <div className="admin-kpi-card">
              <div className="admin-kpi-header">
                <span className="admin-kpi-title">HÀNG ĐỢI AI GẮN CỜ</span>
                <div className="admin-kpi-icon-box" style={{ background: '#ffedd5', color: '#c2410c' }}>
                  <Flag size={18} />
                </div>
              </div>
              <div className="admin-kpi-val-row">
                <span className="admin-kpi-val" style={{ color: '#ea580c' }}>18</span>
                <span className="admin-kpi-unit" style={{ color: '#c2410c', fontWeight: 700 }}>Cần Admin can thiệp</span>
              </div>
              <div className="admin-kpi-footer" style={{ display: 'flex', gap: '0.85rem' }}>
                <span>Tự động tạm ẩn: <strong>14</strong></span>
                <span style={{ color: '#dc2626' }}>Nguy cơ cao: <strong>4</strong></span>
              </div>
            </div>
          </section>

          {/* SECTION: GIÁM SÁT & QUẢN TRỊ MÔ HÌNH AI (MODEL OPS) */}
          <section style={{ marginBottom: '2rem' }}>
            <div className="admin-sec-header">
              <div className="admin-sec-title-box">
                <span className="admin-sec-bar"></span>
                <h2 className="admin-sec-title">Giám sát & Quản trị Mô hình AI (Model Ops)</h2>
                <span className="admin-sec-desc">Chỉ số suy luận, độ trễ và độ tin cậy 4 động cơ trí tuệ nhân tạo nòng cốt.</span>
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

            {/* 4 MODEL CARDS */}
            <div className="admin-models-grid">
              {/* Model 1: Computer Vision */}
              <div className="admin-model-card">
                <div className="admin-model-header">
                  <div className="admin-model-icon-title">
                    <div className="admin-model-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <Activity size={20} />
                    </div>
                    <span className="admin-model-name">Computer Vision</span>
                  </div>
                  <span className="admin-model-badge" style={{ background: '#dcfce7', color: '#15803d' }}>
                    Ổn định
                  </span>
                </div>
                <p className="admin-model-desc">Nhận diện rau củ & độ tươi trong tủ lạnh</p>
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
                      <Sparkles size={20} />
                    </div>
                    <span className="admin-model-name">Recommendation</span>
                  </div>
                  <span className="admin-model-badge" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
                    Mới
                  </span>
                </div>
                <p className="admin-model-desc">Đề xuất thực đơn Macro & định vị ẩm thực</p>
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
                    <span className="admin-metric-val">19,840 công thức</span>
                  </div>
                </div>
                <div className="admin-model-footer">
                  <span>Graph-Collab-Filter</span>
                  <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('Recommendation Filter'); setShowLogsModal(true); }}>
                    Logs &gt;
                  </button>
                </div>
              </div>

              {/* Model 3: Nutrition Chatbot */}
              <div className="admin-model-card">
                <div className="admin-model-header">
                  <div className="admin-model-icon-title">
                    <div className="admin-model-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <Cpu size={20} />
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
                    <span className="admin-metric-val">8,920 phiên</span>
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

              {/* Model 4: Video Summarizer */}
              <div className="admin-model-card">
                <div className="admin-model-header">
                  <div className="admin-model-icon-title">
                    <div className="admin-model-icon" style={{ background: '#ecfdf5', color: '#047857' }}>
                      <Utensils size={20} />
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
                  <span>Whisper-Large + Extractor</span>
                  <button className="admin-model-log-link" onClick={() => { setSelectedModelLog('Whisper Video Extractor'); setShowLogsModal(true); }}>
                    Logs &gt;
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION: 2-COLUMN WORKFLOW (MODERATION ON LEFT, CHARTS ON RIGHT) */}
          <section className="admin-workflow-grid">
            {/* LEFT COLUMN: HÀNG ĐỢI KIỂM DUYỆT AI */}
            <div className="admin-mod-panel">
              <div className="admin-sec-header" style={{ marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#dc2626', fontSize: '1.2rem' }}>•</span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Hàng Đợi Kiểm Duyệt AI (Can Thiệp Thủ Công)
                  </h3>
                </div>
                <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '12px' }}>
                  18 Yêu Cầu Chờ Duyệt
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: '1.45' }}>
                Hệ thống AI tự động phát hiện vi phạm y khoa, nguyên liệu giả nhãn chay hoặc quảng cáo trái phép để Admin đưa ra quyết định sau cùng.
              </p>

              {/* LIST OF 3 MODERATION ITEMS */}
              <div className="admin-mod-card-list">
                {/* Item 1 */}
                <div className="admin-mod-item danger-border">
                  <div className="admin-mod-meta-row">
                    <div className="admin-mod-badge-row">
                      <span className="admin-mod-type-badge" style={{ background: '#fee2e2', color: '#dc2626' }}>
                        Sai lệch Dinh dưỡng
                      </span>
                      <span className="admin-mod-confidence">Độ tin cậy AI: 94%</span>
                    </div>
                    <span className="admin-mod-author">Gửi bởi: @minh_triet</span>
                  </div>

                  <div className="admin-mod-content-box">
                    <div style={{ width: '40px', height: '40px', background: '#fee2e2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', flexShrink: 0 }}>
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <div className="admin-mod-title">Bài viết: "Cách ăn chay kiêng khem cực đoan 0 Calo giải độc tế bào"</div>
                      <div className="admin-mod-snippet">
                        Khuyến khích nhịn ăn liên tục 14 ngày chỉ uống nước ép giấm táo và nước lọc... Nguy cơ toan chuyển hóa cấp tính.
                      </div>
                    </div>
                  </div>

                  <div className="admin-mod-actions">
                    <button className="admin-mod-view-btn" onClick={() => showToast('Đang mở toàn văn bài viết của @minh_triet để rà soát vi phạm y khoa.')}>
                      <Eye size={14} /> Xem chi tiết báo cáo
                    </button>
                    <div className="admin-mod-action-group">
                      <button className="admin-btn-mod-pass" onClick={() => handleModAction('MOD-101', 'approved')}>
                        Phê duyệt giữ lại
                      </button>
                      <button className="admin-btn-mod-danger" onClick={() => handleModAction('MOD-101', 'removed')}>
                        Gỡ &amp; Cảnh cáo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="admin-mod-item warning-border">
                  <div className="admin-mod-meta-row">
                    <div className="admin-mod-badge-row">
                      <span className="admin-mod-type-badge" style={{ background: '#fef3c7', color: '#d97706' }}>
                        Vi phạm Thuần Chay (Vision)
                      </span>
                      <span className="admin-mod-confidence" style={{ color: '#d97706' }}>Độ tin cậy AI: 89%</span>
                    </div>
                    <span className="admin-mod-author">Gửi bởi: @chef_an_nhien</span>
                  </div>

                  <div className="admin-mod-content-box">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80" 
                      alt="Thumbnail" 
                      className="admin-mod-thumb" 
                    />
                    <div>
                      <div className="admin-mod-title">Video: "Món chiên giòn sốt nấm hương"</div>
                      <div className="admin-mod-snippet">
                        AI phát hiện bao bì mỡ động vật công nghiệp xuất hiện tại giây 01:24 trong khung hình góc chế biến của video.
                      </div>
                    </div>
                  </div>

                  <div className="admin-mod-actions">
                    <button className="admin-mod-view-btn" onClick={() => showToast('Đang mở trình xem video tại timestamp 01:24 (Khung vi phạm).')}>
                      <Eye size={14} /> Xem đoạn bị gắn cờ
                    </button>
                    <div className="admin-mod-action-group">
                      <button className="admin-btn-mod-pass" onClick={() => handleModAction('MOD-102', 'approved')}>
                        Bỏ qua cờ AI
                      </button>
                      <button className="admin-btn-mod-danger" onClick={() => handleModAction('MOD-102', 'removed')}>
                        Xóa &amp; Chặn vi phạm
                      </button>
                    </div>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="admin-mod-item info-border">
                  <div className="admin-mod-meta-row">
                    <div className="admin-mod-badge-row">
                      <span className="admin-mod-type-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                        Spam/Thương mại Trái phép
                      </span>
                      <span className="admin-mod-confidence" style={{ color: '#2563eb' }}>NLP Classifier: 98%</span>
                    </div>
                    <span className="admin-mod-author">Bình luận tại: Canh Rong Biển Đậu Hũ</span>
                  </div>

                  <div className="admin-mod-content-box">
                    <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', flexShrink: 0 }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="admin-mod-title">Bình luận chèn link bán TPCN không rõ nguồn gốc</div>
                      <div className="admin-mod-snippet">
                        "Bấm vào link zalo 09xx để mua thuốc giảm cân ăn chay thần tốc hiệu quả 100% không cần tập luyện..."
                      </div>
                    </div>
                  </div>

                  <div className="admin-mod-actions">
                    <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                      ✓ Đã tự động ẩn khỏi cộng đồng
                    </span>
                    <div className="admin-mod-action-group">
                      <button className="admin-btn-mod-pass" onClick={() => handleModAction('MOD-103', 'approved')}>
                        Bỏ ẩn
                      </button>
                      <button className="admin-btn-mod-danger" onClick={() => handleModAction('MOD-103', 'removed')}>
                        Xóa vĩnh viễn &amp; Khóa tài khoản
                      </button>
                    </div>
                  </div>
                </div>
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
                      {/* Background circle */}
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                      {/* Segment 1: Thuần chay (Vegan) 64% */}
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#059669" strokeWidth="4" strokeDasharray="56.2 87.9" strokeDashoffset="0" />
                      {/* Segment 2: Ăn chay linh hoạt (Flexi) 24% */}
                      <circle cx="18" cy="18" r="14" fill="transparent" stroke="#34d399" strokeWidth="4" strokeDasharray="21.1 87.9" strokeDashoffset="-56.2" />
                      {/* Segment 3: Chay thực dưỡng 12% */}
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
                  {/* Item 1: B12 */}
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

                  {/* Item 2: Protein */}
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

                  {/* Item 3: Sắt */}
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
            {/* LEFT: NHẬT KÝ VẬN HÀNH HỆ THỐNG (AUDIT LOG) */}
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

              <div className="admin-quick-item" onClick={() => showToast('Mở trình tạo danh mục món chay mới.')}>
                <div className="admin-quick-item-left">
                  <div className="admin-quick-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                    <Layers size={17} />
                  </div>
                  <div>
                    <div className="admin-quick-name">Tạo danh mục món mới</div>
                    <div className="admin-quick-sub">Cập nhật ontology ẩm thực chay</div>
                  </div>
                </div>
                <Plus size={16} color="#64748b" />
              </div>

              <div className="admin-quick-item" onClick={() => showToast('Mở trình soạn thảo công thức chuẩn kiểm định.')}>
                <div className="admin-quick-item-left">
                  <div className="admin-quick-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                    <Utensils size={17} />
                  </div>
                  <div>
                    <div className="admin-quick-name">Thêm công thức Chuyên gia</div>
                    <div className="admin-quick-sub">Được kiểm định bởi Nutritionist</div>
                  </div>
                </div>
                <Plus size={16} color="#64748b" />
              </div>

              <div className="admin-quick-item" onClick={() => setShowThresholdModal(true)}>
                <div className="admin-quick-item-left">
                  <div className="admin-quick-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                    <Sliders size={17} />
                  </div>
                  <div>
                    <div className="admin-quick-name">Cấu hình Ngưỡng Nhạy AI</div>
                    <div className="admin-quick-sub">Điều chỉnh điểm phạt False-Positive</div>
                  </div>
                </div>
                <Settings size={16} color="#64748b" />
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
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: CẤU HÌNH NGƯỠNG NHẠY AI (THRESHOLD CONFIGURATION)
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
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ngưỡng càng cao sẽ hạn chế tối đa nhận diện nhầm rau củ quả.</span>
              </div>

              {/* Slider 2: Chatbot Factuality Guardrail */}
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
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Chặn các câu trả lời thiếu cơ sở bằng Vector Database y khoa.</span>
              </div>

              {/* Slider 3: Video Non-Vegan Filter */}
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
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Cảnh báo ngay lập tức nếu video xuất hiện dấu hiệu không thuần chay.</span>
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
          MODAL 2: XUẤT BÁO CÁO CAPSTONE (CAPSTONE REPORT EXPORT)
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
                  showToast('Đang tạo và tải xuống file báo cáo Capstone PDF/Excel...');
                }}
              >
                <Download size={16} /> Tải file PDF Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: XEM LOGS MÔ HÌNH CHI TIẾT
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <div>[INFO] 2026-09-13 14:32:46.012 | RAG_Search(k=10) | Cosine similarity query time: 82ms</div>
              <div>[INFO] 2026-09-13 14:32:47.330 | LLM_Engine | Generated nutritional explanation: 245 tokens</div>
              <div>[PASS] 2026-09-13 14:32:47.450 | Non-functional Requirement latency check: 1.34s &lt; 1.50s SLA [PASSED]</div>
              <div>[INFO] 2026-09-13 14:33:01.002 | Auto-Moderator NLP | Scanned comment #CMT-992: Toxicity 0.01 [CLEAN]</div>
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
