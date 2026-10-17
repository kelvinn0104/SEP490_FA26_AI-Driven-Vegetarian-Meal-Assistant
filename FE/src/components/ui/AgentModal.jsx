import React, { useState } from 'react';

export const AgentModal = ({ isOpen, onClose, onRunTestLog }) => {
  const [temperature, setTemperature] = useState(0.4);
  const [confidenceThreshold, setConfidenceThreshold] = useState(94.5);
  const [activeTab, setActiveTab] = useState('overview');
  const [testIngredient, setTestIngredient] = useState('Đậu hũ non, nấm đùi gà, cải thìa, hạt sen Huế');
  const [testResult, setTestResult] = useState(null);
  const [isInferencing, setIsInferencing] = useState(false);

  if (!isOpen) return null;

  const handleRunInference = () => {
    setIsInferencing(true);
    setTestResult(null);
    setTimeout(() => {
      setIsInferencing(false);
      const res = `[VeggieAI Bot v3] Phân tích thành công:
• Năng lượng ước tính: 245 kcal
• Protein thực vật: 18.2g (Tỉ lệ hấp thu sinh học 91%)
• Vi chất: Sắt 3.4mg (24% DV), B12 tăng cường từ men hữu cơ 1.2mcg
• Đánh giá an toàn thực vật: 100% Thuần chay (Vegan)
• Gợi ý món: Canh dưỡng sinh hạt sen nấu đậu non nấm đùi gà`;
      setTestResult(res);
      if (onRunTestLog) {
        onRunTestLog('TEST_INFERENCE: ' + testIngredient);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span>Trung tâm Điều phối AI Agent v3</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                  Online
                </span>
              </h3>
              <p className="text-xs text-outline">
                Cụm GPU HCM-01 • Engine phân tích vi chất & gợi ý ẩm thực thực vật
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-surface-container-high/50 px-6 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Trạng thái máy chủ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Cấu hình mô hình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'test'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Thử nghiệm Inference (Sandbox)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <span className="text-[11px] text-outline uppercase font-semibold">
                    Độ trễ trung bình
                  </span>
                  <p className="text-xl font-bold font-mono text-primary mt-1">21 ms</p>
                  <span className="text-[10px] text-secondary font-medium">99.98% SLA đạt chuẩn</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <span className="text-[11px] text-outline uppercase font-semibold">
                    Tải GPU Hiện tại
                  </span>
                  <p className="text-xl font-bold font-mono text-on-surface mt-1">34.2%</p>
                  <span className="text-[10px] text-outline font-medium">Nhiệt độ 52°C ổn định</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-outline uppercase font-semibold">
                    Embedding Vectors
                  </span>
                  <p className="text-xl font-bold font-mono text-tertiary mt-1">512 Dim</p>
                  <span className="text-[10px] text-outline font-medium">Cosine Distance 0.94</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-inverse-surface text-inverse-on-surface space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-secondary-fixed font-semibold">
                    &gt; agent.health_check
                  </span>
                  <span className="text-surface-dim font-mono">OK</span>
                </div>
                <p className="text-xs text-surface-dim leading-relaxed">
                  Agent v3 đang phục vụ pipeline phân tích công thức, lọc độc tính bình luận và đối chiếu dinh dưỡng tự động với bảng cơ sở dữ liệu USDA & Viện Dinh Dưỡng Quốc Gia.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Đã xóa bộ nhớ đệm GPU cache (Cache Cleared).')}
                  className="px-4 py-2 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs hover:bg-surface-container"
                >
                  Xóa GPU Cache
                </button>
                <button
                  type="button"
                  onClick={() => alert('Đã gửi tín hiệu khởi động lại Agent worker threads.')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container"
                >
                  Khởi động lại Agent
                </button>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">Mức độ sáng tạo (Temperature)</span>
                  <span className="font-mono font-bold text-primary">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[11px] text-outline">
                  Thấp hơn giúp tính toán dinh dưỡng chính xác, cao hơn tạo công thức đa dạng sáng tạo.
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">Ngưỡng chính xác khuyến nghị (%)</span>
                  <span className="font-mono font-bold text-primary">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="85.0"
                  max="99.0"
                  step="0.5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
                <span className="text-[11px] text-outline">
                  Công thức dưới ngưỡng này sẽ tự động chuyển sang hàng đợi &quot;Cần chuyên gia duyệt&quot;.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">Kiểm tra độc tính tự động (Toxicity Filter)</p>
                  <p className="text-[11px] text-outline">Ngăn chặn quảng cáo sai lệch và ngôn từ tiêu cực</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-bold font-mono">
                  Bật (0.01 threshold)
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => alert('Đã lưu cấu hình AI Agent v3 thành công!')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nhập danh sách nguyên liệu hoặc công thức để thử nghiệm:
                </label>
                <textarea
                  rows={3}
                  value={testIngredient}
                  onChange={(e) => setTestIngredient(e.target.value)}
                  className="w-full p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isInferencing}
                  onClick={handleRunInference}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isInferencing ? 'sync' : 'play_arrow'}
                  </span>
                  <span>{isInferencing ? 'Đang phân tích...' : 'Chạy thử nghiệm'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/60">
                  <pre className="font-mono text-xs text-on-surface whitespace-pre-wrap leading-relaxed">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
