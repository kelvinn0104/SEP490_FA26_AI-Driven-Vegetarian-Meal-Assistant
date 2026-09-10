import React from 'react';
import { Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function CommunityPage() {
  const posts = [
    { title: 'Top 5 nguồn Protein thuần chay giúp tăng cơ hiệu quả', author: 'MinhTu_Nutrition', likes: 142, type: 'Blog' },
    { title: 'Video: Hướng dẫn nấu Canh Nấm Hạt Sen bổ dưỡng', author: 'Chef_Veggie', likes: 289, type: 'Video' }
  ];

  return (
    <div>
      <Card>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
          <Users /> Cộng đồng Ăn chay VeggieAI
        </h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 1rem 0' }}>Chia sẻ bài viết, video hướng dẫn nấu ăn tự động tóm tắt văn bản và tìm nhà hàng chay gần bạn.</p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {posts.map((post, idx) => (
          <Card key={idx}>
            <Badge type="success">{post.type}</Badge>
            <h3 style={{ color: '#0f172a', marginTop: '0.5rem' }}>{post.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Tác giả: {post.author} • ❤️ {post.likes} lượt thích</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
