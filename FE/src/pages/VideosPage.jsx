import React, { useState } from 'react';
import { Video, Search, Play, Clock, Sparkles, X, Heart, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function VideosPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [selectedVideo, setSelectedVideo] = useState(null);

  const categories = ['Tất cả', 'Món lẩu & súp', 'Nồi chiên không dầu', 'Món xào & kho', 'Món cuốn & gỏi'];

  const videos = [
    {
      id: 'v1',
      category: 'Món lẩu & súp',
      title: 'Lẩu Nấm Chay Bách Hỷ Chuẩn Vị Thanh Ngọt Thảo Mộc',
      author: 'Chef Minh Tú',
      views: '120k lượt xem',
      time: '18:24',
      summary: '1. Hầm nước dùng củ sen & hạt sen 15 phút. 2. Cho nấm đùi gà, nấm kim châm & đậu hũ non. 3. Thêm táo đỏ & kỷ tử.',
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      details: [
        'Bước 1: Rửa sạch các loại nấm (nấm đùi gà, nấm hương tươi, nấm bào ngư, nấm kim châm).',
        'Bước 2: Nấu nước hầm từ 1 củ sen, 1 củ cải trắng và 50g hạt sen trong 20 phút để lấy vị ngọt thanh tự nhiên.',
        'Bước 3: Nêm 1 thìa đường phèn, hạt nêm nấm hữu cơ và vài lát kỷ tử.',
        'Bước 4: Dọn lên nồi lẩu cùng đĩa nấm tươi và bún tươi ăn kèm.'
      ]
    },
    {
      id: 'v2',
      category: 'Nồi chiên không dầu',
      title: 'Ram Chay Giòn Rụm Không Dầu Nướng Bằng Nồi Chiên',
      author: 'VeggieKitchen',
      views: '85k lượt xem',
      time: '12:05',
      summary: '1. Trộn miến, khoai môn, nấm mèo & đậu hũ. 2. Cuốn bánh tráng rắc mè. 3. Nướng nồi chiên 180°C trong 15 phút.',
      img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80',
      details: [
        'Bước 1: Bào sợi khoai môn, cà rốt. Ngâm nở miến dong và nấm mèo thái nhuyễn.',
        'Bước 2: Dằm nát đậu hũ trắng, trộn đều cùng hạt nêm nấm và tiêu thơm.',
        'Bước 3: Nhúng bánh tráng vào nước pha chút giấm để khi nướng vỏ ram giòn lâu.',
        'Bước 4: Xếp vào nồi chiên không dầu nướng ở 180°C trong 15 phút, lật mặt nướng thêm 5 phút.'
      ]
    },
    {
      id: 'v3',
      category: 'Món xào & kho',
      title: 'Cà Rốt Xào Nấm Nước Cốt Dừa Béo Thanh Đậm Đà',
      author: 'GreenGourmet',
      views: '210k lượt xem',
      time: '10:45',
      summary: '1. Sơ chế cà rốt cắt lát & nấm hương tươi. 2. Phi thơm hành tăm & cho nước cốt dừa. 3. Đun nhỏ lửa 8 phút.',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      details: [
        'Bước 1: Cà rốt tỉa hoa thái lát mỏng, nấm hương ngâm nở.',
        'Bước 2: Đun nóng chảo dầu, phi thơm hành baro.',
        'Bước 3: Cho cà rốt và nấm vào xào nhanh tay, rót nước cốt dừa vào rim nhỏ lửa đến khi sánh lại.',
        'Bước 4: Rắc hành ngò lên đĩa và dùng nóng với cơm gạo lứt.'
      ]
    },
    {
      id: 'v4',
      category: 'Món cuốn & gỏi',
      title: 'Gỏi Cuốn Cầu Vồng Tươi Mát Chấm Sốt Bơ Đậu Phộng',
      author: 'Mộc Nhiên Vegan',
      views: '98k lượt xem',
      time: '14:15',
      summary: '1. Chuẩn bị bún, bơ lát, xoài chín, ớt chuông. 2. Cuốn bánh tráng gạo mè. 3. Pha sốt bơ đậu phộng tỏi ớt.',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      details: [
        'Bước 1: Cắt sợi ớt chuông đỏ, vàng, dưa leo, xoài xanh và bơ sáp.',
        'Bước 2: Làm ẩm bánh tráng mè, xếp rau xà lách, rau thơm, bún tươi và các dải màu rau củ cầu vồng.',
        'Bước 3: Cuộn chặt tay và cắt đôi xiên chéo.',
        'Bước 4: Pha sốt chấm: 2 muỗng bơ đậu phộng, 1 muỗng tương đen, chút nước cốt chanh và nước ấm khuấy mịn.'
      ]
    }
  ];

  const filteredVideos = videos.filter(v => {
    const matchesCategory = activeCategory === 'Tất cả' || v.category === activeCategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          v.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1rem 1.5rem 3.5rem 1.5rem' }}>
      {/* HEADER HERO */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '1rem' }}>
        <span className="badge badge-ai" style={{ marginBottom: '0.75rem' }}>
          <Video size={15} /> KHO VIDEO NẤU ĂN
        </span>
        <h1 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: 800, margin: '0.5rem 0' }}>
          Video Nấu Chay Tích Hợp AI Tóm Tắt
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
          Học nấu các món chay chuẩn dinh dưỡng qua video trực quan, kết hợp công nghệ AI trích xuất nhanh công thức dạng văn bản trong 30 giây.
        </p>

        {/* SEARCH BAR */}
        <div style={{ maxWidth: '560px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1.5px solid #cbd5e1', borderRadius: '30px', padding: '0.5rem 1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
            <Search size={18} color="#64748b" style={{ marginRight: '0.75rem' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm video món chay, tên đầu bếp, cách làm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', color: '#1e293b' }}
            />
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.45rem 1.15rem',
                borderRadius: '20px',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: activeCategory === cat ? 'none' : '1px solid #e2e8f0',
                background: activeCategory === cat ? '#046a47' : '#ffffff',
                color: activeCategory === cat ? '#ffffff' : '#475569',
                transition: 'all 0.2s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* VIDEOS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {filteredVideos.map((video) => (
          <Card 
            key={video.id} 
            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
            onClick={() => setSelectedVideo(video)}
          >
            <div style={{ height: '210px', backgroundImage: `url('${video.img}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.35)' }}></div>
              <div style={{ position: 'relative', background: 'rgba(5, 150, 105, 0.95)', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.2s' }}>
                <Play fill="white" size={24} color="white" />
              </div>
              <span style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.75)', color: 'white', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}>
                {video.time}
              </span>
              <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.92)', color: '#047857', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                {video.category}
              </span>
            </div>

            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ color: '#0f172a', fontSize: '1.15rem', lineHeight: '1.4', marginBottom: '0.4rem' }}>
                {video.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                {video.author} • {video.views}
              </p>

              <div style={{ padding: '0.85rem 1rem', background: '#ecfdf5', borderRadius: '12px', fontSize: '0.85rem', color: '#047857', borderLeft: '4px solid #10b981', marginBottom: '1.25rem' }}>
                <strong>🤖 AI Tóm tắt các bước:</strong>
                <p style={{ marginTop: '0.35rem', lineHeight: '1.5' }}>{video.summary}</p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ color: '#059669', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Eye size={16} /> Xem chi tiết video →
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          <p>Không tìm thấy video nào phù hợp với từ khóa "{searchQuery}".</p>
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); }}>
            Xem tất cả video
          </Button>
        </div>
      )}

      {/* VIDEO DETAIL MODAL */}
      {selectedVideo && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '720px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2.25rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setSelectedVideo(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span className="badge badge-ai">CHI TIẾT VIDEO</span>
            <h2 style={{ color: '#0f172a', margin: '0.75rem 0 0.4rem 0', fontSize: '1.6rem', lineHeight: '1.35' }}>
              {selectedVideo.title}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Đăng bởi: <strong>{selectedVideo.author}</strong> • {selectedVideo.views} • Thời lượng: {selectedVideo.time}
            </p>

            {/* Video Player Box Mockup */}
            <div style={{ height: '280px', background: '#0f172a', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1.5rem', position: 'relative' }}>
              <div style={{ width: '64px', height: '64px', background: '#059669', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(5,150,105,0.4)' }}>
                <Play fill="white" size={26} color="white" />
              </div>
              <span style={{ marginTop: '0.85rem', fontSize: '0.85rem', color: '#94a3b8' }}>Đang phát video hướng dẫn nấu ăn công khai</span>
            </div>

            <h4 style={{ color: '#059669', marginBottom: '0.5rem' }}>🤖 AI Tóm tắt chi tiết các bước nấu:</h4>
            <div style={{ padding: '1.15rem', background: '#ecfdf5', borderRadius: '14px', borderLeft: '4px solid #10b981', marginBottom: '1.5rem' }}>
              <ul style={{ paddingLeft: '1.25rem', color: '#065f46', lineHeight: '1.65' }}>
                {selectedVideo.details?.map((dt, idx) => (
                  <li key={idx} style={{ marginBottom: '0.45rem' }}>{dt}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
              <Button variant="secondary" onClick={() => setSelectedVideo(null)}>Đóng</Button>
              <Button onClick={() => { setSelectedVideo(null); onNavigate && onNavigate('register'); }}>
                Đăng ký để bình luận & lưu video
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
