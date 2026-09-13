import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Clock, ShieldAlert, Search, Eye, Filter, 
  Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2, User, 
  FileText, Video, Utensils, MessageSquare, ArrowLeft, RefreshCw, X
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function ModerationQueue({ onNavigate }) {
  const { user } = useAuth();

  // SAMPLE PENDING AND MODERATED ITEMS
  const [items, setItems] = useState([
    {
      id: 'MOD-001',
      title: 'Công thức Đậu hũ sốt Cà chua & Nấm đông cô chuẩn vị nhà hàng',
      author: 'NguyenVanA',
      authorEmail: 'nguyenvana@gmail.com',
      type: 'Recipe',
      typeLabel: 'Công thức nấu ăn',
      submittedAt: '15 phút trước',
      aiScore: 99,
      aiStatus: 'safe',
      aiDetails: '100% Nguyên liệu thực vật thuần chay. Không phát hiện chất cấm hoặc từ ngữ vi phạm.',
      content: 'Món đậu hũ sốt cà chua kết hợp nấm đông cô tươi tạo nên vị ngọt thanh tự nhiên mà không cần dùng đến hạt nêm xương hầm. Rất giàu đạm thực vật và chất xơ, thích hợp cho bữa cơm gia đình thuần chay.',
      ingredients: ['Đậu hũ mơ: 3 bìa', 'Cà chua chín: 4 quả', 'Nấm đông cô tươi: 100g', 'Hành baro (hành boa-rô): 1 cây', 'Nước tương tamari: 2 thìa canh', 'Dầu mè: 1 thìa cà phê'],
      status: 'pending'
    },
    {
      id: 'MOD-002',
      title: 'Video: Hướng dẫn tự làm Sữa Hạt Sen & Hạt Điều béo mịn tại nhà',
      author: 'TranThiB',
      authorEmail: 'tranthib@gmail.com',
      type: 'Video',
      typeLabel: 'Video hướng dẫn',
      submittedAt: '42 phút trước',
      aiScore: 98,
      aiStatus: 'safe',
      aiDetails: 'Video đạt chuẩn chất lượng HD, âm thanh rõ ràng, công thức sữa hạt thuần chay tự nhiên.',
      content: 'Chia sẻ công thức làm sữa hạt không bị tách nước, vị ngọt thanh tự nhiên từ chà là không dùng đường cát trắng tinh luyện. Thích hợp cho người tập gym cần bổ sung năng lượng sạch.',
      ingredients: ['Hạt sen tươi: 150g', 'Hạt điều rang mộc: 80g', 'Quả chà là tách hạt: 4 quả', 'Nước lọc tinh khiết: 1.2 lít', 'Muối hồng hymalaya: 1 nhúm nhỏ'],
      status: 'pending'
    },
    {
      id: 'MOD-003',
      title: 'Top 7 Nguồn Protein Thực Vật Giúp Tăng Cơ Nhanh Cho Người Ăn Chay',
      author: 'LeMinhC',
      authorEmail: 'leminhc@fitnessvegan.vn',
      type: 'Blog',
      typeLabel: 'Blog dinh dưỡng',
      submittedAt: '1 giờ trước',
      aiScore: 84,
      aiStatus: 'warning',
      aiDetails: 'AI Cảnh báo: Đoạn 3 có nhắc đến "Bổ sung Gelatin từ nước hầm thảo mộc" - cần kiểm tra kỹ nguồn gốc tránh gelatin từ da động vật.',
      content: 'Nhiều người nghĩ ăn chay sẽ thiếu protein để phát triển cơ bắp. Thực tế, tempeh, đậu gà, hạt diêm mạch, đậu lăng đỏ và spirulina cung cấp lượng axit amin thiết yếu hoàn hảo.',
      ingredients: ['Tempeh lên men', 'Đậu gà ngâm nở', 'Hạt Quinoa', 'Tảo Spirulina', 'Đậu nành non Edamame'],
      status: 'pending'
    },
    {
      id: 'MOD-004',
      title: 'Thần dược trị bách bệnh từ Nước Ép Cần Tây & Mật Ong Rừng',
      author: 'HoangVanD',
      authorEmail: 'hoangvand99@yahoo.com',
      type: 'Blog',
      typeLabel: 'Blog dinh dưỡng',
      submittedAt: '2 giờ trước',
      aiScore: 61,
      aiStatus: 'danger',
      aiDetails: 'AI Cảnh báo: Tuyên bố sai lệch y khoa ("trị bách bệnh") và chứa mật ong (không thuần chay nghiêm ngặt Vegan).',
      content: 'Uống 500ml nước ép cần tây mỗi sáng hòa cùng 2 muỗng mật ong rừng nguyên chất giúp thải độc 100% tế bào và chữa khỏi hoàn toàn bệnh tiểu đường chỉ sau 7 ngày!',
      ingredients: ['Cần tây Mỹ: 500g', 'Mật ong rừng: 2 muỗng', 'Chanh tươi: 1 quả'],
      status: 'pending'
    }
  ]);

  const [activeTabFilter, setActiveTabFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Thông tin dinh dưỡng sai lệch / Chưa kiểm chứng y khoa');
  const [rejectNote, setRejectNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ACTIONS
  const handleApprove = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    showToast(`✅ Đã phê duyệt và xuất bản thành công mục #${id}!`);
    if (showPreviewModal) setShowPreviewModal(false);
  };

  const handleOpenRejectModal = (item) => {
    setItemToReject(item);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!itemToReject) return;
    setItems(prev => prev.map(item => item.id === itemToReject.id ? { 
      ...item, 
      status: 'rejected', 
      rejectReason: `${rejectReason}: ${rejectNote}` 
    } : item));
    showToast(`🚫 Đã từ chối bài viết #${itemToReject.id} và gửi phản hồi đến tác giả.`);
    setShowRejectModal(false);
    setItemToReject(null);
    setRejectNote('');
    if (showPreviewModal) setShowPreviewModal(false);
  };

  const handleEscalateToAdmin = (item) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...item, status: 'escalated' } : i));
    showToast(`🚀 Đã chuyển tiếp trường hợp #${item.id} lên Cổng Giám Sát Cấp Cao (Admin Tier 2 Escalation)!`);
    if (showPreviewModal) setShowPreviewModal(false);
  };

  const handleOpenPreview = (item) => {
    setSelectedItem(item);
    setShowPreviewModal(true);
  };

  // FILTERED ITEMS
  const filteredItems = items.filter(item => {
    if (activeTabFilter === 'pending' && item.status !== 'pending') return false;
    if (activeTabFilter === 'Recipe' && item.type !== 'Recipe') return false;
    if (activeTabFilter === 'Video' && item.type !== 'Video') return false;
    if (activeTabFilter === 'Blog' && item.type !== 'Blog') return false;
    if (activeTabFilter === 'history' && item.status === 'pending') return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length + 24;
  const rejectedCount = items.filter(i => i.status === 'rejected').length + 3;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.25rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#065f46',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.9rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BANNER / CONTEXT */}
      <div style={{ 
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)', 
        borderRadius: '16px', 
        padding: '2rem', 
        color: '#ffffff', 
        marginBottom: '2rem',
        boxShadow: '0 10px 30px rgba(4, 120, 87, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <ShieldAlert size={15} color="#34d399" />
            <span>MODERATOR TIER 1 WORKSPACE</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
            Bảng Điều Khiển Kiểm Duyệt Tuyến Đầu
          </h1>
          <p style={{ margin: 0, color: '#d1fae5', fontSize: '0.95rem', maxWidth: '680px', lineHeight: 1.5 }}>
            Rà soát, phê duyệt bài viết blog dinh dưỡng và video nấu chay do cộng đồng người dùng đóng góp. Kết hợp kết quả quét tiền kiểm từ AI Content Safety trước khi xuất bản công khai.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1.25rem', borderRadius: '12px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>KIỂM DUYỆT VIÊN</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{user?.name || 'Moderator On-Duty'}</div>
            <div style={{ fontSize: '0.72rem', color: '#34d399' }}>● Trực tuyến & Sẵn sàng</div>
          </div>
          {onNavigate && (
            <button 
              onClick={() => onNavigate('home')}
              style={{
                background: '#ffffff',
                color: '#065f46',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
            >
              <ArrowLeft size={16} /> Xem Trang Chủ
            </button>
          )}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>HÀNG ĐỢI CHỜ DUYỆT (TIER 1)</span>
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Cần xử lý</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>{pendingCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Bài viết & Video đang trong hàng đợi</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>ĐÃ PHÊ DUYỆT HÔM NAY</span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>+15% hôm qua</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669' }}>{approvedCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Đã xuất bản lên trang cộng đồng</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>TỪ CHỐI / VI PHẠM</span>
            <span style={{ background: '#fee2e2', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>Chặn vi phạm</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#ef4444' }}>{rejectedCount}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Spam, sai kiến thức dinh dưỡng</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>SLA PHẢN HỒI TRUNG BÌNH</span>
            <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>ĐẠT TIÊU CHUẨN</span>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a' }}>14.2 <span style={{ fontSize: '1rem', fontWeight: 600 }}>phút</span></div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>Mục tiêu cam kết SLA: dưới 2 giờ</div>
        </div>
      </div>

      {/* CONTROLS: SUBTABS & SEARCH */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `Tất cả (${items.length})` },
            { id: 'pending', label: `Chờ duyệt (${pendingCount})` },
            { id: 'Recipe', label: 'Công thức món chay' },
            { id: 'Video', label: 'Video nấu ăn' },
            { id: 'Blog', label: 'Blog dinh dưỡng' },
            { id: 'history', label: 'Lịch sử xử lý' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTabFilter(tab.id)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeTabFilter === tab.id ? '#059669' : '#e2e8f0',
                background: activeTabFilter === tab.id ? '#ecfdf5' : '#ffffff',
                color: activeTabFilter === tab.id ? '#059669' : '#475569',
                fontWeight: activeTabFilter === tab.id ? 700 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.85rem',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* ITEMS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredItems.length === 0 ? (
          <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CheckCircle2 size={40} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Hàng đợi kiểm duyệt đang trống</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Không có bài viết hoặc video nào cần xử lý theo bộ lọc hiện tại.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div 
              key={item.id} 
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                      {item.id}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {item.type === 'Video' && <Video size={13} />}
                      {item.type === 'Recipe' && <Utensils size={13} />}
                      {item.type === 'Blog' && <FileText size={13} />}
                      {item.typeLabel}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Gửi lúc: {item.submittedAt}
                    </span>
                    {item.status === 'approved' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        ✅ ĐÃ DUYỆT
                      </span>
                    )}
                    {item.status === 'rejected' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        🚫 ĐÃ TỪ CHỐI
                      </span>
                    )}
                    {item.status === 'escalated' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#f3e8ff', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                        🚀 ĐÃ CHUYỂN ADMIN
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                    {item.title}
                  </h3>

                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Tác giả: <strong style={{ color: '#334155' }}>{item.author}</strong> ({item.authorEmail})
                  </div>
                </div>

                {/* AI SAFETY SCORE CARD */}
                <div style={{ 
                  background: item.aiStatus === 'safe' ? '#f0fdf4' : item.aiStatus === 'warning' ? '#fffbeb' : '#fef2f2',
                  border: `1px solid ${item.aiStatus === 'safe' ? '#bbf7d0' : item.aiStatus === 'warning' ? '#fde68a' : '#fecaca'}`,
                  borderRadius: '10px',
                  padding: '0.65rem 1rem',
                  maxWidth: '320px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: item.aiStatus === 'safe' ? '#166534' : item.aiStatus === 'warning' ? '#92400e' : '#991b1b', marginBottom: '0.25rem' }}>
                    <Sparkles size={14} />
                    <span>AI Safety Score: {item.aiScore}/100</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                    {item.aiDetails}
                  </div>
                </div>
              </div>

              {/* CONTENT SUMMARY */}
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                {item.content}
              </p>

              {/* INGREDIENTS PREVIEW */}
              {item.ingredients && (
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', alignSelf: 'center' }}>Thành phần:</span>
                  {item.ingredients.slice(0, 4).map((ing, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                      {ing}
                    </span>
                  ))}
                  {item.ingredients.length > 4 && (
                    <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                      +{item.ingredients.length - 4} nguyên liệu khác
                    </span>
                  )}
                </div>
              )}

              {/* ACTIONS BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleOpenPreview(item)}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    color: '#334155',
                    padding: '0.45rem 0.95rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Eye size={15} /> Xem chi tiết nội dung
                </button>

                {item.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleEscalateToAdmin(item)}
                      style={{
                        background: '#f3e8ff',
                        border: '1px solid #d8b4fe',
                        color: '#7c3aed',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                      title="Chuyển lên Admin giải quyết trường hợp phức tạp / tranh chấp"
                    >
                      <ArrowUpRight size={15} /> Chuyển cấp trên (Admin Tier 2)
                    </button>

                    <button
                      onClick={() => handleOpenRejectModal(item)}
                      style={{
                        background: '#fee2e2',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}
                    >
                      <XCircle size={15} /> Từ chối
                    </button>

                    <button
                      onClick={() => handleApprove(item.id)}
                      style={{
                        background: '#059669',
                        border: 'none',
                        color: '#ffffff',
                        padding: '0.45rem 1.15rem',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)'
                      }}
                    >
                      <CheckCircle size={15} /> Phê duyệt & Xuất bản
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic' }}>
                    {item.status === 'approved' && 'Bài viết đã xuất bản công khai lên hệ thống.'}
                    {item.status === 'rejected' && `Đã từ chối: ${item.rejectReason || 'Không phù hợp tiêu chuẩn.'}`}
                    {item.status === 'escalated' && 'Đang chờ Admin xử lý tại Tier 2 Escalation.'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: PREVIEW CHI TIẾT BÀI VIẾT */}
      {showPreviewModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '720px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowPreviewModal(false)}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {selectedItem.id}
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                {selectedItem.typeLabel}
              </span>
            </div>

            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {selectedItem.title}
            </h2>

            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Đăng bởi: <strong>{selectedItem.author}</strong> ({selectedItem.authorEmail}) • Gửi lúc {selectedItem.submittedAt}
            </div>

            {/* AI SCAN RESULT */}
            <div style={{
              background: selectedItem.aiStatus === 'safe' ? '#f0fdf4' : selectedItem.aiStatus === 'warning' ? '#fffbeb' : '#fef2f2',
              border: `1px solid ${selectedItem.aiStatus === 'safe' ? '#bbf7d0' : selectedItem.aiStatus === 'warning' ? '#fde68a' : '#fecaca'}`,
              borderRadius: '10px',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: selectedItem.aiStatus === 'safe' ? '#166534' : selectedItem.aiStatus === 'warning' ? '#92400e' : '#991b1b', marginBottom: '0.25rem' }}>
                🔍 Kết Quả Phân Tích Từ Hệ Thống AI Content Safety (Điểm: {selectedItem.aiScore}/100)
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                {selectedItem.aiDetails}
              </div>
            </div>

            {/* FULL CONTENT */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#334155' }}>Nội dung chi tiết:</h4>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.92rem', color: '#334155', lineHeight: 1.7 }}>
                {selectedItem.content}
              </div>
            </div>

            {/* INGREDIENTS */}
            {selectedItem.ingredients && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#334155' }}>Danh sách nguyên liệu & định lượng:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.88rem', color: '#475569', lineHeight: 1.8 }}>
                  {selectedItem.ingredients.map((ing, i) => (
                    <li key={i}>{ing}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ACTION FOOTER */}
            {selectedItem.status === 'pending' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  onClick={() => handleEscalateToAdmin(selectedItem)}
                  style={{
                    background: '#f3e8ff',
                    border: '1px solid #d8b4fe',
                    color: '#7c3aed',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🚀 Chuyển Admin
                </button>
                <button
                  onClick={() => handleOpenRejectModal(selectedItem)}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#dc2626',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Từ chối bài viết
                </button>
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  style={{
                    background: '#059669',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)'
                  }}
                >
                  Phê duyệt & Xuất bản ngay
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: TỪ CHỐI BÀI VIẾT VÀ GỬI LÝ DO */}
      {showRejectModal && itemToReject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: '520px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', marginBottom: '0.75rem' }}>
              <AlertTriangle size={22} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>
                Từ chối bài viết #{itemToReject.id}
              </h3>
            </div>

            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.88rem', color: '#64748b' }}>
              Vui lòng chọn lý do chính để hệ thống tự động thông báo qua email cho tác giả <strong>{itemToReject.author}</strong> chỉnh sửa lại.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Lý do từ chối chuẩn mực:
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  background: '#ffffff'
                }}
              >
                <option value="Thông tin dinh dưỡng sai lệch / Chưa kiểm chứng y khoa">Thông tin dinh dưỡng sai lệch / Chưa kiểm chứng y khoa</option>
                <option value="Chứa thành phần không thuần chay (mật ong, gelatin, dầu mỡ động vật)">Chứa thành phần không thuần chay (mật ong, gelatin, dầu mỡ động vật)</option>
                <option value="Spam hoặc chèn link quảng cáo bán hàng trái phép">Spam hoặc chèn link quảng cáo bán hàng trái phép</option>
                <option value="Hình ảnh hoặc video chất lượng quá thấp / phản cảm">Hình ảnh hoặc video chất lượng quá thấp / phản cảm</option>
                <option value="Vi phạm bản quyền nội dung hoặc sao chép nguyên văn">Vi phạm bản quyền nội dung hoặc sao chép nguyên văn</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                Ghi chú thêm cho tác giả (Tùy chọn):
              </label>
              <textarea
                rows={3}
                placeholder="Nhập hướng dẫn để tác giả biết cách chỉnh sửa lại đúng tiêu chuẩn thuần chay..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowRejectModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmReject}
                style={{
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.6rem 1.4rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)'
                }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
