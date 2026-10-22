import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Play, Clock, Sparkles, X, Heart, Eye, Bookmark, 
  Share2, CheckCircle2, ChevronRight, Youtube, Flame, Check,
  Lock, ArrowRight, Plus, ChevronLeft, Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function VideosPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const { user } = useAuth();
  const isGuest = !user;
  const GUEST_EXTRACT_LIMIT = 2;

  const [guestExtractionsUsed, setGuestExtractionsUsed] = useState(() => {
    try {
      const saved = localStorage.getItem('veggieai_guest_extractions_used');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const remainingExtractions = Math.max(0, GUEST_EXTRACT_LIMIT - guestExtractionsUsed);
  const hasReachedExtractLimit = isGuest && remainingExtractions === 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [activeTimeFilter, setActiveTimeFilter] = useState('Tất cả');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // YouTube Extractor State
  const [extractUrl, setExtractUrl] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedResult, setExtractedResult] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const categories = [
    'Tất cả',
    'Món nước & Súp',
    'Món kho đậm vị',
    'Salad & Healthy Bowl',
    'Món xào thanh',
    'Món chay Đãi tiệc',
    'Sữa hạt dinh dưỡng'
  ];

  const timeFilters = ['Tất cả', 'Dưới 5 phút', '5 - 15 phút', 'Hướng dẫn chi tiết'];

  const featuredVideo = {
    id: 'vf-pho',
    badge: 'TIÊU ĐIỂM TUẦN',
    aiBadge: '⚡ AI Tóm tắt sẵn sàng (30s)',
    title: 'Bí Quyết Nấu Phở Nấm Dưỡng Sinh: Nước Dùng Trong Ngọt Tự Nhiên Từ Củ Quả & Nấm Hương',
    author: 'Bếp Chay Thanh Tịnh',
    views: '124k lượt xem',
    rating: '★ 4.9',
    duration: '12:45',
    category: 'Món nước & Súp',
    timeCategory: '5 - 15 phút',
    quality: '4K ULTRA HD',
    img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1200&q=80',
    macro: {
      calories: '385 kcal',
      protein: '19.6g',
      carbs: '54.0g',
      fat: '7.2g'
    },
    aiCoreTips: [
      {
        title: 'Nước dùng trong veo không cặn:',
        desc: 'Hầm lê và mía tím ở 85°C, không đậy vung để hơi hăng thoát ra ngoài.'
      },
      {
        title: 'Bí quyết Umami tự nhiên:',
        desc: 'Củ cải sấy khô sao cháy xém nướng sơ tạo vị ngọt sâu thanh thoát.'
      },
      {
        title: 'Chân nấm đùi gà xé sợi:',
        desc: 'Ướp tamari cùng dầu mè áp chảo xém vàng để tạo độ dai thơm ngon.'
      }
    ],
    ingredients: [
      'Bánh phở tươi: 150g',
      'Nấm đùi gà & Nấm hương khô: 100g',
      'Đậu hũ chiên vàng: 1 miếng',
      'Nước dùng củ quả (mía tím, lê, củ cải, hành baro nướng): 500ml',
      'Gia vị thảo mộc: Hoa hồi, quế thanh, thảo quả sao thơm',
      'Rau thơm: Ngò gai, húng quế, chanh ớt tươi'
    ],
    steps: [
      '00:15 - Nướng thơm hành tây, gừng, hồi, quế trên lửa nhỏ tạo tầng hương thảo mộc.',
      '02:40 - Ninh củ cải khô, lê và mía tím với 1.5L nước trong 35 phút ở nhiệt độ 85–90°C để nước trong.',
      '06:10 - Áp chảo nấm đùi gà với nước tương tamari và dầu mè cho xém cạnh, dậy mùi thơm giòn.',
      '09:30 - Chần nhanh bánh phở qua nước sôi, xếp vào tô cùng nấm xào, đậu hũ lát và rau mùi.',
      '11:45 - Chan nước dùng phở sôi bốc khói, rắc tiêu sọ và dọn kèm đĩa rau thơm chanh ớt.'
    ]
  };

  const latestVideos = [
    {
      id: 'v1',
      title: 'Bún Bò Huế Thuần Chay Chuẩn Vị Với Nước Dùng Nấm & Sả Nướng',
      author: 'Tuệ Tâm Kitchen',
      views: '89k xem',
      duration: '08:30',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '340 kcal • 15g đạm',
      macro: { calories: '340 kcal', protein: '15.2g', carbs: '48.0g', fat: '6.0g' },
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Tạo mùi thơm đặc trưng bún bò:', desc: 'Nướng thơm 5 nhánh sả đập dập cùng hạt màu điều trước khi ninh nước dùng.' },
        { title: 'Chả chay dai giòn:', desc: 'Dùng váng đậu tươi cuộn tròn hấp chín rồi chiên sơ vàng.' }
      ],
      ingredients: ['Bún sợi to: 150g', 'Nấm đông cô tươi: 80g', 'Đậu hũ chiên: 50g', 'Sả cây nướng thơm: 5 nhánh'],
      steps: ['01:00 - Phi thơm sả băm và ớt bột trong dầu điều.', '03:30 - Ninh thơm dứa và bắp ngọt làm nước dùng thanh mát.', '07:00 - Thả nấm đông cô và đậu hũ, nêm gia vị.', '08:00 - Xếp bún và chan nước dùng nóng.']
    },
    {
      id: 'v2',
      title: 'Nấm Đùi Gà Kho Tiêu Nồi Đất Đậm Đà Bắt Cơm Cho Ngày Mưa',
      author: 'Bếp Mẹ An',
      views: '210k xem',
      duration: '06:15',
      timeCategory: '5 - 15 phút',
      category: 'Món kho đậm vị',
      macroShort: '210 kcal • 12g đạm',
      macro: { calories: '210 kcal', protein: '12.0g', carbs: '18.0g', fat: '4.5g' },
      img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Khía mắt lưới mặt nấm:', desc: 'Giúp nấm đùi gà ngấm sâu nước sốt tiêu đen mà không bị dai xơ.' },
        { title: 'Kho nồi đất giữ nhiệt:', desc: 'Kho riu riu lửa nhỏ đến khi nước tương keo lại bóng đẹp.' }
      ],
      ingredients: ['Nấm đùi gà cắt khoanh: 300g', 'Tiêu xanh & tiêu đen: 2 thìa', 'Nước tương cốt: 3 thìa canh', 'Đường mía thô: 1 thìa'],
      steps: ['01:00 - Khía chéo mặt khoanh nấm và áp chảo vàng đều 2 mặt.', '03:00 - Xào thơm gốc boa-rô và tiêu xanh đập dập trong nồi đất.', '04:30 - Đổ hỗn hợp sốt nước tương và rim nhỏ lửa 10 phút.', '06:00 - Rắc ớt sừng và dọn ăn cùng cơm nóng.']
    },
    {
      id: 'v3',
      title: 'Salad Quinoa Bơ Sáp Và Đậu Gà Giòn Tan Cho Bữa Trưa Eat Clean',
      author: 'Fit Vegan VN',
      views: '67k xem',
      duration: '04:45',
      timeCategory: 'Dưới 5 phút',
      category: 'Salad & Healthy Bowl',
      macroShort: '420 kcal • 22g đạm',
      macro: { calories: '420 kcal', protein: '22.4g', carbs: '52.0g', fat: '14.2g' },
      img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Đậu gà sấy giòn rụm:', desc: 'Trộn đậu gà với bột tỏi, ớt paprika nướng nồi chiên không dầu 180°C 15 phút.' },
        { title: 'Sốt chanh leo thanh mát:', desc: 'Nước cốt chanh leo kết hợp dầu ô liu nguyên chất và mật thốt nốt.' }
      ],
      ingredients: ['Hạt quinoa nấu chín: 1 chén', 'Đậu gà ngâm luộc chín: 100g', 'Bơ sáp cắt hạt lựu: 1/2 quả', 'Cà chua bi & rau mầm: 80g'],
      steps: ['01:00 - Nướng giòn đậu gà trong nồi chiên không dầu.', '02:30 - Lắc đều hỗn hợp sốt chanh leo và dầu ô liu.', '04:00 - Trộn đều quinoa, bơ, rau mầm cùng sốt và rắc đậu gà lên trên.']
    },
    {
      id: 'v4',
      title: 'Đậu Hũ Tứ Xuyên Thuần Chay Cay Nồng Kích Thích Vị Giác',
      author: 'Chef Lâm Chay',
      views: '155k xem',
      duration: '09:20',
      timeCategory: '5 - 15 phút',
      category: 'Món xào thanh',
      macroShort: '290 kcal • 17g đạm',
      macro: { calories: '290 kcal', protein: '17.1g', carbs: '16.5g', fat: '9.0g' },
      img: 'https://images.unsplash.com/photo-1546069901-d779e51c8771?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Đậu hũ non không bị vỡ:', desc: 'Chần nhẹ đậu hũ non qua nước sôi pha xíu muối trước khi cho vào sốt.' },
        { title: 'Vị tê chuẩn Tứ Xuyên:', desc: 'Rang thơm hạt tiêu Tứ Xuyên rồi tán mịn, rắc lên mặt đĩa khi dọn ra.' }
      ],
      ingredients: ['Đậu hũ non: 1 hộp (300g)', 'Nấm hương ngâm băm nhỏ: 80g', 'Tương ớt Đậu Bản Tứ Xuyên chay: 2 thìa', 'Bột năng pha loãng: 1 thìa'],
      steps: ['01:30 - Xào thơm nấm hương băm cùng tương đậu bản chay.', '04:00 - Thêm nước dùng rau củ và nhẹ nhàng thả các viên đậu hũ non.', '07:00 - Xuống bột năng tạo độ sánh óng ánh cho nước sốt.', '08:45 - Rắc tiêu Tứ Xuyên và boa-rô thái lát.']
    },
    {
      id: 'v5',
      title: 'Súp Bí Đỏ Hạt Dẻ Nướng Kem Béo Thuần Thực Vật',
      author: 'Green Life Studio',
      views: '94k xem',
      duration: '07:50',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '260 kcal • 8g đạm',
      macro: { calories: '260 kcal', protein: '8.2g', carbs: '38.0g', fat: '7.8g' },
      img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Nướng bí đỏ trước khi nấu:', desc: 'Nướng thơm bí đỏ giúp cô đọng đường tự nhiên và tạo hương caramel ngậy.' },
        { title: 'Chất kem sánh mịn:', desc: 'Thay kem sữa động vật bằng kem hạt điều ngâm mềm xay nhuyễn.' }
      ],
      ingredients: ['Bí đỏ hạt đậu Nhật: 300g', 'Hạt dẻ nướng bóc vỏ: 80g', 'Sữa yến mạch không đường: 200ml', 'Hạt bí xanh rang trang trí'],
      steps: ['01:00 - Nướng thơm bí đỏ 20 phút.', '03:45 - Xào sơ bí đỏ nướng và hạt dẻ với boa-rô.', '06:20 - Thêm nước hầm rau củ đun sôi, xay mịn bằng máy xay.', '07:30 - Rót súp ra tô, rưới kem hạnh nhân và rắc hạt bí.']
    },
    {
      id: 'v6',
      title: 'Giò Lụa Chay Bằng Váng Đậu Giòn Dai Truyền Thống',
      author: 'Thiên Nhân',
      views: '320k xem',
      duration: '15:10',
      timeCategory: 'Hướng dẫn chi tiết',
      category: 'Món chay Đãi tiệc',
      macroShort: '190 kcal • 18g đạm',
      macro: { calories: '190 kcal', protein: '18.4g', carbs: '8.2g', fat: '6.5g' },
      img: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Chọn váng đậu (tàu hũ ky):', desc: 'Dùng lá khô ngâm nước ấm pha xíu baking soda để tạo độ dai dẻo.' },
        { title: 'Kỹ thuật bó chặt tay:', desc: 'Dùng lá chuối gói thành đòn tròn và buộc dây lạt căng để giò nén chặt.' }
      ],
      ingredients: ['Váng đậu khô: 300g', 'Tiêu hạt đập dập: 2 thìa cà phê', 'Hạt nêm nấm & dầu boa-rô: 2 thìa canh', 'Lá chuối tươi & dây lạt'],
      steps: ['01:30 - Ngâm váng đậu mềm trong nước ấm, rửa sạch và vắt ráo.', '05:00 - Trộn đều váng đậu cùng tiêu hạt, dầu boa-rô phi thơm.', '09:10 - Trải lá chuối, xếp nhân và cuộn tròn thật chặt tay.', '13:20 - Hấp cách thủy 45 phút, để nguội nén trong tủ mát trước khi xắt khoanh.']
    }
  ];

  const [videoList, setVideoList] = useState(latestVideos);

  useEffect(() => {
    try {
      const userPublished = JSON.parse(localStorage.getItem('veggieai_user_published_posts') || '[]');
      const userVideos = userPublished.filter(p => p.type === 'Video').map(v => ({
        id: v.id,
        title: v.title,
        author: v.author || 'Tác giả cộng đồng',
        views: v.views || 'Mới đăng',
        duration: v.duration || '10:00',
        timeCategory: '5 - 15 phút',
        category: v.category || 'Món chay Đãi tiệc',
        macroShort: '300 kcal • 10g đạm',
        macro: { calories: '300 kcal', protein: '10g', carbs: '35g', fat: '8g' },
        img: v.img || v.coverImage || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
        aiCoreTips: [
          { title: 'Nguyên liệu từ Speech-to-Recipe AI:', desc: Array.isArray(v.ingredients) ? v.ingredients.join(', ') : 'Rau củ tươi thuần chay' }
        ],
        ingredients: Array.isArray(v.ingredients) ? v.ingredients : [v.ingredients || 'Nguyên liệu tươi'],
        steps: Array.isArray(v.steps) && v.steps.length > 0 ? v.steps : [v.content || 'Xem video hướng dẫn chi tiết']
      }));
      if (userVideos.length > 0) {
        setVideoList([...userVideos, ...latestVideos]);
      }
    } catch {}
  }, []);

  const filteredVideos = useMemo(() => {
    return videoList.filter(video => {
      const matchesCategory = activeCategory === 'Tất cả' || video.category === activeCategory;
      const matchesTime = activeTimeFilter === 'Tất cả' || video.timeCategory === activeTimeFilter;
      const matchesSearch = !searchQuery || 
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.macroShort.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesTime && matchesSearch;
    });
  }, [videoList, activeCategory, activeTimeFilter, searchQuery]);

  const handleExtractRecipe = (e) => {
    e.preventDefault();

    if (hasReachedExtractLimit) {
      setShowRegisterPopup(true);
      return;
    }

    setIsExtracting(true);

    if (isGuest) {
      setGuestExtractionsUsed(prev => {
        const next = prev + 1;
        try {
          localStorage.setItem('veggieai_guest_extractions_used', next.toString());
        } catch {}
        return next;
      });
    }

    setTimeout(() => {
      setIsExtracting(false);
      const mockResult = {
        id: `extracted-${Date.now()}`,
        title: 'Công thức trích xuất từ Video: Canh Chua Nấm Đùi Gà Dọc Mùng',
        author: 'Nguồn: Kênh Nấu Ăn Tự Nhiên (YouTube)',
        views: 'Trích xuất tự động thành công (30 giây)',
        duration: '08:45',
        macroShort: '185 kcal • 8.5g đạm',
        macro: { calories: '185 kcal', protein: '8.5g', carbs: '24.0g', fat: '4.2g' },
        img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80',
        aiCoreTips: [
          { title: 'Vị chua thanh mát:', desc: 'Dùng nước cốt me tươi hoặc cơm mẻ lọc mịn thay vì giấm công nghiệp.' },
          { title: 'Dọc mùng giòn không ngứa:', desc: 'Tước vỏ, bóp đều cùng muối hạt trong 5 phút rồi rửa sạch vắt ráo nước.' },
          { title: 'Nấm đùi gà thấm vị:', desc: 'Ướp nấm với xíu hạt nêm và nước tương 10 phút trước khi nấu.' }
        ],
        ingredients: [
          'Nấm đùi gà cắt lát xéo: 150g',
          'Dọc mùng (bạc hà) đã sơ chế: 100g',
          'Cà chua chín & dứa thơm: 150g',
          'Nước cốt me chua: 3 thìa canh',
          'Ngò gai, ngổ điếc, ớt sừng'
        ],
        steps: [
          '00:30 - Xào thơm cà chua và dứa cùng 1 thìa dầu hoa cải.',
          '02:15 - Thêm 600ml nước, rót nước cốt me và đun sôi.',
          '05:00 - Thả nấm đùi gà và dọc mùng, nêm đường phèn và muối hầm.',
          '07:30 - Tắt bếp, rắc rau ngổ, ngò gai thái nhỏ và dọn ra tô ăn nóng.'
        ]
      };
      setExtractedResult(mockResult);
      setSelectedVideo(mockResult);
      showToast('✨ Trích xuất Speech-to-Recipe AI thành công!');
    }, 1200);
  };

  const handleSaveFavoriteVideo = () => {
    if (!user) {
      if (onNavigate) onNavigate('login');
      return;
    }
    const nextState = !savedSuccess;
    setSavedSuccess(nextState);
    showToast(nextState ? '❤️ Đã lưu vào Video yêu thích!' : 'Đã bỏ lưu khỏi Video yêu thích');
  };

  return (
    <div className="min-h-screen bg-alabaster/40 py-8 px-4 sm:px-6 lg:px-8 space-y-10 max-w-7xl mx-auto animate-fade-up">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest text-white px-5 py-3 rounded-2xl shadow-floating flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fade-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================
          1. HERO HEADER SECTION
      ==================================================================== */}
      <section className="bg-forest text-alabaster rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SPEECH-TO-RECIPE AI • TÓM TẮT CÔNG THỨC 30 GIÂY</span>
          </div>

          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-[1.15]">
            Video Nấu Ăn Thuần Chay & AI Trợ Giảng
          </h1>

          <p className="text-xs sm:text-sm text-alabaster/80 leading-relaxed max-w-2xl mx-auto">
            Học nấu ăn trực quan với công nghệ Speech-to-Recipe tự động trích xuất định lượng nguyên liệu, phân tích chỉ số Calo/Đạm và mẹo cốt lõi.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto flex items-center bg-white rounded-full p-1.5 shadow-card border border-white/20">
            <Search className="w-4 h-4 text-slate-400 ml-3 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm video: phở nấm, nem giòn, bún bò, cà ri..."
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent py-1"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 mr-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-emeraldBotanic hover:bg-forest text-white text-xs font-semibold transition shrink-0"
            >
              Tìm kiếm
            </button>
          </div>

          {/* User Create Video Button */}
          {user && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('create-video')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition cursor-pointer backdrop-blur-xs"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chia sẻ video nấu ăn mới 📹</span>
              </button>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-emeraldBotanic text-white shadow-xs font-bold'
                      : 'bg-white/10 text-alabaster/90 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. FEATURED VIDEO HERO CARD (TIÊU ĐIỂM TUẦN)
      ==================================================================== */}
      {activeCategory === 'Tất cả' && !searchQuery && (
        <section className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 grid grid-cols-1 lg:grid-cols-12">
          {/* Media Box */}
          <div
            onClick={() => setSelectedVideo(featuredVideo)}
            className="lg:col-span-5 relative min-h-[260px] lg:min-h-[400px] overflow-hidden cursor-pointer group"
          >
            <img
              src={featuredVideo.img}
              alt={featuredVideo.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
            <div className="absolute inset-0 bg-forest/30 group-hover:bg-forest/20 transition"></div>

            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-forest/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold">
              {featuredVideo.quality}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/90 text-forest flex items-center justify-center shadow-floating group-hover:scale-110 transition">
                <Play className="w-6 h-6 fill-current ml-1 text-forest" />
              </div>
            </div>

            <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/70 text-white text-xs font-metric font-semibold">
              {featuredVideo.duration}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-metric">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
                  {featuredVideo.badge}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {featuredVideo.aiBadge}
                </span>
              </div>

              <h2
                onClick={() => setSelectedVideo(featuredVideo)}
                className="font-editorial text-xl sm:text-2xl lg:text-3xl font-bold text-forest hover:text-emeraldBotanic transition leading-snug cursor-pointer"
              >
                {featuredVideo.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-olive font-metric">
                <span className="font-bold text-forest">{featuredVideo.author}</span>
                <span>•</span>
                <span>{featuredVideo.views}</span>
                <span>•</span>
                <span className="text-amber-600 font-bold">{featuredVideo.rating}</span>
              </div>

              {/* AI Highlight Tips */}
              <div className="bg-alabaster p-4 rounded-2xl border border-hairline space-y-2">
                <div className="text-[11px] font-bold text-forest flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emeraldBotanic" />
                  <span>3 Mẹo cốt lõi từ Speech-to-Recipe</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {featuredVideo.aiCoreTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emeraldBotanic/15 text-emeraldBotanic text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span><strong>{tip.title}</strong> {tip.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-metric">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-hairline">
                  <div className="text-[10px] text-olive">Năng lượng</div>
                  <div className="font-bold text-forest">{featuredVideo.macro.calories}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-hairline">
                  <div className="text-[10px] text-olive">Đạm thực vật</div>
                  <div className="font-bold text-emeraldBotanic">{featuredVideo.macro.protein}</div>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-hairline">
                  <div className="text-[10px] text-olive">Carb phức</div>
                  <div className="font-bold text-forest">{featuredVideo.macro.carbs}</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedVideo(featuredVideo)}
                className="px-4 py-2.5 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Xem video & Tóm tắt AI</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveFavoriteVideo}
                  className="px-3.5 py-2 rounded-xl border border-hairline text-olive hover:text-forest hover:bg-alabaster text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedSuccess ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                  <span>{savedSuccess ? 'Đã lưu' : 'Lưu video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('video-detail', featuredVideo)}
                  className="px-4 py-2 rounded-xl bg-emeraldBotanic hover:bg-forest text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>Xem chi tiết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ====================================================================
          3. LATEST VIDEOS GRID
      ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-editorial text-2xl font-bold text-forest">Video Nấu Ăn Mới Nhất</h2>
            <p className="text-xs text-olive">Học nhanh công thức trực quan qua từng góc quay ngắn gọn có bản phân tích dinh dưỡng</p>
          </div>

          {/* Time filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {timeFilters.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveTimeFilter(tf)}
                className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTimeFilter === tf
                    ? 'bg-forest text-white font-bold'
                    : 'bg-white border border-hairline text-olive hover:bg-alabaster'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((item) => (
            <article
              key={item.id}
              onClick={() => setSelectedVideo(item)}
              className="bg-white rounded-3xl border border-hairline overflow-hidden shadow-xs hover:shadow-card transition duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>

                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-forest/80 backdrop-blur-md text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Tóm tắt AI</span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px] font-metric font-semibold">
                    {item.duration}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-forest flex items-center justify-center shadow-md">
                      <Play className="w-4 h-4 fill-current ml-0.5 text-forest" />
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="text-[11px] text-olive font-metric flex items-center justify-between">
                    <span className="font-semibold text-forest">{item.author}</span>
                    <span>{item.views}</span>
                  </div>

                  <h3 className="font-editorial text-base font-bold text-forest group-hover:text-emeraldBotanic transition leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-hairline flex items-center justify-between text-xs text-olive font-metric">
                <span className="font-bold text-forest text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-hairline">
                  {item.macroShort}
                </span>

                <span className="flex items-center gap-1 text-emeraldBotanic font-bold group-hover:translate-x-0.5 transition text-[11px]">
                  <span>Xem tóm tắt</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-hairline p-8 space-y-3">
            <p className="text-sm text-olive">Không tìm thấy video nào phù hợp với bộ lọc hiện tại.</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); setActiveTimeFilter('Tất cả'); }}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forestDark transition"
            >
              Xem tất cả video
            </button>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster disabled:opacity-40 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-olive" />
          </button>

          {[1, 2, 3].map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-xs font-metric font-bold transition cursor-pointer ${
                currentPage === page
                  ? 'bg-forest text-white shadow-xs'
                  : 'bg-white border border-hairline text-olive hover:bg-alabaster'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage(currentPage + 1)}
            className="p-2 rounded-xl border border-hairline bg-white hover:bg-alabaster transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-olive" />
          </button>
        </div>
      </section>

      {/* ====================================================================
          4. YOUTUBE SPEECH-TO-RECIPE EXTRACTOR SECTION
      ==================================================================== */}
      <section className="bg-forest text-alabaster rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-card text-center space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 mx-auto">
          <Youtube className="w-6 h-6" />
        </div>

        {/* Freemium Limit Hook */}
        <div>
          {isGuest ? (
            <div
              onClick={() => hasReachedExtractLimit && setShowRegisterPopup(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                hasReachedExtractLimit
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/30 cursor-pointer'
                  : 'bg-emerald-400/15 text-emerald-300 border-emerald-400/20'
              }`}
            >
              {hasReachedExtractLimit ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>
                {hasReachedExtractLimit
                  ? `Đã hết lượt dùng thử miễn phí (0/${GUEST_EXTRACT_LIMIT}) • Nhấn để đăng ký`
                  : `Dùng thử: Còn ${remainingExtractions}/${GUEST_EXTRACT_LIMIT} lượt trích xuất AI miễn phí`}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tài khoản thành viên • Trích xuất Speech-to-Recipe không giới hạn</span>
            </div>
          )}
        </div>

        <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
          Bạn Có Video Nấu Ăn Yêu Thích Trên YouTube?
        </h2>

        <p className="text-xs sm:text-sm text-alabaster/80 max-w-lg mx-auto">
          Chỉ cần dán đường link video, trợ lý VeggieAI sẽ tự động tách nguyên liệu, định lượng calo và tóm tắt từng bước nấu chỉ trong 30 giây.
        </p>

        <form onSubmit={handleExtractRecipe} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2 pt-2">
          <input
            type="text"
            value={extractUrl}
            onChange={(e) => setExtractUrl(e.target.value)}
            onClick={() => hasReachedExtractLimit && setShowRegisterPopup(true)}
            placeholder={
              hasReachedExtractLimit
                ? 'Bạn đã hết lượt dùng thử miễn phí. Vui lòng đăng ký tài khoản...'
                : '🔗 Dán liên kết YouTube, TikTok hoặc Facebook Video...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm outline-none"
          />
          <button
            type="submit"
            disabled={isExtracting}
            className={`px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-semibold transition cursor-pointer shrink-0 shadow-xs flex items-center justify-center gap-2 ${
              hasReachedExtractLimit
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-terracotta hover:bg-terracottaDark'
            }`}
          >
            {isExtracting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Đang phân tích Speech-to-Recipe...</span>
              </>
            ) : hasReachedExtractLimit ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Hết lượt • Đăng ký ngay</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Trích xuất công thức AI</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-alabaster/60">
          {isGuest ? (
            <span>
              Khách vãng lai: Còn <strong>{remainingExtractions}/{GUEST_EXTRACT_LIMIT}</strong> lượt dùng thử • Đăng ký để dùng không giới hạn
            </span>
          ) : (
            <span>Miễn phí cho mọi tài khoản thành viên • Tương thích mọi video có phụ đề hoặc âm thanh rõ ràng</span>
          )}
        </p>
      </section>

      {/* ====================================================================
          5. VIDEO MODAL / SPEECH-TO-RECIPE SUMMARY PREVIEW
      ==================================================================== */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-forest/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-floating border border-hairline p-6 sm:p-8 space-y-6 animate-scale-up relative">
            <button
              type="button"
              onClick={() => setSelectedVideo(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emeraldBotanic/10 text-emeraldBotanic text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tóm tắt thông minh Speech-to-Recipe</span>
              </span>

              <h2 className="font-editorial text-2xl font-bold text-forest leading-tight">
                {selectedVideo.title}
              </h2>

              <div className="flex items-center gap-2 text-xs text-olive font-metric">
                <span className="font-bold text-forest">{selectedVideo.author}</span>
                <span>•</span>
                <span>{selectedVideo.views}</span>
                <span>•</span>
                <span>{selectedVideo.duration}</span>
              </div>
            </div>

            {/* Video preview / thumbnail */}
            <div className="relative aspect-video rounded-2xl overflow-hidden group">
              <img
                src={selectedVideo.img}
                alt={selectedVideo.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/95 text-forest flex items-center justify-center shadow-lg">
                  <Play className="w-6 h-6 fill-current ml-1 text-forest" />
                </div>
              </div>
            </div>

            {/* Macros summary */}
            {selectedVideo.macro && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-metric">
                <div className="bg-alabaster p-3 rounded-2xl border border-hairline">
                  <div className="text-[10px] text-olive">Năng lượng</div>
                  <div className="font-bold text-forest">{selectedVideo.macro.calories}</div>
                </div>
                <div className="bg-alabaster p-3 rounded-2xl border border-hairline">
                  <div className="text-[10px] text-olive">Đạm thực vật</div>
                  <div className="font-bold text-emeraldBotanic">{selectedVideo.macro.protein}</div>
                </div>
                <div className="bg-alabaster p-3 rounded-2xl border border-hairline">
                  <div className="text-[10px] text-olive">Carb phức</div>
                  <div className="font-bold text-forest">{selectedVideo.macro.carbs}</div>
                </div>
              </div>
            )}

            {/* Core Tips */}
            {selectedVideo.aiCoreTips && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emeraldBotanic" />
                  <span>Mẹo cốt lõi từ AI Speech-to-Recipe:</span>
                </h4>
                <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-hairline">
                  {selectedVideo.aiCoreTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emeraldBotanic/15 text-emeraldBotanic text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span><strong>{tip.title}</strong> {tip.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            {selectedVideo.ingredients && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-forest">
                  Nguyên liệu bóc tách:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {selectedVideo.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-alabaster px-3 py-1.5 rounded-xl border border-hairline">
                      <span className="w-1.5 h-1.5 rounded-full bg-emeraldBotanic"></span>
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-hairline flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 rounded-xl border border-hairline text-olive hover:text-forest text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveFavoriteVideo}
                  className="px-4 py-2 rounded-xl border border-hairline bg-alabaster hover:bg-slate-200 text-forest text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${savedSuccess ? 'fill-emeraldBotanic text-emeraldBotanic' : ''}`} />
                  <span>{savedSuccess ? 'Đã lưu' : 'Lưu video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const v = selectedVideo;
                    setSelectedVideo(null);
                    if (onNavigate) onNavigate('video-detail', v);
                  }}
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forestDark text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Xem chi tiết video</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register modal popup when Guest reaches extraction limit */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-50 bg-forest/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-floating border border-hairline p-6 sm:p-8 space-y-5 animate-scale-up text-center relative">
            <button
              type="button"
              onClick={() => setShowRegisterPopup(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-editorial text-2xl font-bold text-forest">
                Mở Khóa Trích Xuất AI Không Giới Hạn
              </h3>
              <p className="text-xs text-olive leading-relaxed">
                Bạn đã sử dụng hết {GUEST_EXTRACT_LIMIT} lượt dùng thử miễn phí. Đăng ký tài khoản VeggieAI ngay để trích xuất không giới hạn công thức từ YouTube & TikTok!
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRegisterPopup(false);
                  if (onNavigate) onNavigate('register');
                }}
                className="w-full py-3 rounded-xl bg-forest hover:bg-forestDark text-white text-xs sm:text-sm font-semibold transition cursor-pointer shadow-xs"
              >
                Đăng ký tài khoản miễn phí
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowRegisterPopup(false);
                  if (onNavigate) onNavigate('login');
                }}
                className="w-full py-2.5 rounded-xl border border-hairline text-forest text-xs font-semibold hover:bg-alabaster transition cursor-pointer"
              >
                Đã có tài khoản? Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
