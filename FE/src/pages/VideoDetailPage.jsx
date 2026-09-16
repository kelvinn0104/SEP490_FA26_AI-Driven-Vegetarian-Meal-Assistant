import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bookmark, Check, Share2, Heart, MessageSquare, 
  Calendar, Clock, Play, Sparkles, CheckCircle2, Send, Flame, Leaf, Droplet
} from 'lucide-react';

export default function VideoDetailPage({ videoData, onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // DỮ LIỆU VIDEO (MẶC ĐỊNH LÀ BÀI PHỞ NẤM DƯỠNG SINH HOẶC TRUYỀN TỪ PROPS)
  const video = videoData || {
    id: 'vid-pho-1',
    title: 'Bí Quyết Nấu Phở Nấm Dưỡng Sinh: Nước Dùng Trong Ngọt Tự Nhiên Từ Củ Quả & Nấm Hương',
    channel: 'Bếp Chay Thanh Tịnh',
    channelAvatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80',
    views: '124k lượt xem',
    rating: '★ 4.9',
    duration: '12:45',
    date: '2 ngày trước',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    macro: {
      calories: '385 kcal',
      protein: '19.6g',
      carbs: '54.0g'
    },
    aiTips: [
      {
        num: 1,
        title: 'Nước dùng trong veo không cặn:',
        desc: 'Hầm lê và mía tím ở 85°C, không đậy vung để hơi hăng thoát ra ngoài.'
      },
      {
        num: 2,
        title: 'Bí quyết Umami tự nhiên:',
        desc: 'Củ cải sấy khô sao cháy xém nướng sơ tạo vị ngọt sâu thanh thoát.'
      },
      {
        num: 3,
        title: 'Chân nấm đùi gà xé sợi:',
        desc: 'Ướp ta-mari cùng dầu mè áp chảo xém vàng để tạo độ dai thần thánh.'
      }
    ],
    ingredients: [
      'Bánh phở tươi: 150g',
      'Nấm đùi gà & Nấm hương khô: 100g',
      'Đậu hũ chiên vàng: 1 miếng',
      'Nước dùng củ quả (mía tím, lê, củ cải, hành baro nướng): 500ml',
      'Gia vị thảo mộc: Hoa hồi, quế thanh, thảo quả sao thơm',
      'Rau thơm: Ngò gai, húng quế, chanh ớt tươi'
    ],
    steps: [
      { time: '00:15', desc: 'Nướng thơm hành tây, gừng, hồi, quế trên lửa nhỏ tạo tầng hương thảo mộc.' },
      { time: '02:40', desc: 'Ninh củ cải khô, lê và mía tím với 1.5L nước trong 35 phút ở nhiệt độ 85–90°C để nước trong.' },
      { time: '06:10', desc: 'Áp chảo nấm đùi gà với nước tương tamari và dầu mè cho xém cạnh, dậy mùi thơm giòn.' },
      { time: '09:30', desc: 'Chần nhanh bánh phở qua nước sôi, xếp vào tô cùng nấm xào, đậu hũ lát và rau mùi.' },
      { time: '11:45', desc: 'Chan nước dùng phở sôi bốc khói, rắc tiêu sọ và dọn kèm đĩa rau thơm chanh ớt.' }
    ]
  };

  // STATES
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likes, setLikes] = useState(480);
  const [hasLiked, setHasLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentTimeStep, setCurrentTimeStep] = useState('00:15');

  // COMMENTS STATE
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Mai Linh',
      time: '2 ngày trước',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Đã nấu thử',
      content: 'Nước dùng thơm lừng cả gian bếp! Nấu theo bí quyết nướng củ cải khô nước ngọt thanh tự nhiên mà không cần đến hạt nêm luôn.',
      likes: 12,
      replies: [
        {
          id: 'r1',
          author: 'Bếp Chay Thanh Tịnh',
          isAuthor: true,
          time: '1 ngày trước',
          content: 'Cảm ơn bạn Mai Linh! Chúc bạn và gia đình luôn có những bữa chay ấm áp và dồi dào sức khỏe.',
          likes: 3
        }
      ]
    },
    {
      id: 'c2',
      author: 'Hoàng Nam',
      time: 'Hôm qua',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      badge: '',
      content: 'Cho mình hỏi mía tím có thể thay bằng nước mía tươi ép sẵn bán ngoài đường được không?',
      likes: 2,
      replies: [
        {
          id: 'r2',
          author: 'Thanh Nhã', // ĐÃ BỎ "(ĐẦU BẾP GIA CHAY)" - CHỈ GIỮ TÊN "Thanh Nhã"
          isAuthor: false,
          time: 'Hôm qua',
          content: 'Nên dùng mía cây nướng sơ chẻ khúc ninh bạn nhé, nước mía ép sẵn chứa nhiều bọt đường và dễ làm đục nước dùng phở.',
          likes: 4
        }
      ]
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const handleToggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    showToast(next ? '❤️ Đã lưu vào video yêu thích!' : 'Đã bỏ lưu khỏi video yêu thích');
  };

  const handleToggleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      showToast('👍 Cảm ơn bạn đã thích video này!');
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newCmt = {
      id: `c_${Date.now()}`,
      author: 'Thanh Nhã',
      time: 'Vừa xong',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: '',
      content: commentText.trim(),
      likes: 0,
      replies: []
    };

    setComments([newCmt, ...comments]);
    setCommentText('');
    showToast('💬 Đã gửi bình luận của bạn thành công!');
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', color: '#0f172a' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: '#047857',
          color: '#ffffff',
          padding: '0.9rem 1.4rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          fontSize: '0.9rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'slideUp 0.25s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* CONTAINER CHÍNH */}
      <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '1.5rem 1.25rem 0 1.25rem' }}>
        
        {/* TOP BAR BREADCRUMB & REPORT */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
          <button
            onClick={() => onNavigate ? onNavigate('videos') : null}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              color: '#059669',
              fontWeight: 700,
              cursor: 'pointer',
              padding: 0
            }}
          >
            <ArrowLeft size={16} /> Quay lại Video
          </button>

          <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => showToast('Cảm ơn bạn! Đã ghi nhận phản hồi.')}>
            Phản hồi / Báo cáo video
          </span>
        </div>

        {/* HEADER VIDEO: TAGS & BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
              Video Nấu Ăn Thuần Chay
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>⏱ {video.duration}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📅 {video.date}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={handleToggleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: isSaved ? '#ecfdf5' : '#ffffff',
                color: isSaved ? '#047857' : '#334155',
                border: isSaved ? '1px solid #a7f3d0' : '1px solid #cbd5e1',
                padding: '0.5rem 0.95rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {isSaved ? <Check size={14} color="#047857" /> : <Bookmark size={14} />}
              <span>{isSaved ? 'Đã lưu vào video yêu thích' : 'Lưu vào video yêu thích'}</span>
            </button>

            <button
              onClick={() => showToast('🔗 Đã sao chép liên kết video!')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '0.5rem 0.85rem',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Share2 size={14} /> Chia sẻ
            </button>
          </div>
        </div>

        {/* TIÊU ĐỀ VIDEO */}
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
          {video.title}
        </h1>

        {/* KÊNH (ĐÃ BỎ "TÁC GIẢ TIN CẬY", BỎ "VEGGIEAI VERIFIED") */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img 
              src={video.channelAvatar} 
              alt={video.channel} 
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                {video.channel}
              </strong>
              <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {video.views} • {video.rating}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            ❤️ {likes} lượt thích • 💬 {comments.length} bình luận
          </div>
        </div>

        {/* BỐ CỤC CHÍNH: CỘT NỘI DUNG (70%) + CỘT SIDEBAR (30%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem', alignItems: 'start' }}>
          
          {/* ================================================================= */}
          {/* CỘT TRÁI: VIDEO PLAYER & CHI TIẾT */}
          {/* ================================================================= */}
          <div>
            
            {/* TRÌNH PHÁT VIDEO CHUYÊN NGHIỆP */}
            <div style={{ position: 'relative', width: '100%', height: '420px', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem', background: '#000000' }}>
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isPlaying ? 0.95 : 0.85 }} 
              />

              {!isPlaying ? (
                <div 
                  onClick={() => setIsPlaying(true)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    background: '#047857',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingLeft: '4px',
                    boxShadow: '0 0 30px rgba(4, 120, 87, 0.7)',
                    transition: 'transform 0.2s ease'
                  }}>
                    <Play size={32} fill="#ffffff" />
                  </div>
                  <span style={{ color: '#ffffff', marginTop: '0.85rem', fontWeight: 700, fontSize: '0.9rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    Bấm để phát video hướng dẫn
                  </span>
                </div>
              ) : (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff', fontSize: '0.8rem' }}>
                  <span>▶ Đang phát: {currentTimeStep} / {video.duration}</span>
                  <button onClick={() => setIsPlaying(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}>Tạm dừng</button>
                </div>
              )}
            </div>

            {/* 3 THẺ DINH DƯỠNG NHANH */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem', marginBottom: '1.75rem' }}>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>Năng lượng</div>
                <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{video.macro.calories}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>Protein</div>
                <strong style={{ fontSize: '1.1rem', color: '#047857' }}>{video.macro.protein}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>Carbs sạch</div>
                <strong style={{ fontSize: '1.1rem', color: '#2563eb' }}>{video.macro.carbs}</strong>
              </div>
            </div>

            {/* KHỐI MẸO CỐT LÕI TÁCH TỰ ĐỘNG BẰNG AI */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '20px',
              padding: '1.4rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#047857', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={16} />
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                    3 Mẹo cốt lõi tách tự động bằng AI
                  </strong>
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px' }}>
                  Speech-to-Recipe
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {video.aiTips.map((tip) => (
                  <div key={tip.num} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#bbf7d0', color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0, marginTop: '2px' }}>
                      {tip.num}
                    </span>
                    <div>
                      <strong>{tip.title}</strong> {tip.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KHỐI NGUYÊN LIỆU ĐỊNH LƯỢNG */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <span>📋</span> Nguyên liệu định lượng
                </h3>
                <button
                  onClick={() => showToast('🛒 Đã thêm nguyên liệu vào Giỏ đi chợ thông minh!')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🛒 Thêm vào giỏ đi chợ
                </button>
              </div>

              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.88rem', color: '#334155', lineHeight: 1.8 }}>
                {video.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>

            {/* KHỐI TÓM TẮT CÁC BƯỚC THEO DÒNG THỜI GIAN VIDEO */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.15rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>🔍</span> Tóm tắt các bước theo dòng thời gian video
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {video.steps.map((st, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setCurrentTimeStep(st.time);
                      setIsPlaying(true);
                      showToast(`⏩ Đã tua video đến thời điểm ${st.time}`);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#047857', fontWeight: 800, fontSize: '0.84rem', flexShrink: 0 }}>
                      <CheckCircle2 size={16} />
                      <span>{st.time}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                      {st.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* THANH ACTION CUỐI BÀI */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleToggleLike}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: hasLiked ? '#fee2e2' : '#ffffff',
                    color: hasLiked ? '#ef4444' : '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.55rem 0.95rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Heart size={15} fill={hasLiked ? '#ef4444' : 'none'} />
                  <span>{likes} Lượt thích</span>
                </button>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#ffffff',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '0.55rem 0.95rem',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  <MessageSquare size={15} />
                  <span>{comments.length} Bình luận</span>
                </button>
              </div>

              <button
                onClick={() => {
                  showToast('📅 Đã thêm món vào Thực đơn tuần!');
                  if (onNavigate) onNavigate('planner');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#046a47',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.65rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(4, 106, 71, 0.25)'
                }}
              >
                <Calendar size={15} />
                <span>+ Thêm món này vào Thực đơn tuần</span>
              </button>
            </div>

            {/* KHỐI BÌNH LUẬN VIDEO */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0' }}>
                Bình luận ({comments.length})
              </h3>

              {/* Ô NHẬP BÌNH LUẬN */}
              <form onSubmit={handleAddComment} style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.45rem' }}>
                  Đang đăng nhập với tư cách: <strong style={{ color: '#0f172a' }}>Thanh Nhã</strong>
                </div>
                <textarea
                  placeholder="Viết bình luận hoặc đặt câu hỏi cho đầu bếp..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'none',
                    marginBottom: '0.65rem',
                    background: '#f8fafc'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: '#046a47',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.6rem 1.15rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Send size={13} /> Gửi bình luận
                  </button>
                </div>
              </form>

              {/* DANH SÁCH BÌNH LUẬN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {comments.map((cmt) => (
                  <div key={cmt.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <img src={cmt.avatar} alt={cmt.author} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{cmt.author}</strong>
                          {cmt.badge && (
                            <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '1px 6px', borderRadius: '4px' }}>
                              {cmt.badge}
                            </span>
                          )}
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>• {cmt.time}</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 0.45rem 0', lineHeight: 1.5 }}>
                          {cmt.content}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ cursor: 'pointer' }}>❤️ {cmt.likes} Thích</span>
                          <span style={{ cursor: 'pointer' }}>Trả lời</span>
                        </div>

                        {/* REPLIES */}
                        {cmt.replies && cmt.replies.map((rep) => (
                          <div key={rep.id} style={{ marginTop: '0.75rem', background: '#f8fafc', padding: '0.75rem 0.95rem', borderRadius: '12px', borderLeft: '3px solid #059669' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                              <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{rep.author}</strong>
                              {rep.isAuthor && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px' }}>
                                  Kênh gốc
                                </span>
                              )}
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>• {rep.time}</span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                              {rep.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ================================================================= */}
          {/* CỘT PHẢI: SIDEBAR (ĐÃ BỎ "GỢI Ý KÈM THEO", ĐÃ BỎ "MÓN CHAY LIÊN QUAN") */}
          {/* ================================================================= */}
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              padding: '1.4rem',
              boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  <span>📅</span>
                  <span>Kế hoạch tuần này</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Hôm nay</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                Món phở nấm này bổ sung lượng nước và chất xơ tuyệt vời cho bữa sáng hoặc trưa của bạn.
              </p>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Bữa sáng dưỡng sinh</strong>
                    <span style={{ fontSize: '0.74rem', color: '#047857', fontWeight: 600 }}>1 khẩu phần • 385 kcal</span>
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>🍜</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('planner')}
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tuỳ chỉnh lịch ăn trong tuần →
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
