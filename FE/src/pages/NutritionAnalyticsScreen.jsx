import React, { useState } from 'react';

const INITIAL_ANALYTICS = {
  totalUsersTracked: 3840,
  avgDailyCalories: 1850,
  avgDailyProtein: 68,
  avgDailyFiber: 36,
  micronutrientDeficits: [
    {
      nutrientName: 'Vitamin B12 (Cobalamin)',
      severity: 'high',
      deficitPercent: 64,
      standardRdi: '2.4 µg/ngày',
      avgCommunityIntake: '0.86 µg/ngày',
      recommendedSources: ['Men dinh dưỡng', 'Sữa hạt tăng cường', 'Viên ngậm B12 methyl'],
      nutritionistAdvice: 'Mức báo động đỏ: 64% người ăn thuần chay trên hệ thống chưa đạt chuẩn B12 tối thiểu. Cần ưu tiên gửi thông báo nhắc nhở và gắn thẻ cảnh báo trong thực đơn.',
    },
    {
      nutrientName: 'Sắt Thực Vật (Non-heme Iron)',
      severity: 'high',
      deficitPercent: 48,
      standardRdi: '14 - 32 mg/ngày',
      avgCommunityIntake: '11.2 mg/ngày',
      recommendedSources: ['Rau bó xôi', 'Đậu lăng đỏ', 'Hạt bí ngô', 'Tảo xoắn'],
      nutritionistAdvice: 'Tỷ lệ hấp thu sắt thực vật chỉ đạt 5-12%. Hướng dẫn người dùng luôn dùng chung rau củ giàu sắt với thực phẩm chứa Vitamin C (chanh, ớt chuông, kiwi).',
    },
    {
      nutrientName: 'Canxi (Calcium)',
      severity: 'medium',
      deficitPercent: 32,
      standardRdi: '1000 mg/ngày',
      avgCommunityIntake: '680 mg/ngày',
      recommendedSources: ['Đậu hũ muối canxi', 'Cải xoăn Kale', 'Hạt chia', 'Hạt mè rang'],
      nutritionistAdvice: 'Khuyến khích hội viên sử dụng đậu phụ làm từ muối nigari/canxi sulfat và thêm 1 thìa mè rang vào mỗi mâm cơm hàng ngày.',
    },
    {
      nutrientName: 'Kẽm (Zinc)',
      severity: 'medium',
      deficitPercent: 28,
      standardRdi: '8 - 11 mg/ngày',
      avgCommunityIntake: '6.4 mg/ngày',
      recommendedSources: ['Hạt bí xanh', 'Hạt điều rang', 'Đậu gà', 'Yến mạch'],
      nutritionistAdvice: 'Phytate trong ngũ cốc nguyên cám cản trở hấp thu kẽm. Khuyến khích ngâm các loại đậu qua đêm trước khi chế biến.',
    },
    {
      nutrientName: 'Axit Béo Omega-3 (ALA)',
      severity: 'low',
      deficitPercent: 18,
      standardRdi: '1.1 - 1.6 g/ngày',
      avgCommunityIntake: '1.25 g/ngày',
      recommendedSources: ['Hạt lanh xay', 'Hạt chia', 'Quả óc chó', 'Dầu hạt lanh'],
      nutritionistAdvice: 'Tỷ lệ chuyển đổi từ ALA sang EPA/DHA tự nhiên khoảng 5-8%. Có thể cân nhắc vi tảo Schizochytrium nếu người dùng có tiền sử tim mạch.',
    },
  ],
  dietaryGoals: [
    { goalName: 'Thanh lọc cơ thể & Tăng sức bền', percentage: 42, memberCount: 1612, colorHex: '#10B981' },
    { goalName: 'Kiểm soát cân nặng & Giảm mỡ', percentage: 28, memberCount: 1075, colorHex: '#3B82F6' },
    { goalName: 'Bảo vệ tim mạch & Hạ mỡ máu', percentage: 18, memberCount: 691, colorHex: '#F59E0B' },
    { goalName: 'Lối sống thuần chay vì môi trường', percentage: 12, memberCount: 462, colorHex: '#8B5CF6' },
  ],
  calorieDistribution: [
    { rangeLabel: '< 1500 kcal (Nhẹ nhàng)', percentage: 15 },
    { rangeLabel: '1500 - 1800 kcal (Cân bằng)', percentage: 48 },
    { rangeLabel: '1800 - 2200 kcal (Vận động)', percentage: 27 },
    { rangeLabel: '> 2200 kcal (Thể thao)', percentage: 10 },
  ],
  topIngredients: [
    { name: 'Đậu hũ non hữu cơ (Silken Tofu)', category: 'Đạm thực vật', primaryNutrient: '8.8g Protein, 350mg Canxi', growthRate: 34, mentionsCount: 1240 },
    { name: 'Rau cải bó xôi (Spinach)', category: 'Rau xanh vi chất', primaryNutrient: 'Giàu Sắt & Folate', growthRate: 28, mentionsCount: 980 },
    { name: 'Hạt diêm mạch trắng (Quinoa)', category: 'Ngũ cốc phức', primaryNutrient: 'Đủ 9 Acid Amin thiết yếu', growthRate: 22, mentionsCount: 845 },
    { name: 'Men dinh dưỡng (Nutritional Yeast)', category: 'Gia vị vi chất', primaryNutrient: 'Tăng cường Vitamin B12', growthRate: 46, mentionsCount: 720 },
    { name: 'Hạt chia đen Nam Mỹ', category: 'Hạt dinh dưỡng', primaryNutrient: 'Giàu Omega-3 & Chất xơ', growthRate: 18, mentionsCount: 690 },
  ],
};

export const NutritionAnalyticsScreen = ({ userRole = 'admin' }) => {
  const [overview, setOverview] = useState(INITIAL_ANALYTICS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNutrientTab, setSelectedNutrientTab] = useState('all'); // 'all', 'high', 'medium', 'low'

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  const filteredDeficits = overview?.micronutrientDeficits
    ? overview.micronutrientDeficits.filter((item) => {
        if (selectedNutrientTab === 'all') return true;
        return item.severity === selectedNutrientTab;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-950/20 via-teal-900/10 to-transparent p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm mb-1">
            <span className="material-symbols-outlined text-[18px]">insights</span>
            VeggieAI Clinical Nutrition &amp; Epidemiological Intelligence
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Báo Cáo Dịch Tễ &amp; Xu Hướng Dinh Dưỡng Cộng Đồng
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 max-w-3xl">
            Phân tích số liệu tự động tổng hợp từ nhật ký dinh dưỡng và mâm cơm check-in của hơn{' '}
            <strong className="text-on-surface">{overview.totalUsersTracked.toLocaleString('vi-VN')}</strong> hội viên ăn thuần thực vật, giúp Mod &amp; Admin nhận diện nguy cơ thiếu hụt vi chất kịp thời.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors cursor-pointer shrink-0 border border-surface-container-high self-start md:self-auto"
        >
          <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
          Làm Mới Số Liệu
        </button>
      </div>

      {/* Macro Key Metrics (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Calories */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Năng Lượng Trung Bình
            </span>
            <span className="p-2 rounded-xl bg-orange-500/10 text-orange-600">
              <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-on-surface mt-2">
            {overview.avgDailyCalories} <span className="text-xs font-normal text-on-surface-variant">kcal / ngày</span>
          </div>
          <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Phù hợp duy trì cân nặng ổn định
          </div>
        </div>

        {/* Card 2: Plant Protein */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Đạm Thực Vật Hấp Thu
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <span className="material-symbols-outlined text-[20px]">fitness_center</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-on-surface mt-2">
            {overview.avgDailyProtein} <span className="text-xs font-normal text-on-surface-variant">g / ngày</span>
          </div>
          <div className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            Đạt 107% chuẩn RDI khuyến nghị
          </div>
        </div>

        {/* Card 3: Fiber */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Chất Xơ Tự Nhiên
            </span>
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600">
              <span className="material-symbols-outlined text-[20px]">grass</span>
            </span>
          </div>
          <div className="text-2xl font-bold text-teal-600 mt-2">
            {overview.avgDailyFiber} <span className="text-xs font-normal text-on-surface-variant">g / ngày</span>
          </div>
          <div className="text-xs text-teal-600 mt-2 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">eco</span>
            Vượt 143% so với người ăn phổ thông
          </div>
        </div>

        {/* Card 4: Macro Balance */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-surface-container-high/60 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Cân Đối Đa Lượng (Macro)
            </span>
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">pie_chart</span>
            </span>
          </div>
          <div className="text-base font-bold text-on-surface mt-2 flex items-center gap-2">
            <span className="text-amber-600">52% C</span> • <span className="text-emerald-600">23% P</span> • <span className="text-sky-600">25% F</span>
          </div>
          <div className="text-xs text-on-surface-variant mt-2 flex items-center gap-1 font-medium">
            <span className="material-symbols-outlined text-[14px]">tune</span>
            Carb phức &amp; chất béo không bão hòa
          </div>
        </div>
      </div>

      {/* SECTION 1: MICRONUTRIENT DEFICIT MATRIX (CHUYÊN MÔN CAO) */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[22px]">warning</span>
              Bản Đồ Cảnh Báo Nguy Cơ Thiếu Hụt Vi Chất Dinh Dưỡng (Micronutrient Deficit Matrix)
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Thống kê dựa trên phân tích vi chất khẩu phần ăn của hội viên. Các vi chất mức "Báo động đỏ" cần Mod ưu tiên đẩy bài viết &amp; thực đơn cải thiện.
            </p>
          </div>

          {/* Severity filter tabs */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-xl border border-surface-container-high/60 self-start sm:self-auto">
            <button
              onClick={() => setSelectedNutrientTab('all')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedNutrientTab === 'all'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Tất cả ({overview.micronutrientDeficits.length})
            </button>
            <button
              onClick={() => setSelectedNutrientTab('high')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedNutrientTab === 'high'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30'
              }`}
            >
              Báo động cao (High)
            </button>
            <button
              onClick={() => setSelectedNutrientTab('medium')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                selectedNutrientTab === 'medium'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              }`}
            >
              Trung bình (Med)
            </button>
          </div>
        </div>

        {/* Deficit Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredDeficits.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                item.severity === 'high'
                  ? 'border-rose-300/80 bg-rose-50/30 dark:bg-rose-950/10'
                  : item.severity === 'medium'
                  ? 'border-amber-300/80 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-emerald-300/80 bg-emerald-50/30 dark:bg-emerald-950/10'
              }`}
            >
              <div>
                {/* Header: Name + Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-on-surface">{item.nutrientName}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      item.severity === 'high'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200'
                        : item.severity === 'medium'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200'
                    }`}
                  >
                    {item.deficitPercent}% Thiếu
                  </span>
                </div>

                {/* Progress bar of Deficit */}
                <div className="w-full bg-surface-container rounded-full h-2 mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.severity === 'high'
                        ? 'bg-rose-500'
                        : item.severity === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${item.deficitPercent}%` }}
                  />
                </div>

                {/* Intake vs RDI */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-surface/70 p-2.5 rounded-xl border border-surface-container-high/40 mb-3">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Khuyến Nghị (RDI)</span>
                    <span className="font-semibold text-on-surface">{item.standardRdi}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block uppercase font-bold">Thực Tế Hội Viên</span>
                    <span className="font-bold text-rose-600">{item.avgCommunityIntake}</span>
                  </div>
                </div>

                {/* Recommended Sources */}
                <div className="space-y-1 mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Nguồn Bổ Sung Thuần Chay Tối Ưu:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {item.recommendedSources?.map((src, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] px-2 py-0.5 rounded bg-surface border border-surface-container-high text-on-surface font-medium"
                      >
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nutritionist Advice */}
              <div className="pt-3 border-t border-surface-container-high/60 text-xs text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface">Chỉ dẫn Mod:</strong> {item.nutritionistAdvice}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: COMMUNITY GOALS & POPULAR INGREDIENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Community Dietary Goals */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">psychology_alt</span>
              Mục Tiêu Dinh Dưỡng Của Hội Viên (Dietary Goals)
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Động lực chủ đạo thúc đẩy người dùng lựa chọn chế độ thuần thực vật trên VeggieAI.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {overview.dietaryGoals?.map((goal, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-on-surface flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: goal.colorHex }} />
                    {goal.goalName}
                  </span>
                  <span className="font-semibold text-on-surface-variant">
                    {goal.percentage}% ({goal.memberCount.toLocaleString('vi-VN')} người)
                  </span>
                </div>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${goal.percentage}%`, backgroundColor: goal.colorHex }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Calorie Ranges */}
          <div className="pt-4 border-t border-surface-container-high/60">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2.5">
              Phân Bổ Mức Năng Lượng Khẩu Phần:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {overview.calorieDistribution?.map((c, cIdx) => (
                <div key={cIdx} className="bg-surface p-2.5 rounded-xl border border-surface-container-high/50 text-center">
                  <div className="text-xs font-bold text-primary">{c.percentage}%</div>
                  <div className="text-[11px] text-on-surface-variant truncate mt-0.5">{c.rangeLabel.split(' ')[0]} kcal</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Trending Vegan Ingredients */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-surface-container-high/60 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">trending_up</span>
              Top Nguyên Liệu Thuần Chay Thịnh Hành Trong Tuần
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Các nguyên liệu được cộng đồng ghi nhận nhiều nhất trong các món ăn và công thức.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {overview.topIngredients?.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface border border-surface-container-high/40 flex items-center justify-between gap-3 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">{item.name}</div>
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{item.primaryNutrient}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end">
                    <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                    +{item.growthRate}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant">{item.mentionsCount} lượt dùng</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

