import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Search, CheckCircle2, ChevronRight, 
  RotateCw, Eye, ShoppingCart, MoreVertical, Sparkles, Filter, 
  Download, Printer, Trash2, Share2, X, Clock, ChevronLeft,
  Check, Leaf, AlertCircle, Utensils
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';

export default function MealHistoryPage({ onNavigate }) {
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // STATE TÌM KIẾM & BỘ LỌC
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [goalFilter, setGoalFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toastMessage, setToastMessage] = useState('');

  // MODAL STATES
  const [previewWeek, setPreviewWeek] = useState(null);
  const [modalSelectedDayIndex, setModalSelectedDayIndex] = useState(0);
  const [marketWeek, setMarketWeek] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // DỮ LIỆU CÁC TUẦN THỰC ĐƠN ĐÃ LƯU TRỮ (THEO CHUẨN MOCKUP)
  const historyWeeks = [
    {
      id: 'w41',
      code: 'Tuần #W41 (07/10 – 13/10/2026)',
      year: 'Năm 2026',
      goal: 'Giảm mỡ giữ cơ • Thuần chay',
      goalType: 'fatloss',
      adherence: 96,
      calories: '2,050 kcal/ngày',
      protein: '86g Đạm',
      dishes: [
        {
          name: 'Poke Quinoa Tempeh',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '490 kcal',
          protein: '24g Đạm'
        },
        {
          name: 'Buddha Bowl',
          img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
          calories: '520 kcal',
          protein: '22g Đạm'
        },
        {
          name: 'Canh nấm hạt sen',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '340 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Đậu hũ Tứ Xuyên',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '420 kcal',
          protein: '24g Đạm'
        }
      ],
      marketList: [
        'Đậu hũ mơ tươi: 5 bìa (900g)',
        'Hạt Quinoa 3 màu: 500g',
        'Nấm đùi gà & Nấm hương: 600g',
        'Hạt sen tươi Huế: 200g',
        'Rau cải thìa Đà Lạt: 1kg',
        'Sốt tương Tứ Xuyên thuần chay: 1 chai'
      ]
    },
    {
      id: 'w40',
      code: 'Tuần #W40 (30/09 – 06/10/2026)',
      year: 'Năm 2026',
      goal: 'Bổ sung B12 & Sắt • Thuần chay',
      goalType: 'b12',
      adherence: 94,
      calories: '1,980 kcal/ngày',
      protein: '78g Đạm',
      dishes: [
        {
          name: 'Súp bí đỏ hạt sen',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '380 kcal',
          protein: '14g Đạm'
        },
        {
          name: 'Cà ri nấm dừa đậu gà',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '610 kcal',
          protein: '26g Đạm'
        },
        {
          name: 'Gỏi cuốn ngũ sắc',
          img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
          calories: '320 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Sinh tố Spirulina chuối',
          img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=400&q=80',
          calories: '280 kcal',
          protein: '12g Đạm'
        }
      ],
      marketList: [
        'Bí đỏ hồ lô: 1.2kg',
        'Đậu gà hữu cơ ngâm nở: 500g',
        'Tảo Spirulina hữu cơ: 1 hộp',
        'Bánh tráng gạo lứt: 2 xấp',
        'Men dinh dưỡng B12 (Nutritional Yeast): 100g'
      ]
    },
    {
      id: 'w39',
      code: 'Tuần #W39 (23/09 – 29/09/2026)',
      year: 'Năm 2026',
      goal: 'Duy trì thể trạng & Tăng đề kháng • Thuần chay',
      goalType: 'maintain',
      adherence: 98,
      calories: '2,100 kcal/ngày',
      protein: '85g Đạm',
      dishes: [
        {
          name: 'Phở nấm thanh đạm',
          img: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=400&q=80',
          calories: '450 kcal',
          protein: '20g Đạm'
        },
        {
          name: 'Nem nấm nướng giòn',
          img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
          calories: '380 kcal',
          protein: '18g Đạm'
        },
        {
          name: 'Lẩu nấm Tứ Xuyên',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '650 kcal',
          protein: '32g Đạm'
        },
        {
          name: 'Canh chua Nam Bộ',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '310 kcal',
          protein: '15g Đạm'
        }
      ],
      marketList: [
        'Bánh phở tươi: 1kg',
        'Nấm mối đen & nấm đùi gà: 800g',
        'Đậu hũ ky tươi: 300g',
        'Dọc mùng, đậu bắp, cà chua, dứa: 1.5kg'
      ]
    },
    {
      id: 'w38',
      code: 'Tuần #W38 (16/09 – 22/09/2026)',
      year: 'Năm 2026',
      goal: 'Thanh lọc cơ thể & Tiết kiệm thời gian • Thuần chay',
      goalType: 'detox',
      adherence: 92,
      calories: '1,890 kcal/ngày',
      protein: '76g Đạm',
      dishes: [
        {
          name: 'Cơm lứt hạt dẻ',
          img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
          calories: '420 kcal',
          protein: '18g Đạm'
        },
        {
          name: 'Đậu phụ xào nấm',
          img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
          calories: '390 kcal',
          protein: '22g Đạm'
        },
        {
          name: 'Canh đậu non wakame',
          img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80',
          calories: '280 kcal',
          protein: '16g Đạm'
        },
        {
          name: 'Hạt dẻ nướng ấm no',
          img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
          calories: '240 kcal',
          protein: '8g Đạm'
        }
      ],
      marketList: [
        'Gạo lứt huyết rồng: 2kg',
        'Hạt dẻ Trùng Khánh: 500g',
        'Rong biển wakame khô: 100g',
        'Đậu hũ non Nhật Bản: 4 hộp'
      ]
    }
  ];

  // LỌC DANH SÁCH THEO SEARCH VÀ GOAL
  const filteredWeeks = historyWeeks.filter(week => {
    const matchesSearch = week.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      week.dishes.some(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesGoal = goalFilter === 'all' || week.goalType === goalFilter;
    return matchesSearch && matchesGoal;
  });

  // HÀM TẠO DỮ LIỆU 7 NGÀY CHI TIẾT ĐẦY ĐỦ CỦA TUẦN ĐÃ LƯU TRỮ
  const getWeekDaysData = (week) => {
    if (!week) return [];

    const weekDatesMap = {
      w41: ['07/10', '08/10', '09/10', '10/10', '11/10', '12/10', '13/10'],
      w40: ['30/09', '01/10', '02/10', '03/10', '04/10', '05/10', '06/10'],
      w39: ['23/09', '24/09', '25/09', '26/09', '27/09', '28/09', '29/09'],
      w38: ['16/09', '17/09', '18/09', '19/09', '20/09', '21/09', '22/09']
    };

    const dates = weekDatesMap[week.id] || ['07/10', '08/10', '09/10', '10/10', '11/10', '12/10', '13/10'];
    const dayNames = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    const dayShorts = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    // MẪU 7 NGÀY PHONG PHÚ CHO TỪNG TUẦN
    const scheduleByWeek = {
      w41: [
        {
          calories: '2,050 kcal',
          protein: '86g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:00 – 08:30', prepTime: '10 phút', title: 'Smoothie Bowl Yến Mạch, Chuối & Hạt Chia Hạnh Nhân', calories: '480 kcal', protein: '18g Protein', fiber: '9g Xơ', iron: '4.2mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', ingredients: 'Yến mạch cán dẹt, sữa hạt dừa không đường, chuối Laba đông lạnh, hạt chia organic, hạnh nhân lát.', note: 'Năng lượng giải phóng chậm từ yến mạch kết hợp omega-3 giúp não bộ tỉnh táo.' },
            { slot: 'Bữa Trưa', time: '11:30 – 13:00', prepTime: '25 phút', title: 'Poke Quinoa Tempeh & Đậu Hũ Áp Chảo Sốt Mè Rang', calories: '720 kcal', protein: '34g Protein', fiber: '12g Xơ', iron: '8.5mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', ingredients: 'Tempeh đậu nành lên men, quinoa 3 màu, đậu hũ áp chảo vàng giòn, bơ sáp Đắk Lắk, cải thìa trần.', note: 'Bữa ăn giàu đạm hoàn chỉnh giúp phục hồi cơ bắp tối ưu sau buổi tập.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Energy Balls Hạt Bí, Chà Là & Trà Thảo Mộc Hoa Cúc', calories: '220 kcal', protein: '8g Protein', fiber: '5g Xơ', iron: '2.1mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', ingredients: 'Hạt bí xanh Ấn Độ, quả chà là Medjool nghiền, bột ca cao nguyên chất, trà hoa cúc sấy lạnh.', note: 'Bữa phụ tiện lợi cung cấp magie và kẽm ổn định đường huyết trước giờ tan sở.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '20 phút', title: 'Đậu Hũ Tứ Xuyên Thuần Chay & Canh Nấm Hạt Sen', calories: '630 kcal', protein: '26g Protein', fiber: '8g Xơ', iron: '6.4mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80', ingredients: 'Đậu hũ non làng Mơ, nấm đông cô, hạt sen tươi Huế, sốt tương ớt Tứ Xuyên không ngũ vị tân.', note: 'Bữa tối ấm bụng, hạt sen giúp an thần dễ ngủ, nấm tăng cường miễn dịch.' }
          ]
        },
        {
          calories: '2,040 kcal',
          protein: '85g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:00 – 08:30', prepTime: '12 phút', title: 'Bánh Mì Nguyên Cám Quả Bơ & Đậu Gà Nghiền Sốt Tahini', calories: '460 kcal', protein: '17g Protein', fiber: '8g Xơ', iron: '3.8mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', ingredients: 'Bánh mì lúa mạch đen nguyên cám, bơ sáp nghiền, đậu gà luộc mềm, mè rang, ớt bột paprika.', note: 'Chất béo tốt từ quả bơ và protein từ đậu gà tạo cảm giác no lâu, không thèm ăn vặt.' },
            { slot: 'Bữa Trưa', time: '11:30 – 13:00', prepTime: '20 phút', title: 'Buddha Bowl Rau Củ Cầu Vồng, Đậu Lăng & Hạt Sen', calories: '710 kcal', protein: '33g Protein', fiber: '14g Xơ', iron: '7.9mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', ingredients: 'Đậu lăng đỏ hầm nhừ, ngô ngọt luộc, bắp cải tím muối chua nhẹ, hạt sen hấp, sốt chanh leo chua ngọt.', note: 'Sự kết hợp hoàn hảo giữa đạm thực vật và chất chống oxy hóa anthocyanin.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Sữa Hạt Điều Nướng Nguyên Chất & Hạnh Nhân Sấy Mộc', calories: '230 kcal', protein: '9g Protein', fiber: '4g Xơ', iron: '2.5mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80', ingredients: 'Hạt điều Bình Phước hữu cơ xay nhuyễn không thêm đường tinh luyện, hạnh nhân lát sấy.', note: 'Bổ sung tryptophan tự nhiên hỗ trợ thư giãn hệ thần kinh.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '25 phút', title: 'Nấm Đùi Gà Xào Cải Thìa Dầu Hào Chay & Cơm Gạo Lứt', calories: '640 kcal', protein: '26g Protein', fiber: '9g Xơ', iron: '6.8mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', ingredients: 'Nấm đùi gà cắt lát dày giòn sần sật, cải thìa tươi, dầu hào chay từ nấm hương, gạo lứt huyết rồng.', note: 'Beta-glucan từ nấm giúp tăng cường sức đề kháng và hỗ trợ tiêu hóa.' }
          ]
        },
        {
          calories: '2,070 kcal',
          protein: '88g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:00 – 08:30', prepTime: '15 phút', title: 'Phở Nấm Bào Ngư Nước Dùng Rau Củ Thanh Đạm', calories: '490 kcal', protein: '19g Protein', fiber: '7g Xơ', iron: '4.5mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80', ingredients: 'Bánh phở tươi không hàn the, nấm bào ngư xào sơ, nước dùng ninh từ mía lau, củ cải đường, hồi quế thảo mộc.', note: 'Nước dùng trong ngọt tự nhiên giúp thanh lọc cơ thể khởi đầu ngày mới nhẹ nhõm.' },
            { slot: 'Bữa Trưa', time: '11:30 – 13:00', prepTime: '25 phút', title: 'Cơm Gạo Lứt Trộn Hàn Quốc (Bibimbap) Thuần Chay', calories: '730 kcal', protein: '35g Protein', fiber: '13g Xơ', iron: '8.1mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', ingredients: 'Cơm lứt dẻo, nấm hương xào, giá đỗ luộc, cà rốt bào sợi, đậu hũ chiên giòn, tương gochujang chay.', note: 'Cung cấp đầy đủ các nhóm vitamin A, B, C và khoáng chất thiết yếu.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Sinh Tố Bơ Sáp, Chuối & Sữa Hạt Đậu Nành Tươi', calories: '210 kcal', protein: '8g Protein', fiber: '5g Xơ', iron: '2.0mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', ingredients: 'Bơ sáp chín tới, chuối đông lạnh, sữa đậu nành nguyên chất không đường, hạt lanh xay mịn.', note: 'Dồi dào kali và axit béo không bão hòa đơn tốt cho tim mạch.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '20 phút', title: 'Canh Rong Biển Đậu Non & Chả Tempeh Chiên Không Dầu', calories: '640 kcal', protein: '26g Protein', fiber: '8g Xơ', iron: '6.1mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', ingredients: 'Rong biển wakame Hàn Quốc, đậu non Nhật Bản mềm mịn, tempeh ướp thì là nướng giòn.', note: 'I-ốt từ rong biển hỗ trợ chức năng tuyến giáp hoạt động ổn định.' }
          ]
        },
        {
          calories: '2,030 kcal',
          protein: '84g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:00 – 08:30', prepTime: '10 phút', title: 'Cháo Yến Mạch Nấm Rơm & Hạt Điều Rang Muối', calories: '450 kcal', protein: '16g Protein', fiber: '8g Xơ', iron: '4.0mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', ingredients: 'Yến mạch nấu nhuyễn, nấm rơm tươi xào thơm với dầu mè, hạt điều rang đập dập, tiêu sọ cay nhẹ.', note: 'Ấm tỳ vị, dễ tiêu hóa, thích hợp cho buổi sáng bận rộn cần bổ sung đạm nhanh.' },
            { slot: 'Bữa Trưa', time: '11:30 – 13:00', prepTime: '25 phút', title: 'Mì Ý Sốt Cà Chua Đậu Lăng Đỏ & Nấm Mỡ', calories: '720 kcal', protein: '34g Protein', fiber: '11g Xơ', iron: '8.4mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', ingredients: 'Mì Spaghetti lúa mì cứng, sốt cà chua tươi hầm đậu lăng đỏ đậm đà, nấm mỡ xắt lát, lá húng tây basil.', note: 'Lycopene trong cà chua nấu chín kết hợp đạm đậu lăng tăng cường bảo vệ tế bào.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Bánh Quy Yến Mạch Hạt Bí & Trà Xanh Matcha Sữa Yến Mạch', calories: '220 kcal', protein: '8g Protein', fiber: '4g Xơ', iron: '2.2mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', ingredients: 'Bánh nướng thủ công ít ngọt từ yến mạch và hạt bí, matcha Nhật Bản pha sữa yến mạch thơm lừng.', note: 'EGCG trong matcha thúc đẩy quá trình trao đổi chất và đốt cháy calo tự nhiên.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '20 phút', title: 'Cà Ri Nấm Dừa Đậu Gà & Bánh Mì Lúa Mạch Nướng', calories: '640 kcal', protein: '26g Protein', fiber: '10g Xơ', iron: '6.9mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80', ingredients: 'Đậu gà hữu cơ ninh mềm, khoai lang mật, nấm hương, nước cốt dừa tươi thơm béo, bột cà ri thảo quả.', note: 'Curcumin từ nghệ trong bột cà ri giúp chống viêm và phục hồi cơ bắp hiệu quả.' }
          ]
        },
        {
          calories: '2,060 kcal',
          protein: '87g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:00 – 08:30', prepTime: '12 phút', title: 'Hủ Tiếu Gạo Lứt Nấm Đông Cô & Đậu Hũ Ky Giòn', calories: '480 kcal', protein: '18g Protein', fiber: '7g Xơ', iron: '4.1mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80', ingredients: 'Sợi hủ tiếu làm từ gạo lứt nguyên cám, đậu hũ ky tươi rán giòn, nấm đông cô tươi, hẹ lá, nước dùng ngọt thanh.', note: 'Cung cấp năng lượng tinh khiết không tạo cảm giác đầy bụng.' },
            { slot: 'Bữa Trưa', time: '11:30 – 13:00', prepTime: '20 phút', title: 'Cơm Chiên Gạo Lứt Ngũ Sắc & Tempeh Nướng Mật Mía', calories: '730 kcal', protein: '35g Protein', fiber: '12g Xơ', iron: '8.3mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', ingredients: 'Gạo lứt rang xốp, đậu Hà Lan, ngô ngọt, cà rốt hạt lựu, tempeh tẩm mật mía nướng vàng thơm nức.', note: 'Chỉ số GI thấp của gạo lứt giúp duy trì mức insulin ổn định suốt buổi chiều.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Sữa Hạt Sen Tươi Nấu Nước Cốt Dừa Ít Ngọt', calories: '210 kcal', protein: '7g Protein', fiber: '4g Xơ', iron: '2.0mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80', ingredients: 'Hạt sen tươi bóc vỏ ninh nhuyễn với lá dứa thơm mát, sữa dừa nguyên chất không đường tinh luyện.', note: 'Dưỡng tâm, an thần, xua tan căng thẳng mệt mỏi cuối ngày làm việc.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '25 phút', title: 'Nem Nấm Nướng Giòn & Canh Chua Chay Nam Bộ', calories: '640 kcal', protein: '27g Protein', fiber: '9g Xơ', iron: '6.7mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80', ingredients: 'Nem cuốn nấm mối đen và miến dong nướng nồi chiên không dầu, canh chua cà chua dứa đậu bắp thơm ngon.', note: 'Hương vị chua thanh giúp kích thích vị giác và thanh nhiệt cơ thể hiệu quả.' }
          ]
        },
        {
          calories: '2,080 kcal',
          protein: '89g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:30 – 09:00', prepTime: '15 phút', title: 'Pancake Yến Mạch Chuối Chín & Hạt Óc Chó Giòn', calories: '500 kcal', protein: '19g Protein', fiber: '9g Xơ', iron: '4.3mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', ingredients: 'Bột yến mạch nghiền, chuối sứ chín, sữa hạnh nhân, nướng chảo chống dính, rắc hạt óc chó và dâu tây tươi.', note: 'Bữa sáng cuối tuần ấm cúng, giàu chất chống oxy hóa và omega-3 thực vật.' },
            { slot: 'Bữa Trưa', time: '12:00 – 13:30', prepTime: '30 phút', title: 'Lẩu Nấm Dưỡng Sinh Thảo Mộc & Đậu Hũ Non Nhúng Rau Mầm', calories: '740 kcal', protein: '36g Protein', fiber: '13g Xơ', iron: '8.8mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80', ingredients: '5 loại nấm tươi (nấm kim châm, nấm đùi gà, nấm linh chi nâu, nấm hương, nấm rơm), kỷ tử, táo đỏ, đậu non mềm.', note: 'Bữa ăn thịnh soạn giàu polysaccharide giúp thanh lọc độc tố và tăng cường hệ miễn dịch.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Sữa Chua Đậu Nành Hữu Cơ Trộn Hạt Lanh & Quả Mọng', calories: '210 kcal', protein: '9g Protein', fiber: '5g Xơ', iron: '2.1mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', ingredients: 'Sữa chua đậu nành tự làm lên men tự nhiên, hạt lanh xay thô, việt quất và dâu tây tươi.', note: 'Lợi khuẩn probiotics tăng cường sức khỏe đường ruột và hấp thu dưỡng chất.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '20 phút', title: 'Gỏi Cuốn Ngũ Sắc Chấm Tương Đậu Phộng & Canh Bí Đỏ', calories: '630 kcal', protein: '25g Protein', fiber: '9g Xơ', iron: '6.2mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', ingredients: 'Bánh tráng gạo lứt cuốn rau mầm, dưa chuột, ớt chuông đỏ, đậu hũ chiên xắt sợi, sốt bơ đậu phộng mè rang.', note: 'Bữa tối nhẹ nhàng, nhiều enzyme sống từ rau củ tươi giúp cơ thể thanh thoát.' }
          ]
        },
        {
          calories: '2,010 kcal',
          protein: '83g Đạm',
          meals: [
            { slot: 'Bữa Sáng', time: '07:30 – 09:00', prepTime: '15 phút', title: 'Bún Riêu Chay Sữa Đậu Nành, Cà Chua & Đậu Hũ Chiên Vàng', calories: '480 kcal', protein: '20g Protein', fiber: '7g Xơ', iron: '4.6mg Sắt', badgeColor: '#b45309', badgeBg: '#fef3c7', img: 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?auto=format&fit=crop&w=600&q=80', ingredients: 'Riêu làm từ sữa đậu nành tươi kết tủa giấm bỗng, nước dùng cà chua chín đỏ thanh tao, đậu hũ chiên mềm.', note: 'Món nước truyền thống thanh đạm, thơm lừng vị đồng quê chuẩn chỉnh ngày Chủ Nhật.' },
            { slot: 'Bữa Trưa', time: '12:00 – 13:30', prepTime: '25 phút', title: 'Cơm Gạo Lứt Nướng Lá Sen, Hạt Sen Huế & Nấm Mối Đen', calories: '720 kcal', protein: '33g Protein', fiber: '11g Xơ', iron: '8.2mg Sắt', badgeColor: '#047857', badgeBg: '#ecfdf5', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80', ingredients: 'Cơm gạo lứt dẻo thơm gói trong lá sen tươi hấp chín, hạt sen Huế bùi ngậy, nấm mối xào tiêu đậm đà.', note: 'Món chay thanh tịnh, cân bằng âm dương và nuôi dưỡng năng lượng bình an cho tuần mới.' },
            { slot: 'Snack Chiều', time: '15:30 – 16:30', prepTime: '5 phút', title: 'Hạt Dẻ Nướng Ấm No & Trà Hoa Cúc Thảo Mộc', calories: '210 kcal', protein: '6g Protein', fiber: '5g Xơ', iron: '2.0mg Sắt', badgeColor: '#6d28d9', badgeBg: '#f3e8ff', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', ingredients: 'Hạt dẻ Trùng Khánh nướng vỏ giòn thơm nức, tách vỏ ăn liền cùng tách trà hoa cúc nóng.', note: 'Bổ thận khí, cung cấp vitamin C và chất chống oxy hóa tự nhiên.' },
            { slot: 'Bữa Tối', time: '18:30 – 20:00', prepTime: '20 phút', title: 'Súp Bí Đỏ Hạt Sen Hạnh Nhân & Bánh Mì Đen Nướng Giòn', calories: '600 kcal', protein: '24g Protein', fiber: '9g Xơ', iron: '6.0mg Sắt', badgeColor: '#0369a1', badgeBg: '#e0f2fe', img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80', ingredients: 'Bí đỏ hồ lô ninh sánh mịn với hạt sen tươi và sữa dừa, rắc hạnh nhân nướng thơm, bánh mì lúa mạch giòn rụm.', note: 'Bữa tối nhẹ bụng chuẩn bị cho giấc ngủ sâu, khép lại tuần dinh dưỡng trọn vẹn 100% mục tiêu.' }
          ]
        }
      ]
    };

    // NẾU CÓ DỮ LIỆU RIÊNG CHO TUẦN ĐÓ THÌ DÙNG, NẾU KHÔNG THÌ SINH ĐỒNG BỘ THEO DATES
    const weekSchedule = scheduleByWeek[week.id] || scheduleByWeek['w41'];

    return dayNames.map((name, idx) => {
      const dayData = weekSchedule[idx % weekSchedule.length];
      return {
        id: `day-${idx + 1}`,
        dayName: name,
        shortName: dayShorts[idx],
        date: dates[idx],
        calories: dayData.calories,
        totalProtein: dayData.protein,
        adherence: 95 + (idx % 4),
        meals: dayData.meals
      };
    });
  };

  // ÁP DỤNG LẠI THỰC ĐƠN TUẦN ĐÓ
  const handleApplyWeek = (week) => {
    showToast(`✨ Đã áp dụng lại toàn bộ thực đơn "${week.code}" cho tuần này!`);
    setTimeout(() => {
      if (onNavigate) {
        onNavigate('planner');
      }
    }, 1200);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '1.75rem 1.25rem 4rem 1.25rem', color: '#0f172a' }}>
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          background: '#046a47',
          color: '#ffffff',
          padding: '0.85rem 1.4rem',
          borderRadius: '14px',
          boxShadow: '0 10px 30px rgba(4, 106, 71, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          zIndex: 9999,
          fontWeight: 700,
          fontSize: '0.9rem',
          animation: 'fadeIn 0.25s ease'
        }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* ========================================================================= */}
        {/* LINK QUAY LẠI "THỰC ĐƠN CỦA TÔI" (KHỚP 100% GIAO DIỆN ẢNH) */}
        {/* ========================================================================= */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('planner')}
            style={{
              background: 'none',
              border: 'none',
              color: '#047857',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: 0
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại "Thực đơn của tôi"</span>
          </button>
        </div>

        {/* TITLE ROW & STORAGE BADGE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', letterSpacing: '-0.02em' }}>
              Lịch sử thực đơn của tôi
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Xem lại và áp dụng lại các thực đơn tuần trước đây
            </p>
          </div>

          <div style={{
            background: '#ecfdf5',
            color: '#047857',
            border: '1px solid #a7f3d0',
            padding: '0.45rem 1rem',
            borderRadius: '20px',
            fontSize: '0.84rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}>
            <Calendar size={15} />
            <span>24 thực đơn đã lưu trữ</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FILTER BAR: TÌM KIẾM, SẮP XẾP, MỤC TIÊU */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          flexWrap: 'wrap'
        }}>
          {/* SEARCH INPUT */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm theo tuần, món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.25rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          {/* SORT DROPDOWN */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest_adherence">Độ tuân thủ cao nhất</option>
            </select>
          </div>

          {/* GOAL FILTER DROPDOWN */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={goalFilter}
              onChange={(e) => setGoalFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '0.86rem',
                fontWeight: 600,
                color: '#334155'
              }}
            >
              <option value="all">Mục tiêu: Tất cả</option>
              <option value="fatloss">Giảm mỡ giữ cơ</option>
              <option value="b12">Bổ sung B12 & Sắt</option>
              <option value="maintain">Duy trì thể trạng</option>
              <option value="detox">Thanh lọc cơ thể</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LIST OF STORED WEEK MEAL PLANS (4 CARDS THEO CHUẨN MOCKUP) */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {filteredWeeks.map((week) => (
            <div
              key={week.id}
              style={{
                background: '#ffffff',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* TOP ROW: WEEK CODE, YEAR, ADHERENCE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 10px',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}>
                    {week.code}
                  </span>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    background: '#f1f5f9',
                    color: '#475569',
                    padding: '3px 8px',
                    borderRadius: '8px'
                  }}>
                    {week.year}
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    background: '#ecfdf5',
                    color: '#047857',
                    padding: '3px 10px',
                    borderRadius: '10px',
                    border: '1px solid #bbf7d0'
                  }}>
                    ĐỘ TUÂN THỦ: {week.adherence}% đạt chuẩn
                  </span>
                </div>
              </div>

              {/* GOAL TITLE */}
              <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                Mục tiêu: {week.goal}
              </h3>

              {/* METRICS ROW WITH PROGRESS BAR */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Chỉ số trung bình:
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                  TB: {week.calories}
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px' }}>
                  {week.protein}
                </span>
                <span style={{ fontSize: '0.76rem', color: '#047857', fontWeight: 700 }}>
                  {week.adherence}% đạt chuẩn
                </span>

                <div style={{ flex: 1, minWidth: '140px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${week.adherence}%`, height: '100%', background: '#046a47', borderRadius: '3px' }}></div>
                </div>
              </div>

              {/* 4 DISHES THUMBNAILS GRID (KHỚP 100% ẢNH MOCKUP) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {week.dishes.map((dish, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      height: '145px',
                      borderRadius: '14px',
                      backgroundImage: `url('${dish.img}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.85) 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '0.75rem'
                    }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                        {dish.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM ACTIONS BAR */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  {/* [Xem lại] */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewWeek(week);
                      setModalSelectedDayIndex(0);
                    }}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      padding: '0.55rem 1rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    <Eye size={15} />
                    <span>[Xem lại]</span>
                  </button>

                  {/* [Áp dụng lại tuần này] */}
                  <button
                    type="button"
                    onClick={() => handleApplyWeek(week)}
                    style={{
                      background: '#046a47',
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.55rem 1.15rem',
                      borderRadius: '10px',
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: '0 2px 8px rgba(4, 106, 71, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RotateCw size={14} />
                    <span>[Áp dụng lại tuần này]</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Xem danh sách đi chợ (đã lưu) */}
                  <button
                    type="button"
                    onClick={() => setMarketWeek(week)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#475569',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#047857'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
                  >
                    <ShoppingCart size={15} />
                    <span>Xem danh sách đi chợ (đã lưu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast(`Thực đơn "${week.code}" đang được đồng bộ!`)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <MoreVertical size={17} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* PHÂN TRANG (PAGINATION) */}
        {/* ========================================================================= */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontSize: '0.84rem', color: '#64748b' }}>
            Hiển thị 1 – 4 trong tổng số 24 thực đơn đã tạo
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <button
              type="button"
              disabled={currentPage === 1}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              &lt; Trang trước
            </button>

            {[1, 2, 3].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border: currentPage === p ? 'none' : '1px solid #e2e8f0',
                  background: currentPage === p ? '#046a47' : '#ffffff',
                  color: currentPage === p ? '#ffffff' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                0{p}
              </button>
            ))}

            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Trang sau &gt;
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BOTTOM HELPER NOTE (THEO ẢNH MOCKUP) */}
        {/* ========================================================================= */}
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '1.75rem',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#ecfdf5',
            color: '#047857',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <Calendar size={20} />
          </div>

          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Tự động lưu trữ hồ sơ thực đơn tuần
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
            Các thực đơn tuần sau sẽ được tự động lưu lại ở đây để bạn xem lại và áp dụng lại bất cứ lúc nào mà không cần khởi tạo lại từ đầu.
          </p>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: XEM CHI TIẾT THỰC ĐƠN TUẦN (7 NGÀY & CHI TIẾT BỮA ĂN) */}
      {/* ========================================================================= */}
      {previewWeek && (() => {
        const weekDays = getWeekDaysData(previewWeek);
        const currentDay = weekDays[modalSelectedDayIndex] || weekDays[0];

        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
          }}>
            <div style={{
              background: '#ffffff', borderRadius: '24px', maxWidth: '880px', width: '100%', maxHeight: '92vh',
              overflowY: 'auto', padding: '1.75rem 2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
            }}>
              <button 
                onClick={() => setPreviewWeek(null)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>

              <span style={{ fontSize: '0.74rem', background: '#ecfdf5', color: '#047857', padding: '3px 10px', borderRadius: '6px', fontWeight: 800 }}>
                CHI TIẾT THỰC ĐƠN LƯU TRỮ • 7 NGÀY HOÀN CHỈNH
              </span>
              <h2 style={{ color: '#0f172a', margin: '0.55rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
                {previewWeek.code}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.84rem', margin: '0 0 1.25rem 0' }}>
                Mục tiêu: <strong style={{ color: '#0f172a' }}>{previewWeek.goal}</strong> • TB: <strong style={{ color: '#047857' }}>{previewWeek.calories}</strong> • <strong style={{ color: '#047857' }}>{previewWeek.protein}</strong> • Độ tuân thủ: <strong style={{ color: '#047857' }}>{previewWeek.adherence}% đạt chuẩn</strong>
              </p>

              {/* THANH TAB 7 NGÀY (THỨ 2 ĐẾN CHỦ NHẬT) */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                    Chọn ngày trong tuần để xem chi tiết bữa ăn:
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Nhấp vào từng ngày để chuyển đổi
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '0.5rem'
                }}>
                  {weekDays.map((day, idx) => {
                    const isSelected = modalSelectedDayIndex === idx;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => setModalSelectedDayIndex(idx)}
                        style={{
                          borderRadius: '14px',
                          padding: '0.65rem 0.35rem',
                          textAlign: 'center',
                          border: isSelected ? '2px solid #046a47' : '1px solid #e2e8f0',
                          background: isSelected ? '#046a47' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#1e293b',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.15rem',
                          boxShadow: isSelected ? '0 6px 16px rgba(4, 106, 71, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, opacity: isSelected ? 0.95 : 0.6 }}>
                          {day.dayName}
                        </span>
                        <span style={{ fontSize: '1.12rem', fontWeight: 800, lineHeight: 1.15 }}>
                          {day.date}
                        </span>
                        <span style={{ fontSize: '0.66rem', fontWeight: 700, color: isSelected ? '#a7f3d0' : '#059669', marginTop: '2px' }}>
                          {day.calories}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* HEADER NGÀY ĐANG ĐƯỢC CHỌN */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                background: '#f8fafc',
                padding: '0.75rem 1.15rem',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Utensils size={17} color="#047857" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Thực đơn {currentDay.dayName} ({currentDay.date})
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    🔥 {currentDay.calories}
                  </span>
                  <span style={{ background: '#ecfdf5', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    💪 {currentDay.totalProtein}
                  </span>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                    4 bữa ăn chi tiết
                  </span>
                </div>
              </div>

              {/* DANH SÁCH CÁC BỮA ĂN TRONG NGÀY (SÁNG, TRƯA, SNACK, TỐI) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {currentDay.meals.map((meal, mIdx) => (
                  <div
                    key={mIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '110px 1fr 140px',
                      gap: '1rem',
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '0.85rem',
                      alignItems: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* ẢNH MÓN */}
                    <div style={{ position: 'relative', width: '110px', height: '90px', borderRadius: '12px', overflow: 'hidden' }}>
                      <img
                        src={meal.img}
                        alt={meal.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    {/* THÔNG TIN MÓN */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          color: meal.badgeColor,
                          background: meal.badgeBg,
                          padding: '2px 8px',
                          borderRadius: '6px'
                        }}>
                          {meal.slot}
                        </span>
                        <span style={{ fontSize: '0.73rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {meal.time} • {meal.prepTime}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>
                        {meal.title}
                      </h4>

                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.4 }}>
                        <strong style={{ color: '#475569' }}>Nguyên liệu:</strong> {meal.ingredients}
                      </p>

                      {meal.note && (
                        <span style={{ fontSize: '0.72rem', color: '#047857', fontStyle: 'italic' }}>
                          💡 {meal.note}
                        </span>
                      )}
                    </div>

                    {/* MACROS BADGES CỘT PHẢI */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      borderRadius: '12px',
                      padding: '0.55rem 0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: '#64748b' }}>Năng lượng:</span>
                        <strong style={{ color: '#0f172a' }}>{meal.calories}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: '#64748b' }}>Đạm (Protein):</span>
                        <strong style={{ color: '#047857' }}>{meal.protein}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: '#64748b' }}>Chất xơ:</span>
                        <strong style={{ color: '#0284c7' }}>{meal.fiber}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                        <span style={{ color: '#64748b' }}>Sắt (Fe):</span>
                        <strong style={{ color: '#d97706' }}>{meal.iron}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* MODAL FOOTER ACTIONS */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1.15rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  💡 Bạn có thể xem trọn vẹn từng ngày hoặc áp dụng ngay toàn bộ tuần này.
                </span>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <Button variant="secondary" onClick={() => setPreviewWeek(null)}>
                    Đóng
                  </Button>
                  <Button onClick={() => {
                    setPreviewWeek(null);
                    handleApplyWeek(previewWeek);
                  }}>
                    <RotateCw size={15} /> Áp dụng toàn bộ thực đơn này cho tuần này
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* MODAL 2: XEM DANH SÁCH ĐI CHỢ ĐÃ LƯU */}
      {/* ========================================================================= */}
      {marketWeek && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', maxWidth: '580px', width: '100%', maxHeight: '90vh',
            overflowY: 'auto', padding: '2rem', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setMarketWeek(null)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>

            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
              SỔ TAY NGUYÊN LIỆU ĐÃ LƯU
            </span>
            <h2 style={{ color: '#0f172a', margin: '0.65rem 0 0.25rem 0', fontSize: '1.35rem', fontWeight: 800 }}>
              Danh Sách Đi Chợ — {marketWeek.code}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Danh sách các món nguyên liệu đã dùng cho 21 bữa ăn trong tuần này.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.5rem' }}>
              {marketWeek.marketList.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.86rem', color: '#334155' }}>
                  <Check size={16} color="#059669" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setMarketWeek(null)}>Đóng</Button>
              <Button onClick={() => {
                setMarketWeek(null);
                showToast('✓ Đã tải danh sách đi chợ về máy!');
              }}>
                <Download size={15} /> Xuất danh sách
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
