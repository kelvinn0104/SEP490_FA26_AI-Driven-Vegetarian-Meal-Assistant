import React, { useState, useEffect } from 'react';
import { logsApi } from '../../api';
import { exportToCsv } from '../../utils/exportUtils';

export const SystemLogsScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logType, setLogType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async (type = logType, search = searchQuery) => {
    try {
      setLoading(true);
      setError('');
      const data = await logsApi.getSystemLogs({ type, search, limit: 100 });
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Không thể tải nhật ký kiểm toán hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(logType, searchQuery);
  }, [logType]);

  const handleExportCsv = () => {
    exportToCsv(
      'veggieai-system-logs',
      [
        { key: 'id', label: 'ID' },
        { key: 'createdAt', label: 'Thời gian' },
        { key: 'userName', label: 'Người thực hiện' },
        { key: 'userEmail', label: 'Email' },
        { key: 'logType', label: 'Phân loại' },
        { key: 'action', label: 'Hành động' },
        { key: 'target', label: 'Đối tượng' },
        { key: 'details', label: 'Chi tiết' },
      ],
      logs
    );
  };

  const getLogTypeBadge = (type) => {
    switch (type) {
      case 'auth':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'user_management':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'role_management':
        return 'bg-tertiary/10 text-tertiary border-tertiary/20';
      case 'moderation':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'error':
        return 'bg-error-container text-on-error-container border-error/20';
      default:
        return 'bg-surface-container-high text-on-surface-variant border-transparent';
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Kiểm toán Bảo mật • SuperAdmin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight mt-1">
            Nhật ký Hệ thống (System Logs)
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant font-medium">
            Theo dõi toàn bộ lịch sử xác thực, phân quyền, cấu hình và thao tác quản trị trên PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchLogs(logType, searchQuery)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="p-4 rounded-xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLogs(logType, searchQuery);
          }}
          className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]"
        >
          <div className="relative flex-1 min-w-[200px]">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm hành động, đối tượng, chi tiết..."
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low text-xs text-on-surface border border-surface-container-high/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="h-9 px-3.5 rounded-lg bg-primary text-on-primary text-xs font-bold cursor-pointer"
          >
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'auth', label: 'Xác thực' },
            { id: 'user_management', label: 'Tài khoản' },
            { id: 'role_management', label: 'Phân quyền' },
            { id: 'system', label: 'Hệ thống' },
            { id: 'moderation', label: 'Kiểm duyệt' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setLogType(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                logType === item.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container-lowest border border-surface-container-high/40 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-outline">Đang tải nhật ký kiểm toán...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-outline space-y-2">
            <span className="material-symbols-outlined text-[32px] block opacity-50">inbox</span>
            <p>Chưa có bản ghi nhật ký phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-container-high/40 bg-surface-container-low/50 text-outline uppercase font-semibold">
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Người thực hiện</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4">Hành động</th>
                  <th className="py-3 px-4">Đối tượng</th>
                  <th className="py-3 px-4">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/40">
                    <td className="py-3.5 px-4 font-mono text-outline whitespace-nowrap">
                      <div>{log.timeAgo || log.createdAt}</div>
                      <div className="text-[10px] opacity-70">{log.createdAt}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface whitespace-nowrap">
                      <div>{log.userName || 'Hệ thống'}</div>
                      {log.userEmail && (
                        <div className="text-[10px] font-mono text-outline font-normal">
                          {log.userEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded border text-[11px] font-bold ${getLogTypeBadge(
                          log.logType
                        )}`}
                      >
                        {log.logType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-on-surface">{log.action}</td>
                    <td className="py-3.5 px-4 font-semibold text-secondary">{log.target || '—'}</td>
                    <td className="py-3.5 px-4 text-on-surface-variant max-w-md">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
