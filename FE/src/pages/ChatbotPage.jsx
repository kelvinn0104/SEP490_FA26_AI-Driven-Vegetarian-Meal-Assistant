import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Bot, Sparkles, Lock, ArrowRight, CheckCircle2, 
  Bookmark, Sliders, Copy, Camera, Mic, ChevronRight, 
  Activity, Flame, Leaf, RotateCcw, Trash2, 
  Plus, MessageSquare, ShieldCheck, Home, Check
} from 'lucide-react';
import { askChatbot } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function ChatbotPage({ onNavigate }) {
  const { user } = useAuth();

  // Luôn đảm bảo cuộn lên đầu trang khi mở trang
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // =========================================================================
  // 1. GIAO DIỆN DÀNH CHO KHÁCH CHƯA ĐĂNG NHẬP (GUEST INTERFACE - GIỮ NGUYÊN)
  // =========================================================================
  const [guestMessages, setGuestMessages] = useState([
    { 
      sender: 'bot', 
      text: 'Xin chào! Tôi là Trợ lý Hỏi AI của VeggieAI. Bạn có thắc mắc gì về chế độ ăn chay, vi chất B12, Sắt hay cách thay thế nguyên liệu thực dưỡng không?' 
    }
  ]);
  const [guestInput, setGuestInput] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestQuestionsAsked, setGuestQuestionsAsked] = useState(0);

  const GUEST_LIMIT = 3;
  const isGuest = !user;
  const remainingQuestions = Math.max(0, GUEST_LIMIT - guestQuestionsAsked);
  const hasReachedLimit = isGuest && remainingQuestions === 0;

  const handleGuestSend = async () => {
    if (!guestInput.trim() || hasReachedLimit) return;
    const userText = guestInput;
    setGuestMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setGuestInput('');
    setGuestLoading(true);

    setGuestQuestionsAsked(prev => prev + 1);

    try {
      const data = await askChatbot(userText);
      setGuestMessages(prev => [...prev, { sender: 'bot', text: data.answer }]);
    } catch (err) {
      console.error(err);
      setGuestMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Xin lỗi, hiện tại hệ thống Hỏi AI đang phản hồi chậm. Bạn có thể thử lại sau giây lát!' 
      }]);
    } finally {
      setGuestLoading(false);
    }
  };

  // =========================================================================
  // 2. GIAO DIỆN WORKSPACE CAO CẤP DÀNH CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
  // =========================================================================
  const [activeChatId, setActiveChatId] = useState('chat-1');
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [authInput, setAuthInput] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const chatBottomRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  // Cuộc hội thoại mẫu đầy đủ theo thiết kế Workspace
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      time: '18:05',
      type: 'text',
      content: `Chào ${user?.name || 'Minh Tuấn'}! Theo Dashboard hôm nay, bạn đã nạp 1,420 / 2,080 kcal và đạt 72g đạm. Tuy nhiên chỉ số Canxi hiện mới đạt 62% (thiếu ~320mg). Mình sẵn sàng đồng hành cùng bữa tối tối ưu cho bạn!`
    },
    {
      id: 'm2',
      sender: 'user',
      time: '18:07',
      status: 'Đã xem',
      type: 'text',
      content: 'Tối nay mình còn nấm đùi gà và rau cải thìa trong tủ lạnh, bạn gợi ý món gì nấu dưới 20 phút mà bổ sung đủ lượng canxi và sắt còn thiếu trong ngày không? Nhớ là không dùng hành tỏi tây nhé.'
    },
    {
      id: 'm3',
      sender: 'bot',
      time: '18:08',
      type: 'recommendation_card',
      tags: [
        '100% Không Dị Ứng Đậu Phộng',
        'Không Ngũ Vị Tân (Chuẩn Chay Tu Tập)',
        '15 Phút Chế Biến'
      ],
      titlePrefix: 'MÓN TÂM ĐIỂM BỮA TỐI ĐỀ XUẤT',
      dishName: 'Nấm Đùi Gà Xào Cải Thìa Sốt Mè Rang & Đậu Hũ Non Áp Chảo Hạt Sen',
      nutrition: '340 kcal • 18g đạm • 380mg Canxi (bù đắp 100% chỉ số canxi thiếu hụt trong ngày)'
    }
  ]);

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleAuthSend = async (customText = null) => {
    const textToSend = customText || authInput;
    if (!textToSend.trim() || authLoading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Đã xem',
      type: 'text',
      content: textToSend.trim()
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customText) setAuthInput('');
    setAuthLoading(true);

    try {
      const res = await askChatbot(textToSend.trim());
      const botMsg = {
        id: `b_${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        content: res.answer || 'VeggieNutri AI đã ghi nhận yêu cầu của bạn và điều chỉnh vào hồ sơ dinh dưỡng!'
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      // Fallback câu trả lời thông minh dựa theo ngữ cảnh
      setTimeout(() => {
        const botMsg = {
          id: `b_${Date.now()}`,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          content: `Dạ, để tối ưu cho chế độ Chay trường và bổ sung đạm/canxi không dùng ngũ vị tân: Bạn nên kết hợp hạt mè rang giã thô cùng đậu hũ non và nấm đùi gà. Phương pháp này giúp tỷ lệ hấp thu canxi sinh học đạt trên 70% mà không gây nặng bụng buổi tối!`
        };
        setChatMessages(prev => [...prev, botMsg]);
      }, 700);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatMessages([
      {
        id: `m_${Date.now()}`,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        content: `Chào ${user?.name || 'Minh Tuấn'}! Cuộc trò chuyện mới đã sẵn sàng. Bạn muốn tham vấn thực đơn, kiểm tra vi chất hay tính toán lượng dinh dưỡng bữa ăn nào?`
      }
    ]);
    setActiveChatId(`chat-${Date.now()}`);
    showToast('✨ Đã tạo cuộc trò chuyện mới');
  };

  // NẾU LÀ GUEST: HIỂN THỊ GIAO DIỆN HỎI AI BAN ĐẦU
  if (isGuest) {
    return (
      <Card style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', margin: 0 }}>
            <Sparkles size={22} /> Hỏi AI - Trợ Lý Dinh Dưỡng Thực Dưỡng
          </h2>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: hasReachedLimit ? '#fee2e2' : '#ecfdf5', 
            color: hasReachedLimit ? '#b91c1c' : '#047857',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700,
            border: `1px solid ${hasReachedLimit ? '#fca5a5' : '#a7f3d0'}`
          }}>
            <Sparkles size={14} />
            <span>Dùng thử: Còn {remainingQuestions}/{GUEST_LIMIT} lượt hỏi</span>
          </div>
        </div>

        {/* CHAT MESSAGES STREAM */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {guestMessages.map((msg, idx) => (
            <div key={idx} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
              <div style={{
                padding: '0.85rem 1.15rem',
                borderRadius: '16px',
                background: msg.sender === 'user' ? '#046a47' : 'white',
                color: msg.sender === 'user' ? 'white' : '#0f172a',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                border: msg.sender === 'bot' ? '1px solid #e2e8f0' : 'none',
                lineHeight: '1.5'
              }}>
                {msg.text}
              </div>
            </div>
          ))}

          {guestLoading && <div style={{ color: '#64748b', fontStyle: 'italic' }}>AI đang tra cứu tri thức dinh dưỡng...</div>}

          {/* PROMPT WHEN LIMIT REACHED */}
          {hasReachedLimit && (
            <div style={{ 
              padding: '1.25rem', 
              background: '#fff7ed', 
              border: '1.5px solid #fed7aa', 
              borderRadius: '16px', 
              textAlign: 'center', 
              marginTop: '1rem' 
            }}>
              <Lock size={28} color="#ea580c" style={{ margin: '0 auto 0.5rem auto' }} />
              <h4 style={{ color: '#9a3412', marginBottom: '0.35rem' }}>Bạn đã dùng hết {GUEST_LIMIT} lượt hỏi thử nghiệm miễn phí cùng Hỏi AI!</h4>
              <p style={{ color: '#7c2d12', fontSize: '0.88rem', maxWidth: '500px', margin: '0 auto 1rem auto' }}>
                Khách vãng lai được trải nghiệm tối đa {GUEST_LIMIT} câu hỏi. Hãy đăng ký tài khoản để sử dụng Hỏi AI không giới hạn và lưu trữ lịch sử tư vấn dinh dưỡng.
              </p>
              <Button onClick={() => onNavigate && onNavigate('register')} style={{ background: '#046a47', margin: '0 auto' }}>
                <Sparkles size={16} /> Đăng ký miễn phí để tiếp tục sử dụng Hỏi AI <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </div>

        {/* INPUT ROW */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <input
            type="text"
            value={guestInput}
            disabled={hasReachedLimit}
            onChange={(e) => setGuestInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGuestSend()}
            placeholder={hasReachedLimit ? "Vui lòng đăng ký tài khoản để tiếp tục hỏi..." : "Đặt câu hỏi cùng Hỏi AI về dinh dưỡng chay, thiếu máu, vi chất B12..."}
            style={{ 
              flex: 1, 
              padding: '0.75rem', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1',
              background: hasReachedLimit ? '#f1f5f9' : 'white',
              cursor: hasReachedLimit ? 'not-allowed' : 'text'
            }}
          />
          <Button onClick={handleGuestSend} disabled={hasReachedLimit || guestLoading}>
            <Send size={18} />
          </Button>
        </div>
      </Card>
    );
  }

  // =========================================================================
  // GIAO DIỆN CHO NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP (WORK AREA 3 CỘT ĐÚNG THEO ẢNH MẪU)
  // =========================================================================
  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 120px)', padding: '1rem 1.25rem 2.5rem 1.25rem' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#ffffff',
          padding: '0.8rem 1.25rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontSize: '0.88rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem'
        }}>
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BREADCRUMB */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
        <button 
          onClick={() => onNavigate && onNavigate('home')}
          style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', padding: 0 }}
        >
          <Home size={14} /> Trang chủ
        </button>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>VeggieAI Workspace</span>
      </div>

      {/* BỐ CỤC 3 CỘT WORKSPACE */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '270px 1fr 310px', 
        gap: '1.25rem', 
        alignItems: 'start' 
      }}>

        {/* ======================================================= */}
        {/* CỘT TRÁI: LỊCH SỬ CHAT & HỒ SƠ ĐỒNG BỘ */}
        {/* ======================================================= */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* NÚT TẠO CUỘC TRÒ CHUYỆN MỚI */}
          <button 
            onClick={handleNewChat}
            style={{
              width: '100%',
              background: '#047857',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              fontWeight: 700,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#065f46'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#047857'}
          >
            <Plus size={18} /> Cuộc trò chuyện mới
          </button>

          {/* THẺ HỒ SƠ ĐỒNG BỘ */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 800, color: '#047857', letterSpacing: '0.3px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
                <span>HỒ SƠ ĐỒNG BỘ</span>
              </div>
              
              {/* TOGGLE SWITCH */}
              <button 
                type="button"
                onClick={() => {
                  setSyncEnabled(!syncEnabled);
                  showToast(!syncEnabled ? 'Đã bật đồng bộ thể trạng AI' : 'Đã tạm ngưng đồng bộ');
                }}
                style={{
                  width: '38px',
                  height: '22px',
                  borderRadius: '12px',
                  background: syncEnabled ? '#047857' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s ease',
                  padding: '2px'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '2px',
                  left: syncEnabled ? '18px' : '2px',
                  transition: 'left 0.2s ease'
                }} />
              </button>
            </div>

            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
              {user?.name || 'Minh Tuấn'} (31 tuổi)
            </div>

            {/* TAGS HỒ SƠ (CHAY TRƯỜNG, LEAN MASS, KIÊNG NGŨ VỊ TÂN, DỊ ỨNG) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px' }}>
                Chay trường
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px' }}>
                Lean Mass
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fff7ed', color: '#c2410c', padding: '3px 8px', borderRadius: '6px' }}>
                Kiêng ngũ vị tân
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fef2f2', color: '#b91c1c', padding: '3px 8px', borderRadius: '6px' }}>
                Dị ứng đậu phộng
              </span>
            </div>
          </div>

          {/* DANH SÁCH LỊCH SỬ CUỘC TRÒ CHUYỆN */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* HÔM NAY */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Hôm nay
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div 
                  onClick={() => setActiveChatId('chat-1')}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    background: activeChatId === 'chat-1' ? '#ecfdf5' : 'transparent',
                    color: activeChatId === 'chat-1' ? '#047857' : '#334155',
                    border: activeChatId === 'chat-1' ? '1px solid #a7f3d0' : '1px solid transparent',
                    fontWeight: activeChatId === 'chat-1' ? 700 : 500,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <MessageSquare size={14} style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Tối ưu canxi & B12 cho bữa tối...</span>
                </div>

                <div 
                  onClick={() => setActiveChatId('chat-2')}
                  style={{
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    background: activeChatId === 'chat-2' ? '#ecfdf5' : 'transparent',
                    color: activeChatId === 'chat-2' ? '#047857' : '#475569',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <MessageSquare size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>Thay thế đậu phụ trong thực đơn...</span>
                </div>
              </div>
            </div>

            {/* 7 NGÀY QUA (ĐÃ BỎ "ĐÁNH GIÁ CHỈ SỐ VEGGIESCORE") */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                7 Ngày qua
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div 
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Leaf size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Nấu nước dùng phở không...</span>
                </div>

                <div 
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Sparkles size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Giải cứu 500g nấm đùi gà...</span>
                </div>

                {/* THAY THẾ "ĐÁNH GIÁ CHỈ SỐ VEGGIESCORE" BẰNG MỤC GỢI Ý THỰC ĐƠN KHÁCH QUAN */}
                <div 
                  style={{
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem'
                  }}
                >
                  <Activity size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Gợi ý thực đơn giàu đạm...</span>
                </div>
              </div>
            </div>

            {/* THÁNG 10 */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                Tháng 10
              </div>
              <div 
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: '8px',
                  color: '#475569',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <Flame size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Ăn tăng cơ thực vật (2,08...</span>
              </div>
            </div>

            {/* FOOTER BỘ NHỚ NGỮ CẢNH */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Bộ nhớ ngữ cảnh AI</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#047857' }}>88%</span>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 0.65rem 0', lineHeight: 1.4 }}>
                Đã ghi nhớ 42 thói quen ăn uống & phản ứng dinh dưỡng.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>
                <span style={{ cursor: 'pointer' }} onClick={() => showToast('Đang mở cài đặt bộ nhớ...')}>Quản lý bộ nhớ</span>
                <span style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={() => showToast('Đã xóa bộ nhớ đệm lịch sử')}>Xóa lịch sử</span>
              </div>
            </div>

          </div>
        </aside>

        {/* ======================================================= */}
        {/* CỘT GIỮA: MÀN HÌNH CHAT CHÍNH VỚI VEGGIENUTRI AI */}
        {/* ======================================================= */}
        <main style={{ 
          background: '#ffffff', 
          borderRadius: '20px', 
          border: '1px solid #e2e8f0', 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 170px)',
          boxShadow: '0 4px 20px -5px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}>
          
          {/* HEADER CỦA KHUNG CHAT VEGGIENUTRI AI */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(4, 120, 87, 0.2)'
              }}>
                <Bot size={22} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    VeggieNutri AI
                  </h3>
                  {/* ĐÃ BỎ HOÀN TOÀN BADGE "Chuẩn RNI 2024" THEO YÊU CẦU */}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                  <span>Trực tuyến & Đồng bộ hồ sơ thể trạng (Cập nhật 15 phút trước)</span>
                </div>
              </div>
            </div>

            {/* ACTION ICONS GÓC TRÊN PHẢI */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                type="button"
                onClick={() => {
                  setCopiedSuccess(true);
                  showToast('📋 Đã sao chép nội dung cuộc trò chuyện');
                  setTimeout(() => setCopiedSuccess(false), 2000);
                }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: copiedSuccess ? '#047857' : '#64748b' }}
                title="Sao chép cuộc trò chuyện"
              >
                {copiedSuccess ? <Check size={16} /> : <Copy size={16} />}
              </button>

              <button 
                type="button"
                onClick={() => {
                  setBookmarked(!bookmarked);
                  showToast(!bookmarked ? '⭐ Đã lưu cuộc trò chuyện này' : 'Đã bỏ lưu');
                }}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: bookmarked ? '#047857' : '#64748b' }}
                title="Lưu vào mục quan trọng"
              >
                <Bookmark size={16} fill={bookmarked ? '#047857' : 'none'} />
              </button>

              <button 
                type="button"
                onClick={() => showToast('Tùy chỉnh phong cách phản hồi của AI')}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#64748b' }}
                title="Cài đặt trò chuyện"
              >
                <Sliders size={16} />
              </button>
            </div>
          </div>

          {/* KHÔNG GIAN CUỘN TIN NHẮN */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#fafaf9' }}>
            {chatMessages.map((msg) => {
              if (msg.sender === 'user') {
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                    <div style={{ maxWidth: '78%' }}>
                      <div style={{
                        background: '#047857',
                        color: '#ffffff',
                        padding: '0.85rem 1.15rem',
                        borderRadius: '18px 18px 4px 18px',
                        fontSize: '0.9rem',
                        lineHeight: 1.6,
                        boxShadow: '0 2px 8px rgba(4, 120, 87, 0.15)'
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textAlign: 'right', marginTop: '4px' }}>
                        {msg.time} • {msg.status}
                      </div>
                    </div>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#ea580c',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      MT
                    </div>
                  </div>
                );
              }

              // TIN NHẮN TỪ VEGGIENUTRI AI
              if (msg.type === 'recommendation_card') {
                return (
                  <div key={msg.id} style={{ display: 'flex', gap: '0.65rem', maxWidth: '85%' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: '#047857',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Bot size={18} />
                    </div>

                    {/* RECOMMENDATION CARD ĐẶC THÙ THEO MOCKUP */}
                    <div style={{
                      background: '#ffffff',
                      border: '1px solid #bbf7d0',
                      borderRadius: '18px',
                      padding: '1.25rem',
                      boxShadow: '0 4px 15px rgba(4, 120, 87, 0.06)',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.85rem' }}>
                        {msg.tags.map((t, idx) => (
                          <span 
                            key={idx}
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: idx === 0 ? '#f0fdf4' : idx === 1 ? '#ecfdf5' : '#fef3c7',
                              color: idx === 0 ? '#15803d' : idx === 1 ? '#047857' : '#b45309',
                              border: idx === 0 ? '1px solid #bbf7d0' : idx === 1 ? '1px solid #a7f3d0' : '1px solid #fde68a',
                              padding: '2px 8px',
                              borderRadius: '6px'
                            }}
                          >
                            {idx === 0 ? '🛡️ ' : idx === 1 ? '🌿 ' : '⏱️ '}{t}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', letterSpacing: '0.4px', marginBottom: '0.35rem' }}>
                        {msg.titlePrefix}
                      </div>

                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                        {msg.dishName}
                      </h4>

                      <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 1rem 0' }}>
                        {msg.nutrition}
                      </p>

                      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            if (onNavigate) onNavigate('article-detail');
                          }}
                          style={{
                            background: '#047857',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.55rem 0.95rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Xem công thức chi tiết →
                        </button>

                        <button
                          onClick={() => showToast('✅ Đã thêm món vào thực đơn tối nay!')}
                          style={{
                            background: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '0.55rem 0.95rem',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Thêm vào thực đơn tối
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // TIN NHẮN DẠNG TEXT THÔNG THƯỜNG CỦA BOT
              return (
                <div key={msg.id} style={{ display: 'flex', gap: '0.65rem', maxWidth: '80%' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#047857',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Bot size={18} />
                  </div>

                  <div>
                    <div style={{
                      background: '#ffffff',
                      color: '#0f172a',
                      padding: '0.85rem 1.15rem',
                      borderRadius: '4px 18px 18px 18px',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                    }}>
                      {msg.content}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {authLoading && (
              <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', color: '#047857', fontSize: '0.85rem', fontStyle: 'italic' }}>
                <Bot size={18} />
                <span>VeggieNutri AI đang tra cứu tri thức dinh dưỡng...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* GỢI Ý CÂU HỎI NHANH (PROMPTS PILLS) */}
          <div style={{ padding: '0.6rem 1.25rem', background: '#ffffff', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.65rem', overflowX: 'auto' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', flexShrink: 0 }}>GỢI Ý:</span>
            <button
              onClick={() => handleAuthSend('Tính macro cho bữa trưa tự nấu')}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4px 12px', fontSize: '0.78rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              📋 Tính macro cho bữa trưa tự nấu
            </button>
            <button
              onClick={() => handleAuthSend('Cách ủ đậu nành làm tempeh')}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4px 12px', fontSize: '0.78rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              🌱 Cách ủ đậu nành làm tempeh
            </button>
            <button
              onClick={() => handleAuthSend('Bổ sung canxi và sắt thuần chay')}
              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4px 12px', fontSize: '0.78rem', color: '#334155', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              💧 Bổ sung canxi & sắt thuần chay
            </button>
          </div>

          {/* THANH NHẬP LIỆU CHAT */}
          <div style={{ padding: '0.85rem 1.25rem', background: '#ffffff', borderTop: '1px solid #f1f5f9' }}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAuthSend();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: '16px',
                padding: '4px 8px 4px 12px'
              }}
            >
              <button 
                type="button" 
                onClick={() => showToast('📷 Tính năng tải ảnh đĩa thức ăn để nhận diện dinh dưỡng')}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                title="Tải ảnh đĩa ăn"
              >
                <Camera size={18} />
              </button>

              <button 
                type="button" 
                onClick={() => showToast('🎙️ Tính năng thu âm giọng nói đang sẵn sàng')}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                title="Thu âm câu hỏi"
              >
                <Mic size={18} />
              </button>

              <input
                type="text"
                value={authInput}
                onChange={(e) => setAuthInput(e.target.value)}
                placeholder="Hỏi VeggieNutri AI về dinh dưỡng, công thức món..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.88rem',
                  color: '#0f172a',
                  padding: '0.5rem 0.25rem'
                }}
              />

              <button
                type="submit"
                disabled={!authInput.trim() || authLoading}
                style={{
                  background: authInput.trim() ? '#047857' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.55rem 1.15rem',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: authInput.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'background 0.15s ease'
                }}
              >
                Gửi ➤
              </button>
            </form>

            {/* DÒNG DISCLAIMER CUỐI TRANG: ĐÃ BỎ HOÀN TOÀN "VIỆN DINH DƯỠNG THỰC VẬT & TIÊU CHUẨN RNI 2024" */}
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.55rem' }}>
              Thông tin do VeggieNutri AI cung cấp mang tính tham khảo chăm sóc sức khỏe.
            </div>
          </div>
        </main>

        {/* ======================================================= */}
        {/* CỘT PHẢI: THỂ TRẠNG HÔM NAY & KIẾN THỨC KHOA HỌC */}
        {/* ======================================================= */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          
          {/* THẺ 1: THỂ TRẠNG HÔM NAY #W42-T5 */}
          <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                <Activity size={18} color="#047857" />
                <span>Thể trạng hôm nay</span>
              </div>
              <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                #W42-T5
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569' }}>Năng lượng</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>1,420 / 2,080 kcal</strong>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#475569' }}>Đạm thực vật (Protein)</span>
                <strong style={{ color: '#047857' }}>72g / 85g (85%)</strong>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '4px' }} />
              </div>
            </div>

            {/* ALERT BOX THIẾU CANXI */}
            <div style={{
              background: '#fff7ed',
              border: '1px solid #ffedd5',
              borderRadius: '12px',
              padding: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c2410c', fontWeight: 800, fontSize: '0.82rem' }}>
                <span>⚠️ Cần thêm ~320mg Canxi</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#9a3412', margin: 0, lineHeight: 1.45 }}>
                Món tối nấm xào cải thìa mè rang sẽ bù đủ 100% mục tiêu.
              </p>
            </div>
          </div>

          {/* THẺ 2: KIẾN THỨC DINH DƯỠNG KHOA HỌC */}
          <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem', fontWeight: 800, color: '#047857', marginBottom: '0.65rem' }}>
              <Sparkles size={16} />
              <span>Kiến thức Dinh Dưỡng Khoa Học</span>
            </div>

            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.75rem 0', lineHeight: 1.45 }}>
              Vì sao hạt mè nguyên cám là siêu thực phẩm canxi thuần chay?
            </h4>

            <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '0.75rem', height: '120px' }}>
              <img 
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80" 
                alt="Hạt mè nguyên cám" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.55, margin: 0 }}>
              100g hạt mè nguyên vỏ chứa đến <strong>975mg canxi</strong> (gấp 8 lần sữa bò công nghiệp). Khi rang chín và nhai kỹ hoặc xay mịn, tỷ lệ sinh khả dụng đạt trên 70%.
            </p>
          </div>

          {/* THẺ 3: LỐI TẮT ĐỒNG BỘ (ĐÃ BỎ "CẦN HỎI Ý KIẾN BÁC SĨ") */}
          <div style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.15rem' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.65rem', letterSpacing: '0.5px' }}>
              Lối tắt đồng bộ
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              
              {/* LỐI TẮT 1: TỦ LẠNH VEGGIEBOX */}
              <div 
                onClick={() => showToast('🥦 Mở tủ lạnh thông minh VeggieBox: 8 nguyên liệu tươi')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Tủ lạnh VeggieBox</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>8 nguyên liệu còn tươi</div>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </div>

              {/* LỐI TẮT 2: KẾ HOẠCH TUẦN */}
              <div 
                onClick={() => onNavigate && onNavigate('planner')}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>Kế hoạch tuần #W42</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Đã hoàn thành 5/7 ngày</div>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </div>

              {/* ĐÃ BỎ HOÀN TOÀN MỤC "Cần hỏi ý kiến Bác Sĩ? — Kết nối trực tiếp 1-1 với Chuyên gia Lâm sàng" THEO ĐÚNG YÊU CẦU CỦA NGƯỜI DÙNG */}

            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
