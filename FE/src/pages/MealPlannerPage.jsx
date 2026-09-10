import React, { useState } from 'react';
import { Utensils, Sparkles } from 'lucide-react';
import { generateMealPlan } from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function MealPlannerPage() {
  const [ingredientsInput, setIngredientsInput] = useState('Tofu, Broccoli, Carrot, Mushroom');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const ingredients = ingredientsInput.split(',').map(i => i.trim());
      const data = await generateMealPlan(ingredients);
      setMealPlan(data);
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
          <Utensils /> AI Personalized Meal Planner (Linear Programming)
        </h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 1rem 0' }}>
          Tự động tính toán thực đơn tuần dựa trên chỉ số BMI, mục tiêu calo, vi chất (Protein, Iron, B12, Omega-3) & nguyên liệu sẵn có.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            placeholder="Nhập nguyên liệu sẵn có trong tủ lạnh..."
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? 'Đang tính toán...' : <><Sparkles size={18} /> Tạo thực đơn AI</>}
          </Button>
        </div>
      </Card>

      {mealPlan && (
        <Card>
          <h3 style={{ color: '#047857', marginBottom: '1rem' }}>📅 Thực đơn đề xuất tuần này</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {mealPlan.items?.map((item, idx) => (
              <div key={idx} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '10px', borderLeft: '4px solid #10b981' }}>
                <Badge type="success">{item.dayOfWeek} - {item.mealType}</Badge>
                <h4 style={{ marginTop: '0.5rem', color: '#0f172a' }}>{item.recipeTitle}</h4>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
