import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Card from '../components/ui/Card';

export default function AdminDashboard() {
  return (
    <div>
      <Card>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669' }}>
          <ShieldCheck /> Admin Dashboard - Quản trị Hệ thống & Giám sát AI
        </h2>
        <p style={{ color: '#64748b', margin: '0.5rem 0 1rem 0' }}>Giám sát độ chính xác mô hình AI (YOLO, LP Solver, RAG), quản lý người dùng & phân quyền.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1.25rem', background: '#ecfdf5', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
            <h4 style={{ color: '#047857', marginBottom: '0.5rem' }}>Tổng thành viên</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>2,450</span>
          </div>
          <div style={{ padding: '1.25rem', background: '#eff6ff', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
            <h4 style={{ color: '#1d4ed8', marginBottom: '0.5rem' }}>Thực đơn AI đã tạo</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>14,210</span>
          </div>
          <div style={{ padding: '1.25rem', background: '#fff7ed', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
            <h4 style={{ color: '#c2410c', marginBottom: '0.5rem' }}>Độ chính xác YOLOv8</h4>
            <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>95.4%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
