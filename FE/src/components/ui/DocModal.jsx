import React from 'react';
import { createPortal } from 'react-dom';

export const DocModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-forestDark/70 backdrop-blur-sm"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-fade-up my-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
            <h3 className="font-bold text-base text-on-surface">
              Tài liệu Nhà phát triển VeggieAI API
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div>
            <h4 className="font-bold text-sm text-on-surface mb-1">Hạ tầng Cụm HCM-01</h4>
            <p className="text-on-surface-variant leading-relaxed">
              VeggieAI Core vận hành trên mạng nơ-ron phân tán, tích hợp bộ mã hóa công thức ẩm thực thuần chay với cơ sở dữ liệu USDA Nutrition Data và Viện Dinh Dưỡng.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 font-mono space-y-1 text-[11px]">
            <p className="text-primary font-bold">POST /api/v3/recipe/parse-macros</p>
            <p className="text-on-surface-variant">Authorization: Bearer [VEGGIE_ADMIN_TOKEN]</p>
            <p className="text-on-surface-variant">Content-Type: application/json</p>
            <div className="mt-2 text-outline">
              &#123; &quot;ingredients&quot;: [&quot;đậu hũ non&quot;, &quot;nấm đùi gà&quot;], &quot;diet&quot;: &quot;vegan&quot; &#125;
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-on-surface mb-1">Hỗ trợ kỹ thuật</h4>
            <p className="text-on-surface-variant">
              Email trực ban DevOps: <span className="font-mono text-primary font-semibold">devops@veggieai.internal</span>
            </p>
            <p className="text-on-surface-variant">
              Tài liệu SDK nội bộ: v2.4.12-prod (Cập nhật 2025-10-24)
            </p>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-surface-container-high/60 bg-surface-container-low/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
