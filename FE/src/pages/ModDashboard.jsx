import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, XCircle, Clock, ShieldAlert, Search, Eye, Filter, 
  Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2, User, 
  FileText, Video, Utensils, MessageSquare, ArrowLeft, RefreshCw, X,
  LayoutDashboard, ShieldCheck, History, Settings, LogOut, Sun, Bell,
  ChevronRight, Play, Check, Slash, Zap, Download, Send, AlertCircle,
  HelpCircle, MoreVertical, Lock, Shield, Camera, Plus, Trash2, Edit2,
  Bookmark, Award, Sliders, Key, Smartphone, Globe, MapPin, Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ModDashboard({ onNavigate }) {
  const { user, logout } = useAuth();

  // Active navigation tab in Moderator Workspace
  // 'dashboard' | 'queue' | 'detail' | 'history' | 'profile' | 'security'
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

  // Modals state
  const [inspectingItem, setInspectingItem] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [itemToReject, setItemToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('Chứa nguyên liệu phi chay / vi phạm quy chuẩn');
  const [rejectNote, setRejectNote] = useState('');
  const [showAutoReviewModal, setShowAutoReviewModal] = useState(false);
  const [autoReviewStep, setAutoReviewStep] = useState(0);

  // =========================================================================
  // MOD PROFILE STATE & AVATAR UPLOAD (MATCHING IMAGE 2 & FEEDBACK RULES)
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
  // Rule 3: Bỏ "Senior" trong "Senior Content Moderator" -> chỉ giữ "Content Moderator"
  // Rule 4 & 5: Bỏ "Nutritionist Master" & "Top Mentor 2024" -> chỉ giữ "Food Safety ISO" & "Tiêu chuẩn Thuần Chay VeggieAI"
  const [modProfileData, setModProfileData] = useState({
    fullName: 'Lê Tuệ Tâm',
    roleTitle: 'Content Moderator', // BỎ "Senior"
    bio: 'Chuyên gia Ẩm thực Thực dưỡng & Lên men Sinh thái',
    email: 'mod.tuetam@veggie.ai',
    phone: '+84 912 348 765',
    culturalRegion: 'Đông Nam Á & Đông Á (Việt, Thái...)',
    specialties: ['Món thuần chay Á Đông', 'Thực phẩm lên men & Tempeh', 'Dinh dưỡng trị liệu'],
    passwords: { current: '••••••••••••', newPass: '', confirmPass: '' },
    lastSaved: 'Hôm nay lúc 14:28'
  });

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
  // Authors have pure name + numeric "Điểm uy tín: XX/100" (no titles/ranks like "Cấp 3" or "Chuyên gia")
  const [moderationItems, setModerationItems] = useState([
    {
      id: 'MOD-8801',
      title: 'Bún Nấm Riêu Chay Cốt Đậu Hũ Non',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300',
      author: 'Đầu bếp An Nhiên',
      authorEmail: 'annhien.chef@gmail.com',
      trustScore: 96,
      type: 'Công thức nấu ăn',
      typeCode: 'recipe',
      submittedAt: '12 phút trước',
      aiConfidence: 98.4,
      aiStatus: 'safe',
      aiSummary: '100% Nguyên liệu thực vật thuần chay. Không phát hiện chất cấm hoặc từ ngữ vi phạm.',
      warningTag: null,
      priority: 'high',
      isNew: true,
      hasFiveSpices: false,
      ingredients: [
        { name: 'Đậu hũ non', amount: '2 bìa (300g)', status: 'safe' },
        { name: 'Cà chua chín mọng', amount: '3 quả (250g)', status: 'safe' },
        { name: 'Nấm rơm & nấm đùi gà', amount: '200g', status: 'safe' },
        { name: 'Sữa đậu nành nguyên chất', amount: '400ml', status: 'safe' },
        { name: 'Dấm bỗng nếp cái hoa vàng', amount: '3 thìa canh', status: 'safe' }
      ],
      macros: { calo: '380 kcal', protein: '18.5g', carbs: '45g', fat: '11.2g' },
      instructions: 'Đun sôi nước dùng cà chua phi thơm hành baro, cho sữa đậu nành và dấm bỗng vào tạo riêu bông mịn, cho nấm và đậu hũ non vào nấu lửa nhỏ 10 phút.',
      status: 'pending'
    },
    {
      id: 'MOD-8802',
      title: 'Thịt Nguội Thực Vật Xào Tỏi Ớt & Hẹ',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
      author: 'GreenFoodie_92',
      authorEmail: 'greenfoodie92@yahoo.com',
      trustScore: 72,
      type: 'Công thức nấu ăn',
      typeCode: 'recipe',
      submittedAt: '28 phút trước',
      aiConfidence: 86.2,
      aiStatus: 'warning',
      aiSummary: 'AI phát hiện thành phần Ngũ vị tân: Tỏi và Hẹ lá. Tác giả đã tích chọn "Thuần chay có ngũ vị tân".',
      warningTag: 'Có Ngũ Vị Tân (Tỏi, Hẹ)',
      priority: 'high',
      isNew: true,
      hasFiveSpices: true,
      ingredients: [
        { name: 'Thịt nguội chay từ đậu nành', amount: '250g', status: 'safe' },
        { name: 'Hẹ lá cắt khúc', amount: '100g', status: 'warning' },
        { name: 'Tỏi băm nhuyễn', amount: '3 tép', status: 'warning' },
        { name: 'Ớt sừng trâu tỉa hoa', amount: '1 quả', status: 'safe' },
        { name: 'Nước tương đậu nành lên men', amount: '2 thìa canh', status: 'safe' }
      ],
      macros: { calo: '310 kcal', protein: '22.0g', carbs: '14g', fat: '8.5g' },
      instructions: 'Thái lát thịt nguội chay, áp chảo vàng nhẹ hai mặt. Phi thơm tỏi băm và ớt, cho hẹ vào đảo nhanh tay với lửa lớn 1 phút rồi trút thịt nguội vào đảo đều.',
      status: 'pending'
    },
    {
      id: 'MOD-8803',
      title: 'Smoothie Bowl Cải Xoăn & Quả Mọng Siêu Chống Oxy Hóa',
      thumbnail: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300',
      author: 'Bác Sĩ Dinh Dưỡng Mai Anh',
      authorEmail: 'maianh.nutrition@gmail.com',
      trustScore: 99,
      type: 'Thức uống dinh dưỡng',
      typeCode: 'drink',
      submittedAt: '45 phút trước',
      aiConfidence: 99.1,
      aiStatus: 'safe',
      aiSummary: 'Nguyên liệu 100% Organic sạch, định lượng gram chuẩn xác, giàu Vitamin C và chất chống oxy hóa.',
      warningTag: null,
      priority: 'high',
      isNew: true,
      hasFiveSpices: false,
      ingredients: [
        { name: 'Cải xoăn Kale xoăn non', amount: '80g', status: 'safe' },
        { name: 'Việt quất & mâm xôi đông lạnh', amount: '120g', status: 'safe' },
        { name: 'Chuối già chín đông lạnh', amount: '1 quả (100g)', status: 'safe' },
        { name: 'Hạt chia & hạt lanh xay mịn', amount: '15g', status: 'safe' },
        { name: 'Sữa yến mạch không đường', amount: '150ml', status: 'safe' }
      ],
      macros: { calo: '285 kcal', protein: '9.8g', carbs: '52g', fat: '5.1g' },
      instructions: 'Cho tất cả nguyên liệu vào máy xay công suất lớn, xay nhuyễn mịn trong 60 giây. Đổ ra bát sứ và trang trí thêm hạt chia, dừa sấy giòn lên bề mặt.',
      status: 'pending'
    },
    {
      id: 'MOD-8804',
      title: 'Canh Chua Bạc Hà Nấu Nấm Đùi Gà & Đậu Bắp',
      thumbnail: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300',
      author: 'Võ Minh Quân',
      authorEmail: 'minhquan.vo@outlook.com',
      trustScore: 84,
      type: 'Công thức nấu ăn',
      typeCode: 'recipe',
      submittedAt: '1 giờ trước',
      aiConfidence: 97.5,
      aiStatus: 'safe',
      aiSummary: 'Nước dùng me chua tự nhiên, không hạt nêm thịt, rau củ quả thuần chay đạt chuẩn an toàn.',
      warningTag: null,
      priority: 'normal',
      isNew: true,
      hasFiveSpices: false,
      ingredients: [
        { name: 'Nấm đùi gà cắt xéo', amount: '200g', status: 'safe' },
        { name: 'Cốt me chua dầm nước ấm', amount: '50g', status: 'safe' },
        { name: 'Đậu bắp non & bạc hà (dọc mùng)', amount: '150g', status: 'safe' },
        { name: 'Giá đỗ sạch & ngò gai, rau om', amount: '80g', status: 'safe' }
      ],
      macros: { calo: '160 kcal', protein: '6.2g', carbs: '28g', fat: '2.0g' },
      instructions: 'Đun sôi nước me lọc bỏ hạt, cho nấm đùi gà vào nấu chín, thả đậu bắp và bạc hà vào đun sôi bùng, tắt bếp rồi cho giá và rau thơm vào.',
      status: 'pending'
    },
    {
      id: 'MOD-8805',
      title: 'Bí Quyết Nước Dùng Phở Bò Chay Hầm Xương Thảo Mộc',
      thumbnail: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300',
      author: 'Hương Vị Cổ Truyền',
      authorEmail: 'huongvi.cotruyen@gmail.com',
      trustScore: 48,
      type: 'Công thức nấu ăn',
      typeCode: 'recipe',
      submittedAt: '2 giờ trước',
      aiConfidence: 45.0,
      aiStatus: 'danger',
      aiSummary: 'CẢNH BÁO ĐỎ: Phát hiện đoạn văn bản hướng dẫn cho 200g xương ống hầm lấy nước ngọt, vi phạm cấm thịt động vật.',
      warningTag: 'Vi phạm: Chứa xương động vật',
      priority: 'urgent',
      isNew: false,
      hasFiveSpices: true,
      ingredients: [
        { name: 'Xương ống hầm nhừ', amount: '200g', status: 'violation' },
        { name: 'Quế hồi, thảo quả nướng thơm', amount: '20g', status: 'safe' },
        { name: 'Hành tây nướng cháy cạnh', amount: '1 củ', status: 'warning' }
      ],
      macros: { calo: '420 kcal', protein: '25.0g', carbs: '30g', fat: '18.0g' },
      instructions: 'Bí quyết nước ngọt đậm đà như ngoài hàng là hầm xương ống kỹ trong 2 tiếng...',
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
        moderator: 'Lê Minh Trí',
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
        moderator: 'Lê Minh Trí',
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
      moderator: 'Lê Minh Trí',
      time: 'Vừa xong',
      note: 'Duyệt nhanh tự động qua bộ lọc AI an toàn cao (>95%).'
    }));
    setModerationLogs(prev => [...newLogs, ...prev]);
    showToast(`⚡ Đã phê duyệt an toàn hàng loạt ${safeItems.length} bài viết có điểm tin cậy cao!`);
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

  // Filtered items list
  const filteredItems = moderationItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(topSearchQuery.toLowerCase()) ||
                          item.id.toLowerCase().includes(topSearchQuery.toLowerCase());
    const matchesAiFilter = isAiFlagFilterActive ? (item.aiStatus === 'warning' || item.aiStatus === 'danger') : true;
    return matchesSearch && matchesAiFilter;
  });

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

            <button 
              className={`mod-nav-link ${activeModTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveModTab('security')}
            >
              <div className="mod-nav-link-inner">
                <div className="mod-nav-icon-box">
                  <ShieldCheck size={16} />
                </div>
                <span className="mod-nav-text">Bảo mật</span>
              </div>
            </button>
          </nav>
        </div>

        {/* BOTTOM USER PILL: Lê Minh Trí — Moderator (Removed 'Lead') */}
        <div className="mod-sidebar-footer">
          <div className="mod-user-card">
            <div className="mod-user-avatar">
              <User size={18} color="#ffffff" />
            </div>
            <div className="mod-user-info">
              <div className="mod-user-name">Lê Minh Trí</div>
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
              title="Lê Minh Trí (Moderator)"
              onClick={() => setActiveModTab('profile')}
            >
              <span>MT</span>
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
              VIEW 2: HÀNG ĐỢI DUYỆT BÀI (FULL QUEUE VIEW)
              ========================================================================= */}
          {activeModTab === 'queue' && (
            <div className="mod-queue-view">
              <div className="mod-view-header">
                <div>
                  <h1 className="mod-view-title">Hàng Đợi Kiểm Duyệt Bài Viết &amp; Video</h1>
                  <p className="mod-view-sub">
                    Tổng cộng <strong>{moderationItems.length}</strong> bài viết đang chờ phê duyệt. Nhấn vào bài viết để soi chi tiết hoặc thao tác nhanh.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button className="mod-batch-approve-btn" onClick={handleBatchApproveSafe}>
                    <CheckCircle2 size={16} />
                    <span>Duyệt hàng loạt an toàn ({moderationItems.filter(i => i.aiConfidence >= 95).length})</span>
                  </button>
                </div>
              </div>

              <div className="mod-panel-card" style={{ marginTop: '1rem' }}>
                <div className="mod-items-list">
                  {filteredItems.map(item => (
                    <div key={item.id} className="mod-item-row">
                      <div className="mod-item-main">
                        <img src={item.thumbnail} alt={item.title} className="mod-item-thumb" />
                        <div className="mod-item-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                              #{item.id}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.type}</span>
                            <span className="mod-meta-sep">•</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Gửi {item.submittedAt}</span>
                          </div>
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
                            <span className="mod-item-author">{item.author}</span>
                            <span className="mod-meta-sep">•</span>
                            <div className="mod-trust-score-badge">
                              <Shield size={12} color={item.trustScore >= 90 ? '#059669' : '#d97706'} />
                              <span>Điểm uy tín: <strong>{item.trustScore}/100</strong></span>
                            </div>
                            <span className="mod-meta-sep">•</span>
                            <span style={{ fontSize: '0.72rem', color: item.aiStatus === 'safe' ? '#059669' : item.aiStatus === 'warning' ? '#d97706' : '#dc2626', fontWeight: 700 }}>
                              AI Score: {item.aiConfidence}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mod-item-actions">
                        <button 
                          className="mod-btn-action view"
                          onClick={() => {
                            setInspectingItem(item);
                            setActiveModTab('detail');
                          }}
                        >
                          <Eye size={14} />
                          <span>Chi tiết</span>
                        </button>
                        <button 
                          className="mod-btn-action approve"
                          onClick={() => handleApproveItem(item)}
                        >
                          <Check size={14} />
                          <span>Duyệt</span>
                        </button>
                        <button 
                          className="mod-btn-action reject"
                          onClick={() => handleOpenRejectModal(item)}
                        >
                          <X size={14} />
                          <span>Từ chối</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              VIEW 3: CHI TIẾT BÀI VIẾT (DEEP INSPECTION VIEW)
              ========================================================================= */}
          {activeModTab === 'detail' && (
            <div className="mod-detail-view">
              {inspectingItem ? (
                <div>
                  {/* Top Bar Navigation */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <button 
                      onClick={() => setActiveModTab('dashboard')}
                      style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.45rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
                    >
                      <ArrowLeft size={15} />
                      <span>Quay lại Dashboard</span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <button 
                        onClick={() => handleOpenRejectModal(inspectingItem)}
                        className="mod-btn-action reject"
                        style={{ padding: '0.55rem 1.15rem' }}
                      >
                        <X size={16} />
                        <span>Từ chối bài này (R)</span>
                      </button>
                      <button 
                        onClick={() => handleApproveItem(inspectingItem)}
                        className="mod-btn-action approve"
                        style={{ padding: '0.55rem 1.35rem' }}
                      >
                        <Check size={16} />
                        <span>Phê duyệt xuất bản (Space)</span>
                      </button>
                    </div>
                  </div>

                  {/* Main Detail Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                    {/* Left: Recipe Content, Ingredients, Instructions */}
                    <div className="mod-panel-card">
                      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                        <img 
                          src={inspectingItem.thumbnail} 
                          alt={inspectingItem.title} 
                          style={{ width: '140px', height: '105px', borderRadius: '10px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                              #{inspectingItem.id}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{inspectingItem.type}</span>
                          </div>
                          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.45rem' }}>
                            {inspectingItem.title}
                          </h1>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
                            <span>Tác giả: <strong>{inspectingItem.author}</strong></span>
                            <span>•</span>
                            <span style={{ color: '#059669', fontWeight: 700 }}>Điểm uy tín: {inspectingItem.trustScore}/100</span>
                            <span>•</span>
                            <span>Gửi {inspectingItem.submittedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ingredients List */}
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
                        🥗 Danh sách nguyên liệu &amp; Định lượng:
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.5rem' }}>
                        {inspectingItem.ingredients.map((ing, idx) => (
                          <div 
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.55rem 0.85rem',
                              background: ing.status === 'violation' ? '#fef2f2' : ing.status === 'warning' ? '#fffbeb' : '#f8fafc',
                              border: `1px solid ${ing.status === 'violation' ? '#fecaca' : ing.status === 'warning' ? '#fde68a' : '#e2e8f0'}`,
                              borderRadius: '8px',
                              fontSize: '0.82rem'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{ing.name}</span>
                            <span style={{ color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>{ing.amount}</span>
                          </div>
                        ))}
                      </div>

                      {/* Instructions */}
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                        📝 Hướng dẫn chế biến:
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {inspectingItem.instructions}
                      </p>
                    </div>

                    {/* Right: AI Safety Evaluation & Macros */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* AI Verification Box */}
                      <div className="mod-panel-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Sparkles size={18} color="#059669" />
                          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Đánh giá an toàn AI</h3>
                        </div>

                        <div style={{ background: inspectingItem.aiStatus === 'safe' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${inspectingItem.aiStatus === 'safe' ? '#a7f3d0' : '#fde68a'}`, borderRadius: '8px', padding: '0.85rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <strong style={{ fontSize: '0.85rem', color: inspectingItem.aiStatus === 'safe' ? '#047857' : '#b45309' }}>
                              Độ tin cậy: {inspectingItem.aiConfidence}%
                            </strong>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, background: '#ffffff', padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                              {inspectingItem.aiStatus === 'safe' ? 'AN TOÀN' : 'CẢNH BÁO'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                            {inspectingItem.aiSummary}
                          </p>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          <div>• Computer Vision (YOLO): <strong>Khớp ảnh thực vật 100%</strong></div>
                          <div style={{ marginTop: '0.35rem' }}>• NLP Parser: <strong>Không phát hiện gelatin / mỡ lợn</strong></div>
                          <div style={{ marginTop: '0.35rem' }}>• Ngũ vị tân: <strong>{inspectingItem.hasFiveSpices ? 'Đã gắn nhãn rõ ràng' : 'Không chứa ngũ vị tân'}</strong></div>
                        </div>
                      </div>

                      {/* Nutritional Macro Box */}
                      <div className="mod-panel-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                          <Utensils size={17} color="#059669" />
                          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Macro Dinh Dưỡng</h3>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                          <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Năng lượng</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{inspectingItem.macros.calo}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Đạm thực vật</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669' }}>{inspectingItem.macros.protein}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Carbohydrate</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{inspectingItem.macros.carbs}</div>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '0.65rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Chất béo tốt</div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{inspectingItem.macros.fat}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                  <FileText size={42} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Chưa chọn bài viết nào để soi chi tiết</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.45rem', marginBottom: '1.25rem' }}>Vui lòng chọn một bài viết từ Hàng đợi duyệt bài.</p>
                  <button className="mod-batch-approve-btn" onClick={() => setActiveModTab('queue')}>
                    Đến Hàng Đợi Duyệt Bài
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =========================================================================
              VIEW 4: LỊCH SỬ DUYỆT BÀI (AUDIT LOGS)
              ========================================================================= */}
          {activeModTab === 'history' && (
            <div className="mod-history-view">
              <div className="mod-view-header">
                <div>
                  <h1 className="mod-view-title">Nhật Ký &amp; Lịch Sử Kiểm Duyệt</h1>
                  <p className="mod-view-sub">Hồ sơ lưu trữ các quyết định phê duyệt và từ chối nội dung của bạn.</p>
                </div>
                <button 
                  className="mod-download-report-btn"
                  onClick={() => {
                    showToast('📥 Đang tải file CSV Lịch sử kiểm duyệt...');
                  }}
                >
                  <Download size={14} />
                  <span>Xuất File CSV</span>
                </button>
              </div>

              <div className="mod-panel-card" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {moderationLogs.map((log) => (
                    <div 
                      key={log.id} 
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.85rem 1.15rem',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        flexWrap: 'wrap',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: log.badgeBg, color: log.badgeColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {log.action === 'approved' ? <CheckCircle size={18} /> : <Slash size={18} />}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{log.title}</strong>
                            <span style={{ background: log.badgeBg, color: log.badgeColor, fontSize: '0.68rem', fontWeight: 800, padding: '0.1rem 0.45rem', borderRadius: '4px' }}>
                              {log.actionLabel}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.15rem' }}>
                            Tác giả: <strong>{log.author}</strong> • {log.note}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>{log.moderator}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

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

                    {/* Rule 3: BỎ "Senior", chỉ giữ "Content Moderator" */}
                    <div className="mod-profile-role-badge">
                      {modProfileData.roleTitle}
                    </div>

                    <p className="mod-profile-bio">
                      {modProfileData.bio}
                    </p>

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

          {/* =========================================================================
              VIEW 6: BẢO MẬT & 2FA MODERATOR
              ========================================================================= */}
          {activeModTab === 'security' && (
            <div className="mod-security-view">
              <div className="mod-view-header">
                <div>
                  <h1 className="mod-view-title">Bảo Mật Tài Khoản Kiểm Duyệt</h1>
                  <p className="mod-view-sub">Bảo vệ quyền can thiệp nội dung cộng đồng với xác thực hai yếu tố (2FA).</p>
                </div>
              </div>

              <div className="mod-panel-card" style={{ marginTop: '1rem', maxWidth: '720px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#ecfdf5', borderRadius: '10px', border: '1px solid #a7f3d0', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ShieldCheck size={24} color="#059669" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', color: '#065f46' }}>Xác thực hai bước (2FA) - Đã kích hoạt</strong>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>Bảo vệ tài khoản qua ứng dụng Google Authenticator</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', background: '#ffffff', padding: '0.2rem 0.65rem', borderRadius: '9999px' }}>
                    ĐANG BẬT
                  </span>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.85rem' }}>Đổi mật khẩu tài khoản</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Mật khẩu hiện tại</label>
                      <input type="password" placeholder="••••••••" className="mod-form-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Mật khẩu mới</label>
                      <input type="password" placeholder="Tối thiểu 8 ký tự" className="mod-form-input" />
                    </div>
                  </div>

                  <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      className="mod-batch-approve-btn"
                      onClick={() => showToast('🔒 Đã cập nhật mật khẩu mới cho tài khoản kiểm duyệt!')}
                    >
                      Cập nhật mật khẩu
                    </button>
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
