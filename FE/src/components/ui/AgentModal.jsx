import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

export const AgentModal = ({ isOpen, onClose }) => {
  const { isSuperAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [models, setModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  const [testIngredient, setTestIngredient] = useState('200g đậu hũ non, 100g nấm đùi gà, 50g cải thìa');
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState('');
  const [isInferencing, setIsInferencing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingModels(true);
    aiApi
      .getModels()
      .then((data) => setModels(Array.isArray(data) ? data : []))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunInference = async () => {
    if (!testIngredient.trim()) return;
    setIsInferencing(true);
    setTestError('');
    setTestResult(null);
    try {
      const res = await aiApi.parseNutrition(testIngredient.trim());
      setTestResult(res);
    } catch (err) {
      setTestError(err.message || 'Không thể phân tích nguyên liệu lúc này.');
    } finally {
      setIsInferencing(false);
    }
  };

  const handleToggleStatus = async (model) => {
    if (!isSuperAdmin) return;
    const nextStatus = model.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await aiApi.updateModelStatus(model.id, nextStatus);
      if (updated) {
        setModels((prev) => prev.map((m) => (m.id === model.id ? updated : m)));
      }
    } catch (err) {
      setTestError(err.message || 'Không thể cập nhật trạng thái mô hình.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span>Trung tâm Dịch vụ VeggieAI Engine</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono text-[10px] font-bold">
                  Backend API
                </span>
              </h3>
              <p className="text-xs text-outline">
                Phân tích dinh dưỡng tập trung tại Backend • Không lưu khóa API ở trình duyệt
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex border-b border-surface-container-high/50 px-6 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Danh sách mô hình AI ({models.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'test'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Thử nghiệm Phân tích Dinh dưỡng
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              {loadingModels ? (
                <div className="py-8 text-center text-xs text-outline">Đang tải danh sách mô hình AI...</div>
              ) : models.length === 0 ? (
                <div className="py-8 text-center text-xs text-outline">
                  Chưa có mô hình AI nào được đăng ký trong cơ sở dữ liệu.
                </div>
              ) : (
                models.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-surface-container-low border border-surface-container-high/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">{m.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                          v{m.version}
                        </span>
                      </div>
                      <p className="text-xs text-outline mt-0.5">
                        Loại: {m.type} • Độ chính xác: {m.accuracy}% • Độ trễ TB: {m.avgLatencyMs}ms • Tổng lượt gọi: {m.totalCalls}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                          m.status === 'active'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        {m.status}
                      </span>
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(m)}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer"
                        >
                          {m.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1">
                  Nhập danh sách nguyên liệu món ăn:
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary-container disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isInferencing ? 'sync' : 'play_arrow'}
                  </span>
                  <span>{isInferencing ? 'Đang gửi tới Backend...' : 'Chạy phân tích thật'}</span>
                </button>
              </div>

              {testError && (
                <div className="p-3 rounded-xl bg-error-container/40 border border-error/20 text-xs text-error font-medium">
                  {testError}
                </div>
              )}

              {testResult && (
                <div className="p-4 rounded-xl bg-surface-container-low border border-surface-container-high/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-1.5">
                    <span className="font-bold text-primary">
                      Nguồn phân tích: {testResult.source === 'gemini' ? 'Gemini AI Backend' : 'CSDL Dinh dưỡng PostgreSQL'}
                    </span>
                    <span className="font-mono font-bold text-on-surface">{testResult.calories} kcal</span>
                  </div>
                  {!testResult.analyzed ? (
                    <p className="text-amber-700 font-medium pt-1">
                      Chưa nhận diện được nguyên liệu khớp trong CSDL. Hãy thêm nguyên liệu vào Thư viện Vi chất hoặc cấu hình khóa Gemini ở Backend.
                    </p>
                  ) : (
                    <>
                      <p><b>Đạm:</b> {testResult.protein} • <b>Tinh bột:</b> {testResult.carbs} • <b>Chất béo:</b> {testResult.fat}</p>
                      <p><b>Vi chất:</b> B12 {testResult.b12Percent} • Sắt {testResult.ironPercent}</p>
                      <p><b>Độ thuần chay:</b> {testResult.veganPurity}</p>
                      <p className="text-outline"><b>Cảnh báo dị ứng:</b> {testResult.allergenAlert}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
