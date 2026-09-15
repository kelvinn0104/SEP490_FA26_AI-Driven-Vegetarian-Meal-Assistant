import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, XCircle, Clock, ShieldAlert, Search, Eye, Filter, 
  Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2, User, 
  FileText, Video, Utensils, MessageSquare, ArrowLeft, RefreshCw, X,
  LayoutDashboard, ShieldCheck, History, Settings, LogOut, Sun, Bell,
  ChevronRight, Play, Check, Slash, Zap, Download, Send, AlertCircle,
  HelpCircle, MoreVertical, Lock, Shield, Camera, Plus, Trash2, Edit2,
  Bookmark, Award, Sliders, Key, Smartphone, Globe, MapPin, Tag, Laptop,
  Bot, SlidersHorizontal, ChevronLeft, CheckSquare, Sprout, SkipForward,
  Calendar, Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ModDashboard({ onNavigate }) {
  const { user, logout } = useAuth();

  // Active navigation tab in Moderator Workspace
  // 'dashboard' | 'queue' | 'detail' | 'history' | 'profile'
  const [activeModTab, setActiveModTab] = useState('dashboard');

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search in topbar
  const [topSearchQuery, setTopSearchQuery] = useState('');
  const [isAiFlagFilterActive, setIsAiFlagFilterActive] = useState(false);

  // Moderation Queue Interactive Filters & State
  const [queueTab, setQueueTab] = useState('all'); // 'all' | 'new' | 'flagged' | 'revision'
  const [queueSearch, setQueueSearch] = useState('');
  const [queueCategory, setQueueCategory] = useState('all'); // 'all' | 'nutrition' | 'cooking' | 'seasonal' | 'video'
  const [queueAiFilter, setQueueAiFilter] = useState('all'); // 'all' | 'safe' | 'warning'
  const [queueCurrentPage, setQueueCurrentPage] = useState(1);

  // Modals state
  const [inspectingItem, setInspectingItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Chứa nguyên liệu phi chay / vi phạm quy chuẩn');
  const [rejectNote, setRejectNote] = useState('');
  const [showAutoReviewModal, setShowAutoReviewModal] = useState(false);
  const [autoReviewStep, setAutoReviewStep] = useState(0);

  // Post Detail Interactive Controls (matching exact uploaded mockup)
  const [detailMealCategory, setDetailMealCategory] = useState('main'); // 'main' | 'side' | 'dessert'
  const [detailIsExpertCertified, setDetailIsExpertCertified] = useState(true);
  const [detailInternalFeedback, setDetailInternalFeedback] = useState('');
  const [detailSelectedTags, setDetailSelectedTags] = useState(['#MonTheoMua', '#TangDeKhang', '#MonKhoHam', '#DuongSinhOhsawa']);

  // History Tab Interactive Controls & Audit Dataset
  // STRICTLY RESPECTING IMAGE 2 FEEDBACK:
  // - Clean author names ONLY (no Chef Verified, no Tác giả cộng đồng, no Top Contributor, no Thành viên mới, no Food Blogger)
  // - "Bác sĩ Tuấn Minh - Chuyên gia dinh dưỡng" -> "Tuấn Minh" (no Bác sĩ, no Chuyên gia)
  // - "Trích dẫn 4 nguồn Y khoa" -> REMOVED
  const [historySearch, setHistorySearch] = useState('');
  const [historyPeriod, setHistoryPeriod] = useState('month'); // 'today' | 'week' | 'month' | 'custom'
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all'); // 'all' | 'published' | 'rejected' | 'revision'
  const [historyPage, setHistoryPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState('20 bài');

  const [historyAuditRecords, setHistoryAuditRecords] = useState([
    {
      id: 'VEC-9482',
      tag: '#VEC-9482 • Lên men tự nhiên',
      title: 'Bí quyết ủ men Tempeh đậu nành truyền thống',
      thumbBadge: 'REC',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-d007c0828330?w=200',
      meta: '⏱️ 48 giờ • ⚡ 19g Protein / 100g',
      author: 'Hoàng An Nhiên',
      authorInitials: 'HA',
      authorAvatarBg: '#ecfeff',
      authorAvatarColor: '#0891b2',
      decision: 'published',
      decisionLabel: 'Đã xuất bản',
      date: '14:32 • 24/10/2025',
      slaTime: 'Xử lý trong 8 phút',
      slaType: 'green'
    },
    {
      id: 'VEC-9479',
      tag: '#VEC-9479 • Món nước thực dưỡng',
      title: 'Phở nấm thực dưỡng dưỡng sinh',
      thumbBadge: 'NUTRI',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      meta: '⏱️ 45 phút • 340 kcal',
      author: 'Đặng Khang',
      authorInitials: 'ĐK',
      authorAvatarBg: '#fef3c7',
      authorAvatarColor: '#b45309',
      decision: 'revision',
      decisionLabel: 'Yêu cầu bổ sung',
      date: '11:15 • 24/10/2025',
      slaTime: 'Xử lý trong 12 phút',
      slaType: 'warning'
    },
    {
      id: 'VEC-9471',
      tag: '#VEC-9471 • Khai vị lành mạnh',
      title: 'Bánh tráng cuốn nấm ngũ sắc',
      thumbBadge: 'REC',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200',
      meta: '⏱️ 20 phút • 🌱 100% Raw Vegan',
      author: 'Mai Linh Vegan',
      authorInitials: 'ML',
      authorAvatarBg: '#ecfdf5',
      authorAvatarColor: '#059669',
      decision: 'published',
      decisionLabel: 'Đã xuất bản',
      date: '09:40 • 24/10/2025',
      slaTime: 'Xử lý trong 5 phút',
      slaType: 'green'
    },
    {
      id: 'VEC-9469',
      tag: '#VEC-9469 • Bánh ngọt công nghiệp',
      title: 'Bánh Brownie bơ thực vật xốp mềm',
      thumbBadge: 'REJECT',
      isProhibited: true,
      meta: '⚠️ Chứa phụ gia bột sữa bò',
      isDangerMeta: true,
      author: 'Trần Ngọc Huy',
      authorInitials: 'TN',
      authorAvatarBg: '#ede9fe',
      authorAvatarColor: '#6d28d9',
      decision: 'rejected',
      decisionLabel: 'Từ chối — Không thuần chay',
      date: '16:45 • 23/10/2025',
      slaTime: 'Xử lý trong 4 phút',
      slaType: 'red'
    },
    {
      id: 'VEC-9452',
      tag: '#VEC-9452 • Kiến thức chuyên sâu',
      title: 'Cân bằng Omega 3–6 trong chế độ thuần chay',
      thumbBadge: 'BLOG',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200',
      meta: '📖 6 phút đọc',
      author: 'Tuấn Minh',
      authorInitials: 'TM',
      authorAvatarBg: '#dcfce7',
      authorAvatarColor: '#15803d',
      decision: 'published',
      decisionLabel: 'Đã xuất bản',
      date: '14:10 • 23/10/2025',
      slaTime: 'Xử lý trong 15 phút',
      slaType: 'green'
    },
    {
      id: 'VEC-9449',
      tag: '#VEC-9449 • Ngũ cốc ăn sáng',
      title: 'Granola yến mạch mật thốt nốt giòn tan',
      thumbBadge: 'REC',
      thumbnail: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=200',
      meta: '⏱️ 30 phút • ⚠️ Thiếu cảnh báo dị ứng hạt',
      isWarningMeta: true,
      author: 'Lâm Thanh Hà',
      authorInitials: 'LT',
      authorAvatarBg: '#f0fdf4',
      authorAvatarColor: '#16a34a',
      decision: 'revision',
      decisionLabel: 'Yêu cầu sửa đổi',
      date: '10:05 • 23/10/2025',
      slaTime: 'Xử lý trong 7 phút',
      slaType: 'warning'
    }
  ]);

  // =========================================================================
  // MOD PROFILE STATE & AVATAR UPLOAD (MATCHING EXACT MOD USER REQUIREMENTS)
  // =========================================================================
  const modAvatarInputRef = useRef(null);
  // Default image matching mockup
  const [modAvatar, setModAvatar] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300');

  const handleModAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setModAvatar(url);
      showToast('📸 Đã cập nhật ảnh đại diện Kiểm duyệt viên thành công!');
    }
  };

  // Profile data state
  // Yêu cầu: Tất cả đều để là Moderator hoặc Mod (không để Content Moderator), bỏ danh hiệu
  const [modProfileData, setModProfileData] = useState({
    fullName: 'Lê Tuệ Tâm',
    roleTitle: 'Moderator',
    email: 'mod.tuetam@veggie.ai',
    phone: '+84 912 348 765',
    culturalRegion: 'Đông Nam Á & Đông Á (Việt, Thái...)',
    specialties: ['Món thuần chay Á Đông', 'Thực phẩm lên men & Tempeh', 'Dinh dưỡng trị liệu'],
    passwords: { current: '••••••••••••', newPass: '', confirmPass: '' },
    lastSaved: 'Hôm nay lúc 14:28'
  });

  // Active login sessions & devices (like Admin)
  const [modSessions, setModSessions] = useState([
    {
      id: 'SES-01',
      device: 'Windows PC • Chrome v128',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      ip: '118.69.182.45',
      time: 'Đang hoạt động (Phiên này)',
      isCurrent: true
    },
    {
      id: 'SES-02',
      device: 'iPhone 15 Pro • Safari iOS 17.5',
      location: 'TP. Hồ Chí Minh, Việt Nam',
      ip: '118.69.182.45',
      time: '12 phút trước',
      isCurrent: false
    },
    {
      id: 'SES-03',
      device: 'MacBook Air M2 • Firefox 129',
      location: 'Hà Nội, Việt Nam',
      ip: '14.162.144.12',
      time: 'Hôm qua lúc 18:30',
      isCurrent: false
    }
  ]);

  const handleLogoutAllOtherDevices = () => {
    setModSessions(prev => prev.filter(s => s.isCurrent));
    showToast('🔒 Đã đăng xuất khỏi tất cả các thiết bị khác thành công!');
  };

  const handleLogoutAllDevices = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi TẤT CẢ các thiết bị bao gồm phiên hiện tại?')) {
      logout();
      if (onNavigate) onNavigate('login');
      showToast('🔒 Đã đăng xuất khỏi tất cả thiết bị.');
    }
  };

  const [profileSubTab, setProfileSubTab] = useState('account'); // 'account' | 'filters' | 'notifications' | 'security'
  const [newSpecialtyInput, setNewSpecialtyInput] = useState('');
  const [showAddSpecialty, setShowAddSpecialty] = useState(false);

  // Modal create/edit rejection template
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ title: '', category: 'Ăn chay truyền thống', text: '' });

  // Rejection templates (BỎ "Thiếu định lượng dinh dưỡng calo/macro" per rule 7)
  const [rejectionTemplates, setRejectionTemplates] = useState([
    {
      id: 1,
      title: 'Chứa ngũ vị tân chưa dán nhãn phân loại',
      category: 'Ăn chay truyền thống',
      badgeColor: 'amber',
      text: 'Bài viết có chứa hành/tỏi/hẹ hoặc nén nhưng chưa bật tag cảnh báo "Có chứa ngũ vị tân" ở phần thuộc tính phân loại món ăn tâm linh/thuần chay. Vui lòng tick chọn thuộc tính phù hợp.'
    },
    {
      id: 2,
      title: 'Ảnh thumbnail mờ, vỡ nét hoặc dính bản quyền',
      category: 'Hình ảnh',
      badgeColor: 'blue',
      text: 'Hình ảnh minh họa có độ phân giải dưới 720p hoặc dính watermark từ nguồn thương mại thứ ba. Bạn có thể chụp ảnh trực tiếp món tự nấu bằng cam điện thoại có độ ánh sáng tự nhiên nhất!'
    },
    {
      id: 3,
      title: 'Chứa nguyên liệu phi chay (xương, thịt, mỡ động vật, gelatin)',
      category: 'Quy chuẩn Thuần Chay',
      badgeColor: 'red',
      text: 'Công thức chứa nguyên liệu có nguồn gốc động vật hoặc chất phụ gia bị cấm, vi phạm quy chuẩn an toàn thực phẩm thuần chay VeggieAI.'
    }
  ]);

  const handleAddSpecialty = () => {
    if (!newSpecialtyInput.trim()) return;
    if (modProfileData.specialties.includes(newSpecialtyInput.trim())) {
      showToast('Chuyên môn này đã có trong danh sách.');
      return;
    }
    setModProfileData(prev => ({
      ...prev,
      specialties: [...prev.specialties, newSpecialtyInput.trim()]
    }));
    setNewSpecialtyInput('');
    setShowAddSpecialty(false);
    showToast('✅ Đã bổ sung chuyên môn kiểm duyệt.');
  };

  const handleRemoveSpecialty = (tag) => {
    setModProfileData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(t => t !== tag)
    }));
    showToast(`Đã xóa chuyên môn: ${tag}`);
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({ title: '', category: 'Ăn chay truyền thống', text: '' });
    setShowCreateTemplateModal(true);
  };

  const handleOpenEditTemplate = (tmpl) => {
    setEditingTemplate(tmpl);
    setTemplateForm({ title: tmpl.title, category: tmpl.category, text: tmpl.text });
    setShowCreateTemplateModal(true);
  };

  const handleSaveTemplateSubmit = (e) => {
    if (e) e.preventDefault();
    if (!templateForm.title.trim() || !templateForm.text.trim()) {
      showToast('Vui lòng nhập đầy đủ tiêu đề và nội dung mẫu phản hồi.');
      return;
    }
    if (editingTemplate) {
      setRejectionTemplates(prev => prev.map(t => t.id === editingTemplate.id ? { ...t, title: templateForm.title.trim(), category: templateForm.category, text: templateForm.text.trim() } : t));
      showToast('✅ Đã cập nhật mẫu phản hồi từ chối!');
    } else {
      const newTmpl = {
        id: Date.now(),
        title: templateForm.title.trim(),
        category: templateForm.category,
        badgeColor: templateForm.category.includes('Thuần Chay') ? 'red' : templateForm.category.includes('Hình ảnh') ? 'blue' : 'amber',
        text: templateForm.text.trim()
      };
      setRejectionTemplates(prev => [...prev, newTmpl]);
      showToast('✅ Đã thêm mẫu phản hồi từ chối mới!');
    }
    setShowCreateTemplateModal(false);
  };

  const handleDeleteTemplate = (id) => {
    setRejectionTemplates(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ Đã xóa mẫu phản hồi từ chối.');
  };

  const handleSaveModProfile = () => {
    setModProfileData(prev => ({
      ...prev,
      lastSaved: `Hôm nay lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    }));
    showToast('✅ Đã lưu toàn bộ cấu hình hồ sơ và mẫu phản hồi Moderator thành công!');
  };

  // Core Data: Priority & Pending Moderation Queue (Items)
  // Authors have pure name + objective stats "XX bài duyệt • X vi phạm" (NO chef/doctor titles, NO tier badges)
  const [moderationItems, setModerationItems] = useState([
    {
      id: 'POST-8821',
      title: 'Cà ri bí đỏ cốt dừa hạt điều hạt sen dưỡng sinh mùa đông',
      thumbnail: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600',
      coverImage: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=1200',
      author: 'Bếp Chay Tuệ Tâm',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      authorInitials: 'TT',
      authorEmail: 'tuetam.bepchay@gmail.com',
      isVerified: true,
      authorStats: '142 công thức đã duyệt',
      trustScore: 100,
      type: 'Ẩm thực Thực Dưỡng Ohsawa',
      typeTag: 'Thực dưỡng',
      typeCode: 'seasonal',
      category: 'seasonal',
      excerpt: 'Cà ri bí đỏ béo bùi từ hạt sen tươi và cốt dừa, bổ sung đạm hạt điều ấm nồng cho mùa đông...',
      submittedAt: '10:42 Hôm nay',
      submittedDateFull: '26/10/2024 - 10:42',
      servings: '4 Người ăn',
      cookTime: '45 Phút',
      veganBadge: 'Thuần chay 100%',
      dietCategory: 'ẨM THỰC THỰC DƯỠNG OHSAWA',
      slaRemaining: 'Còn 45 phút SLA',
      slaStatus: 'normal',
      aiConfidence: 100,
      aiStatus: 'safe',
      aiBadgeLabel: 'Đạt chuẩn thuần chay 100%',
      aiSummary: 'Không phát hiện mỡ động vật, bơ sữa bò, trứng hoặc phụ gia gelatin.',
      warningTag: null,
      priority: 'high',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      macros: {
        calo: '568 kcal',
        protein: '11.4g',
        proteinDv: '13% DV',
        carbs: '38.2g',
        carbsDv: '54% DV',
        fat: '16.8g',
        fatDv: '25% DV',
        fiber: '7.5g',
        fiberDv: '28% DV'
      },
      ingredientsTable: [
        { name: 'Bí đỏ hồ lô giống hữu cơ', amount: '500g', calories: '130 kcal', origin: 'Rau củ hữu cơ', originColor: 'blue', status: 'Hợp lệ' },
        { name: 'Hạt sen tươi Huế', amount: '150g', calories: '134 kcal', origin: 'Hạt dưỡng chất', originColor: 'purple', status: 'Hợp lệ' },
        { name: 'Hạt điều sữa tươi chưa rang', amount: '80g', calories: '442 kcal', origin: 'Hạt giàu đạm/béo', originColor: 'amber', status: 'Hợp lệ' },
        { name: 'Nước cốt dừa tươi nguyên chất', amount: '200ml', calories: '460 kcal', origin: 'Chất béo dừa tươi', originColor: 'teal', status: 'Hợp lệ' },
        { name: 'Bột cà ri Ấn Độ hữu cơ & Sả cây', amount: '30g', calories: '25 kcal', origin: 'Thảo mộc tự nhiên', originColor: 'emerald', status: 'Hợp lệ' }
      ],
      instructionsSteps: [
        {
          step: 1,
          title: 'Sơ chế rau củ và hạt dưỡng chất',
          img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
          desc: 'Bí đỏ gọt vỏ, thái quân cờ vừa ăn khoảng 3x3cm (không thái quá mỏng để tránh nát khi hầm). Hạt sen rửa sạch lấy tim đắng nếu có. Hạt điều ngâm nước ấm 20 phút cho nở mềm rồi vớt ráo.'
        },
        {
          step: 2,
          title: 'Kích hoạt tầng hương gia vị thực dưỡng',
          img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
          desc: 'Đun 1 thìa dầu mè nguyên chất, cho sả đập dập và bột cà ri vào phi nhỏ lửa cho dậy mùi thơm ấm áp. Cho bí đỏ và hạt sen vào đảo đều trong 3 phút để áo đều lớp gia vị vàng óng tự nhiên.'
        },
        {
          step: 3,
          title: 'Hầm chậm cùng nước cốt dừa và hạt điều',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          desc: 'Đổ 400ml nước dùng rau củ đun sôi, hạ lửa riu riu hầm trong 15 phút. Khi bí và hạt sen vừa chín mềm tới, cho hạt điều cùng 200ml cốt dừa vào khuấy nhẹ tay. Nêm 1 thìa tương tamari và một nhúm muối hồng Himalaya rồi tắt bếp sau 3 phút.'
        }
      ],
      macrobioticTip: 'Bí đỏ mang năng lượng Dương ấm nồng, phối hợp cùng hạt sen thanh tâm an thần và cốt dừa giúp cân bằng thể trạng trong những ngày tiết trời chuyển lạnh. Tránh nêm bột ngọt hóa học hoặc đường tinh luyện làm mất đi vị ngọt hậu thanh tao tự nhiên của củ và hạt sen.',
      aiTags: ['#MonTheoMua', '#TangDeKhang', '#MonKhoHam', '#DuongSinhOhsawa'],
      safetyChecks: {
        language: '0 vi phạm',
        externalLinks: 'Không có',
        copyright: 'Nguyên bản 100%'
      },
      status: 'pending'
    },
    {
      id: 'MOD-8811',
      title: 'Salad Cầu Vồng Rau Củ Mùa Hè',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      author: 'Trần Thanh Nhã',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      authorEmail: 'thanhnha.tran@gmail.com',
      isVerified: true,
      authorStats: '18 bài duyệt • 0 vi phạm',
      trustScore: 98,
      type: 'Công thức theo mùa',
      typeTag: 'Công thức',
      typeCode: 'seasonal',
      category: 'seasonal',
      excerpt: 'Công thức giàu chất chống oxy hóa tự...',
      submittedAt: '25 phút trước',
      slaRemaining: 'Còn 35 phút SLA',
      slaStatus: 'normal',
      aiConfidence: 98,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Nguyên liệu thuần thực vật 100%, không phát hiện dị nguyên ẩn.',
      warningTag: null,
      priority: 'high',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Xà lách Romaine & Bắp cải tím', amount: '200g', status: 'safe' },
        { name: 'Ớt chuông đỏ vàng', amount: '100g', status: 'safe' },
        { name: 'Hạt mè rang hữu cơ', amount: '2 thìa canh', status: 'safe' },
        { name: 'Xốt mè rang thuần chay', amount: '30ml', status: 'safe' }
      ],
      macros: { calo: '210 kcal', protein: '5.2g', carbs: '18g', fat: '12g' },
      instructions: 'Rửa sạch rau củ quả, để ráo. Thái sợi mỏng bắp cải tím và ớt chuông. Trộn đều cùng xốt mè rang hữu cơ và thưởng thức.',
      status: 'pending'
    },
    {
      id: 'MOD-8812',
      title: 'Trà Thảo Mộc Dưỡng Nhan Mùa Thu',
      thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300',
      author: 'Đỗ Khang Huy',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      authorEmail: 'khanghuy.do@gmail.com',
      isVerified: false,
      authorStats: '2 bài duyệt • 0 vi phạm',
      trustScore: 74,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Blog',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Hướng dẫn cách ủ trà hoa cúc kết hợp bán...',
      submittedAt: '48 phút trước',
      slaRemaining: 'Còn 12 phút SLA',
      slaStatus: 'warning',
      aiConfidence: 74,
      aiStatus: 'warning',
      aiBadgeLabel: 'Cảnh báo: Phát hiện mật ong',
      aiSummary: 'Có thành phần từ động vật trong công thức gắn mác Thuần Chay (Vegan).',
      warningTag: 'Chứa mật ong (Phi thuần chay)',
      priority: 'high',
      isNew: false,
      queueStatus: 'flagged',
      actionType: 'handle',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Hoa cúc vàng sấy lạnh', amount: '10g', status: 'safe' },
        { name: 'Kỷ tử đỏ hữu cơ', amount: '15g', status: 'safe' },
        { name: 'Mật ong hoa rừng tự nhiên', amount: '20ml', status: 'violation' }
      ],
      macros: { calo: '85 kcal', protein: '0.8g', carbs: '20g', fat: '0.1g' },
      instructions: 'Hãm hoa cúc và kỷ tử với nước sôi 90 độ C trong 10 phút, để nguội bớt rồi hòa mật ong hoa rừng vào khuấy đều...',
      status: 'pending'
    },
    {
      id: 'MOD-8813',
      title: 'Bí Quyết Hầm Nước Dùng Chay Umami',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300',
      author: 'Võ Quốc Anh',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      authorEmail: 'quocanh.vo@gmail.com',
      isVerified: true,
      authorStats: '42 bài duyệt • 0 vi phạm',
      trustScore: 96,
      type: 'Video thực hành',
      typeTag: 'Video HD',
      typeCode: 'video',
      category: 'video',
      excerpt: 'Kỹ thuật nướng củ quả tạo vị ngọt umami sắ...',
      submittedAt: '1 giờ trước',
      slaRemaining: 'Còn 50 phút SLA',
      slaStatus: 'normal',
      aiConfidence: 96,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Chuẩn kỹ thuật',
      aiSummary: 'Hình ảnh và âm thanh chất lượng cao, đúng quy chuẩn bản quyền.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Củ cải trắng và cà rốt nướng sém cạnh', amount: '500g', status: 'safe' },
        { name: 'Mía lau róc vỏ chẻ đôi', amount: '2 khúc', status: 'safe' },
        { name: 'Nấm hương rừng khô', amount: '80g', status: 'safe' },
        { name: 'Hành baro nướng thơm', amount: '2 cây', status: 'safe' }
      ],
      macros: { calo: '120 kcal', protein: '4.5g', carbs: '26g', fat: '0.5g' },
      instructions: 'Nướng các loại củ quả trên than hồng cho dậy mùi thơm caramel hóa. Cho vào nồi áp suất hầm cùng mía và nấm hương trong 45 phút để lấy nước ngọt tự nhiên.',
      status: 'pending'
    },
    {
      id: 'MOD-8814',
      title: 'Bổ Sung Vitamin B12 Tự Nhiên Cho Người Ăn Chay',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
      author: 'Hoàng Yến',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      authorEmail: 'hoangyen@gmail.com',
      isVerified: true,
      authorStats: '15 bài duyệt • 0 vi phạm',
      trustScore: 99,
      type: 'Dinh dưỡng & Vi chất',
      typeTag: 'Dinh dưỡng',
      typeCode: 'nutrition',
      category: 'nutrition',
      excerpt: 'Tổng hợp nguồn thực phẩm lên men và liều...',
      submittedAt: '1.5 giờ trước',
      slaRemaining: 'Còn 1 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 99,
      aiStatus: 'safe',
      aiBadgeLabel: 'Đạt chuẩn dữ liệu',
      aiSummary: 'Thành phần dinh dưỡng khớp cơ sở dữ liệu VeggieAI, không phát hiện sai lệch',
      warningTag: null,
      priority: 'normal',
      isNew: false,
      queueStatus: 'all',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Men dinh dưỡng (Nutritional Yeast) bổ sung B12', amount: '15g', status: 'safe' },
        { name: 'Tempeh đậu nành lên men', amount: '150g', status: 'safe' },
        { name: 'Nấm đông cô hữu cơ', amount: '60g', status: 'safe' }
      ],
      macros: { calo: '280 kcal', protein: '24g', carbs: '18g', fat: '6.5g' },
      instructions: 'Hướng dẫn bổ sung men dinh dưỡng chứa B12 vào khẩu phần hàng ngày và cách kết hợp với các thực phẩm lên men truyền thống.',
      status: 'pending'
    },
    {
      id: 'MOD-8815',
      title: 'Bún Nấm Riêu Chay Cốt Đậu Hũ Non',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      author: 'Đậu Bắp Xanh',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
      authorEmail: 'daubapxanh@gmail.com',
      isVerified: true,
      authorStats: '9 bài duyệt • 0 vi phạm',
      trustScore: 95,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Bí quyết nấu riêu đậu nành béo mềm cùng nước cà chua dấm bỗng thanh dịu...',
      submittedAt: '2 giờ trước',
      slaRemaining: 'Còn 1.2 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 98,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: '100% Nguyên liệu thực vật thuần chay. Không phát hiện chất cấm.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Đậu hũ non', amount: '2 bìa (300g)', status: 'safe' },
        { name: 'Cà chua chín mọng', amount: '3 quả', status: 'safe' },
        { name: 'Nấm rơm', amount: '200g', status: 'safe' }
      ],
      macros: { calo: '380 kcal', protein: '18.5g', carbs: '45g', fat: '11.2g' },
      instructions: 'Đun sôi nước dùng cà chua, cho sữa đậu nành và dấm bỗng vào tạo riêu bông mịn...',
      status: 'pending'
    },
    {
      id: 'MOD-8816',
      title: 'Thịt Nguội Thực Vật Xào Tỏi Ớt & Hẹ',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      author: 'GreenFoodie',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      authorEmail: 'greenfoodie@yahoo.com',
      isVerified: false,
      authorStats: '5 bài duyệt • 1 vi phạm',
      trustScore: 72,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Món xào thơm cay đậm vị với thịt nguội chay và hẹ tươi...',
      submittedAt: '2.5 giờ trước',
      slaRemaining: 'Còn 45 phút SLA',
      slaStatus: 'warning',
      aiConfidence: 86,
      aiStatus: 'warning',
      aiBadgeLabel: 'Cảnh báo: Ngũ vị tân',
      aiSummary: 'AI phát hiện thành phần Ngũ vị tân: Tỏi và Hẹ lá trong công thức.',
      warningTag: 'Có Ngũ Vị Tân (Tỏi, Hẹ)',
      priority: 'high',
      isNew: false,
      queueStatus: 'flagged',
      actionType: 'handle',
      hasFiveSpices: true,
      ingredients: [
        { name: 'Thịt nguội chay đậu nành', amount: '250g', status: 'safe' },
        { name: 'Hẹ lá cắt khúc', amount: '100g', status: 'warning' },
        { name: 'Tỏi băm nhuyễn', amount: '3 tép', status: 'warning' }
      ],
      macros: { calo: '310 kcal', protein: '22g', carbs: '14g', fat: '8.5g' },
      instructions: 'Thái lát thịt nguội chay áp chảo vàng đều, phi thơm tỏi và hẹ rồi cho vào xào nhanh...',
      status: 'pending'
    },
    {
      id: 'MOD-8817',
      title: 'Cơm Chiên Hạt Sen & Nấm Tươi Mùa Thu',
      thumbnail: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300',
      author: 'Mai Tuấn',
      authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
      authorEmail: 'maituan@gmail.com',
      isVerified: true,
      authorStats: '12 bài duyệt • 0 vi phạm',
      trustScore: 97,
      type: 'Công thức theo mùa',
      typeTag: 'Công thức',
      typeCode: 'seasonal',
      category: 'seasonal',
      excerpt: 'Cơm chiên hạt sen Huế bùi béo kết hợp nấm bào ngư xé sợi giòn rụm...',
      submittedAt: '3 giờ trước',
      slaRemaining: 'Còn 2 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 97,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Công thức thuần chay tự nhiên, cân đối chất xơ và đạm thực vật.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Cơm gạo lứt huyết rồng', amount: '2 chén', status: 'safe' },
        { name: 'Hạt sen Huế tươi', amount: '80g', status: 'safe' },
        { name: 'Nấm đùi gà', amount: '100g', status: 'safe' }
      ],
      macros: { calo: '340 kcal', protein: '11g', carbs: '58g', fat: '6g' },
      instructions: 'Hấp chín hạt sen, chiên cơm săn hạt với dầu mè rồi trộn cùng hạt sen và nấm...',
      status: 'pending'
    },
    {
      id: 'MOD-8818',
      title: 'Súp Bí Đỏ Hạt Điều Kem Béo Thực Vật',
      thumbnail: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=300',
      author: 'Bảo Trâm',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      authorEmail: 'baotram@gmail.com',
      isVerified: true,
      authorStats: '7 bài duyệt • 0 vi phạm',
      trustScore: 95,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Món súp kem mịn sánh từ bí đỏ nướng và sữa hạt điều béo ngậy...',
      submittedAt: '3.5 giờ trước',
      slaRemaining: 'Còn 2.5 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 95,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Nguyên liệu hoàn toàn từ hạt và củ quả tươi, không chứa phụ gia.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Bí đỏ mật nướng chín', amount: '350g', status: 'safe' },
        { name: 'Hạt điều ngâm mềm', amount: '60g', status: 'safe' },
        { name: 'Nước hầm rau củ', amount: '300ml', status: 'safe' }
      ],
      macros: { calo: '230 kcal', protein: '6.5g', carbs: '32g', fat: '9g' },
      instructions: 'Xay nhuyễn bí đỏ và hạt điều với nước dùng củ quả ấm nóng, đun nhỏ lửa nêm chút muối hồng...',
      status: 'pending'
    },
    {
      id: 'MOD-8819',
      title: 'Bánh Mì Chay Pate Nấm Đậu Gà',
      thumbnail: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300',
      author: 'Lê Quân',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      authorEmail: 'lequan@gmail.com',
      isVerified: true,
      authorStats: '8 bài duyệt • 0 vi phạm',
      trustScore: 98,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Blog',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Cách làm pate chay béo ngậy từ đậu gà, nấm hương và bơ thực vật...',
      submittedAt: '4 giờ trước',
      slaRemaining: 'Còn 3 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 98,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Thành phần an toàn, công thức chuẩn bị rõ ràng và đầy đủ định lượng.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Đậu gà hầm mềm', amount: '150g', status: 'safe' },
        { name: 'Nấm đùi gà băm', amount: '100g', status: 'safe' },
        { name: 'Bơ thực vật cacao', amount: '20g', status: 'safe' }
      ],
      macros: { calo: '310 kcal', protein: '14g', carbs: '42g', fat: '8g' },
      instructions: 'Xào nấm cho cạn nước, xay cùng đậu gà và bơ thực vật cho mịn rồi hấp cách thủy 20 phút...',
      status: 'pending'
    },
    {
      id: 'MOD-8820',
      title: 'Hướng Dẫn Làm Tempeh Tại Nhà Chi Tiết',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-d007c0828330?w=300',
      author: 'Hà My',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      authorEmail: 'hamy@gmail.com',
      isVerified: true,
      authorStats: '19 bài duyệt • 0 vi phạm',
      trustScore: 97,
      type: 'Video thực hành',
      typeTag: 'Video HD',
      typeCode: 'video',
      category: 'video',
      excerpt: 'Kỹ thuật lên men đậu tương bằng men Rhizopus oligosporus an toàn chuẩn vi sinh...',
      submittedAt: '4.2 giờ trước',
      slaRemaining: 'Còn 3 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 97,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Chuẩn kỹ thuật',
      aiSummary: 'Video quay quy trình vệ sinh tiệt trùng đạt chuẩn kỹ thuật thực phẩm.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Hạt đậu tương hữu cơ đãi vỏ', amount: '500g', status: 'safe' },
        { name: 'Men giống Tempeh Rhizopus', amount: '2g', status: 'safe' },
        { name: 'Giấm gạo tạo môi trường axit', amount: '2 thìa canh', status: 'safe' }
      ],
      macros: { calo: '190 kcal', protein: '19g', carbs: '9g', fat: '11g' },
      instructions: 'Luộc đậu nành với giấm, lau khô thật ráo, rắc men đều và ủ ở nhiệt độ 31 độ C trong 36 giờ...',
      status: 'pending'
    },
    {
      id: 'MOD-8821',
      title: 'Cà Ri Chay Nhật Bản Khoai Củ Nấm',
      thumbnail: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300',
      author: 'Quỳnh Nga',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      authorEmail: 'quynhnga@gmail.com',
      isVerified: true,
      authorStats: '11 bài duyệt • 0 vi phạm',
      trustScore: 96,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Cà ri chay sánh mịn vị táo và mật mía hầm cùng khoai tây, cà rốt...',
      submittedAt: '5 giờ trước',
      slaRemaining: 'Còn 3.5 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 96,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Viên cà ri thực vật tự làm, không chứa chất điều vị nhân tạo.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Khoai tây & Cà rốt hữu cơ', amount: '300g', status: 'safe' },
        { name: 'Viên xốt cà ri chay', amount: '50g', status: 'safe' },
        { name: 'Táo tươi xay nhuyễn', amount: '1/2 quả', status: 'safe' }
      ],
      macros: { calo: '280 kcal', protein: '7.5g', carbs: '45g', fat: '6g' },
      instructions: 'Xào thơm củ quả, cho nước hầm đun mềm 20 phút rồi thả viên xốt cà ri và táo xay vào đun sánh lại...',
      status: 'pending'
    },
    {
      id: 'MOD-8822',
      title: 'Gỏi Cuốn Ngũ Sắc Xốt Đậu Phộng Chay',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      author: 'Phương Linh',
      authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
      authorEmail: 'phuonglinh@gmail.com',
      isVerified: true,
      authorStats: '14 bài duyệt • 0 vi phạm',
      trustScore: 97,
      type: 'Công thức theo mùa',
      typeTag: 'Công thức',
      typeCode: 'seasonal',
      category: 'seasonal',
      excerpt: 'Món gỏi cuốn thanh mát với đậu hũ chiên, bơ sáp và rau thơm mùa hè...',
      submittedAt: '5.5 giờ trước',
      slaRemaining: 'Còn 4 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 97,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: 'Công thức nguyên liệu tươi sạch, giàu chất xơ và vitamin.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Bánh tráng mè gạo lứt', amount: '10 cái', status: 'safe' },
        { name: 'Đậu hũ non chiên giòn', amount: '2 bìa', status: 'safe' },
        { name: 'Bơ sáp thái lát', amount: '1 quả', status: 'safe' }
      ],
      macros: { calo: '240 kcal', protein: '9.2g', carbs: '28g', fat: '9g' },
      instructions: 'Nhúng bánh tráng qua nước ấm, cuộn chặt tay cùng đậu hũ non và bơ, chấm kèm xốt đậu phộng béo bùi...',
      status: 'pending'
    },
    {
      id: 'MOD-8823',
      title: 'Chè Hạt Sen Nhãn Nhục Thanh Mát',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      author: 'Thu Hoài',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      authorEmail: 'thuhoai@gmail.com',
      isVerified: true,
      authorStats: '6 bài duyệt • 0 vi phạm',
      trustScore: 99,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Blog',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Món tráng miệng thanh nhiệt với đường phèn kết tinh tự nhiên...',
      submittedAt: '6 giờ trước',
      slaRemaining: 'Còn 4.5 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 99,
      aiStatus: 'safe',
      aiBadgeLabel: 'An toàn - Đầy đủ dinh dưỡng',
      aiSummary: '100% thảo mộc tự nhiên, an toàn cho mọi lứa tuổi.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Hạt sen tươi', amount: '100g', status: 'safe' },
        { name: 'Nhãn nhục Hưng Yên', amount: '50g', status: 'safe' },
        { name: 'Đường phèn mật mía', amount: '30g', status: 'safe' }
      ],
      macros: { calo: '160 kcal', protein: '3.5g', carbs: '38g', fat: '0.2g' },
      instructions: 'Nấu hạt sen chín bở, cho đường phèn và nhãn nhục vào sôi bùng 2 phút tắt bếp...',
      status: 'pending'
    },
    {
      id: 'MOD-8824',
      title: 'Sữa Chua Đậu Nành Lên Men Tự Nhiên',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
      author: 'Đức Trí',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      authorEmail: 'ductri@gmail.com',
      isVerified: true,
      authorStats: '20 bài duyệt • 0 vi phạm',
      trustScore: 98,
      type: 'Dinh dưỡng & Vi chất',
      typeTag: 'Dinh dưỡng',
      typeCode: 'nutrition',
      category: 'nutrition',
      excerpt: 'Tự ủ sữa chua thuần chay bằng men probiotic thực vật an toàn đường ruột...',
      submittedAt: '6.5 giờ trước',
      slaRemaining: 'Còn 5 giờ SLA',
      slaStatus: 'normal',
      aiConfidence: 98,
      aiStatus: 'safe',
      aiBadgeLabel: 'Đạt chuẩn dữ liệu',
      aiSummary: 'Thành phần dinh dưỡng khớp cơ sở dữ liệu VeggieAI, không phát hiện sai lệch.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      queueStatus: 'new',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Sữa đậu nành nguyên chất đặc', amount: '1000ml', status: 'safe' },
        { name: 'Men Probiotic thực vật', amount: '1 gói', status: 'safe' }
      ],
      macros: { calo: '140 kcal', protein: '8.5g', carbs: '12g', fat: '4.5g' },
      instructions: 'Tiệt trùng hũ thủy tinh, đun sữa ấm 42 độ C hòa men rồi ủ trong nồi cơm ấm 8 tiếng...',
      status: 'pending'
    },
    {
      id: 'MOD-8825',
      title: 'Phở Nấm Trộn Chua Ngọt Hà Nội',
      thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300',
      author: 'Tuấn Hưng',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      authorEmail: 'tuanhung@gmail.com',
      isVerified: false,
      authorStats: '4 bài duyệt • 1 vi phạm',
      trustScore: 71,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Món phở trộn với sốt chua ngọt và nấm hương chiên giòn...',
      submittedAt: '7 giờ trước',
      slaRemaining: 'Còn 20 phút SLA',
      slaStatus: 'warning',
      aiConfidence: 71,
      aiStatus: 'warning',
      aiBadgeLabel: 'Cảnh báo: Nguồn gốc gia vị',
      aiSummary: 'Phát hiện thành phần gia vị đóng gói chưa ghi rõ chứng nhận chay.',
      warningTag: 'Cần xác thực nhãn gia vị',
      priority: 'high',
      isNew: false,
      queueStatus: 'flagged',
      actionType: 'handle',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Bánh phở tươi', amount: '300g', status: 'safe' },
        { name: 'Gia vị phở trộn đóng gói', amount: '1 gói', status: 'warning' }
      ],
      macros: { calo: '380 kcal', protein: '9g', carbs: '65g', fat: '5g' },
      instructions: 'Trần bánh phở, trộn cùng sốt và nấm xào thơm...',
      status: 'pending'
    },
    {
      id: 'MOD-8826',
      title: 'Lẩu Nấm Thập Cẩm Nước Cốt Dừa',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300',
      author: 'Kim Oanh',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      authorEmail: 'kimoanh@gmail.com',
      isVerified: true,
      authorStats: '16 bài duyệt • 0 vi phạm',
      trustScore: 68,
      type: 'Công thức theo mùa',
      typeTag: 'Công thức',
      typeCode: 'seasonal',
      category: 'seasonal',
      excerpt: 'Nước lẩu béo ngọt từ nước dừa tươi và 6 loại nấm tươi mùa thu...',
      submittedAt: '8 giờ trước',
      slaRemaining: 'Còn 15 phút SLA',
      slaStatus: 'warning',
      aiConfidence: 68,
      aiStatus: 'warning',
      aiBadgeLabel: 'Cảnh báo: Bổ sung hạt nêm',
      aiSummary: 'Có nhãn hạt nêm thịt nghi vấn trong danh sách gia vị đi kèm.',
      warningTag: 'Nghi vấn hạt nêm thịt',
      priority: 'urgent',
      isNew: false,
      queueStatus: 'flagged',
      actionType: 'handle',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Nước dừa tươi', amount: '1000ml', status: 'safe' },
        { name: 'Hạt nêm súp đóng hộp', amount: '2 thìa', status: 'warning' }
      ],
      macros: { calo: '290 kcal', protein: '12g', carbs: '28g', fat: '14g' },
      instructions: 'Đun sôi nước dừa, thả nấm và rau củ vào dùng kèm...',
      status: 'pending'
    },
    {
      id: 'MOD-8827',
      title: 'Bánh Flan Yến Mạch Nước Cốt Dừa',
      thumbnail: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300',
      author: 'Minh Ngọc',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      authorEmail: 'minhngoc@gmail.com',
      isVerified: false,
      authorStats: '3 bài duyệt • 2 vi phạm',
      trustScore: 82,
      type: 'Bí quyết nấu ăn',
      typeTag: 'Công thức',
      typeCode: 'cooking',
      category: 'cooking',
      excerpt: 'Công thức bánh flan mềm mịn không dùng trứng, sử dụng bột yến mạch và thạch rau câu...',
      submittedAt: '1 ngày trước',
      slaRemaining: 'Chờ tác giả',
      slaStatus: 'normal',
      aiConfidence: 82,
      aiStatus: 'warning',
      aiBadgeLabel: 'Chờ sửa: Thiếu định lượng',
      aiSummary: 'Đã gửi yêu cầu tác giả cập nhật lại định lượng gram chi tiết.',
      warningTag: 'Chờ tác giả sửa định lượng',
      priority: 'normal',
      isNew: false,
      queueStatus: 'revision',
      actionType: 'handle',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Sữa yến mạch đặc', amount: '300ml', status: 'safe' },
        { name: 'Bột rau câu agar', amount: 'Chưa ghi rõ', status: 'warning' }
      ],
      macros: { calo: '180 kcal', protein: '4g', carbs: '28g', fat: '5g' },
      instructions: 'Khuấy đều hỗn hợp trên lửa nhỏ rồi đổ khuôn làm lạnh...',
      status: 'pending'
    },
    {
      id: 'MOD-8828',
      title: 'Canh Rong Biển Đậu Phụ Non Hạt Sen',
      thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300',
      author: 'Thanh Tâm',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100',
      authorEmail: 'thanhtam@gmail.com',
      isVerified: true,
      authorStats: '10 bài duyệt • 0 vi phạm',
      trustScore: 94,
      type: 'Dinh dưỡng & Vi chất',
      typeTag: 'Công thức',
      typeCode: 'nutrition',
      category: 'nutrition',
      excerpt: 'Canh dưỡng sinh thanh nhiệt, bổ sung iot tự nhiên từ rong biển Hàn Quốc...',
      submittedAt: '1 ngày trước',
      slaRemaining: 'Chờ tác giả',
      slaStatus: 'normal',
      aiConfidence: 94,
      aiStatus: 'safe',
      aiBadgeLabel: 'Chờ sửa: Ảnh minh họa',
      aiSummary: 'Tác giả đang thay thế ảnh minh họa độ phân giải cao theo yêu cầu hệ thống.',
      warningTag: 'Chờ tác giả đổi ảnh',
      priority: 'normal',
      isNew: false,
      queueStatus: 'revision',
      actionType: 'approve',
      hasFiveSpices: false,
      ingredients: [
        { name: 'Rong biển khô ngâm nở', amount: '20g', status: 'safe' },
        { name: 'Đậu phụ non thái hạt lựu', amount: '150g', status: 'safe' }
      ],
      macros: { calo: '110 kcal', protein: '8g', carbs: '12g', fat: '2.5g' },
      instructions: 'Nấu sôi nước dùng, cho rong biển và đậu phụ vào nêm nước tương Nhật...',
      status: 'pending'
    }
  ]);

  // Moderation Audit Log (History)
  const [moderationLogs, setModerationLogs] = useState([
    {
      id: 'LOG-9921',
      title: 'Salad Rong Nho & Đậu Hũ Non Sốt Mè Rang',
      author: 'Thu Thảo Vegan',
      action: 'approved',
      actionLabel: 'Đã phê duyệt',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      moderator: 'Lê Minh Trí',
      time: '08:45 Hôm nay',
      note: 'Công thức thuần khiết, tính toán macro chính xác.'
    },
    {
      id: 'LOG-9920',
      title: 'Bình luận bán bột giảm cân cấp tốc gia truyền',
      author: 'shop_thuocnam_99',
      action: 'rejected',
      actionLabel: 'Bị từ chối',
      badgeColor: '#dc2626',
      badgeBg: '#fee2e2',
      moderator: 'Lê Minh Trí',
      time: '09:12 Hôm nay',
      note: 'Spam bán thực phẩm chức năng chưa kiểm định.'
    },
    {
      id: 'LOG-9919',
      title: 'Lẩu Nấm Thập Cẩm & Chả Nấm Bào Ngư',
      author: 'Bếp Nhà Chay',
      action: 'approved',
      actionLabel: 'Đã phê duyệt',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      moderator: 'Lê Minh Trí',
      time: '09:30 Hôm nay',
      note: 'Đạt chuẩn 100% nguyên liệu nấm tự nhiên.'
    },
    {
      id: 'LOG-9918',
      title: 'Video: Cách xào mì chay giòn rụm',
      author: 'HoangLong_Kitchen',
      action: 'approved',
      actionLabel: 'Đã phê duyệt',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      moderator: 'Lê Minh Trí',
      time: '10:05 Hôm nay',
      note: 'Video chất lượng cao, khai báo rõ ngũ vị tân.'
    }
  ]);

  // Handle Approve
  const handleApproveItem = (item) => {
    setModerationItems(prev => prev.filter(i => i.id !== item.id));
    setModerationLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        title: item.title,
        author: item.author,
        action: 'approved',
        actionLabel: 'Đã phê duyệt',
        badgeColor: '#059669',
        badgeBg: '#ecfdf5',
        moderator: modProfileData.fullName,
        time: 'Vừa xong',
        note: 'Đã kiểm tra an toàn thuần chay & duyệt xuất bản.'
      },
      ...prev
    ]);
    showToast(`✅ Đã phê duyệt và xuất bản bài viết: "${item.title}"`);
    if (inspectingItem?.id === item.id) setInspectingItem(null);
  };

  // Handle Reject
  const handleOpenRejectModal = (item) => {
    setItemToReject(item);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!itemToReject) return;
    const rejectedItem = itemToReject;
    setModerationItems(prev => prev.filter(i => i.id !== rejectedItem.id));
    setModerationLogs(prev => [
      {
        id: `LOG-${Date.now().toString().slice(-4)}`,
        title: rejectedItem.title,
        author: rejectedItem.author,
        action: 'rejected',
        actionLabel: 'Bị từ chối',
        badgeColor: '#dc2626',
        badgeBg: '#fee2e2',
        moderator: modProfileData.fullName,
        time: 'Vừa xong',
        note: `${rejectReason}${rejectNote ? ` - Ghi chú: ${rejectNote}` : ''}`
      },
      ...prev
    ]);
    showToast(`🚫 Đã từ chối bài viết: "${rejectedItem.title}"`);
    setShowRejectModal(false);
    setItemToReject(null);
    setRejectNote('');
    if (inspectingItem?.id === rejectedItem.id) setInspectingItem(null);
  };

  // Batch approve safe items (AI Score > 95% & no danger warnings)
  const handleBatchApproveSafe = () => {
    const safeItems = moderationItems.filter(i => i.aiConfidence >= 95 && i.aiStatus === 'safe');
    if (safeItems.length === 0) {
      showToast('⚠️ Không có bài viết nào đạt điều kiện phê duyệt an toàn hàng loạt (AI Score ≥ 95%).');
      return;
    }
    const safeIds = safeItems.map(i => i.id);
    setModerationItems(prev => prev.filter(i => !safeIds.includes(i.id)));
    const newLogs = safeItems.map(item => ({
      id: `LOG-${Date.now().toString().slice(-4)}-${item.id}`,
      title: item.title,
      author: item.author,
      action: 'approved',
      actionLabel: 'Đã duyệt hàng loạt',
      badgeColor: '#059669',
      badgeBg: '#ecfdf5',
      moderator: modProfileData.fullName,
      time: 'Vừa xong',
      note: 'Duyệt nhanh tự động qua bộ lọc AI an toàn cao (>95%).'
    }));
    setModerationLogs(prev => [...newLogs, ...prev]);
    showToast(`⚡ Đã phê duyệt an toàn hàng loạt ${safeItems.length} bài viết có điểm tin cậy cao!`);
  };

  const handleBatchReceive = () => {
    showToast('📥 Đã nhận thành công nhóm 4 bài viết ưu tiên vào danh sách xử lý!');
  };

  // Auto-review sequential mode
  const handleStartAutoReview = () => {
    if (moderationItems.length === 0) {
      showToast('Hàng đợi kiểm duyệt hiện đang trống!');
      return;
    }
    setAutoReviewStep(0);
    setInspectingItem(moderationItems[0]);
    setShowAutoReviewModal(true);
    showToast('🚀 Đã kích hoạt Chế độ Duyệt Tự Động Tập Trung.');
  };

  // Filtered items list for general dashboard
  const filteredItems = moderationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(topSearchQuery.toLowerCase());
    const matchesAiFilter = isAiFlagFilterActive ? (item.aiStatus === 'warning' || item.aiStatus === 'danger') : true;
    return matchesSearch && matchesAiFilter;
  });

  // Filtered queue items specifically for Queue View (Image 1 & 2)
  const filteredQueueItems = moderationItems.filter(item => {
    // Status tab filter
    if (queueTab === 'new' && !item.isNew && item.queueStatus !== 'new') return false;
    if (queueTab === 'flagged' && item.queueStatus !== 'flagged' && item.aiStatus !== 'warning' && item.aiStatus !== 'danger') return false;
    if (queueTab === 'revision' && item.queueStatus !== 'revision') return false;

    // Search query in queue
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      const match = item.title.toLowerCase().includes(q) ||
                    item.author.toLowerCase().includes(q) ||
                    item.id.toLowerCase().includes(q) ||
                    (item.excerpt && item.excerpt.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Category pills filter
    if (queueCategory !== 'all') {
      if (item.category !== queueCategory && item.typeCode !== queueCategory) return false;
    }

    // AI risk dropdown filter
    if (queueAiFilter === 'safe') {
      if (item.aiConfidence < 95 || item.aiStatus !== 'safe') return false;
    } else if (queueAiFilter === 'warning') {
      if (item.aiStatus !== 'warning' && item.aiStatus !== 'danger') return false;
    }

    return true;
  });

  // Calculate items for current page (4 items per page matching mockup)
  const queueItemsPerPage = 4;
  const queueTotalPages = Math.ceil(filteredQueueItems.length / queueItemsPerPage) || 1;
  const paginatedQueueItems = filteredQueueItems.slice(
    (queueCurrentPage - 1) * queueItemsPerPage,
    queueCurrentPage * queueItemsPerPage
  );

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If modal or inspecting an item
      if (inspectingItem && !showRejectModal) {
        if (e.code === 'Space') {
          e.preventDefault();
          handleApproveItem(inspectingItem);
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          handleOpenRejectModal(inspectingItem);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentIndex = moderationItems.findIndex(i => i.id === inspectingItem.id);
          if (currentIndex !== -1 && currentIndex < moderationItems.length - 1) {
            setInspectingItem(moderationItems[currentIndex + 1]);
          }
        } else if (e.key === 'a' || e.key === 'A') {
          e.preventDefault();
          showToast(`🤖 AI Deep-Scan: Mô hình phân tích 100% không phát hiện thành phần thịt hoặc chất tạo đông gelatin.`);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectingItem, moderationItems, showRejectModal]);

  return (
    <div className="mod-portal-wrapper">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#065f46',
          color: '#ffffff',
          padding: '0.85rem 1.35rem',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '0.88rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} color="#34d399" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          LEFT SIDEBAR (MATCHING EXACT DESIGN SCREENSHOT)
          ========================================================================= */}
      <aside className="mod-sidebar">
        <div className="mod-sidebar-top">
          {/* BRAND LOGO HEADER: VeggieAI — Moderation Workspace */}
          <div className="mod-brand-header" onClick={() => setActiveModTab('dashboard')} style={{ cursor: 'pointer' }} title="Về Tổng quan Dashboard">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '12px', border: '1.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', flexShrink: 0 }}>
                <span style={{ fontSize: '1.25rem' }}>🌱</span>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    Veggie<span style={{ color: '#059669' }}>AI</span>
                  </span>
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#059669', letterSpacing: '0.4px', textTransform: 'uppercase', marginTop: '-1px' }}>
                  Mod Portal
                </div>
              </div>
            </div>
          </div>

          {/* NAVIGATION SECTIONS */}
          <nav className="mod-nav-container">
            {/* GROUP 1: TỔNG QUAN */}
            <div className="mod-nav-group-label">TỔNG QUAN</div>
            <button 
              className={`mod-nav-link ${activeModTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveModTab('dashboard')}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <LayoutDashboard size={16} />
                </div>
                <span className="mod-nav-text">Dashboard</span>
              </div>
            </button>

            {/* GROUP 2: KIỂM DUYỆT */}
            <div className="mod-nav-group-label" style={{ marginTop: '0.85rem' }}>KIỂM DUYỆT</div>
            <button 
              className={`mod-nav-link ${activeModTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveModTab('queue')}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <CheckCircle size={16} />
                </div>
                <span className="mod-nav-text">Hàng đợi duyệt bài</span>
              </div>
              <span className="mod-badge-count">{moderationItems.length}</span>
            </button>

            <button 
              className={`mod-nav-link ${activeModTab === 'detail' ? 'active' : ''}`}
              onClick={() => {
                if (!inspectingItem && moderationItems.length > 0) {
                  setInspectingItem(moderationItems[0]);
                }
                setActiveModTab('detail');
              }}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <FileText size={16} />
                </div>
                <span className="mod-nav-text">Chi tiết bài viết</span>
              </div>
            </button>

            <button 
              className={`mod-nav-link ${activeModTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveModTab('history')}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <History size={16} />
                </div>
                <span className="mod-nav-text">Lịch sử duyệt bài</span>
              </div>
            </button>

            {/* GROUP 3: CÀI ĐẶT & TÀI KHOẢN */}
            <div className="mod-nav-group-label" style={{ marginTop: '0.85rem' }}>CÀI ĐẶT & TÀI KHOẢN</div>
            <button 
              className={`mod-nav-link ${activeModTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveModTab('profile')}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <User size={16} />
                </div>
                <span className="mod-nav-text">Trang cá nhân &amp; Cài đặt</span>
              </div>
            </button>
          </nav>
        </div>

        {/* BOTTOM USER PILL: Lê Tuệ Tâm — Moderator */}
        <div className="mod-sidebar-footer">
          <div className="mod-user-card">
            <div className="mod-user-avatar" style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ffffff' }}>
              TT
            </div>
            <div className="mod-user-info">
              <div className="mod-user-name">Lê Tuệ Tâm</div>
              <div className="mod-user-role">Moderator</div>
            </div>
            <button 
              className="mod-logout-btn" 
              title="Đăng xuất khỏi phiên làm việc"
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn đăng xuất khỏi phiên kiểm duyệt?')) {
                  logout();
                  if (onNavigate) onNavigate('home');
                }
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          MAIN WORKSPACE CONTENT AREA
          ========================================================================= */}
      <div className="mod-workspace-main">
        {/* TOPBAR */}
        <header className="mod-topbar">
          {/* LEFT PILL: Moderation Workspace */}
          <div className="mod-topbar-pill">
            <span className="mod-pulse-dot"></span>
            <span>Moderation Workspace</span>
          </div>

          {/* SEARCH BAR */}
          <div className="mod-topbar-search">
            <Search size={16} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm kiếm công thức, tác giả, id kiểm duyệt..."
              value={topSearchQuery}
              onChange={(e) => setTopSearchQuery(e.target.value)}
            />
            {topSearchQuery && (
              <button 
                onClick={() => setTopSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* RIGHT ACTION ICONS */}
          <div className="mod-topbar-right">
            {/* Quick Home link */}
            <button 
              className="mod-topbar-icon-btn" 
              title="Về Trang chủ Website"
              onClick={() => onNavigate && onNavigate('home')}
            >
              <ArrowLeft size={17} />
            </button>

            {/* Theme Toggle icon */}
            <button className="mod-topbar-icon-btn" title="Chế độ sáng/tối">
              <Sun size={17} />
            </button>

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="mod-topbar-icon-btn" 
                title="Thông báo hệ thống"
                onClick={() => showToast('🔔 Bạn có 4 bài viết ưu tiên cao cần xử lý trước 16:30!')}
              >
                <Bell size={17} />
              </button>
              <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #ffffff' }}></span>
            </div>

            {/* User Avatar Circle */}
            <div 
              className="mod-avatar-circle"
              title="Lê Tuệ Tâm (Moderator)"
              onClick={() => setActiveModTab('profile')}
            >
              <span>TT</span>
            </div>
          </div>
        </header>

        {/* BODY CONTAINER */}
        <main className="mod-body-content">
          {/* =========================================================================
              VIEW 1: DASHBOARD (MAIN OVERVIEW SCREEN FROM USER IMAGE)
              ========================================================================= */}
          {activeModTab === 'dashboard' && (
            <div className="mod-dashboard-view">
              {/* 1. HERO GREETING BANNER */}
              <div className="mod-hero-banner">
                <div className="mod-hero-left">
                  <div className="mod-hero-tag">
                    <span className="mod-hero-tag-dot"></span>
                    <span>TRỢ LÝ AI ĐANG HOẠT ĐỘNG • PHIÊN BẢN 3.4</span>
                  </div>
                  <h1 className="mod-hero-title">
                    Xin chào, Kiểm duyệt viên Tuệ Tâm! 🌿
                  </h1>
                  <p className="mod-hero-sub">
                    Hôm nay có <strong>18 bài viết</strong> và <strong>32 bình luận</strong> đang chờ bạn phê duyệt. Thuật toán VeggieAI đã hoàn tất tiền kiểm tra an toàn dinh dưỡng và tiêu chuẩn cộng đồng thuần chay.
                  </p>
                </div>

                <div className="mod-hero-right">
                  <div className="mod-shift-card">
                    <div className="mod-shift-label">TRỰC CA HIỆN TẠI</div>
                    <div className="mod-shift-time">08:30 – 16:30</div>
                    <span className="mod-shift-badge">Đạt SLA 100%</span>
                  </div>

                  <button 
                    className="mod-start-auto-btn"
                    onClick={handleStartAutoReview}
                  >
                    <Play size={15} fill="#064e3b" color="#064e3b" />
                    <span>Bắt đầu duyệt tự động</span>
                  </button>
                </div>
              </div>

              {/* 2. STATS OVERVIEW CARDS (4 COLUMNS) */}
              <div className="mod-stats-grid">
                {/* Card 1: Đang chờ duyệt */}
                <div className="mod-stat-card">
                  <div className="mod-stat-header">
                    <span className="mod-stat-label">ĐANG CHỜ DUYỆT</span>
                    <div className="mod-stat-icon-wrap amber">
                      <Clock size={18} color="#d97706" />
                    </div>
                  </div>
                  <div className="mod-stat-value">18</div>
                  <div className="mod-stat-footer">
                    <span className="mod-badge-danger">4 ưu tiên cao</span>
                    <span className="mod-stat-hint">cần xử lý trong 1h</span>
                  </div>
                </div>

                {/* Card 2: Đã duyệt hôm nay */}
                <div className="mod-stat-card">
                  <div className="mod-stat-header">
                    <span className="mod-stat-label">ĐÃ DUYỆT HÔM NAY</span>
                    <div className="mod-stat-icon-wrap green">
                      <CheckCircle size={18} color="#059669" />
                    </div>
                  </div>
                  <div className="mod-stat-value">46</div>
                  <div className="mod-stat-footer">
                    <span className="mod-stat-hint">Tỷ lệ chấp thuận:</span>
                    <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>88.4%</strong>
                  </div>
                </div>

                {/* Card 3: Bị từ chối / Vi phạm */}
                <div className="mod-stat-card">
                  <div className="mod-stat-header">
                    <span className="mod-stat-label">BỊ TỪ CHỐI / VI PHẠM</span>
                    <div className="mod-stat-icon-wrap red">
                      <Slash size={18} color="#dc2626" />
                    </div>
                  </div>
                  <div className="mod-stat-value" style={{ color: '#dc2626' }}>6</div>
                  <div className="mod-stat-footer">
                    <span className="mod-stat-hint" style={{ color: '#64748b' }}>
                      <span style={{ color: '#dc2626', marginRight: '4px' }}>⊘</span>
                      Spam, sai định lượng thuần chay
                    </span>
                  </div>
                </div>

                {/* Card 4: Thời gian phản hồi TB */}
                <div className="mod-stat-card">
                  <div className="mod-stat-header">
                    <span className="mod-stat-label">THỜI GIAN PHẢN HỒI TB</span>
                    <div className="mod-stat-icon-wrap blue">
                      <Zap size={18} color="#2563eb" />
                    </div>
                  </div>
                  <div className="mod-stat-value">
                    14<span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b', marginLeft: '3px' }}>phút</span>
                  </div>
                  <div className="mod-stat-footer">
                    <span style={{ color: '#059669', fontSize: '0.74rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ArrowUpRight size={13} /> Nhanh hơn 53%
                    </span>
                    <span className="mod-stat-hint">(SLA: 30p)</span>
                  </div>
                </div>
              </div>

              {/* 3. MAIN CONTENT: 2 COLUMNS (LEFT 68% - RIGHT 32%) */}
              <div className="mod-content-2col">
                {/* LEFT COLUMN: PRIORITY LIST & PROGRESS CHART */}
                <div className="mod-col-left">
                  {/* CARD 1: BÀI VIẾT CẦN DUYỆT ƯU TIÊN */}
                  <div className="mod-panel-card">
                    {/* Header */}
                    <div className="mod-panel-header">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <h2 className="mod-panel-title">Bài viết cần duyệt ưu tiên</h2>
                          <span className="mod-badge-count-green">{moderationItems.length} bài mới</span>
                        </div>
                        <p className="mod-panel-sub">Đã sắp xếp theo mức độ cảnh báo AI và thời gian gửi</p>
                      </div>

                      <div className="mod-panel-actions">
                        <button 
                          className={`mod-filter-btn ${isAiFlagFilterActive ? 'active' : ''}`}
                          onClick={() => {
                            setIsAiFlagFilterActive(!isAiFlagFilterActive);
                            showToast(isAiFlagFilterActive ? 'Đang hiển thị tất cả bài viết' : 'Đã lọc: Chỉ hiển thị bài có cảnh báo AI Flag');
                          }}
                        >
                          <Filter size={14} />
                          <span>Lọc AI Flag</span>
                        </button>

                        <button 
                          className="mod-batch-approve-btn"
                          onClick={handleBatchApproveSafe}
                        >
                          <CheckCircle2 size={15} />
                          <span>Duyệt hàng loạt an toàn</span>
                        </button>
                      </div>
                    </div>

                    {/* Table Column Label */}
                    <div className="mod-list-col-header">
                      <span>TIÊU ĐỀ &amp; TÁC GIẢ</span>
                      <span>THAO TÁC XỬ LÝ</span>
                    </div>

                    {/* Items List */}
                    <div className="mod-items-list">
                      {filteredItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="mod-item-row">
                          <div className="mod-item-main">
                            <img 
                              src={item.thumbnail} 
                              alt={item.title} 
                              className="mod-item-thumb"
                            />
                            <div className="mod-item-info">
                              <h3 
                                className="mod-item-title"
                                onClick={() => {
                                  setInspectingItem(item);
                                  setActiveModTab('detail');
                                }}
                              >
                                {item.title}
                              </h3>
                              <div className="mod-item-meta">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <User size={13} color="#64748b" />
                                  <span className="mod-item-author">{item.author}</span>
                                </div>
                                <span className="mod-meta-sep">•</span>
                                {/* User instruction: Chỉ giữ tên tác giả đơn thuần. Dùng điểm uy tín (số) thay vì nhãn cấp bậc/danh xưng */}
                                <div className="mod-trust-score-badge">
                                  <Shield size={12} color={item.trustScore >= 90 ? '#059669' : '#d97706'} />
                                  <span>Điểm uy tín: <strong>{item.trustScore}/100</strong></span>
                                </div>
                                {item.warningTag && (
                                  <>
                                    <span className="mod-meta-sep">•</span>
                                    <span className="mod-warning-pill">{item.warningTag}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mod-item-actions">
                            <button 
                              className="mod-btn-action view"
                              title="Soi chi tiết công thức & AI phân tích"
                              onClick={() => {
                                setInspectingItem(item);
                                setActiveModTab('detail');
                              }}
                            >
                              <Eye size={14} />
                              <span>Soi chi tiết</span>
                            </button>
                            <button 
                              className="mod-btn-action approve"
                              title="Phê duyệt bài viết"
                              onClick={() => handleApproveItem(item)}
                            >
                              <Check size={14} />
                              <span>Duyệt nhanh</span>
                            </button>
                            <button 
                              className="mod-btn-action reject"
                              title="Từ chối có kèm lý do"
                              onClick={() => handleOpenRejectModal(item)}
                            >
                              <X size={14} />
                              <span>Từ chối</span>
                            </button>
                          </div>
                        </div>
                      ))}

                      {filteredItems.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                          <CheckCircle2 size={36} color="#10b981" style={{ margin: '0 auto 0.75rem auto' }} />
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>Không có bài viết nào khớp bộ lọc</div>
                          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Hàng đợi duyệt bài hiện đang sạch sẽ hoặc không khớp từ khóa tìm kiếm.</div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mod-panel-footer">
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Hiển thị {Math.min(3, filteredItems.length)} trong tổng số {moderationItems.length} bài cần duyệt ưu tiên
                      </span>
                      <button 
                        className="mod-view-all-link"
                        onClick={() => setActiveModTab('queue')}
                      >
                        <span>Xem toàn bộ hàng đợi duyệt</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* CARD 2: TIẾN ĐỘ KIỂM DUYỆT TUẦN NÀY (KPI AREA CHART) */}
                  <div className="mod-panel-card" style={{ marginTop: '1.25rem' }}>
                    <div className="mod-panel-header" style={{ alignItems: 'flex-start' }}>
                      <div>
                        <h2 className="mod-panel-title">Tiến độ kiểm duyệt tuần này</h2>
                        <p className="mod-panel-sub">So sánh thực tế xử lý với KPI cam kết (Mục tiêu 300 bài/tuần)</p>
                      </div>

                      {/* Legend */}
                      <div className="mod-chart-legend">
                        <div className="mod-legend-item">
                          <span className="mod-legend-dot green"></span>
                          <span>Đã phê duyệt</span>
                        </div>
                        <div className="mod-legend-item">
                          <span className="mod-legend-dot red"></span>
                          <span>Bị từ chối</span>
                        </div>
                        <div className="mod-legend-item">
                          <span className="mod-legend-line-dashed"></span>
                          <span>Mục tiêu KPI</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Interactive Area Chart */}
                    <div className="mod-chart-container">
                      <svg viewBox="0 0 700 180" className="mod-chart-svg">
                        <defs>
                          <linearGradient id="areaGreenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>

                        {/* Background Grid Lines */}
                        <line x1="50" y1="30" x2="660" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="50" y1="75" x2="660" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="50" y1="120" x2="660" y2="120" stroke="#f1f5f9" strokeWidth="1" />

                        {/* KPI Dashed Line (Target = 50 items/day) */}
                        <line x1="50" y1="75" x2="660" y2="75" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 4" />
                        <text x="665" y="79" fill="#0284c7" fontSize="10" fontWeight="700" textAnchor="start">KPI chuẩn: 50 bài/ngày</text>

                        {/* Green Area Curve */}
                        <path 
                          d="M 80 135 C 130 130, 180 110, 220 95 C 260 80, 310 90, 350 85 C 390 80, 440 100, 480 88 C 520 75, 570 65, 620 68 L 620 150 L 80 150 Z" 
                          fill="url(#areaGreenGrad)" 
                        />
                        {/* Green Line Curve */}
                        <path 
                          d="M 80 135 C 130 130, 180 110, 220 95 C 260 80, 310 90, 350 85 C 390 80, 440 100, 480 88 C 520 75, 570 65, 620 68" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="2.5" 
                        />

                        {/* Points on Green Line */}
                        <circle cx="80" cy="135" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="220" cy="95" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="350" cy="85" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="480" cy="88" r="4.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="620" cy="68" r="5" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />

                        {/* Rejected bars (Red/Orange small bars at bottom) */}
                        <rect x="76" y="142" width="8" height="8" rx="2" fill="#ef4444" />
                        <rect x="216" y="138" width="8" height="12" rx="2" fill="#ef4444" />
                        <rect x="346" y="145" width="8" height="5" rx="2" fill="#ef4444" />
                        <rect x="476" y="140" width="8" height="10" rx="2" fill="#ef4444" />
                        <rect x="616" y="136" width="8" height="14" rx="2" fill="#ef4444" />

                        {/* X-Axis Labels */}
                        <text x="80" y="168" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Thứ 2</text>
                        <text x="220" y="168" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Thứ 3</text>
                        <text x="350" y="168" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Thứ 4</text>
                        <text x="480" y="168" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Thứ 5</text>
                        <text x="560" y="168" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Thứ 6</text>
                        <text x="620" y="168" fill="#059669" fontSize="11" fontWeight="800" textAnchor="middle">Hôm nay</text>
                      </svg>
                    </div>

                    {/* Bottom Alert Progress */}
                    <div className="mod-progress-summary-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }}></span>
                        <span style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                          Tổng cộng <strong>284/300 bài</strong> tuần này. Bạn đang <strong>vượt tiến độ tuần 14%</strong>.
                        </span>
                      </div>
                      <button 
                        className="mod-download-report-btn"
                        onClick={() => {
                          showToast('📥 Đang xuất báo cáo kiểm duyệt tuần định dạng CSV...');
                          setTimeout(() => showToast('✅ Đã tải xuống báo cáo kiểm duyệt tuần thành công!'), 1000);
                        }}
                      >
                        <Download size={13} />
                        <span>Tải báo cáo chi tiết</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: RULES, METRICS (NO GAMIFICATION), SHORTCUTS */}
                <div className="mod-col-right">
                  {/* CARD 1: QUY CHUẨN KIỂM DUYỆT NHANH (v2.4) */}
                  <div className="mod-panel-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1rem' }}>📍</span>
                        <h2 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Quy chuẩn kiểm duyệt nhanh</h2>
                      </div>
                      <span className="mod-version-pill">v2.4</span>
                    </div>

                    {/* Rule 1: Tuyệt đối cấm */}
                    <div className="mod-rule-item red">
                      <div className="mod-rule-title red">
                        <AlertCircle size={14} color="#dc2626" />
                        <span>Tuyệt đối cấm (Từ chối ngay)</span>
                      </div>
                      <ul className="mod-rule-list">
                        <li>Thịt, hải sản, phụ phẩm động vật.</li>
                        <li>Gelatin động vật, mỡ lợn, mắm tôm/cá.</li>
                        <li>Hình ảnh phản cảm hoặc spam link ngoài.</li>
                      </ul>
                    </div>

                    {/* Rule 2: Gắn nhãn Ngũ Vị Tân & Macro */}
                    <div className="mod-rule-item amber">
                      <div className="mod-rule-title amber">
                        <AlertTriangle size={14} color="#d97706" />
                        <span>Gắn nhãn Ngũ Vị Tân &amp; Macro</span>
                      </div>
                      <p className="mod-rule-desc">
                        Nếu công thức có hành, hẹ, tỏi, nén, kiệu: Chọn <strong>"Thuần chay có ngũ vị tân"</strong>, không từ chối nếu tác giả khai báo rõ.
                      </p>
                    </div>

                    {/* Rule 3: Chuẩn Calo & Macro AI */}
                    <div className="mod-rule-item green">
                      <div className="mod-rule-title green">
                        <Sparkles size={14} color="#059669" />
                        <span>Chuẩn Calo &amp; Macro AI</span>
                      </div>
                      <p className="mod-rule-desc">
                        Công thức phải ghi rõ khối lượng (gram/ml) cho từng nguyên liệu để AI tính toán chính xác hàm lượng Protein thực vật.
                      </p>
                    </div>
                  </div>

                  {/* CARD 2: CHỈ SỐ CHẤT LƯỢNG KIỂM DUYỆT (ĐÃ BỎ "TOP 2 MOD" VÀ "TIỀN THƯỞNG" THEO YÊU CẦU) */}
                  <div className="mod-panel-card" style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <h2 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Chỉ số chất lượng kiểm duyệt</h2>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Tháng này</span>
                    </div>

                    {/* Pure Operational Metrics */}
                    <div className="mod-performance-clean-box">
                      {/* Gauge */}
                      <div className="mod-gauge-wrap">
                        <svg viewBox="0 0 100 100" className="mod-gauge-svg">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                          <circle 
                            cx="50" 
                            cy="50" 
                            r="42" 
                            fill="none" 
                            stroke="#059669" 
                            strokeWidth="8" 
                            strokeDasharray="264" 
                            strokeDashoffset="8" 
                            strokeLinecap="round" 
                            transform="rotate(-90 50 50)" 
                          />
                        </svg>
                        <div className="mod-gauge-center">
                          <span className="mod-gauge-num">98.4%</span>
                          <span className="mod-gauge-text">Chuẩn xác</span>
                        </div>
                      </div>

                      {/* Pure Numbers (No gamification, no salary reward) */}
                      <div className="mod-perf-data-list">
                        <div className="mod-perf-data-row">
                          <span className="mod-perf-lbl">Tổng đã xử lý:</span>
                          <span className="mod-perf-val"><strong>1.120</strong> bài</span>
                        </div>
                        <div className="mod-perf-data-row">
                          <span className="mod-perf-lbl">Độ trễ khiếu nại:</span>
                          <span className="mod-perf-val" style={{ color: '#059669' }}><strong>&lt; 0.6%</strong></span>
                        </div>
                        <div className="mod-perf-data-row">
                          <span className="mod-perf-lbl">Điểm chất lượng:</span>
                          <span className="mod-perf-val"><strong>4.95 / 5.0</strong> ⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: PHÍM TẮT THAO TÁC NHANH */}
                  <div className="mod-panel-card" style={{ marginTop: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.95rem' }}>⌨️</span>
                      <h2 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Phím tắt thao tác nhanh</h2>
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.85rem' }}>
                      Tối ưu tốc độ phê duyệt khi xem ở chế độ tập trung:
                    </p>

                    <div className="mod-shortcuts-table">
                      <div className="mod-shortcut-row">
                        <span className="mod-shortcut-action">Duyệt bài hiện tại</span>
                        <kbd className="mod-kbd">Space</kbd>
                      </div>
                      <div className="mod-shortcut-row">
                        <span className="mod-shortcut-action">Từ chối có kèm lý do mẫu</span>
                        <kbd className="mod-kbd">R</kbd>
                      </div>
                      <div className="mod-shortcut-row">
                        <span className="mod-shortcut-action">Chuyển sang bài tiếp theo</span>
                        <kbd className="mod-kbd">→ Phím phải</kbd>
                      </div>
                      <div className="mod-shortcut-row">
                        <span className="mod-shortcut-action">Yêu cầu AI phân tích sâu</span>
                        <kbd className="mod-kbd">A</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 2: HÀNG ĐỢI DUYỆT BÀI (MODERATION QUEUE - IMAGE 1 & 2 FEEDBACK)
              ========================================================================= */}
          {activeModTab === 'queue' && (
            <div className="mod-queue-container">
              {/* TOP HEADER: Breadcrumb, Title, Subtitle, SLA stat, Batch action */}
              <div className="mod-queue-top-row">
                <div>
                  <div className="mod-queue-breadcrumb-tag">
                    <ShieldCheck size={14} color="#059669" />
                    <span>TRUNG TÂM VẬN HÀNH NỘI DUNG</span>
                  </div>
                  <h1 className="mod-queue-title">Hàng Đợi Duyệt Bài (Moderation Queue)</h1>
                  <p className="mod-queue-sub">
                    Danh sách bài viết blog, công thức món chay và video do cộng đồng gửi lên chờ kiểm duyệt chất lượng và tính chuẩn xác dinh dưỡng.
                  </p>
                </div>

                <div className="mod-queue-top-actions">
                  <div className="mod-sla-stat-pill">
                    <Clock size={16} color="#0284c7" />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>SLA trung bình:</div>
                      <strong>18 phút</strong>
                    </div>
                  </div>

                  <button className="mod-batch-receive-btn" onClick={handleBatchReceive}>
                    <CheckSquare size={16} />
                    <span>Nhận bài hàng loạt</span>
                  </button>
                </div>
              </div>

              {/* 4 KPI METRIC CARDS */}
              <div className="mod-queue-kpi-grid">
                <div className="mod-queue-kpi-card">
                  <div>
                    <div className="mod-queue-kpi-label">ĐANG CHỜ XỬ LÝ</div>
                    <div className="mod-queue-kpi-value">
                      18 <span className="mod-queue-kpi-sub">bài</span>
                    </div>
                  </div>
                  <div className="mod-queue-kpi-icon-box green">
                    <FileText size={20} />
                  </div>
                </div>

                <div className="mod-queue-kpi-card">
                  <div>
                    <div className="mod-queue-kpi-label">AI CẢNH BÁO RỦI RO</div>
                    <div className="mod-queue-kpi-value">
                      04 <span className="mod-queue-kpi-sub">bài gắn cờ</span>
                    </div>
                  </div>
                  <div className="mod-queue-kpi-icon-box coral">
                    <Bot size={20} />
                  </div>
                </div>

                <div className="mod-queue-kpi-card">
                  <div>
                    <div className="mod-queue-kpi-label">TỶ LỆ SẠCH AI (&gt;95%)</div>
                    <div className="mod-queue-kpi-value">
                      83.4%
                    </div>
                  </div>
                  <div className="mod-queue-kpi-icon-box emerald">
                    <ShieldCheck size={20} />
                  </div>
                </div>

                <div className="mod-queue-kpi-card">
                  <div>
                    <div className="mod-queue-kpi-label">VI PHẠM SLA HÔM NAY</div>
                    <div className="mod-queue-kpi-value">
                      0 <span className="mod-queue-kpi-sub">trường hợp</span>
                    </div>
                  </div>
                  <div className="mod-queue-kpi-icon-box red">
                    <Clock size={20} />
                  </div>
                </div>
              </div>

              {/* STATUS FILTER TABS */}
              <div className="mod-queue-tabs-row">
                <button 
                  className={`mod-queue-tab-btn ${queueTab === 'all' ? 'active' : ''}`}
                  onClick={() => { setQueueTab('all'); setQueueCurrentPage(1); }}
                >
                  <span>Tất cả</span>
                  <span className="mod-tab-count-badge">18</span>
                </button>

                <button 
                  className={`mod-queue-tab-btn ${queueTab === 'new' ? 'active' : ''}`}
                  onClick={() => { setQueueTab('new'); setQueueCurrentPage(1); }}
                >
                  <span>Mới gửi</span>
                  <span className="mod-tab-count-badge">11</span>
                </button>

                <button 
                  className={`mod-queue-tab-btn ${queueTab === 'flagged' ? 'active' : ''}`}
                  onClick={() => { setQueueTab('flagged'); setQueueCurrentPage(1); }}
                >
                  <Bot size={13} />
                  <span>AI Gắn cờ cần chú ý</span>
                  <span className="mod-tab-count-badge">4</span>
                </button>

                <button 
                  className={`mod-queue-tab-btn ${queueTab === 'revision' ? 'active' : ''}`}
                  onClick={() => { setQueueTab('revision'); setQueueCurrentPage(1); }}
                >
                  <span>Chờ tác giả chỉnh sửa</span>
                  <span className="mod-tab-count-badge">3</span>
                </button>
              </div>

              {/* FILTER & SEARCH BAR */}
              <div className="mod-queue-filter-bar">
                <div className="mod-queue-search-row">
                  <div className="mod-queue-search-input-wrap">
                    <Search size={15} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Tìm tiêu đề, tác giả hoặc ID..."
                      value={queueSearch}
                      onChange={(e) => { setQueueSearch(e.target.value); setQueueCurrentPage(1); }}
                    />
                    {queueSearch && (
                      <button 
                        onClick={() => setQueueSearch('')}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <button 
                    className="mod-queue-search-filter-btn" 
                    title="Tuỳ chọn bộ lọc nâng cao"
                  >
                    <SlidersHorizontal size={15} />
                  </button>
                </div>

                <div className="mod-queue-cat-row">
                  <div className="mod-queue-cat-pills">
                    <span className="mod-queue-cat-label">Danh mục:</span>
                    <button 
                      className={`mod-queue-cat-pill-btn ${queueCategory === 'all' ? 'active' : ''}`}
                      onClick={() => { setQueueCategory('all'); setQueueCurrentPage(1); }}
                    >
                      Tất cả danh mục
                    </button>
                    <button 
                      className={`mod-queue-cat-pill-btn ${queueCategory === 'nutrition' ? 'active' : ''}`}
                      onClick={() => { setQueueCategory('nutrition'); setQueueCurrentPage(1); }}
                    >
                      Dinh dưỡng &amp; Vi chất
                    </button>
                    <button 
                      className={`mod-queue-cat-pill-btn ${queueCategory === 'cooking' ? 'active' : ''}`}
                      onClick={() => { setQueueCategory('cooking'); setQueueCurrentPage(1); }}
                    >
                      Bí quyết nấu ăn
                    </button>
                    <button 
                      className={`mod-queue-cat-pill-btn ${queueCategory === 'seasonal' ? 'active' : ''}`}
                      onClick={() => { setQueueCategory('seasonal'); setQueueCurrentPage(1); }}
                    >
                      Công thức theo mùa
                    </button>
                    <button 
                      className={`mod-queue-cat-pill-btn ${queueCategory === 'video' ? 'active' : ''}`}
                      onClick={() => { setQueueCategory('video'); setQueueCurrentPage(1); }}
                    >
                      Video thực hành
                    </button>
                  </div>

                  <div className="mod-queue-ai-filter-wrap">
                    <span className="mod-queue-ai-filter-label">Bộ lọc AI:</span>
                    <select 
                      className="mod-queue-ai-filter-select"
                      value={queueAiFilter}
                      onChange={(e) => { setQueueAiFilter(e.target.value); setQueueCurrentPage(1); }}
                    >
                      <option value="all">Tất cả mức độ rủi ro</option>
                      <option value="safe">An toàn (&gt;95%)</option>
                      <option value="warning">Cảnh báo rủi ro / Thuần chay</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE CONTAINER */}
              <div className="mod-queue-table-card">
                <table className="mod-queue-table">
                  <thead>
                    <tr>
                      <th style={{ width: '34%' }}>THÔNG TIN BÀI ĐĂNG</th>
                      <th style={{ width: '18%' }}>TÁC GIẢ &amp; UY TÍN</th>
                      <th style={{ width: '24%' }}>PHÂN TÍCH AI (PRE-SCREENING)</th>
                      <th style={{ width: '12%' }}>THỜI GIAN &amp; SLA</th>
                      <th style={{ width: '12%', textAlign: 'right' }}>HÀNH ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQueueItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                          <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>Không có bài viết nào phù hợp bộ lọc</div>
                          <div style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Thử xóa từ khóa tìm kiếm hoặc chọn danh mục khác.</div>
                        </td>
                      </tr>
                    ) : (
                      paginatedQueueItems.map(item => (
                        <tr key={item.id}>
                          {/* COL 1: THÔNG TIN BÀI ĐĂNG */}
                          <td>
                            <div className="mod-post-info-box">
                              <div className="mod-post-thumb-wrap">
                                <img src={item.thumbnail} alt={item.title} className="mod-post-thumb-img" />
                                <span className="mod-post-thumb-label">{item.typeTag || 'Công thức'}</span>
                              </div>
                              <div>
                                <span className={`mod-post-cat-badge ${item.category || item.typeCode}`}>
                                  {item.type}
                                </span>
                                <h4 
                                  className="mod-post-name"
                                  onClick={() => {
                                    setInspectingItem(item);
                                    setActiveModTab('detail');
                                  }}
                                  title="Nhấn để xem chi tiết bài viết"
                                >
                                  {item.title}
                                </h4>
                                <p className="mod-post-excerpt">{item.excerpt}</p>
                              </div>
                            </div>
                          </td>

                          {/* COL 2: TÁC GIẢ & UY TÍN (Strictly: Name + verified check + stats, NO titles/ranks) */}
                          <td>
                            <div className="mod-author-cell">
                              <img src={item.authorAvatar || modAvatar} alt={item.author} className="mod-author-avatar-img" />
                              <div className="mod-author-details">
                                <div className="mod-author-name-row">
                                  <span className="mod-author-display-name">{item.author}</span>
                                  {item.isVerified && (
                                    <CheckCircle2 size={13} color="#059669" className="mod-author-verified-icon" />
                                  )}
                                </div>
                                <div className="mod-author-stat-line">
                                  <Sprout size={12} color="#059669" />
                                  <span>{item.authorStats || `${item.trustScore} điểm uy tín`}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* COL 3: PHÂN TÍCH AI (PRE-SCREENING) */}
                          <td>
                            <div className="mod-ai-screening-box">
                              <div className="mod-ai-bar-header">
                                <span className="mod-ai-percent-num">{item.aiConfidence}%</span>
                                <div className="mod-ai-progress-track">
                                  <div 
                                    className="mod-ai-progress-fill" 
                                    style={{ 
                                      width: `${item.aiConfidence}%`,
                                      background: item.aiConfidence >= 90 ? '#10b981' : item.aiConfidence >= 70 ? '#f97316' : '#ef4444'
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className={`mod-ai-result-badge ${item.aiStatus === 'safe' ? 'safe' : item.aiStatus === 'warning' ? 'warning' : 'standard'}`}>
                                {item.aiStatus === 'safe' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                <span>{item.aiBadgeLabel}</span>
                              </div>
                              <p className={`mod-ai-explain-txt ${item.aiStatus === 'warning' ? 'danger-note' : ''}`}>
                                {item.aiSummary}
                              </p>
                            </div>
                          </td>

                          {/* COL 4: THỜI GIAN & SLA */}
                          <td>
                            <div className="mod-time-sla-box">
                              <span className="mod-time-ago-txt">{item.submittedAt}</span>
                              <div className={`mod-sla-countdown-pill ${item.slaStatus === 'warning' ? 'warning' : 'normal'}`}>
                                <Clock size={11} />
                                <span>{item.slaRemaining}</span>
                              </div>
                            </div>
                          </td>

                          {/* COL 5: HÀNH ĐỘNG */}
                          <td style={{ textAlign: 'right' }}>
                            <div className="mod-table-actions-cell">
                              <button 
                                className={`mod-tbl-btn-primary ${item.actionType === 'handle' ? 'handle' : 'approve'}`}
                                onClick={() => {
                                  setInspectingItem(item);
                                  setActiveModTab('detail');
                                }}
                              >
                                {item.actionType === 'handle' ? 'Xem & Xử lý' : 'Xem & Duyệt'}
                              </button>
                              
                              {item.actionType === 'handle' ? (
                                <button 
                                  className="mod-tbl-btn-quick-action warning" 
                                  title="Xem chi tiết và xử lý vi phạm"
                                  onClick={() => {
                                    setInspectingItem(item);
                                    setActiveModTab('detail');
                                  }}
                                >
                                  <MessageSquare size={14} />
                                </button>
                              ) : (
                                <button 
                                  className="mod-tbl-btn-quick-check" 
                                  title="Duyệt nhanh bài viết"
                                  onClick={() => handleApproveItem(item)}
                                >
                                  <Check size={14} />
                                </button>
                              )}

                              <button 
                                className="mod-tbl-btn-more" 
                                title="Thêm thao tác"
                                onClick={() => showToast(`Tuỳ chọn quản lý cho bài viết #${item.id}`)}
                              >
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* PAGINATION BAR */}
                <div className="mod-queue-pagination-bar">
                  <div className="mod-queue-pagination-info">
                    Hiển thị <strong>{filteredQueueItems.length > 0 ? `${(queueCurrentPage - 1) * queueItemsPerPage + 1}–${Math.min(queueCurrentPage * queueItemsPerPage, filteredQueueItems.length)}` : '0'}</strong> trong số <strong>{filteredQueueItems.length} bài chờ duyệt</strong>
                  </div>
                  <div className="mod-queue-pagination-pages">
                    <button 
                      className="mod-page-btn" 
                      disabled={queueCurrentPage === 1}
                      onClick={() => setQueueCurrentPage(p => Math.max(1, p - 1))}
                      title="Trang trước"
                    >
                      <ChevronLeft size={13} />
                    </button>
                    <button 
                      className={`mod-page-btn ${queueCurrentPage === 1 ? 'active' : ''}`}
                      onClick={() => setQueueCurrentPage(1)}
                    >
                      1
                    </button>
                    {filteredQueueItems.length > queueItemsPerPage && (
                      <button 
                        className={`mod-page-btn ${queueCurrentPage === 2 ? 'active' : ''}`}
                        onClick={() => setQueueCurrentPage(2)}
                      >
                        2
                      </button>
                    )}
                    {filteredQueueItems.length > queueItemsPerPage * 2 && (
                      <button 
                        className={`mod-page-btn ${queueCurrentPage === 3 ? 'active' : ''}`}
                        onClick={() => setQueueCurrentPage(3)}
                      >
                        3
                      </button>
                    )}
                    <button 
                      className="mod-page-btn"
                      disabled={queueCurrentPage * queueItemsPerPage >= filteredQueueItems.length}
                      onClick={() => setQueueCurrentPage(p => p + 1)}
                      title="Trang sau"
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM AI STATUS BANNER */}
              <div className="mod-queue-bottom-ai-card">
                <div className="mod-queue-bottom-ai-left">
                  <div className="mod-bottom-ai-icon">
                    <Sparkles size={18} />
                  </div>
                  <div className="mod-bottom-ai-content">
                    <h4>Công nghệ AI Assistant Moderation đang hoạt động</h4>
                    <p>Hệ thống đang tự động quét kiểm tra thành phần vi phạm quy chuẩn thuần chay, độc tố dị ứng và đối soát từ khóa y tế theo thời gian thực.</p>
                  </div>
                </div>
                <div className="mod-bottom-ai-badge">
                  <span className="mod-bottom-ai-pulse"></span>
                  <span>Engine v3.4 Active</span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: CHI TIẾT BÀI VIẾT (MODERATOR POST DETAIL VIEW) - PIXEL PERFECT
              ========================================================================= */}
          {activeModTab === 'detail' && (() => {
            const currItem = inspectingItem || moderationItems[0];
            const ingredientsList = currItem?.ingredientsTable || (currItem?.ingredients || []).map((ing, idx) => ({
              name: ing.name,
              amount: ing.amount,
              calories: `${Math.round(40 + idx * 35)} kcal`,
              origin: idx % 2 === 0 ? 'Rau củ hữu cơ' : 'Hạt dưỡng chất',
              originColor: idx % 2 === 0 ? 'blue' : 'purple',
              status: ing.status === 'violation' ? 'Cảnh báo' : 'Hợp lệ'
            }));

            const stepsList = currItem?.instructionsSteps || [
              {
                step: 1,
                title: 'Sơ chế rau củ và hạt dưỡng chất',
                img: currItem?.thumbnail || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
                desc: 'Bí đỏ gọt vỏ, thái quân cờ vừa ăn khoảng 3x3cm (không thái quá mỏng để tránh nát khi hầm). Hạt sen rửa sạch lấy tim đắng nếu có. Hạt điều ngâm nước ấm 20 phút cho nở mềm rồi vớt ráo.'
              },
              {
                step: 2,
                title: 'Kích hoạt tầng hương gia vị thực dưỡng',
                img: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400',
                desc: 'Đun 1 thìa dầu mè nguyên chất, cho sả đập dập và bột cà ri vào phi nhỏ lửa cho dậy mùi thơm ấm áp. Cho bí đỏ và hạt sen vào đảo đều trong 3 phút để áo đều lớp gia vị vàng óng tự nhiên.'
              },
              {
                step: 3,
                title: 'Hầm chậm cùng nước cốt dừa và hạt điều',
                img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
                desc: currItem?.instructions || 'Đổ 400ml nước dùng rau củ đun sôi, hạ lửa riu riu hầm trong 15 phút. Khi bí và hạt sen vừa chín mềm tới, cho hạt điều cùng 200ml cốt dừa vào khuấy nhẹ tay. Nêm 1 thìa tương tamari và một nhúm muối hồng Himalaya rồi tắt bếp sau 3 phút.'
              }
            ];

            const itemMacros = currItem?.macros || {
              calo: '568 kcal',
              protein: '11.4g',
              proteinDv: '13% DV',
              carbs: '38.2g',
              carbsDv: '54% DV',
              fat: '16.8g',
              fatDv: '25% DV',
              fiber: '7.5g',
              fiberDv: '28% DV'
            };

            const tipContent = currItem?.macrobioticTip || 'Bí đỏ mang năng lượng Dương ấm nồng, phối hợp cùng hạt sen thanh tâm an thần và cốt dừa giúp cân bằng thể trạng trong những ngày tiết trời chuyển lạnh. Tránh nêm bột ngọt hóa học hoặc đường tinh luyện làm mất đi vị ngọt hậu thanh tao tự nhiên của củ và hạt sen.';

            const handleNextPost = () => {
              const currentIndex = moderationItems.findIndex(i => i.id === currItem.id);
              const nextIndex = (currentIndex + 1) % moderationItems.length;
              setInspectingItem(moderationItems[nextIndex]);
              showToast(`Đã chuyển sang bài viết #${moderationItems[nextIndex].id}`);
            };

            const handleDetailApproveAndPublish = (item) => {
              handleApproveItem(item);
              showToast(`🎉 Đã phê duyệt và xuất bản công thức #${item.id} thành công!`);
              handleNextPost();
            };

            const handleDetailRequestRevision = (item) => {
              showToast(`📩 Đã gửi yêu cầu tác giả ${item.author} chỉnh sửa công thức #${item.id}!`);
            };

            const handleDetailReject = (item) => {
              handleOpenRejectModal(item);
            };

            return (
              <div className="mod-detail-page-wrap">
                {/* 1. TOP NAV BREADCRUMB & ACTION BAR */}
                <div className="mod-detail-top-nav-bar">
                  <div className="mod-detail-nav-left">
                    <button 
                      className="mod-detail-back-btn" 
                      onClick={() => setActiveModTab('queue')}
                      title="Quay lại Hàng đợi duyệt bài"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <span className="mod-detail-post-id">Mã #{currItem.id}</span>
                    <span className="mod-detail-status-pill">Chờ phê duyệt</span>
                    <span className="mod-detail-meta-dot">•</span>
                    <span className="mod-detail-author-meta">
                      <User size={13} color="#64748b" />
                      <span>Tác giả: <strong>{currItem.author}</strong></span>
                    </span>
                    <span className="mod-detail-meta-dot">•</span>
                    <span className="mod-detail-time-meta">{currItem.submittedAt}</span>
                  </div>

                  <div className="mod-detail-nav-actions">
                    <button 
                      className="mod-detail-btn-reject"
                      onClick={() => handleDetailReject(currItem)}
                    >
                      <X size={15} />
                      <span>Từ chối</span>
                    </button>

                    <button 
                      className="mod-detail-btn-revision"
                      onClick={() => handleDetailRequestRevision(currItem)}
                    >
                      <Edit2 size={14} />
                      <span>Yêu cầu sửa</span>
                    </button>

                    <button 
                      className="mod-detail-btn-approve"
                      onClick={() => handleDetailApproveAndPublish(currItem)}
                    >
                      <Check size={16} />
                      <span>Phê duyệt &amp; Xuất bản</span>
                    </button>

                    <button 
                      className="mod-detail-btn-next"
                      onClick={handleNextPost}
                      title="Chuyển sang bài chờ duyệt tiếp theo"
                    >
                      <SkipForward size={16} />
                    </button>
                  </div>
                </div>

                {/* 2. MAIN 2-COLUMN GRID CONTAINER */}
                <div className="mod-detail-grid-container">
                  {/* LEFT COLUMN: RECIPE CONTENT & NUTRITION & INSTRUCTIONS */}
                  <div className="mod-detail-content-col">
                    {/* HERO RECIPE CARD */}
                    <div className="mod-detail-hero-card">
                      <img 
                        src={currItem.coverImage || currItem.thumbnail} 
                        alt={currItem.title} 
                        className="mod-detail-hero-img" 
                      />
                      <div className="mod-detail-hero-overlay"></div>
                      
                      <div className="mod-detail-hero-top-badges">
                        <span className="mod-hero-tag-vegan">
                          <Sprout size={13} />
                          <span>{currItem.veganBadge || 'Thuần chay 100%'}</span>
                        </span>
                        <span className="mod-hero-tag-time">
                          <Clock size={13} />
                          <span>{currItem.cookTime || '45 Phút'}</span>
                        </span>
                      </div>

                      <div className="mod-detail-hero-bottom">
                        <span className="mod-hero-category-chip">
                          {currItem.dietCategory || 'ẨM THỰC THỰC DƯỠNG OHSAWA'}
                        </span>
                        <h1 className="mod-hero-title-text">
                          {currItem.title}
                        </h1>
                      </div>
                    </div>

                    {/* AUTHOR PROFILE BAR */}
                    <div className="mod-detail-author-card">
                      <div className="mod-detail-author-left">
                        <div className="mod-detail-author-avatar">
                          {currItem.authorInitials || (currItem.author ? currItem.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'TT')}
                        </div>
                        <div className="mod-detail-author-info">
                          <div className="mod-detail-author-name">
                            <span>{currItem.author}</span>
                            {currItem.isVerified && (
                              <CheckCircle2 size={16} color="#059669" />
                            )}
                          </div>
                          <div className="mod-detail-author-stats">
                            {currItem.authorStats || '142 công thức đã duyệt'}
                          </div>
                        </div>
                      </div>
                      <div className="mod-detail-author-right-meta">
                        <div className="time-label">Thời gian nộp: {currItem.submittedDateFull || '26/10/2024 - 10:42'}</div>
                        <div className="servings-label">Khẩu phần: {currItem.servings || '4 Người ăn'}</div>
                      </div>
                    </div>

                    {/* NUTRITIONAL MACRO METRICS */}
                    <div className="mod-detail-card">
                      <div className="mod-detail-section-header">
                        <h3 className="mod-detail-section-title">
                          <Sprout size={17} color="#059669" />
                          <span>Chỉ số dinh dưỡng dự tính (Mỗi khẩu phần)</span>
                        </h3>
                        <span className="mod-detail-total-kcal">
                          Tổng: {itemMacros.calo || '568 kcal'}
                        </span>
                      </div>

                      <div className="mod-nutrition-grid">
                        <div className="mod-nutrition-box">
                          <div className="mod-nutrition-lbl">PROTEIN</div>
                          <div className="mod-nutrition-val">{itemMacros.protein || '11.4g'}</div>
                          <div className="mod-nutrition-dv">{itemMacros.proteinDv || '13% DV'}</div>
                        </div>
                        <div className="mod-nutrition-box">
                          <div className="mod-nutrition-lbl">CARBOHYDRATE</div>
                          <div className="mod-nutrition-val">{itemMacros.carbs || '38.2g'}</div>
                          <div className="mod-nutrition-dv">{itemMacros.carbsDv || '54% DV'}</div>
                        </div>
                        <div className="mod-nutrition-box">
                          <div className="mod-nutrition-lbl">CHẤT BÉO TỐT</div>
                          <div className="mod-nutrition-val">{itemMacros.fat || '16.8g'}</div>
                          <div className="mod-nutrition-dv">{itemMacros.fatDv || '25% DV'}</div>
                        </div>
                        <div className="mod-nutrition-box">
                          <div className="mod-nutrition-lbl">CHẤT XƠ TỰ NHIÊN</div>
                          <div className="mod-nutrition-val">{itemMacros.fiber || '7.5g'}</div>
                          <div className="mod-nutrition-dv">{itemMacros.fiberDv || '28% DV'}</div>
                        </div>
                      </div>
                    </div>

                    {/* INGREDIENTS TABLE */}
                    <div className="mod-detail-card">
                      <div className="mod-detail-section-header">
                        <h3 className="mod-detail-section-title">
                          <FileText size={17} color="#059669" />
                          <span>Bảng phân tích thành phần &amp; Định lượng</span>
                        </h3>
                      </div>

                      <div className="mod-ingredients-table-wrap">
                        <table className="mod-ingredients-table">
                          <thead>
                            <tr>
                              <th>NGUYÊN LIỆU</th>
                              <th>KHỐI LƯỢNG</th>
                              <th>NĂNG LƯỢNG</th>
                              <th>GỐC THỰC VẬT</th>
                              <th>TRẠNG THÁI</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ingredientsList.map((ing, idx) => (
                              <tr key={idx}>
                                <td><strong>{ing.name}</strong></td>
                                <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>{ing.amount}</td>
                                <td>{ing.calories || `${100 + idx * 40} kcal`}</td>
                                <td>
                                  <span className={`mod-origin-pill ${ing.originColor || (idx % 2 === 0 ? 'blue' : 'purple')}`}>
                                    {ing.origin || 'Rau củ hữu cơ'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`mod-status-valid-pill ${ing.status === 'Vi phạm' || ing.status === 'Cảnh báo' ? 'warning' : ''}`}>
                                    <Check size={12} />
                                    <span>{ing.status || 'Hợp lệ'}</span>
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* COOKING INSTRUCTIONS */}
                    <div className="mod-detail-card">
                      <div className="mod-detail-section-header">
                        <h3 className="mod-detail-section-title">
                          <Utensils size={17} color="#059669" />
                          <span>Hướng dẫn chi tiết các bước chế biến</span>
                        </h3>
                      </div>

                      <div className="mod-steps-list">
                        {stepsList.map((stepItem) => (
                          <div key={stepItem.step} className="mod-step-card">
                            <img src={stepItem.img} alt={stepItem.title} className="mod-step-thumb" />
                            <div className="mod-step-body">
                              <div className="mod-step-header">
                                <span className="mod-step-num-badge">{stepItem.step}</span>
                                <h4 className="mod-step-title">{stepItem.title}</h4>
                              </div>
                              <p className="mod-step-desc">{stepItem.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AUTHOR MACROBIOTIC TIP CARD */}
                    <div className="mod-author-tip-card">
                      <div className="mod-tip-icon-wrap">
                        <MapPin size={18} />
                      </div>
                      <div className="mod-tip-content">
                        <h4 className="mod-tip-title">Mẹo thực dưỡng Ohsawa từ tác giả</h4>
                        <p className="mod-tip-body">{tipContent}</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: AI PRE-SCREENING & MOD DECISION PANEL */}
                  <div className="mod-detail-sidebar-col">
                    {/* CARD 1: AI PRE-SCREENING */}
                    <div className="mod-sidebar-card">
                      <div className="mod-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <Sparkles size={17} color="#059669" />
                          <h3 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Trợ lý AI Pre-Screening</h3>
                        </div>
                        <span className="mod-ai-auto-badge">Tự động 100%</span>
                      </div>

                      <div className="mod-ai-gauge-box">
                        <div className="mod-circle-meter">
                          {currItem.aiConfidence || 100}%
                        </div>
                        <div className="mod-gauge-info">
                          <div className="mod-gauge-title">Đạt tiêu chuẩn thuần chay</div>
                          <p className="mod-gauge-desc">
                            {currItem.aiSummary || 'Không phát hiện mỡ động vật, bơ sữa bò, trứng hoặc phụ gia gelatin.'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="mod-sidebar-field-label">GỢI Ý PHÂN LOẠI THẺ (AI TAGS):</div>
                        <div className="mod-ai-tags-wrap">
                          {['#MonTheoMua +', '#TangDeKhang +', '#MonKhoHam +', '#DuongSinhOhsawa'].map((tag, tIdx) => {
                            const pureTag = tag.replace(' +', '');
                            const isSelected = detailSelectedTags.includes(pureTag);
                            return (
                              <button
                                key={tIdx}
                                className={`mod-ai-tag-pill ${isSelected ? 'active' : ''}`}
                                onClick={() => {
                                  if (isSelected) {
                                    setDetailSelectedTags(detailSelectedTags.filter(t => t !== pureTag));
                                  } else {
                                    setDetailSelectedTags([...detailSelectedTags, pureTag]);
                                    showToast(`Đã thêm thẻ ${pureTag} vào danh mục bài viết`);
                                  }
                                }}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: KIỂM TRA AN TOÀN & NGÔN TỪ */}
                    <div className="mod-sidebar-card">
                      <div className="mod-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <ShieldCheck size={17} color="#059669" />
                          <h3 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Kiểm tra An toàn &amp; Ngôn từ</h3>
                        </div>
                        <span className="mod-safe-score-badge">99.8% Sạch</span>
                      </div>

                      <div className="mod-safety-list">
                        <div className="mod-safety-item">
                          <div className="mod-safety-item-left">
                            <CheckCircle2 size={14} color="#059669" />
                            <span>Ngôn từ chuẩn mực, tôn trọng</span>
                          </div>
                          <span className="mod-safe-pill">0 vi phạm</span>
                        </div>

                        <div className="mod-safety-item">
                          <div className="mod-safety-item-left">
                            <CheckCircle2 size={14} color="#059669" />
                            <span>Liên kết ngoài / Tiếp thị liên kết</span>
                          </div>
                          <span className="mod-safe-pill">Không có</span>
                        </div>

                        <div className="mod-safety-item">
                          <div className="mod-safety-item-left">
                            <CheckCircle2 size={14} color="#059669" />
                            <span>Bản quyền hình ảnh xác thực</span>
                          </div>
                          <span className="mod-safe-pill">Nguyên bản 100%</span>
                        </div>
                      </div>
                    </div>

                    {/* CARD 3: QUYẾT ĐỊNH CỦA KIỂM DUYỆT VIÊN */}
                    <div className="mod-sidebar-card">
                      <div className="mod-card-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                          <User size={16} color="#b45309" />
                          <h3 className="mod-panel-title" style={{ fontSize: '0.88rem' }}>Quyết định của Kiểm duyệt viên</h3>
                        </div>
                      </div>

                      <div className="mod-sidebar-field-label">PHÂN MỤC BỮA ĂN</div>
                      <div className="mod-meal-segment-grid">
                        <button 
                          className={`mod-meal-seg-btn ${detailMealCategory === 'main' ? 'active' : ''}`}
                          onClick={() => setDetailMealCategory('main')}
                        >
                          Món chính
                        </button>
                        <button 
                          className={`mod-meal-seg-btn ${detailMealCategory === 'side' ? 'active' : ''}`}
                          onClick={() => setDetailMealCategory('side')}
                        >
                          Món phụ/canh
                        </button>
                        <button 
                          className={`mod-meal-seg-btn ${detailMealCategory === 'dessert' ? 'active' : ''}`}
                          onClick={() => setDetailMealCategory('dessert')}
                        >
                          Tráng miệng
                        </button>
                      </div>

                      <div 
                        className="mod-expert-cert-box"
                        onClick={() => setDetailIsExpertCertified(!detailIsExpertCertified)}
                      >
                        <input 
                          type="checkbox" 
                          checked={detailIsExpertCertified} 
                          onChange={(e) => setDetailIsExpertCertified(e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div>
                          <div className="mod-cert-title">Chứng nhận Chuyên gia VeggieAI</div>
                          <div className="mod-cert-sub">Gắn huy hiệu uy tín xuất hiện trên trang chủ ứng dụng và tab thịnh hành.</div>
                        </div>
                      </div>

                      <div>
                        <div className="mod-sidebar-field-label">GHI CHÚ NỘI BỘ HOẶC PHẢN HỒI GỬI TÁC GIẢ</div>
                        <textarea 
                          className="mod-feedback-textarea"
                          placeholder="Ví dụ: Công thức định lượng chuẩn, ảnh chụp đẹp. Đề xuất thêm chú thích nhiệt độ sôi..."
                          value={detailInternalFeedback}
                          onChange={(e) => setDetailInternalFeedback(e.target.value)}
                        />
                      </div>

                      <div className="mod-detail-mod-status">
                        <span>Kiểm duyệt viên: <strong>{modProfileData.fullName || 'Lê Tuệ Tâm'}</strong></span>
                        <span style={{ color: '#94a3b8' }}>•</span>
                        <span className="status-dot"></span>
                        <span style={{ color: '#059669' }}>Đang trực tuyến</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              VIEW 4: LỊCH SỬ DUYỆT BÀI CỦA TÔI (MODERATOR AUDIT & HISTORY) - MATCHING MOCKUP
              ========================================================================= */}
          {activeModTab === 'history' && (() => {
            const filteredRecords = historyAuditRecords.filter((rec) => {
              if (historySearch.trim()) {
                const q = historySearch.toLowerCase();
                const match = rec.id.toLowerCase().includes(q) ||
                  rec.title.toLowerCase().includes(q) ||
                  rec.author.toLowerCase().includes(q) ||
                  rec.tag.toLowerCase().includes(q);
                if (!match) return false;
              }
              if (historyStatusFilter === 'published' && rec.decision !== 'published') return false;
              if (historyStatusFilter === 'rejected' && rec.decision !== 'rejected') return false;
              if (historyStatusFilter === 'revision' && rec.decision !== 'revision') return false;
              return true;
            });

            return (
              <div className="mod-history-page-wrap">
                {/* 1. TOP BREADCRUMB & HEADER TITLE ROW */}
                <div>
                  <div className="mod-history-breadcrumb">
                    <ShieldCheck size={15} />
                    <span>Hồ sơ kiểm duyệt viên #MOD-8821</span>
                    <span style={{ color: '#cbd5e1' }}>/</span>
                    <span style={{ color: '#475569' }}>{modProfileData.fullName || 'Lê Minh Trí'}</span>
                  </div>

                  <div className="mod-history-title-row">
                    <div>
                      <h1 className="mod-history-main-title">Lịch Sử Duyệt Bài Của Tôi</h1>
                      <p className="mod-history-subtitle">
                        Theo dõi toàn bộ bài viết, công thức và bình luận bạn đã phê duyệt hoặc từ chối, kèm nhật ký kiểm tra và đối soát chất lượng dữ liệu dinh dưỡng thực vật.
                      </p>
                    </div>

                    <div className="mod-history-header-actions">
                      <button 
                        className="mod-history-btn-audit"
                        onClick={() => showToast('⚙️ Bảng cấu hình Audit Trail & Định danh SHA-256 đã kích hoạt.')}
                      >
                        <SlidersHorizontal size={15} />
                        <span>Cấu hình Audit</span>
                      </button>

                      <button 
                        className="mod-history-btn-export"
                        onClick={() => showToast('📥 Đang xuất 1.428 bản ghi nhật ký kiểm duyệt (Excel/CSV)...')}
                      >
                        <Download size={15} />
                        <span>Xuất nhật ký (Excel/CSV)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. TOP 4 KPI CARDS */}
                <div className="mod-history-kpi-grid">
                  {/* KPI 1 */}
                  <div className="mod-history-kpi-card">
                    <div className="mod-kpi-top-row">
                      <span className="mod-kpi-title">TỔNG SỐ ĐÃ XỬ LÝ</span>
                      <div className="mod-kpi-icon-wrap cyan">
                        <FileText size={16} />
                      </div>
                    </div>
                    <div className="mod-kpi-value-row">
                      <span className="mod-kpi-big-num">1,428</span>
                    </div>
                    <div className="mod-kpi-subtext" style={{ color: '#059669', fontWeight: 700 }}>
                      ↗ +18.4% so với tháng trước
                    </div>
                    <div className="mod-kpi-bar teal"></div>
                  </div>

                  {/* KPI 2 */}
                  <div className="mod-history-kpi-card">
                    <div className="mod-kpi-top-row">
                      <span className="mod-kpi-title">ĐÃ DUYỆT XUẤT BẢN</span>
                      <div className="mod-kpi-icon-wrap green">
                        <CheckCircle2 size={16} />
                      </div>
                    </div>
                    <div className="mod-kpi-value-row">
                      <span className="mod-kpi-big-num">1,285</span>
                      <span className="mod-kpi-percent-badge green">90%</span>
                    </div>
                    <div className="mod-kpi-subtext">
                      Công thức đạt tiêu chuẩn thuần chay
                    </div>
                    <div className="mod-kpi-bar green"></div>
                  </div>

                  {/* KPI 3 */}
                  <div className="mod-history-kpi-card">
                    <div className="mod-kpi-top-row">
                      <span className="mod-kpi-title">YÊU CẦU SỬA / TỪ CHỐI</span>
                      <div className="mod-kpi-icon-wrap pink">
                        <MessageSquare size={16} />
                      </div>
                    </div>
                    <div className="mod-kpi-value-row">
                      <span className="mod-kpi-big-num" style={{ color: '#c2410c' }}>143</span>
                      <span className="mod-kpi-percent-badge amber">10%</span>
                    </div>
                    <div className="mod-kpi-subtext">
                      112 sửa vi chất • 31 vi phạm chuẩn
                    </div>
                    <div className="mod-kpi-bar orange"></div>
                  </div>

                  {/* KPI 4 */}
                  <div className="mod-history-kpi-card">
                    <div className="mod-kpi-top-row">
                      <span className="mod-kpi-title">ĐỘ HÀI LÒNG TÁC GIẢ</span>
                      <div className="mod-kpi-icon-wrap mint">
                        <Smile size={16} />
                      </div>
                    </div>
                    <div className="mod-kpi-value-row">
                      <span className="mod-kpi-big-num" style={{ color: '#047857' }}>99.2%</span>
                      <span className="mod-kpi-percent-badge csat">CSAT</span>
                    </div>
                    <div className="mod-kpi-subtext">
                      Dựa trên 820 lượt đánh giá phản hồi
                    </div>
                    <div className="mod-kpi-bar blue"></div>
                  </div>
                </div>

                {/* 3. FILTER & SEARCH CARD */}
                <div className="mod-history-filter-card">
                  <div className="mod-history-search-wrap">
                    <Search size={16} color="#94a3b8" />
                    <input 
                      type="text" 
                      placeholder="Tìm theo ID bài viết (#VEC-1092), tên công thức, tác giả..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                    {historySearch && (
                      <button 
                        onClick={() => setHistorySearch('')}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="mod-history-filter-row">
                    {/* PERIOD */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <span className="mod-history-filter-lbl">KỲ LỌC:</span>
                      <div className="mod-history-period-group">
                        <button 
                          className={`mod-period-btn ${historyPeriod === 'today' ? 'active' : ''}`}
                          onClick={() => setHistoryPeriod('today')}
                        >
                          Hôm nay
                        </button>
                        <button 
                          className={`mod-period-btn ${historyPeriod === 'week' ? 'active' : ''}`}
                          onClick={() => setHistoryPeriod('week')}
                        >
                          Tuần này
                        </button>
                        <button 
                          className={`mod-period-btn ${historyPeriod === 'month' ? 'active' : ''}`}
                          onClick={() => setHistoryPeriod('month')}
                        >
                          Tháng này
                        </button>
                        <button 
                          className={`mod-period-btn ${historyPeriod === 'custom' ? 'active' : ''}`}
                          onClick={() => {
                            setHistoryPeriod('custom');
                            showToast('📅 Chọn khoảng thời gian tùy chỉnh...');
                          }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Calendar size={12} />
                          <span>Tùy chỉnh ngày</span>
                        </button>
                      </div>
                    </div>

                    {/* STATUS PILLS */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mod-history-filter-lbl">TRẠNG THÁI:</span>
                      <div className="mod-history-status-pills">
                        <button 
                          className={`mod-status-filter-pill ${historyStatusFilter === 'all' ? 'active' : ''}`}
                          onClick={() => setHistoryStatusFilter('all')}
                        >
                          Tất cả kết quả (1,428)
                        </button>
                        <button 
                          className={`mod-status-filter-pill ${historyStatusFilter === 'published' ? 'active' : ''}`}
                          onClick={() => setHistoryStatusFilter('published')}
                          style={{ color: historyStatusFilter === 'published' ? '#ffffff' : '#059669', borderColor: '#bbf7d0' }}
                        >
                          ● Đã xuất bản (1,285)
                        </button>
                        <button 
                          className={`mod-status-filter-pill ${historyStatusFilter === 'rejected' ? 'active' : ''}`}
                          onClick={() => setHistoryStatusFilter('rejected')}
                          style={{ color: historyStatusFilter === 'rejected' ? '#ffffff' : '#dc2626', borderColor: '#fecaca' }}
                        >
                          ● Từ chối (31)
                        </button>
                        <button 
                          className={`mod-status-filter-pill ${historyStatusFilter === 'revision' ? 'active' : ''}`}
                          onClick={() => setHistoryStatusFilter('revision')}
                          style={{ color: historyStatusFilter === 'revision' ? '#ffffff' : '#d97706', borderColor: '#fde68a' }}
                        >
                          ● Yêu cầu sửa đổi (112)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mod-history-ai-line">
                    <Sparkles size={14} color="#059669" />
                    <span>AI Auto-Compliance Check v3.4 Active</span>
                  </div>
                </div>

                {/* 4. TABLE CONTAINER CARD */}
                <div className="mod-history-table-card">
                  <div className="mod-history-table-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mod-table-header-title">Chi tiết bản ghi kiểm duyệt</span>
                      <span className="mod-table-count-badge">Hiển thị {filteredRecords.length} / 1,428</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: '#64748b' }}>
                      <span>Tự động đồng bộ hóa cách đây 1 phút</span>
                      <button 
                        onClick={() => showToast('🔄 Đã cập nhật và đồng bộ nhật ký kiểm duyệt mới nhất!')}
                        style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                        title="Đồng bộ hóa lại"
                      >
                        <RefreshCw size={13} />
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="mod-history-table">
                      <thead>
                        <tr>
                          <th>MÃ BÀI &amp; TIÊU ĐỀ</th>
                          <th>TÁC GIẢ</th>
                          <th>QUYẾT ĐỊNH CỦA BẠN</th>
                          <th>THỜI GIAN &amp; HIỆU SUẤT</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRecords.length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                              Không tìm thấy bản ghi kiểm duyệt nào khớp với tiêu chí tìm kiếm.
                            </td>
                          </tr>
                        ) : (
                          filteredRecords.map((item) => (
                            <tr key={item.id}>
                              {/* COL 1: POST & TITLE */}
                              <td>
                                <div className="mod-hist-post-cell">
                                  {item.isProhibited ? (
                                    <div className="mod-hist-prohibit-icon" title="Vi phạm quy chuẩn">
                                      <Slash size={22} />
                                    </div>
                                  ) : (
                                    <div className="mod-hist-thumb-wrap">
                                      <img src={item.thumbnail} alt={item.title} />
                                      <span className={`mod-hist-thumb-badge ${item.thumbBadge === 'NUTRI' ? 'nutri' : item.thumbBadge === 'BLOG' ? 'blog' : ''}`}>
                                        {item.thumbBadge}
                                      </span>
                                    </div>
                                  )}

                                  <div className="mod-hist-post-info">
                                    <span className="mod-hist-post-tag" style={{ color: item.isDangerMeta ? '#dc2626' : '#b45309' }}>
                                      {item.tag}
                                    </span>
                                    <h4 
                                      className="mod-hist-post-title"
                                      onClick={() => {
                                        const found = moderationItems.find(i => i.id === item.id) || {
                                          id: item.id,
                                          title: item.title,
                                          author: item.author,
                                          thumbnail: item.thumbnail || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
                                          submittedAt: item.date,
                                          type: item.tag,
                                          trustScore: 98,
                                          status: item.decision
                                        };
                                        setInspectingItem(found);
                                        setActiveModTab('detail');
                                      }}
                                    >
                                      {item.title}
                                    </h4>
                                    <div className="mod-hist-post-meta">
                                      {item.isDangerMeta ? (
                                        <span className="mod-hist-danger-note">{item.meta}</span>
                                      ) : item.isWarningMeta ? (
                                        <span style={{ color: '#d97706', fontWeight: 700 }}>{item.meta}</span>
                                      ) : (
                                        <span>{item.meta}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* COL 2: AUTHOR (CLEAN NAME ONLY - NO TITLES AS PER IMAGE 2) */}
                              <td>
                                <div className="mod-hist-author-cell">
                                  <div 
                                    className="mod-hist-author-avatar"
                                    style={{ background: item.authorAvatarBg, color: item.authorAvatarColor }}
                                  >
                                    {item.authorInitials}
                                  </div>
                                  <span className="mod-hist-author-name">{item.author}</span>
                                </div>
                              </td>

                              {/* COL 3: YOUR DECISION */}
                              <td>
                                {item.decision === 'published' && (
                                  <span className="mod-hist-decision-pill published">
                                    <Check size={13} />
                                    <span>{item.decisionLabel}</span>
                                  </span>
                                )}
                                {item.decision === 'revision' && (
                                  <span className="mod-hist-decision-pill revision">
                                    <Edit2 size={13} />
                                    <span>{item.decisionLabel}</span>
                                  </span>
                                )}
                                {item.decision === 'rejected' && (
                                  <span className="mod-hist-decision-pill rejected">
                                    <X size={13} />
                                    <span>{item.decisionLabel}</span>
                                  </span>
                                )}
                              </td>

                              {/* COL 4: TIME & SLA */}
                              <td>
                                <div className="mod-hist-time-cell">
                                  <span className="mod-hist-datetime">{item.date}</span>
                                  <span className={`mod-hist-sla ${item.slaType}`}>
                                    <Clock size={11} />
                                    <span>{item.slaTime}</span>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* PAGINATION BAR */}
                  <div className="mod-history-pagination">
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                      Hiển thị <strong>1 – 6</strong> trong tổng số <strong>1,428</strong> kết quả kiểm duyệt
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.74rem', color: '#64748b' }}>
                        <span>Mỗi trang:</span>
                        <select 
                          value={historyItemsPerPage}
                          onChange={(e) => setHistoryItemsPerPage(e.target.value)}
                          className="mod-page-select"
                        >
                          <option value="10 bài">10 bài</option>
                          <option value="20 bài">20 bài</option>
                          <option value="50 bài">50 bài</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button className="mod-page-btn" title="Trang đầu">«</button>
                        <button className="mod-page-btn" title="Trang trước">‹</button>
                        <button className="mod-page-btn active">1</button>
                        <button className="mod-page-btn">2</button>
                        <button className="mod-page-btn">3</button>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0 0.2rem' }}>...</span>
                        <button className="mod-page-btn">72</button>
                        <button className="mod-page-btn" title="Trang sau">›</button>
                        <button className="mod-page-btn" title="Trang cuối">»</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. BOTTOM AUDIT TRAIL HASH CARD */}
                <div className="mod-history-audit-box">
                  <div className="mod-audit-left">
                    <div className="mod-audit-shield-icon">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <div className="mod-audit-title-line">
                        <h4 className="mod-audit-title">Tính toàn vẹn nhật ký &amp; Đối chiếu tự động (Audit Trail Hash)</h4>
                        <span className="mod-audit-immutable-pill">Immutable Log</span>
                      </div>
                      <p className="mod-audit-subtext">
                        Mỗi quyết định phê duyệt đều được ký số mã băm SHA-256 nội bộ để đảm bảo tính khách quan và minh bạch của hội đồng kiểm duyệt nội dung dinh dưỡng VeggieAI.
                      </p>
                    </div>
                  </div>

                  <button 
                    className="mod-audit-report-btn"
                    onClick={() => showToast('📜 Đang mở Báo cáo đối soát tính toàn vẹn (SHA-256) tuần 42...')}
                  >
                    Xem báo cáo đối soát tuần
                  </button>
                </div>
              </div>
            );
          })()}

          {/* =========================================================================
              VIEW 5: TRANG CÁ NHÂN & CÀI ĐẶT MODERATOR
              ========================================================================= */}
          {activeModTab === 'profile' && (
            <div className="mod-profile-view">
              {/* Top breadcrumb bar & online status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                  <ShieldCheck size={16} />
                  <span>Không gian điều hành cá nhân</span>
                  <span style={{ color: '#94a3b8' }}>•</span>
                  <span style={{ color: '#64748b' }}>Hệ thống VeggieAI v3.4</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.76rem', fontWeight: 700, color: '#065f46' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  <span>Trạng thái: Trực tuyến</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="mod-view-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h1 className="mod-view-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    Hồ Sơ Cá Nhân &amp; Cài Đặt Kiểm Duyệt Viên
                  </h1>
                  <p className="mod-view-sub" style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Cập nhật thông tin chuyên môn, chứng chỉ thẩm định và cấu hình thông báo kiểm duyệt cho quy trình đánh giá công thức chuẩn nông nghiệp sạch.
                  </p>
                </div>
              </div>

              {/* Two-Column Grid Layout */}
              <div className="mod-profile-layout">
                {/* LEFT COLUMN: Summary Card + Subnav + Guideline */}
                <div className="mod-profile-left-col">
                  <div className="mod-profile-summary-box">
                    {/* Hidden file input for avatar upload */}
                    <input 
                      type="file" 
                      ref={modAvatarInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*"
                      onChange={handleModAvatarChange}
                    />
                    <div className="mod-profile-avatar-wrap">
                      <img 
                        src={modAvatar} 
                        alt="Moderator Avatar" 
                        className="mod-profile-avatar-img"
                      />
                      <button 
                        type="button" 
                        className="mod-profile-cam-btn"
                        title="Thay đổi ảnh đại diện"
                        onClick={() => modAvatarInputRef.current?.click()}
                      >
                        <Camera size={14} />
                      </button>
                    </div>

                    <h2 className="mod-profile-name">
                      <span>{modProfileData.fullName}</span>
                      <CheckCircle2 size={16} color="#0284c7" fill="#e0f2fe" />
                    </h2>

                    {/* Role badge: Moderator */}
                    <div className="mod-profile-role-badge">
                      {modProfileData.roleTitle}
                    </div>

                    {/* Stats 2-Column */}
                    <div className="mod-profile-stats-row">
                      <div className="mod-profile-stat-box">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#10b981', marginBottom: '2px' }}>
                          <CheckCircle2 size={15} />
                        </div>
                        <div className="mod-profile-stat-val">1,420</div>
                        <div className="mod-profile-stat-lbl">Bài đã kiểm duyệt</div>
                      </div>
                      <div className="mod-profile-stat-box">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', color: '#f59e0b', marginBottom: '2px' }}>
                          <Award size={15} />
                        </div>
                        <div className="mod-profile-stat-val">
                          4.98 <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>/ 5.0</span>
                        </div>
                        <div className="mod-profile-stat-lbl">Điểm chất lượng</div>
                      </div>
                    </div>

                    {/* Rule 4 & 5: Bỏ "Nutritionist Master" & "Top Mentor 2024" */}
                    <div className="mod-profile-certs-section">
                      <div className="mod-profile-certs-title">CHỨNG CHỈ THẨM ĐỊNH</div>
                      <div className="mod-cert-pill-list">
                        <div className="mod-cert-pill">
                          <ShieldCheck size={14} />
                          <span>Food Safety ISO</span>
                        </div>
                        <div className="mod-cert-pill">
                          <Sparkles size={14} />
                          <span>Tiêu chuẩn Thuần Chay VeggieAI</span>
                        </div>
                      </div>
                    </div>

                    {/* Sparkline Performance */}
                    <div className="mod-profile-perf-box">
                      <div className="mod-perf-box-header">
                        <span>Hiệu suất 7 ngày qua</span>
                        <span style={{ color: '#059669', fontWeight: 800 }}>+18.4%</span>
                      </div>
                      <svg viewBox="0 0 200 45" style={{ width: '100%', height: '36px', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="modSparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path 
                          d="M 0 32 Q 35 36, 65 24 T 120 18 T 160 8 T 200 14" 
                          fill="none" 
                          stroke="#059669" 
                          strokeWidth="2.5" 
                        />
                        <path 
                          d="M 0 32 Q 35 36, 65 24 T 120 18 T 160 8 T 200 14 L 200 45 L 0 45 Z" 
                          fill="url(#modSparkGrad)" 
                        />
                        <circle cx="200" cy="14" r="3.5" fill="#059669" stroke="#ffffff" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Vertical Subnav */}
                  <div className="mod-profile-subnav">
                    <button 
                      type="button"
                      className={`mod-subnav-btn ${profileSubTab === 'account' ? 'active' : ''}`}
                      onClick={() => setProfileSubTab('account')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <User size={16} />
                        <span>Thông tin tài khoản</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    <button 
                      type="button"
                      className={`mod-subnav-btn ${profileSubTab === 'filters' ? 'active' : ''}`}
                      onClick={() => {
                        setProfileSubTab('filters');
                        showToast('⚙️ Cấu hình bộ lọc duyệt bài ưu tiên');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Sliders size={16} />
                        <span>Cấu hình bộ lọc duyệt bài</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    <button 
                      type="button"
                      className={`mod-subnav-btn ${profileSubTab === 'notifications' ? 'active' : ''}`}
                      onClick={() => {
                        setProfileSubTab('notifications');
                        showToast('🔔 Cài đặt thông báo & cam kết SLA');
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Bell size={16} />
                        <span>Thông báo &amp; SLA</span>
                      </div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#fee2e2', color: '#dc2626', padding: '0.1rem 0.45rem', borderRadius: '9999px' }}>
                        4 mới
                      </span>
                    </button>
                    <button 
                      type="button"
                      className={`mod-subnav-btn ${profileSubTab === 'security' ? 'active' : ''}`}
                      onClick={() => {
                        setProfileSubTab('security');
                        const secEl = document.getElementById('mod-security-section');
                        if (secEl) secEl.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Key size={16} />
                        <span>Bảo mật 2FA &amp; Khóa ký</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* VeggieAI Guideline Note */}
                  <div className="mod-guideline-note-card">
                    <div className="mod-guideline-header">
                      <Bookmark size={15} />
                      <span>Ghi chú quy chuẩn VeggieAI</span>
                    </div>
                    <p className="mod-guideline-text">
                      Tất cả công thức chứa chất bảo quản tự nhiên hoặc men cấy Koji cần đính kèm chú thích về nhiệt độ ủ chính xác để đạt tiêu chuẩn xuất bản thư viện.
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN: Section 1, Section 2 (Rejection Templates), Section 3 (Security), Footer */}
                <div className="mod-profile-main-col">
                  {/* 1. THÔNG TIN CÁ NHÂN & CHUYÊN MÔN */}
                  <div className="mod-section-card">
                    <div className="mod-section-header-row">
                      <div className="mod-section-title-wrap">
                        <div className="mod-section-icon-square green">
                          <FileText size={18} />
                        </div>
                        <div>
                          <h3 className="mod-section-title">1. Thông Tin Cá Nhân &amp; Chuyên Môn</h3>
                          <p className="mod-section-subtitle">
                            Dữ liệu hiển thị trong biên bản thẩm định công thức và phân công tự động
                          </p>
                        </div>
                      </div>
                      <div style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', fontWeight: 800, padding: '0.25rem 0.65rem', borderRadius: '6px', letterSpacing: '0.5px' }}>
                        ID: MOD-8829
                      </div>
                    </div>

                    {/* 2-col inputs */}
                    <div className="mod-form-grid-2col">
                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Họ và tên</label>
                        <div className="mod-field-input-box">
                          <User size={15} color="#94a3b8" />
                          <input 
                            type="text" 
                            value={modProfileData.fullName}
                            onChange={(e) => setModProfileData({ ...modProfileData, fullName: e.target.value })}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                      </div>

                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Email công vụ</label>
                        <div className="mod-field-input-box">
                          <Globe size={15} color="#94a3b8" />
                          <input 
                            type="email" 
                            value={modProfileData.email}
                            onChange={(e) => setModProfileData({ ...modProfileData, email: e.target.value })}
                            placeholder="Email kiểm duyệt viên"
                          />
                        </div>
                      </div>

                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Số điện thoại liên lạc nội bộ</label>
                        <div className="mod-field-input-box">
                          <Smartphone size={15} color="#94a3b8" />
                          <input 
                            type="text" 
                            value={modProfileData.phone}
                            onChange={(e) => setModProfileData({ ...modProfileData, phone: e.target.value })}
                            placeholder="Số điện thoại"
                          />
                        </div>
                      </div>

                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Khu vực phân loại vùng văn hóa</label>
                        <div className="mod-field-input-box">
                          <MapPin size={15} color="#94a3b8" />
                          <input 
                            type="text" 
                            value={modProfileData.culturalRegion}
                            onChange={(e) => setModProfileData({ ...modProfileData, culturalRegion: e.target.value })}
                            placeholder="Khu vực ẩm thực"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Chuyên môn tags */}
                    <div style={{ marginTop: '0.75rem' }}>
                      <label className="mod-field-label" style={{ marginBottom: '0.45rem', display: 'block' }}>
                        Lĩnh vực chuyên trách ưu tiên gán bài
                      </label>
                      <div className="mod-tags-container">
                        {modProfileData.specialties.map((spec) => (
                          <span key={spec} className="mod-specialty-tag">
                            <Tag size={12} />
                            <span>{spec}</span>
                            <button 
                              type="button" 
                              className="mod-specialty-remove-btn"
                              title={`Xóa ${spec}`}
                              onClick={() => handleRemoveSpecialty(spec)}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}

                        {showAddSpecialty ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input 
                              type="text" 
                              value={newSpecialtyInput}
                              onChange={(e) => setNewSpecialtyInput(e.target.value)}
                              placeholder="Nhập chuyên môn mới..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddSpecialty();
                                if (e.key === 'Escape') setShowAddSpecialty(false);
                              }}
                              style={{
                                fontSize: '0.76rem',
                                padding: '0.3rem 0.65rem',
                                borderRadius: '9999px',
                                border: '1px solid #10b981',
                                outline: 'none'
                              }}
                              autoFocus
                            />
                            <button 
                              type="button"
                              onClick={handleAddSpecialty}
                              style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '9999px', padding: '0.3rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Lưu
                            </button>
                            <button 
                              type="button"
                              onClick={() => setShowAddSpecialty(false)}
                              style={{ background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '9999px', padding: '0.3rem 0.55rem', fontSize: '0.72rem', cursor: 'pointer' }}
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            className="mod-add-specialty-btn"
                            onClick={() => setShowAddSpecialty(true)}
                          >
                            <Plus size={13} />
                            <span>Thêm chuyên môn</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. BỘ MẪU PHẢN HỒI TỪ CHỐI NHANH */}
                  {/* Rule 6: ĐÃ BỎ hoàn toàn mục "Cấu hình Ca trực & Tiếp nhận Hàng đợi" */}
                  {/* Rule 7: ĐÃ BỎ mẫu "Thiếu định lượng dinh dưỡng calo/macro" */}
                  <div className="mod-section-card">
                    <div className="mod-section-header-row">
                      <div className="mod-section-title-wrap">
                        <div className="mod-section-icon-square peach">
                          <MessageSquare size={18} />
                        </div>
                        <div>
                          <h3 className="mod-section-title">2. Bộ Mẫu Phản Hồi Từ Chối Nhanh</h3>
                          <p className="mod-section-subtitle">
                            Giải thích lịch sự, mang tính xây dựng giúp người dùng chỉnh sửa công thức
                          </p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleOpenCreateTemplate}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.45rem',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '0.45rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Plus size={14} color="#059669" />
                        <span>Tạo mẫu mới</span>
                      </button>
                    </div>

                    <div className="mod-templates-stack">
                      {rejectionTemplates.map((tmpl) => (
                        <div key={tmpl.id} className="mod-template-item-card">
                          <div className="mod-template-top">
                            <div className="mod-template-title-area">
                              <span className="mod-template-title">{tmpl.title}</span>
                              <span className={`mod-template-category-badge ${tmpl.badgeColor}`}>
                                {tmpl.category}
                              </span>
                            </div>
                            <div className="mod-template-actions">
                              <button 
                                type="button" 
                                className="mod-template-action-btn"
                                title="Chỉnh sửa mẫu"
                                onClick={() => handleOpenEditTemplate(tmpl)}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                type="button" 
                                className="mod-template-action-btn delete"
                                title="Xóa mẫu"
                                onClick={() => handleDeleteTemplate(tmpl.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="mod-template-quote">
                            “{tmpl.text}”
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. CÀI ĐẶT BẢO MẬT & ĐỔI MẬT KHẨU */}
                  <div className="mod-section-card" id="mod-security-section">
                    <div className="mod-section-header-row">
                      <div className="mod-section-title-wrap">
                        <div className="mod-section-icon-square green">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <h3 className="mod-section-title">3. Cài Đặt Bảo Mật &amp; Đổi Mật Khẩu</h3>
                          <p className="mod-section-subtitle">
                            Đảm bảo an toàn tài khoản kiểm duyệt có thẩm quyền phê duyệt dữ liệu cộng đồng
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 3-col password grid */}
                    <div className="mod-password-grid-3col">
                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Mật khẩu hiện tại</label>
                        <div className="mod-field-input-box">
                          <Lock size={15} color="#94a3b8" />
                          <input 
                            type="password" 
                            value={modProfileData.passwords.current}
                            onChange={(e) => setModProfileData({
                              ...modProfileData,
                              passwords: { ...modProfileData.passwords, current: e.target.value }
                            })}
                            placeholder="••••••••••••"
                          />
                        </div>
                      </div>

                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Mật khẩu mới</label>
                        <div className="mod-field-input-box">
                          <Key size={15} color="#94a3b8" />
                          <input 
                            type="password" 
                            value={modProfileData.passwords.newPass}
                            onChange={(e) => setModProfileData({
                              ...modProfileData,
                              passwords: { ...modProfileData.passwords, newPass: e.target.value }
                            })}
                            placeholder="Tối thiểu 10 ký tự"
                          />
                        </div>
                      </div>

                      <div className="mod-form-field-group">
                        <label className="mod-field-label">Xác nhận mật khẩu mới</label>
                        <div className="mod-field-input-box">
                          <CheckCircle size={15} color="#94a3b8" />
                          <input 
                            type="password" 
                            value={modProfileData.passwords.confirmPass}
                            onChange={(e) => setModProfileData({
                              ...modProfileData,
                              passwords: { ...modProfileData.passwords, confirmPass: e.target.value }
                            })}
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2FA Status Box */}
                    <div className="mod-2fa-status-box">
                      <div className="mod-2fa-info">
                        <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', flexShrink: 0 }}>
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.84rem', color: '#065f46', display: 'block' }}>
                            Xác thực 2 yếu tố (Google Authenticator)
                          </strong>
                          <span style={{ fontSize: '0.74rem', color: '#047857' }}>
                            Bảo vệ phiên đăng nhập Moderation Portal bằng mã sinh OTP 6 số.
                          </span>
                        </div>
                      </div>

                      <button 
                        type="button"
                        style={{
                          background: '#10b981',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.45rem 1rem',
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          flexShrink: 0
                        }}
                        onClick={() => showToast('🔒 2FA Google Authenticator đã được kích hoạt trên thiết bị.')}
                      >
                        <Check size={14} />
                        <span>Đã thiết lập</span>
                      </button>
                    </div>

                    {/* PHIÊN ĐĂNG NHẬP & THIẾT BỊ HOẠT ĐỘNG (GIỐNG ADMIN) */}
                    <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.86rem', color: '#0f172a', display: 'block' }}>Phiên đăng nhập &amp; Thiết bị hoạt động</strong>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Quản lý các thiết bị đang đăng nhập tài khoản kiểm duyệt của bạn</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <button 
                            type="button"
                            onClick={handleLogoutAllOtherDevices}
                            style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.75rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'all 0.15s ease' }}
                          >
                            <LogOut size={13} />
                            <span>Đăng xuất thiết bị khác</span>
                          </button>
                          <button 
                            type="button"
                            onClick={handleLogoutAllDevices}
                            style={{ background: '#dc2626', border: 'none', color: '#ffffff', fontSize: '0.75rem', fontWeight: 700, padding: '0.35rem 0.85rem', borderRadius: '7px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 4px rgba(220, 38, 38, 0.2)' }}
                          >
                            <LogOut size={13} />
                            <span>Đăng xuất khỏi tất cả thiết bị</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {modSessions.map(session => (
                          <div key={session.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {session.device.includes('iPhone') ? <Smartphone size={17} /> : <Laptop size={17} />}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{session.device}</strong>
                                  {session.isCurrent && (
                                    <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.65rem', fontWeight: 800, padding: '0.08rem 0.45rem', borderRadius: '4px' }}>
                                      Phiên này
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                                  {session.location} • IP: {session.ip} • {session.time}
                                </div>
                              </div>
                            </div>

                            {session.isCurrent ? (
                              <CheckCircle2 size={18} color="#10b981" />
                            ) : (
                              <button 
                                type="button"
                                onClick={() => {
                                  setModSessions(prev => prev.filter(s => s.id !== session.id));
                                  showToast(`Đã ngắt phiên thiết bị: ${session.device}`);
                                }}
                                style={{ background: '#fee2e2', border: 'none', color: '#dc2626', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                title="Đăng xuất thiết bị này"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="mod-profile-footer-bar">
                    <div className="mod-footer-time-hint">
                      <Clock size={14} color="#94a3b8" />
                      <span>
                        Lần lưu gần nhất: <strong>{modProfileData.lastSaved}</strong> bởi <strong>{modProfileData.fullName}</strong>
                      </span>
                    </div>

                    <div className="mod-footer-buttons">
                      <button 
                        type="button" 
                        className="mod-footer-cancel-btn"
                        onClick={() => {
                          showToast('↺ Đã khôi phục thông tin cài đặt ban đầu.');
                        }}
                      >
                        Hủy thay đổi
                      </button>
                      <button 
                        type="button" 
                        className="mod-footer-save-btn"
                        onClick={handleSaveModProfile}
                      >
                        <Check size={16} />
                        <span>Lưu Cấu Hình</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          MODAL: TỪ CHỐI BÀI VIẾT (REJECT MODAL WITH REASONS)
          ========================================================================= */}
      {showRejectModal && itemToReject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Slash size={16} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Từ Chối Bài Viết #{itemToReject.id}</h3>
              </div>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1rem' }}>
              Bài viết: <strong>"{itemToReject.title}"</strong> của tác giả <strong>{itemToReject.author}</strong> sẽ bị chuyển sang trạng thái Từ chối kèm thông báo giải thích.
            </p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Lý do từ chối tiêu chuẩn:
              </label>
              <select 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mod-form-input"
              >
                <option>Chứa nguyên liệu phi chay / vi phạm quy chuẩn</option>
                <option>Sai định lượng gram/ml (không thể tính Macro AI)</option>
                <option>Chứa Ngũ vị tân nhưng không khai báo rõ ràng</option>
                <option>Hình ảnh mờ, phản cảm hoặc vi phạm bản quyền</option>
                <option>Spam bán hàng, chèn link ngoài hoặc lừa đảo</option>
                <option>Tuyên bố sai lệch y khoa ("chữa khỏi ung thư", "trị bách bệnh")</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                Ghi chú thêm gửi tác giả (tùy chọn):
              </label>
              <textarea 
                rows={3}
                placeholder="Nhập hướng dẫn để tác giả chỉnh sửa và gửi lại..."
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                className="mod-form-input"
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowRejectModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.55rem 1.15rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmReject}
                style={{ background: '#dc2626', border: 'none', color: '#ffffff', padding: '0.55rem 1.25rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              >
                <X size={15} />
                <span>Xác nhận từ chối</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DUYỆT TỰ ĐỘNG TẬP TRUNG (AUTO REVIEW MODAL)
          ========================================================================= */}
      {showAutoReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '640px', padding: '1.75rem', boxShadow: '0 25px 30px -5px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span className="mod-pulse-dot"></span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Chế Độ Duyệt Tự Động Tập Trung (AI Assistant)
                </h3>
              </div>
              <button 
                onClick={() => setShowAutoReviewModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {inspectingItem ? (
              <div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <img 
                    src={inspectingItem.thumbnail} 
                    alt={inspectingItem.title} 
                    style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{inspectingItem.title}</h4>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Tác giả: <strong>{inspectingItem.author}</strong> • Điểm uy tín: <strong>{inspectingItem.trustScore}/100</strong>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginTop: '0.2rem' }}>
                      AI Confidence: {inspectingItem.aiConfidence}% (Đạt tiêu chuẩn an toàn)
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem', fontSize: '0.8rem', color: '#334155', marginBottom: '1.25rem' }}>
                  <strong>Lời khuyên AI:</strong> {inspectingItem.aiSummary}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Nhấn <strong>Space</strong> để duyệt nhanh • <strong>R</strong> để từ chối
                  </span>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button 
                      className="mod-btn-action reject"
                      style={{ padding: '0.55rem 1.15rem' }}
                      onClick={() => handleOpenRejectModal(inspectingItem)}
                    >
                      Từ chối (R)
                    </button>
                    <button 
                      className="mod-btn-action approve"
                      style={{ padding: '0.55rem 1.25rem' }}
                      onClick={() => {
                        handleApproveItem(inspectingItem);
                        const remaining = moderationItems.filter(i => i.id !== inspectingItem.id);
                        if (remaining.length > 0) {
                          setInspectingItem(remaining[0]);
                        } else {
                          setShowAutoReviewModal(false);
                          showToast('🎉 Bạn đã xử lý hết toàn bộ hàng đợi kiểm duyệt!');
                        }
                      }}
                    >
                      <Check size={16} />
                      <span>Duyệt &amp; Tiếp tục (Space)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <p>Không còn bài viết nào trong hàng đợi!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TẠO / SỬA MẪU PHẢN HỒI TỪ CHỐI
          ========================================================================= */}
      {showCreateTemplateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', width: '100%', maxWidth: '520px', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {editingTemplate ? 'Chỉnh Sửa Mẫu Phản Hồi' : 'Tạo Mẫu Phản Hồi Từ Chối Mới'}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Phục vụ từ chối nhanh có lý do chuẩn mực</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowCreateTemplateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplateSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Tiêu đề lý do mẫu
                  </label>
                  <input 
                    type="text"
                    value={templateForm.title}
                    onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                    placeholder="VD: Chứa ngũ vị tân chưa dán nhãn..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Phân loại danh mục
                  </label>
                  <select 
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', background: '#ffffff' }}
                  >
                    <option value="Ăn chay truyền thống">Ăn chay truyền thống</option>
                    <option value="Hình ảnh">Hình ảnh</option>
                    <option value="Quy chuẩn Thuần Chay">Quy chuẩn Thuần Chay</option>
                    <option value="Quy chuẩn bản quyền">Quy chuẩn bản quyền</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.35rem' }}>
                    Nội dung phản hồi góp ý chi tiết
                  </label>
                  <textarea 
                    rows={4}
                    value={templateForm.text}
                    onChange={(e) => setTemplateForm({ ...templateForm, text: e.target.value })}
                    placeholder="Nhập nội dung hướng dẫn sửa chữa gửi đến tác giả bài viết..."
                    style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none', resize: 'vertical' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowCreateTemplateModal(false)}
                  style={{ padding: '0.55rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  style={{ padding: '0.55rem 1.25rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#ffffff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editingTemplate ? 'Cập nhật mẫu' : 'Lưu mẫu mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
