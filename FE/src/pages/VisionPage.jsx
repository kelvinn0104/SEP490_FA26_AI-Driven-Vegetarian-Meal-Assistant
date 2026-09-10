import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { detectIngredients } from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function VisionPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    setLoading(true);
    try {
      const data = await detectIngredients();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
          <Camera /> Computer Vision (Nhận diện nguyên liệu & Độ tươi)
        </h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
          Chụp ảnh nguyên liệu trong tủ lạnh. Mô hình YOLOv8 trong .NET sẽ tự động nhận diện và đề xuất công thức chế biến chống lãng phí.
        </p>

        <div style={{ padding: '2rem', border: '2px dashed #cbd5e1', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
          <Camera size={48} color="#94a3b8" />
          <p style={{ margin: '0.5rem 0 1rem 0', color: '#64748b' }}>Kéo thả hình ảnh hoặc chọn ảnh tủ lạnh để quét nguyên liệu</p>
          <Button onClick={handleScan} disabled={loading}>
            {loading ? 'AI đang nhận diện...' : 'Quét nguyên liệu mẫu'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card>
          <h3 style={{ color: '#047857' }}>🔍 Kết quả nhận diện YOLOv8</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1rem 0' }}>
            {result.detectedItems?.map((item, idx) => (
              <div key={idx} style={{ padding: '0.75rem 1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                <strong>{item.name}</strong> - Độ tươi: <span style={{ color: item.freshness === 'Fresh' ? '#059669' : '#d97706', fontWeight: 600 }}>{item.freshness}</span>
              </div>
            ))}
          </div>

          <h4 style={{ color: '#0f172a', marginTop: '1rem' }}>💡 Gợi ý công thức phù hợp:</h4>
          <ul>
            {result.suggestedRecipes?.map((recipe, idx) => (
              <li key={idx} style={{ margin: '0.5rem 0', color: '#334155' }}>{recipe}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
