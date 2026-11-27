import React from 'react';

export const DocModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high/60 bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
            <h3 className="font-bold text-base text-on-surface">
              Tài liệu Kiến trúc & REST API VeggieAI (Web & Mobile)
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
            <h4 className="font-bold text-sm text-on-surface mb-1">
              Kiến trúc Phân quyền & Tái sử dụng Mobile
            </h4>
            <p className="text-on-surface-variant leading-relaxed">
              VeggieAI vận hành trên ASP.NET Core (.NET 10) + Entity Framework Core + PostgreSQL (43 bảng đồng bộ 1-1). Hệ thống tách biệt 2 vai trò quản trị (<b>SuperAdmin</b> quản trị hệ thống & xem giám sát, <b>Mod</b> điều phối toàn bộ nội dung vận hành) và tài khoản ứng dụng (<b>User</b> cho Mobile sau này).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 font-mono space-y-1 text-[11px]">
            <p className="text-primary font-bold">POST /api/ai/recipe/parse-macros</p>
            <p className="text-on-surface-variant">Authorization: Bearer &lt;JWT_ACCESS_TOKEN&gt;</p>
            <p className="text-on-surface-variant">Content-Type: application/json</p>
            <div className="mt-2 text-outline">
              &#123; &quot;recipeText&quot;: &quot;200g đậu hũ non, 100g nấm đùi gà&quot; &#125;
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-high/60 font-mono space-y-1 text-[11px]">
            <p className="text-primary font-bold">POST /api/uploads/image</p>
            <p className="text-on-surface-variant">Authorization: Bearer &lt;JWT_ACCESS_TOKEN&gt;</p>
            <p className="text-on-surface-variant">Content-Type: multipart/form-data (file &le; 5MB)</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-semibold text-xs hover:bg-primary/90 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
