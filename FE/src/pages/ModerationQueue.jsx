import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ModerationQueue() {
  const [posts, setPosts] = useState([
    { id: '1', title: 'Công thức Đậu hũ sốt Cà chua chuẩn vị', author: 'NguyenVanA', type: 'Blog', status: 'Pending Review' },
    { id: '2', title: 'Video: Hướng dẫn làm Sữa Hạt Sen tại nhà', author: 'TranThiB', type: 'Cooking Video', status: 'Pending Review' }
  ]);

  const handleAction = (id, action) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Card>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
        <Clock /> Hàng chờ duyệt bài (Dành cho Moderator)
      </h2>
      <p style={{ color: '#64748b', margin: '0.5rem 0 1rem 0' }}>Duyệt các bài viết blog & video nấu ăn do người dùng đăng tải trước khi xuất bản Public.</p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '0.75rem' }}>Tiêu đề bài viết</th>
            <th style={{ padding: '0.75rem' }}>Tác giả</th>
            <th style={{ padding: '0.75rem' }}>Loại bài</th>
            <th style={{ padding: '0.75rem' }}>Trạng thái</th>
            <th style={{ padding: '0.75rem' }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '0.75rem', fontWeight: 600 }}>{post.title}</td>
              <td style={{ padding: '0.75rem' }}>{post.author}</td>
              <td style={{ padding: '0.75rem' }}>{post.type}</td>
              <td style={{ padding: '0.75rem' }}><Badge type="pending">{post.status}</Badge></td>
              <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <Button variant="primary" style={{ padding: '0.35rem 0.75rem' }} onClick={() => handleAction(post.id, 'approve')}>
                  <CheckCircle size={16} /> Duyệt
                </Button>
                <Button variant="danger" style={{ padding: '0.35rem 0.75rem' }} onClick={() => handleAction(post.id, 'reject')}>
                  <XCircle size={16} /> Từ chối
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
