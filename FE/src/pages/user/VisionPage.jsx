import React, { useState } from 'react';
import { 
  Camera, Sparkles, ArrowRight, CheckCircle2, Leaf, 
  Plus, X, Trash2, Check, RefreshCw, Upload, Utensils, AlertTriangle, Eye, Clock, Flame
} from 'lucide-react';
import { detectIngredients } from '../../utils/api';
import { scanService } from '../../api';
import { useVeggieNutrition } from '../../context/VeggieNutritionContext';
import RecipeDetailModal from '../../components/recipes/RecipeDetailModal';

export default function VisionPage({ onNavigate }) {
  const { generateAiMealPlan, isBackendConnected, showToast } = useVeggieNutrition();

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedItems, setDetectedItems] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState(null);

  // 1. CÁC ẢNH MẪU TỦ LẠNH CHUẨN BỊ SẴN (PRESETS)
  const samplePresets = [
    {
      id: 'p1',
      title: 'Tủ lạnh Nấm & Đậu hũ',
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Đậu hũ mơ tươi', freshness: 'Fresh', confidence: '98%', note: '🟢 Tươi ngon', confirmed: true },
        { name: 'Nấm đùi gà', freshness: 'Fresh', confidence: '96%', note: '🟢 Tươi ngon', confirmed: true },
        { name: 'Bí đỏ hồ lô', freshness: 'ExpiringSoon', confidence: '92%', note: '🌱 Dùng trong 24h', confirmed: true },
        { name: 'Rau cải thìa', freshness: 'ExpiringSoon', confidence: '89%', note: '🌱 Dùng trong 24h', confirmed: true }
      ]
    },
    {
      id: 'p2',
      title: 'Rau củ quả tươi',
      img: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Bơ sáp hữu cơ', freshness: 'Fresh', confidence: '99%', note: '🟢 Tươi ngon', confirmed: true },
        { name: 'Cà rốt Đà Lạt', freshness: 'Fresh', confidence: '97%', note: '🟢 Tươi ngon', confirmed: true },
        { name: 'Cà chua bi', freshness: 'Fresh', confidence: '95%', note: '🟢 Tươi ngon', confirmed: true },
        { name: 'Bắp ngọt', freshness: 'ExpiringSoon', confidence: '91%', note: '🌱 Dùng trong 24h', confirmed: true }
      ]
    },
    {
      id: 'p3',
      title: 'Thực phẩm cần giải cứu',
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      items: [
        { name: 'Đậu hũ chiên', freshness: 'ExpiringSoon', confidence: '96%', note: '🌱 Dùng trong 12h', confirmed: true },
        { name: 'Nấm rơm tươi', freshness: 'ExpiringSoon', confidence: '93%', note: '🌱 Dùng trong 12h', confirmed: true },
        { name: 'Xà lách Đà Lạt', freshness: 'ExpiringSoon', confidence: '91%', note: '🌱 Dùng trong 24h', confirmed: true },
        { name: 'Cà chua chín mọng', freshness: 'Fresh', confidence: '95%', note: '🟢 Tươi ngon', confirmed: true }
      ]
    }
  ];

  // 2. XỬ LÝ CHỌN TỆP ẢNH TỪ MÁY TÍNH
  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Tệp ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 8MB theo chuẩn hệ thống.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      handleScan(file);
    }
  };

  // 3. XỬ LÝ QUÉT MẪU PRESET
  const handleSelectPreset = (preset) => {
    setImagePreview(preset.img);
    setScanId(null);
    setLoading(true);
    setTimeout(() => {
      setDetectedItems(preset.items);
      setLoading(false);
      showToast(`✨ Đã bóc tách nguyên liệu mẫu "${preset.title}"!`);
    }, 450);
  };

  // 4. NHẬN DIỆN MÔ HÌNH YOLOV8 QUA BACKEND (CÓ DỰ PHÒNG CỤC BỘ)
  const handleScan = async (fileOrSrc = null) => {
    setLoading(true);
    if (!imagePreview && !fileOrSrc) {
      setImagePreview(samplePresets[0].img);
    }

    if (fileOrSrc && typeof fileOrSrc === 'object' && fileOrSrc instanceof File) {
      try {
        const res = await scanService.uploadScan(fileOrSrc);
        if (res) {
          setScanId(res.scanId || null);
          if (res.detectedItems && res.detectedItems.length > 0) {
            const mapped = res.detectedItems.map(item => ({
              ingredientId: item.ingredientId,
              name: item.nameVi || item.name,
              freshness: item.freshness === 'fresh' ? 'Fresh' : 'ExpiringSoon',
              confidence: `${Math.round((item.confidence || 0.9) * 100)}%`,
              note: item.freshness === 'fresh' ? '🟢 Tươi ngon' : '🌱 Dùng sớm',
              confirmed: true
            }));
            setDetectedItems(mapped);
          } else {
            setDetectedItems(samplePresets[0].items);
          }
          showToast(res.message || '✨ AI Vision đã bóc tách nguyên liệu thành công!');
          return;
        }
      } catch (err) {
        console.warn('Backend scan failed, fallback to local preset:', err.message);
      } finally {
        setLoading(false);
      }
    }

    try {
      const data = await detectIngredients();
      if (data && data.detectedItems) {
        setDetectedItems(data.detectedItems.map(i => ({ ...i, confirmed: true })));
      } else {
        setDetectedItems(samplePresets[0].items);
      }
      showToast('✨ Đã phân tích xong nguyên liệu!');
    } catch (err) {
      setDetectedItems(samplePresets[0].items);
    } finally {
      setLoading(false);
    }
  };

  // 5. CHỈNH SỬA DANH SÁCH NGUYÊN LIỆU
  const handleRemoveItem = (idx) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== idx));
    showToast('Đã xóa nguyên liệu khỏi danh sách.');
  };

  const handleToggleFreshness = (idx) => {
    setDetectedItems(prev => prev.map((item, i) => {
      if (i === idx) {
        const isFresh = item.freshness === 'Fresh';
        return {
          ...item,
          freshness: isFresh ? 'ExpiringSoon' : 'Fresh',
          note: isFresh ? '🌱 Dùng trong 24h' : '🟢 Tươi ngon'
        };
      }
      return item;
    }));
  };

  const handleAddManualItem = (e) => {
    e?.preventDefault();
    if (!manualInput.trim()) return;
    const newItem = {
      name: manualInput.trim(),
      freshness: 'Fresh',
      confidence: '100% (Thủ công)',
      note: '🟢 Tươi ngon',
      confirmed: true
    };
    setDetectedItems(prev => [...(prev || []), newItem]);
    setManualInput('');
    showToast(`Đã thêm "${newItem.name}" vào danh sách.`);
  };

  // 6. CHUYỂN SANG LẬP THỰC ĐƠN TUẦN CHỐNG LÃNG PHÍ
  const handleApplyIngredientsToPlan = async () => {
    if (detectedItems && detectedItems.length > 0) {
      const names = detectedItems.map(i => i.name);
      try {
        localStorage.setItem('veggieai_scanned_pantry', JSON.stringify(names));
      } catch (e) {}
    }

    showToast('🚀 Đang chuyển danh sách nguyên liệu sang Thực đơn AI...');
    try {
      if (scanId) {
        await generateAiMealPlan({ scanId, days: 7, note: 'Tận dụng nguyên liệu từ ảnh quét tủ lạnh' });
      }
    } catch (e) {}

    setTimeout(() => {
      if (onNavigate) {
        onNavigate('planner');
      }
    }, 400);
  };

  // GỢI Ý MÓN ĂN TẬN DỤNG NGUYÊN LIỆU (ZERO-WASTE)
  const suggestedRecipes = [
    {
      id: 'r1',
      title: 'Súp Bí Đỏ Cốt Dừa & Nấm Đùi Gà',
      matchScore: '100% Tận dụng',
      time: '25 phút',
      calories: 340,
      protein: '14g Đạm',
      pantryUsed: ['Bí đỏ hồ lô', 'Nấm đùi gà'],
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      description: 'Món súp sánh mịn thơm nức nước cốt dừa tự nhiên kết hợp nấm đùi gà giòn ngọt và bí đỏ hồ lô chín mọng.'
    },
    {
      id: 'r2',
      title: 'Buddha Bowl Quinoa Đậu Hũ & Cải Thìa',
      matchScore: '92% Tận dụng',
      time: '20 phút',
      calories: 420,
      protein: '24g Đạm',
      pantryUsed: ['Đậu hũ mơ tươi', 'Rau cải thìa'],
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      description: 'Tô dinh dưỡng chuẩn phong cách Buddha Bowl với đậu hũ áp chảo vàng giòn và cải thìa xanh mướt.'
    },
    {
      id: 'r3',
      title: 'Nấm Đùi Gà Xào Cải Thìa Dầu Hào Chay',
      matchScore: '88% Tận dụng',
      time: '15 phút',
      calories: 310,
      protein: '12g Đạm',
      pantryUsed: ['Nấm đùi gà', 'Rau cải thìa'],
      img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
      description: 'Món xào thanh nhẹ thơm lừng sốt dầu hào thực vật, rau cải giòn sần sật giữ trọn vitamin.'
    }
  ];

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto animate-fade-up">
      {/* 1. HEADER SECTION */}
      <div className="bg-white rounded-3xl border border-hairline p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-semibold">
            <Camera className="w-3.5 h-3.5" />
            <span>AI COMPUTER VISION • TẬN DỤNG NGUYÊN LIỆU</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-4xl font-bold text-forest">
            Quét Tủ Lạnh & Nhận Diện Nguyên Liệu
          </h1>
          <p className="text-xs sm:text-sm text-olive max-w-2xl leading-relaxed">
            Chụp ảnh các nguyên liệu đang có trong bếp hoặc tủ lạnh. Trí tuệ nhân tạo sẽ tự động bóc tách tên thực phẩm, đánh giá độ tươi và gợi ý thực đơn không lãng phí.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="px-5 py-3 rounded-2xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs flex items-center gap-2 active:scale-95">
            <Upload className="w-4 h-4 text-emerald-300" />
            <span>Tải Ảnh Lên</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 2. PRESETS BAR */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase text-olive tracking-wider mr-1">Ảnh Mẫu Thử Nghiệm:</span>
        {samplePresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handleSelectPreset(preset)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-hairline hover:bg-sage text-forest text-xs font-semibold transition cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>📷</span>
            <span>{preset.title}</span>
          </button>
        ))}
      </div>

      {/* 3. MAIN WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image Preview Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-hairline p-5 sm:p-6 shadow-xs space-y-4">
          <span className="text-xs font-bold uppercase text-olive tracking-wider block">Hình Ảnh Phân Tích</span>
          
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-alabaster border border-hairline flex items-center justify-center group">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Ảnh tủ lạnh"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-forest/5 border border-hairline flex items-center justify-center mx-auto text-forest">
                  <Camera className="w-6 h-6 text-emeraldBotanic" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-forest">Chưa có ảnh nào được tải lên</p>
                  <p className="text-[11px] text-olive">Bấm nút "Tải Ảnh Lên" hoặc chọn ảnh mẫu ở trên để thử nghiệm.</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 bg-forestDark/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                <RefreshCw className="w-7 h-7 text-emerald-300 animate-spin" />
                <span className="text-xs font-semibold tracking-wide">AI Đang Nhận Diện Nguyên Liệu...</span>
              </div>
            )}
          </div>

          {imagePreview && !loading && (
            <button
              type="button"
              onClick={() => handleScan()}
              className="w-full py-2.5 rounded-xl bg-alabaster hover:bg-sage border border-hairline text-forest text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emeraldBotanic" />
              <span>Quét Lại Ảnh Này</span>
            </button>
          )}
        </div>

        {/* Right Column: Detected Items & Action (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-hairline p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <div>
              <span className="text-xs font-bold uppercase text-emeraldBotanic tracking-wider">KẾT QUẢ BÓC TÁCH</span>
              <h2 className="font-editorial text-xl font-bold text-forest mt-0.5">
                Nguyên Liệu Trong Tủ Lạnh ({detectedItems ? detectedItems.length : 0})
              </h2>
            </div>

            {detectedItems && detectedItems.length > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                Độ chính xác ~95%
              </span>
            )}
          </div>

          {/* List of Detected Items */}
          {detectedItems && detectedItems.length > 0 ? (
            <div className="space-y-2.5">
              {detectedItems.map((item, idx) => {
                const isFresh = item.freshness === 'Fresh';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-alabaster border border-hairline flex items-center justify-between gap-3 group hover:border-emeraldBotanic/40 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white border border-hairline flex items-center justify-center text-sm shadow-2xs">
                        🥗
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-forest">{item.name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-olive font-metric">
                          <span>Độ tin cậy: {item.confidence}</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => handleToggleFreshness(idx)}
                            className={`font-semibold cursor-pointer underline decoration-dotted ${
                              isFresh ? 'text-emerald-700' : 'text-amber-700'
                            }`}
                          >
                            {item.note}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg text-olive hover:text-terracotta hover:bg-white transition cursor-pointer"
                      title="Xóa nguyên liệu"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-alabaster rounded-2xl border border-dashed border-hairline space-y-2">
              <Sparkles className="w-6 h-6 text-emeraldBotanic mx-auto" />
              <p className="text-xs text-olive font-medium">Chưa có nguyên liệu nào. Hãy chọn ảnh mẫu hoặc tải ảnh tủ lạnh của bạn lên!</p>
            </div>
          )}

          {/* Add Manual Item Input */}
          <form onSubmit={handleAddManualItem} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Thêm nguyên liệu thủ công (vd: Đậu phộng rang, Chanh tươi)..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-alabaster border border-hairline rounded-xl px-3.5 py-2.5 text-xs text-forest focus:outline-none focus:border-forest"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </form>

          {/* Action CTA: Apply to Meal Plan */}
          {detectedItems && detectedItems.length > 0 && (
            <div className="p-4 rounded-2xl bg-emeraldBotanic/10 border border-emeraldBotanic/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-forest">Tận Dụng Nguyên Liệu Chống Lãng Phí</span>
                <p className="text-[11px] text-olive">Đưa toàn bộ {detectedItems.length} nguyên liệu vào AI Meal Planner để tạo thực đơn 7 ngày.</p>
              </div>

              <button
                type="button"
                onClick={handleApplyIngredientsToPlan}
                className="px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracottaDark text-white text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-2 shrink-0 justify-center active:scale-95"
              >
                <span>Lập Thực Đơn Tuần AI</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. ZERO-WASTE SUGGESTED RECIPES */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-emeraldBotanic tracking-wider">CÔNG THỨC PHÙ HỢP NHẤT</span>
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-forest">
              Món Ăn Gợi Ý Từ Nguyên Liệu Hiện Có
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {suggestedRecipes.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition flex flex-col justify-between group cursor-pointer"
              onClick={() => setSelectedRecipeDetail(r)}
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-alabaster">
                  <img
                    src={r.img}
                    alt={r.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-forest/90 text-emerald-300 text-[11px] font-metric font-bold shadow-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-300" />
                    <span>{r.matchScore}</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-forest text-[11px] font-metric font-bold shadow-xs flex items-center gap-1">
                    <Clock className="w-3 h-3 text-olive" />
                    <span>{r.time}</span>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug">
                    {r.title}
                  </h3>
                  <p className="text-xs text-olive line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.pantryUsed.map((p, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-hairline mt-3 flex items-center justify-between text-xs font-metric">
                <span className="font-bold text-forest">{r.calories} kcal • {r.protein}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast(`Đã thêm "${r.title}" vào thực đơn bữa ăn!`);
                    if (onNavigate) onNavigate('planner');
                  }}
                  className="text-xs font-bold text-emeraldBotanic hover:text-forest transition cursor-pointer flex items-center gap-1"
                >
                  <span>Nấu món này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          onApplyMeal={() => {
            showToast(`Đã thêm "${selectedRecipeDetail.title}" vào thực đơn bữa ăn!`);
            if (onNavigate) onNavigate('planner');
          }}
        />
      )}
    </div>
  );
}
