import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Bookmark, Check, Share2, Heart, MessageSquare, 
  Calendar, Clock, Users, ChefHat, Sparkles, CheckCircle2, 
  AlertCircle, Send, Plus, ChevronRight, X, ExternalLink
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function ArticleDetailPage({ articleData, onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // DỮ LIỆU BÀI VIẾT MẶC ĐỊNH (CÀ RI BÍ ĐỎ HẠT SEN NHƯ ẢNH 3 HOẶC TRUYỀN TỪ PROPS)
  const defaultArticle = {
    id: 'art-curry-1',
    category: 'Món Kho / Cà Ri Chay',
    readTime: '6 phút đọc',
    date: '4 ngày trước',
    title: 'Cà Ri Bí Đỏ Hạt Sen & Đậu Hũ Non Cốt Dừa Thơm Béo',
    author: 'Cà Ri Bí Đỏ',
    authorAvatar: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=80',
    likesCount: 320,
    commentsCount: 12,
    prepTime: '15 phút',
    cookTime: '30 phút',
    servings: '4 người',
    difficulty: 'Dễ làm',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=80',
    intro: 'Cà ri bí đỏ hạt sen là món ăn thanh nhẹ, giàu dưỡng chất và cực kỳ phù hợp cho những ngày mưa hay mâm cơm gia đình ấm cúng. Nước cốt dừa thơm lừng hòa quyện cùng vị ngọt bùi tự nhiên của bí đỏ hồ lô, hạt sen tươi ninh mềm bở tơi, kết hợp những miếng đậu hũ non béo ngậy tạo nên nồi cà ri tròn vị.',
    ingredients: [
      { name: 'Bí đỏ hồ lô', amount: '500g (cắt miếng vừa ăn)' },
      { name: 'Hạt sen tươi Huế', amount: '100g (bỏ tâm sen)' },
      { name: 'Đậu hũ non hữu cơ', amount: '1 hộp (300g)' },
      { name: 'Nước cốt dừa nguyên chất', amount: '250ml' },
      { name: 'Nấm đùi gà / nấm rơm', amount: '150g' },
      { name: 'Bột cà ri chay & Hạt nêm nấm', amount: '1.5 muỗng cà phê' },
      { name: 'Rau gia vị ăn kèm', amount: 'Rau húng quế, ngò gai tươi' }
    ],
    steps: [
      {
        num: 1,
        title: 'Sơ chế nguyên liệu',
        desc: 'Bí đỏ gọt vỏ, bỏ ruột và cắt khối vuông cạnh khoảng 2.5cm. Nấm đùi gà ngâm nước muối loãng 5 phút, rửa sạch để ráo rồi cắt lát vừa ăn. Đậu hũ non trần sơ qua nước ấm, cắt khối vuông rồi đặt trên giấy thấm ráo. Hạt sen thông tâm để không bị đắng.'
      },
      {
        num: 2,
        title: 'Xào thơm và hầm hạt sen bí đỏ',
        desc: 'Đun nóng 1 muỗng dầu dừa trong nồi sâu lòng, phi thơm phần gốc boa-rô băm nhỏ. Cho nấm và bột cà ri chay vào xào nhanh 1-2 phút cho lên màu vàng óng và dậy mùi thơm. Đổ 600ml nước dùng rau củ cùng hạt sen tươi vào đun sôi, hạ lửa vừa ninh 15 phút cho hạt sen bắt đầu bở mềm.'
      },
      {
        num: 3,
        title: 'Nấu nước cốt dừa và hoàn thiện',
        desc: 'Tiếp tục cho bí đỏ vào đun thêm 10 phút đến khi bí đỏ chín mềm nhưng không bị nát. Hạ nhỏ lửa tối đa rồi từ từ rót 250ml nước cốt dừa vào khuấy nhẹ tay một chiều. Nêm nếm với 1 muỗng hạt nêm nấm và nửa muỗng cà phê muối hồng Himalaya. Tắt bếp, rắc lá quế và ngò gai cắt nhỏ lên bề mặt. Dùng nóng kèm bánh mì hoặc bún tươi.'
      }
    ],
    nutrition: {
      calories: '345 kcal / khẩu phần',
      protein: '18.5g Đạm thực vật',
      fiber: '4.2g Chất xơ',
      cholesterol: '0mg Cholesterol',
      allergyNote: 'Không chứa Đậu phộng, không Ngũ vị tân, Thuần chay 100%'
    }
  };

  // CHUẨN HÓA DỮ LIỆU AN TOÀN
  const article = {
    ...defaultArticle,
    ...(articleData || {}),
    author: articleData?.author || defaultArticle.author,
    image: articleData?.image || articleData?.img || defaultArticle.image,
    category: articleData?.category || articleData?.tag || defaultArticle.category,
    intro: articleData?.intro || articleData?.content || articleData?.excerpt || defaultArticle.intro,
    ingredients: (Array.isArray(articleData?.ingredients) && articleData.ingredients.length > 0)
      ? articleData.ingredients
      : defaultArticle.ingredients,
    steps: (Array.isArray(articleData?.steps) && articleData.steps.length > 0)
      ? articleData.steps
      : defaultArticle.steps,
    nutrition: {
      ...defaultArticle.nutrition,
      ...(articleData?.nutrition || {})
    }
  };

  // STATES
  const [isSaved, setIsSaved] = useState(false);
  const [likes, setLikes] = useState(article.likesCount);
  const [hasLiked, setHasLiked] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // COMMENTS STATE
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c1',
      author: 'Mai Linh',
      time: '3 ngày trước',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      badge: 'Đã nấu thử',
      content: 'Công thức tuyệt vời! Mình đã trổ tài cho bữa cơm gia đình hôm qua và cả nhà ai cũng khen nước dùng béo thanh tự nhiên, hạt sen bở ngậy.',
      likes: 8,
      replies: [
        {
          id: 'r1',
          author: 'Cà Ri Bí Đỏ',
          isAuthor: true,
          time: '2 ngày trước',
          content: 'Cảm ơn bạn Mai Linh đã tin tưởng công thức nhé! Bạn có thể thêm chút lá chúc nếu thích hương vị nồng nàn hơn nữa 🌿',
          likes: 2
        }
      ]
    },
    {
      id: 'c2',
      author: 'Hoàng Nam',
      time: '1 ngày trước',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      badge: '',
      content: 'Có thể thay hạt sen bằng đậu xơ hoặc đậu gà không ạ? Nhà mình đang sẵn đậu gà ngâm qua đêm.',
      likes: 3,
      replies: [
        {
          id: 'r2',
          author: 'Thanh Nhã', // ĐÃ BỎ "(ĐẦU BẾP GIA CHAY)" - CHỈ GIỮ TÊN "Thanh Nhã"
          isAuthor: false,
          time: '1 ngày trước',
          content: 'Hoàn toàn được bạn nhé! Đậu gà luộc mềm trước khi nấu cà ri sẽ giúp nước sốt sánh và tăng thêm rất nhiều đạm thực vật đấy.',
          likes: 1
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
    showToast(next ? '❤️ Đã lưu vào Bài viết yêu thích!' : 'Đã bỏ lưu khỏi Bài viết yêu thích');
  };

  const handleToggleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      showToast('👍 Cảm ơn bạn đã thích bài viết này!');
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
            onClick={() => onNavigate ? onNavigate('blog') : null}
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
            <ArrowLeft size={16} /> Quay lại Blog
          </button>

          <span style={{ color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }} onClick={() => showToast('Cảm ơn bạn! Đã ghi nhận phản hồi.')}>
            Phản hồi / Báo cáo lỗi
          </span>
        </div>

        {/* HEADER BÀI VIẾT: TAGS & BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#ecfdf5', color: '#047857', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '6px' }}>
              {article.category}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>⏱ {article.readTime}</span>
            <span style={{ color: '#cbd5e1' }}>•</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>📅 {article.date}</span>
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
              <span>{isSaved ? 'Đã lưu vào Bài viết yêu thích' : 'Lưu vào Bài viết yêu thích'}</span>
            </button>

            <button
              onClick={() => showToast('🔗 Đã sao chép liên kết chia sẻ!')}
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

        {/* TIÊU ĐỀ BÀI VIẾT LỚN */}
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0', lineHeight: 1.35, letterSpacing: '-0.02em' }}>
          {article.title}
        </h1>

        {/* TÁC GIẢ (ĐÃ BỎ "TÁC GIẢ TIN CẬY", BỎ "CHUYÊN GIA DINH DƯỠNG THỰC VẬT & NGƯỜI SÁNG LẬP BẾP ÂM XANH") */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img 
              src={article.authorAvatar} 
              alt={article.author} 
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <div>
              <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                {article.author}
              </strong>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            ❤️ {likes} lượt thích • 💬 {article.commentsCount} bình luận
          </div>
        </div>

        {/* BỐ CỤC CHÍNH: CỘT NỘI DUNG (70%) + CỘT SIDEBAR (30%) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '2rem', alignItems: 'start' }}>
          
          {/* ================================================================= */}
          {/* CỘT TRÁI: NỘI DUNG BÀI VIẾT */}
          {/* ================================================================= */}
          <div>
            {/* ẢNH BÀI VIẾT NỔI BẬT */}
            <div style={{ position: 'relative', width: '100%', height: '380px', borderRadius: '20px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img 
                src={article.image} 
                alt={article.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <span style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                background: 'rgba(15, 23, 42, 0.75)',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)'
              }}>
                Ảnh chụp thực tế từ gian bếp VeggieAI
              </span>
            </div>

            {/* 4 THẺ THÔNG TIN NHANH */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>⏱ Chuẩn bị</div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{article.prepTime}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>🍳 Nấu chín</div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{article.cookTime}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>👥 Khẩu phần</div>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{article.servings}</strong>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem' }}>🌿 Độ khó</div>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>{article.difficulty}</strong>
              </div>
            </div>

            {/* ĐOẠN MÔ TẢ MỞ ĐẦU */}
            <p style={{ fontSize: '0.96rem', color: '#334155', lineHeight: 1.7, marginBottom: '2rem' }}>
              {article.intro}
            </p>

            {/* KHỐI 1: DANH SÁCH NGUYÊN LIỆU */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  <span>📋</span>
                  <span>Danh sách nguyên liệu (Chuẩn 4 khẩu phần)</span>
                </div>
                <button
                  onClick={() => showToast('🛒 Đã thêm 6 nguyên liệu vào Giỏ đi chợ thông minh!')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                >
                  🛒 Thêm vào giỏ đi chợ
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
                {article.ingredients.map((ing, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: '10px', fontSize: '0.84rem' }}>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>• {ing.name}</span>
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* KHỐI 2: CÁC BƯỚC THỰC HIỆN CHI TIẾT */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.25rem' }}>
                <span>🍳</span>
                <span>Các bước thực hiện chi tiết</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {article.steps.map((st) => (
                  <div key={st.num} style={{ display: 'flex', gap: '0.95rem', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      background: '#047857',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {st.num}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
                        {st.title}
                      </h4>
                      <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: 1.65 }}>
                        {st.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KHỐI 3: AI PHÂN TÍCH DINH DƯỠNG (ĐÃ BỎ "VEGGIEAI VERIFIED") */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '20px',
              padding: '1.4rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.85rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#047857', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={16} />
                </div>
                <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                  AI Phân tích dinh dưỡng
                </strong>
              </div>

              <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.84rem', color: '#334155', fontWeight: 600, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <span style={{ color: '#047857' }}>🔥 {article.nutrition.calories}</span>
                <span>•</span>
                <span style={{ color: '#059669' }}>🌱 {article.nutrition.protein}</span>
                <span>•</span>
                <span style={{ color: '#d97706' }}>🌾 {article.nutrition.fiber}</span>
                <span>•</span>
                <span style={{ color: '#2563eb' }}>💧 {article.nutrition.cholesterol}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>🛡 Cảnh báo dị ứng:</span>
                <span>{article.nutrition.allergyNote}</span>
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
                  showToast('📅 Đã thêm món "Cà Ri Bí Đỏ Hạt Sen" vào Thực đơn tuần!');
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

            {/* =============================================================== */}
            {/* KHỐI BÌNH LUẬN & THẢO LUẬN */}
            {/* =============================================================== */}
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
                  placeholder="Viết bình luận hoặc chia sẻ cảm nhận nấu ăn của bạn..."
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
                                  Tác giả
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
          {/* CỘT PHẢI: SIDEBAR (ĐÃ BỎ "GỢI Ý UỐNG GÌ", ĐÃ BỎ "MÓN CHAY LIÊN QUAN") */}
          {/* ================================================================= */}
          <div>
            {/* KHỐI: KẾ HOẠCH TUẦN NÀY (THỰC ĐƠN MẪU) */}
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
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Thứ Năm</span>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.45 }}>
                Món Cà Ri bí đỏ này sẽ giúp hoàn hảo mục tiêu 55/70g đạm đạt chuẩn cho bữa trưa hôm nay của bạn.
              </p>

              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>Bữa trưa gia đình</strong>
                    <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600 }}>4 khẩu phần • 345 kcal</span>
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>🥗</span>
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
