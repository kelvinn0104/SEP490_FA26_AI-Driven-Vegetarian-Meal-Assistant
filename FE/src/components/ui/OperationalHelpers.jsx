import React, { useRef, useState } from 'react';
import { uploadsApi } from '../../api';

export const SuperAdminReadOnlyBanner = ({ readOnly }) => {
  if (!readOnly) return null;
  return (
    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300/70 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
      <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0">
        visibility
      </span>
      <div>
        <span className="font-bold">Chế độ Giám sát (SuperAdmin - Chỉ xem):</span>{' '}
        <span>
          Bạn đang truy cập phân hệ vận hành với quyền đọc giám sát. Các thao tác thêm, chỉnh sửa, xóa và phê duyệt nội dung do vai trò <b>Mod</b> thực hiện.
        </span>
      </div>
    </div>
  );
};

export const ApiErrorBanner = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;
  return (
    <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">error</span>
        <span>{error}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2.5 py-1 rounded-lg bg-error text-on-error font-bold cursor-pointer"
          >
            Thử lại
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="underline cursor-pointer"
          >
            Đóng
          </button>
        )}
      </div>
    </div>
  );
};

export const ImageUploadField = ({
  label,
  value,
  onChange,
  placeholder = 'https://... hoặc tải tệp ảnh từ máy',
}) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadErr('');
    try {
      const data = await uploadsApi.uploadImage(file);
      if (data?.url) {
        onChange(data.url);
      }
    } catch (err) {
      setUploadErr(err.message || 'Tải ảnh thất bại.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-on-surface">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface font-mono focus:outline-none focus:border-primary"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="h-9 px-3 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload</span>
          <span>{uploading ? 'Đang tải...' : 'Tải ảnh'}</span>
        </button>
      </div>
      {uploadErr && <p className="text-[11px] text-error font-medium">{uploadErr}</p>}
    </div>
  );
};
