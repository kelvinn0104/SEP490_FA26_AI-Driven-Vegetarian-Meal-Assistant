import React, { useState, useEffect } from 'react';
import { 
  Search, Play, Clock, Sparkles, X, Heart, Eye, Bookmark, 
  Share2, CheckCircle2, ChevronRight, Youtube, Flame, Check,
  Lock, ArrowRight
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

export default function VideosPage({ onNavigate }) {
  // Luôn đảm bảo khi mở trang Videos thì vị trí cuộn ở đỉnh trang (0, 0)
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
    } catch (e) {
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

  // Category filter tabs from design mockup
  const categories = [
    'Tất cả',
    'Món nước & Súp',
    'Món kho đậm vị',
    'Salad & Healthy Bowl',
    'Món xào thanh',
    'Món chay Đãi tiệc',
    'Thông minh & Sữa hạt'
  ];

  // Time filter pills
  const timeFilters = ['Tất cả', 'Dưới 5 phút', '5 - 15 phút', 'Hướng dẫn chi tiết'];

  // Featured hero video
  const featuredVideo = {
    id: 'vf-pho',
    badge: 'TIÊU ĐIỂM TUẦN',
    aiBadge: '⚡ AI Tóm tắt sẵn sàng (30 s)',
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
        desc: 'Ướp ta-mari cùng dầu mè áp chảo xém vàng để tạo độ dai thần thánh.'
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
      '02:40 - Ninh củ cải khô, lê và mía tím với 1.5L nước trong 35 phút ở nhiệt độ 85-90°C để nước trong.',
      '06:10 - Áp chảo nấm đùi gà với nước tương tamari và dầu mè cho xém cạnh, dậy mùi thơm giòn.',
      '09:30 - Chần nhanh bánh phở qua nước sôi, xếp vào tô cùng nấm xào, đậu hũ lát và rau mùi.',
      '11:45 - Chan nước dùng phở sôi bốc khói, rắc tiêu sọ và dọn kèm đĩa rau thơm chanh ớt.'
    ]
  };

  // 6 Latest Videos from mockup
  const latestVideos = [
    {
      id: 'v1',
      title: 'Ram Chay Giòn Rụm Không Hút Dầu Nướng Nồi Chiên Không Dầu',
      author: 'Bếp Chay Tuệ Tâm',
      views: '89k xem',
      duration: '11:45',
      timeCategory: '5 - 15 phút',
      category: 'Món kho đậm vị',
      macroShort: '215 kcal • 7g đạm',
      macro: { calories: '215 kcal', protein: '7.2g', carbs: '28.5g', fat: '8.1g' },
      img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Bí quyết vỏ ram giòn:', desc: 'Quét lớp bia mỏng hoặc giấm gạo lên bánh tráng trước khi gói.' },
        { title: 'Nhân không bị nhão:', desc: 'Vắt ráo nước đậu hũ non và xào sơ miến với nấm mèo trước khi trộn.' },
        { title: 'Nhiệt độ nồi chiên:', desc: 'Nướng 180°C trong 12 phút, xịt dầu mỏng và trở mặt thêm 5 phút ở 200°C.' }
      ],
      ingredients: [
        'Bánh tráng đậu xanh / bánh đa nem: 15 cái',
        'Khoai môn bào sợi: 80g',
        'Nấm mèo & miến dong ngâm nở: 50g',
        'Đậu hũ trắng ép ráo: 1 miếng',
        'Gia vị: Tiêu sọ, hạt nêm chay nấm, dầu mè'
      ],
      steps: [
        '00:30 - Bào nhuyễn khoai môn, cà rốt; xào tái cùng nấm mèo và tiêu sọ.',
        '03:15 - Bóp nhuyễn đậu hũ, trộn đều nguyên liệu và nêm thìa dầu mè.',
        '06:20 - Cuốn nem đều tay, dùng nước giấm pha loãng làm ẩm bánh tráng.',
        '09:40 - Xếp vào nồi chiên không dầu 180°C trong 12 phút cho vàng ruộm đều 2 mặt.'
      ]
    },
    {
      id: 'v2',
      title: 'Cà Ri Xanh Kiểu Thái Thuần Chay Béo Cốt Dừa & Nấm Đùi Gà',
      author: 'Green Gourmet',
      views: '210k xem',
      duration: '10:48',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '420 kcal • 14g đạm',
      macro: { calories: '420 kcal', protein: '14.0g', carbs: '32.0g', fat: '26.5g' },
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Màu xanh tự nhiên:', desc: 'Xay nhuyễn lá quế Thái và ngò gai cùng chút dầu dừa để giữ sắc ngọc lục bảo.' },
        { title: 'Nước cốt dừa thơm béo:', desc: 'Đun nhỏ lửa không để sôi bùng, tránh tình trạng tách dầu mất đi độ mịn.' },
        { title: 'Nấm đùi gà mọng nước:', desc: 'Khía mắt lưới và áp chảo trước khi thả vào sốt cà ri.' }
      ],
      ingredients: [
        'Paste cà ri xanh chay: 2 thìa canh',
        'Nước cốt dừa tươi nguyên chất: 250ml',
        'Nấm đùi gà baby: 150g',
        'Cà tím bi & đậu que: 100g',
        'Lá chúc (lá chanh kaffir) & húng quế Thái: 1 nắm nhỏ'
      ],
      steps: [
        '00:45 - Xào thơm bột paste cà ri xanh cùng 2 thìa nước cốt dừa trên chảo nóng.',
        '03:20 - Cho nấm đùi gà khía carô vào xào thấm vị trong 3 phút.',
        '06:10 - Đổ phần nước cốt dừa còn lại và nước dừa tươi, ninh cà tím bi lửa riu riu.',
        '09:15 - Vò nhẹ lá chanh Thái thả vào, tắt bếp và ăn kèm bún tươi hoặc cơm hoa lài.'
      ]
    },
    {
      id: 'v3',
      title: 'Bún Bò Huế Chay Đậm Đà Chuẩn Vị Cố Đô Không Ngũ Vị Tân',
      author: 'Bếp Thuần Chay',
      views: '152k xem',
      duration: '14:30',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '345 kcal • 16g đạm',
      macro: { calories: '345 kcal', protein: '16.2g', carbs: '48.0g', fat: '9.0g' },
      img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Hương vị sả Huế đặc trưng:', desc: 'Đập dập gốc sả và phi thơm với màu điều dầu thay thế mắm ruốc truyền thống.' },
        { title: 'Độ ngọt tự nhiên của nước dùng:', desc: 'Hầm từ dứa thơm chín, bắp ngọt và củ cải muối.' },
        { title: 'Chả chay dai mềm:', desc: 'Dùng chả lụa chay thủ công và nấm đông cô ướp tiêu đen đượm vị.' }
      ],
      ingredients: [
        'Bún sợi to xứ Huế: 150g',
        'Chả lụa chay & nấm hương khô: 100g',
        'Sả cây đập dập: 5 cây',
        'Dứa chín, bắp ngọt, củ sắn: 300g',
        'Ớt sa tế chay rim dầu điều: 1 thìa canh',
        'Bắp chuối bào, rau muống chẻ, chanh tươi'
      ],
      steps: [
        '01:10 - Ninh bắp ngọt, dứa và củ sắn 40 phút tạo nước nền ngọt thanh đậm đà.',
        '04:30 - Phi thơm sả băm cùng dầu màu điều và sa tế ớt tạo màu đỏ cam lóng lánh.',
        '08:00 - Trút hỗn hợp sả xào vào nồi nước dùng, nêm đường phèn và muối hầm.',
        '12:15 - Cho bún sợi to vào tô, thêm chả lụa, nấm kho, chan nước súp và dọn cùng bắp chuối.'
      ]
    },
    {
      id: 'v4',
      title: 'Canh Rong Biển Đậu Hũ Non Hạt Sen Thanh Mát',
      author: 'An Lạc Kitchen',
      views: '66k xem',
      duration: '08:20',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '165 kcal • 9g đạm',
      macro: { calories: '165 kcal', protein: '9.0g', carbs: '18.5g', fat: '4.5g' },
      img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Khử mùi tanh rong biển:', desc: 'Ngâm rong biển với vài giọt nước cốt gừng và dầu mè trắng trong 5 phút.' },
        { title: 'Hạt sen bùi thơm không sượng:', desc: 'Hấp hoặc luộc hạt sen trước khi cho vào nấu chung với canh.' },
        { title: 'Đậu hũ non mướt mịn:', desc: 'Cắt khối vuông nhỏ và cho vào nồi ở bước cuối cùng, tránh đảo mạnh tay.' }
      ],
      ingredients: [
        'Rong biển wakame khô: 15g',
        'Đậu hũ non Nhật Bản: 1 hộp (200g)',
        'Hạt sen tươi Huế: 60g',
        'Gừng tươi thái sợi: 1 nhánh nhỏ',
        'Nước tương Shoyu & dầu mè thơm: 1 thìa'
      ],
      steps: [
        '00:40 - Ngâm nở rong biển wakame, bóp nhẹ với gừng tươi khử tanh.',
        '02:30 - Nấu chín mềm hạt sen tươi trong 500ml nước lọc.',
        '05:10 - Cho rong biển, nêm thìa tương Shoyu và vài lát gừng sợi vào nồi sôi nhẹ.',
        '07:00 - Thả nhẹ nhàng đậu hũ non cắt khối, rắc tiêu trắng và tắt bếp.'
      ]
    },
    {
      id: 'v5',
      title: 'Súp Bí Đỏ Hạt Dẻ Dưỡng Sinh Mùa Lạnh',
      author: 'Chef Tuệ Tâm',
      views: '74k xem',
      duration: '09:15',
      timeCategory: '5 - 15 phút',
      category: 'Món nước & Súp',
      macroShort: '280 kcal • 6g đạm',
      macro: { calories: '280 kcal', protein: '6.4g', carbs: '38.0g', fat: '11.0g' },
      img: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2b?auto=format&fit=crop&w=800&q=80',
      aiCoreTips: [
        { title: 'Nướng bí đỏ trước khi nấu:', desc: 'Nướng bí ở 190°C với xíu muối hạt giúp caramen hóa đường tự nhiên trong bí.' },
        { title: 'Hạt dẻ bùi ngậy:', desc: 'Hấp chín hạt dẻ Trùng Khánh bóc vỏ và xay mịn cùng sữa hạt hạnh nhân.' },
        { title: 'Chất kem sánh mịn thuần chay:', desc: 'Thay kem sữa động vật bằng kem hạt điều ngâm mềm xay nhuyễn.' }
      ],
      ingredients: [
        'Bí đỏ hạt đậu Nhật: 300g',
        'Hạt dẻ nướng bóc vỏ: 80g',
        'Sữa yến mạch hoặc sữa hạnh nhân không đường: 200ml',
        'Bơ cacao hoặc dầu dừa nguyên chất: 1 thìa nhỏ',
        'Hạt bí xanh rang & lá xô thơm trang trí'
      ],
      steps: [
        '01:00 - Cắt bí đỏ thành miếng vừa, quét nhẹ dầu dừa nướng thơm 20 phút.',
        '03:45 - Xào sơ bí đỏ nướng và hạt dẻ bùi với hành baro cho dậy mùi.',
        '06:20 - Thêm nước hầm rau củ đun sôi, xay mịn bằng máy xay sinh tố công suất cao.',
        '08:15 - Rót súp ra bát sâu lòng, vẽ đường kem hạnh nhân và rắc hạt bí rang giòn.'
      ]
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
        { title: 'Chọn váng đậu (tàu hũ ky):', desc: 'Dùng lá tươi hoặc lá khô ngâm nước ấm pha xíu baking soda để tạo độ dai.' },
        { title: 'Kỹ thuật bó chặt tay:', desc: 'Dùng lá chuối hơ lửa gói thành đòn tròn và buộc dây lạt thật căng để giò nén chặt.' },
        { title: 'Hấp và làm nguội:', desc: 'Hấp cách thủy 45 phút, để nguội hoàn toàn trong tủ mát 4 giờ mới thái lát.' }
      ],
      ingredients: [
        'Tàu hũ ky (váng đậu khô): 300g',
        'Tiêu hạt đập dập & tiêu sọ trắng xay: 2 thìa cà phê',
        'Hạt nêm nấm hữu cơ & dầu boa-rô: 2 thìa canh',
        'Lá chuối tươi đã lau sạch, dây lạt hoặc dây gai buộc giò'
      ],
      steps: [
        '01:30 - Ngâm váng đậu mềm trong nước ấm, rửa sạch nhiều lần cho hết mùi chua và vắt ráo.',
        '05:00 - Trộn đều váng đậu cùng tiêu hạt, dầu boa-rô phi thơm và gia vị nấm.',
        '09:10 - Trải lá chuối, xếp đều nhân giò và cuộn tròn thật chặt tay, nén 2 đầu.',
        '13:20 - Hấp cách thủy 45 phút trên lửa vừa, vớt ra để nguội nén trong tủ mát trước khi xắt khoanh.'
      ]
    }
  ];

  // Filtering logic
  const filteredVideos = latestVideos.filter(video => {
    const matchesCategory = activeCategory === 'Tất cả' || video.category === activeCategory;
    const matchesTime = activeTimeFilter === 'Tất cả' || video.timeCategory === activeTimeFilter;
    const matchesSearch = !searchQuery || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.macroShort.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesTime && matchesSearch;
  });

  // Handle YouTube Extraction Simulation with Guest Limit
  const handleExtractRecipe = (e) => {
    e.preventDefault();

    // Nếu đã hết lượt dùng thử cho khách vãng lai -> Hiện popup mời đăng ký
    if (hasReachedExtractLimit) {
      setShowRegisterPopup(true);
      return;
    }

    const url = extractUrl.trim() || 'https://www.youtube.com/watch?v=veggie-pho-demo';
    setIsExtracting(true);

    // Ghi nhận lượt sử dụng của Guest
    if (isGuest) {
      setGuestExtractionsUsed(prev => {
        const next = prev + 1;
        try {
          localStorage.setItem('veggieai_guest_extractions_used', next.toString());
        } catch (err) {}
        return next;
      });
    }

    setTimeout(() => {
      setIsExtracting(false);
      const mockResult = {
        title: 'Công thức trích xuất từ Video: Canh Chua Nấm Đùi Gà Dọc Mùng',
        author: 'Nguồn: Kênh Nấu Ăn Tự Nhiên (YouTube)',
        views: 'Trích xuất tự động thành công (30 giây)',
        time: '08:45',
        macro: { calories: '185 kcal', protein: '8.5g', carbs: '24.0g', fat: '4.2g' },
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
    }, 1200);
  };

  const handleSaveMealPlan = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="video-container">
      {/* 1. TOP HERO SECTION */}
      <section className="video-hero">
        <div className="video-thuan-chay-badge">
          <Sparkles size={14} /> VIDEO NẤU THUẦN CHAY
        </div>
        <h1 className="video-main-title">
          Khám Phá Video Nấu Ăn & Học Nhanh Cùng AI
        </h1>
        <p className="video-subtitle">
          Trải nghiệm học nấu ăn trực quan cùng công nghệ Speech-to-Recipe tự động tóm tắt công thức, định lượng và mẹo cốt lõi trong 30 giây.
        </p>

        {/* SEARCH BAR */}
        <div className="video-search-box-wrapper">
          <Search size={18} color="#9ca3af" style={{ flexShrink: 0, marginRight: '0.65rem' }} />
          <input
            type="text"
            className="video-search-input"
            placeholder="Tìm video, phở nấm, nem giòn, bún bò, cà ri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(e.target.value)}
          />
          <button className="video-search-btn" onClick={() => {}}>
            Tìm kiếm
          </button>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="video-filter-pills-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`video-pill-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* 2. FEATURED VIDEO HERO CARD (TIÊU ĐIỂM TUẦN) */}
      {activeCategory === 'Tất cả' && !searchQuery && (
        <section className="video-featured-card">
          {/* Left Media Box */}
          <div 
            className="video-featured-media-box"
            style={{ backgroundImage: `url('${featuredVideo.img}')` }}
            onClick={() => setSelectedVideo(featuredVideo)}
          >
            <div className="video-overlay"></div>
            <span className="video-badge-4k">{featuredVideo.quality}</span>
            <div className="video-play-circle-btn">
              <Play fill="#ffffff" size={26} color="#ffffff" style={{ marginLeft: '3px' }} />
            </div>
            <span className="video-duration-tag">{featuredVideo.duration}</span>
          </div>

          {/* Right Details Box */}
          <div className="video-featured-details">
            <div>
              <div className="video-featured-top-tags">
                <span className="tag-tieudiem">{featuredVideo.badge}</span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span className="tag-ai-ready">{featuredVideo.aiBadge}</span>
              </div>

              <h2 
                className="video-featured-h2"
                onClick={() => setSelectedVideo(featuredVideo)}
                style={{ cursor: 'pointer' }}
              >
                {featuredVideo.title}
              </h2>

              <div className="video-featured-meta-info">
                <span>{featuredVideo.author}</span>
                <span>•</span>
                <span>{featuredVideo.views}</span>
                <span>•</span>
                <span style={{ color: '#d97706', fontWeight: 700 }}>{featuredVideo.rating}</span>
              </div>

              {/* AI Highlight Summary Box */}
              <div className="video-ai-summary-box">
                <div className="video-ai-box-header">
                  <span className="video-ai-box-title">
                    <Sparkles size={14} color="#047857" /> 3 MẸO CỐT LÕI TỪ VIDEO
                  </span>
                  <span className="speech-to-recipe-pill">Speech-to-Recipe</span>
                </div>

                <ul className="video-ai-steps-list">
                  {featuredVideo.aiCoreTips.map((tip, idx) => (
                    <li key={idx} className="video-ai-step-item">
                      <span className="video-step-num">{idx + 1}</span>
                      <span>
                        <strong>{tip.title}</strong> {tip.desc}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Macro 3-Box */}
              <div className="video-macro-grid">
                <div className="video-macro-box">
                  <div className="video-macro-label">Năng lượng</div>
                  <div className="video-macro-val">{featuredVideo.macro.calories}</div>
                </div>
                <div className="video-macro-box">
                  <div className="video-macro-label">Protein</div>
                  <div className="video-macro-val" style={{ color: '#047857' }}>{featuredVideo.macro.protein}</div>
                </div>
                <div className="video-macro-box">
                  <div className="video-macro-label">Carbs sạch</div>
                  <div className="video-macro-val">{featuredVideo.macro.carbs}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="video-actions-row">
              <button 
                className="btn-watch-video-ai"
                onClick={() => setSelectedVideo(featuredVideo)}
              >
                <Play fill="white" size={15} color="white" /> Xem video & Tóm tắt AI
              </button>

              <button 
                className="btn-bookmark-meal"
                onClick={handleSaveMealPlan}
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} color="#047857" /> Đã lưu vào Thực Đơn
                  </>
                ) : (
                  <>
                    <Bookmark size={16} /> Lưu vào Thực Đơn
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. LATEST VIDEOS SECTION (VIDEO NẤU ĂN MỚI NHẤT) */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div className="video-latest-section-header">
          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', margin: '0 0 0.4rem 0' }}>
              Video Nấu Ăn Mới Nhất
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.92rem', margin: 0 }}>
              Học nhanh công thức trực quan qua từng góc quay ngắn gọn có bản phân tích dinh dưỡng
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="video-latest-time-filters">
            {timeFilters.map((tf) => (
              <button
                key={tf}
                className={`video-time-filter-btn ${activeTimeFilter === tf ? 'active' : ''}`}
                onClick={() => setActiveTimeFilter(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Video Cards Grid */}
        <div className="video-cards-grid">
          {filteredVideos.map((item) => (
            <article 
              key={item.id} 
              className="video-grid-item"
              onClick={() => setSelectedVideo(item)}
            >
              {/* Thumbnail */}
              <div 
                className="video-grid-thumb"
                style={{ backgroundImage: `url('${item.img}')` }}
              >
                <span className="video-ai-tag-pill">⚡ Tóm tắt AI</span>
                <span className="video-duration-tag">{item.duration}</span>
              </div>

              {/* Body */}
              <div className="video-grid-body">
                <div className="video-grid-author-row">
                  <span>{item.author}</span>
                  <span>{item.views}</span>
                </div>

                <h3 className="video-grid-title">
                  {item.title}
                </h3>

                <div className="video-grid-footer">
                  <span className="video-grid-nutrition">{item.macroShort}</span>
                  <span className="video-grid-action-link">
                    Xem tóm tắt <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty Search Fallback */}
        {filteredVideos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#f9fafb', borderRadius: '20px', border: '1px solid #e5e7eb', marginBottom: '2.5rem' }}>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '1rem' }}>
              Không tìm thấy video nào phù hợp với điều kiện tìm kiếm.
            </p>
            <button 
              className="video-pill-btn active"
              onClick={() => { setSearchQuery(''); setActiveCategory('Tất cả'); setActiveTimeFilter('Tất cả'); }}
            >
              Xem tất cả video
            </button>
          </div>
        )}

        {/* 4. PAGINATION */}
        <div className="video-pagination-wrapper">
          <button 
            className="video-page-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ opacity: currentPage === 1 ? 0.6 : 1 }}
          >
            Trang trước
          </button>

          <button 
            className={`video-page-num ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <button 
            className={`video-page-num ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <button 
            className={`video-page-num ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>

          <button 
            className="video-page-btn"
            onClick={() => setCurrentPage(prev => Math.min(3, prev + 1))}
            disabled={currentPage === 3}
            style={{ opacity: currentPage === 3 ? 0.6 : 1 }}
          >
            Trang sau
          </button>
        </div>
      </section>

      {/* 5. BOTTOM YOUTUBE EXTRACTOR BANNER (CÓ GIỚI HẠN DÙNG THỬ DÀNH CHO GUEST) */}
      <section className="video-extractor-card">
        <div className="video-extractor-icon">
          <Play fill="#047857" size={24} color="#047857" />
        </div>

        {/* CHỈ BÁO DẠNG "CÒN X LƯỢT DÙNG THỬ MIỄN PHÍ" (FREEMIUM HOOK - GUEST LIMIT) */}
        <div style={{ marginBottom: '1.1rem' }}>
          {isGuest ? (
            <div 
              onClick={() => hasReachedExtractLimit && setShowRegisterPopup(true)}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.45rem', 
                background: hasReachedExtractLimit ? '#fee2e2' : '#ecfdf5', 
                color: hasReachedExtractLimit ? '#b91c1c' : '#047857',
                padding: '0.4rem 1.05rem',
                borderRadius: '20px',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: `1px solid ${hasReachedExtractLimit ? '#fca5a5' : '#a7f3d0'}`,
                cursor: hasReachedExtractLimit ? 'pointer' : 'default',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              {hasReachedExtractLimit ? <Lock size={14} /> : <Sparkles size={14} />}
              <span>
                {hasReachedExtractLimit 
                  ? `Đã hết lượt dùng thử miễn phí (0/${GUEST_EXTRACT_LIMIT}) • Nhấn để đăng ký` 
                  : `Dùng thử: Còn ${remainingExtractions}/${GUEST_EXTRACT_LIMIT} lượt trích xuất AI miễn phí`}
              </span>
            </div>
          ) : (
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.45rem', 
              background: '#ecfdf5', 
              color: '#047857', 
              padding: '0.4rem 1.05rem', 
              borderRadius: '20px', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              border: '1px solid #a7f3d0' 
            }}>
              <Sparkles size={14} />
              <span>Tài khoản chính thức • Trích xuất không giới hạn</span>
            </div>
          )}
        </div>

        <h2 className="video-extractor-title">
          Bạn Có Video Nấu Ăn Yêu Thích Trên YouTube?
        </h2>

        <p className="video-extractor-sub">
          Chỉ cần dán đường link video, trợ lý VeggieAI sẽ tự động tách nguyên liệu, định lượng calo và tóm tắt từng bước nấu chỉ trong 30 giây.
        </p>

        <form onSubmit={handleExtractRecipe} className="video-extractor-form">
          <input
            type="text"
            className="video-extractor-input"
            placeholder={
              hasReachedExtractLimit 
                ? "Bạn đã hết lượt dùng thử miễn phí. Vui lòng đăng ký tài khoản..." 
                : "🔗 Dán liên kết YouTube, TikTok..."
            }
            value={extractUrl}
            onChange={(e) => setExtractUrl(e.target.value)}
            onClick={() => hasReachedExtractLimit && setShowRegisterPopup(true)}
          />
          <button 
            type="submit" 
            className="video-extractor-btn" 
            disabled={isExtracting}
            style={hasReachedExtractLimit ? { background: '#ea580c' } : {}}
          >
            {isExtracting ? (
              <>
                <Sparkles size={16} className="animate-spin" /> Đang phân tích Speech-to-Recipe...
              </>
            ) : hasReachedExtractLimit ? (
              <>
                <Lock size={16} /> Hết lượt • Đăng ký ngay
              </>
            ) : (
              <>
                <Sparkles size={16} /> Trích xuất công thức AI
              </>
            )}
          </button>
        </form>

        <p className="video-extractor-note">
          {isGuest ? (
            <span>
              Khách vãng lai: Còn <strong>{remainingExtractions}/{GUEST_EXTRACT_LIMIT}</strong> lượt dùng thử miễn phí • Đăng ký tài khoản để trích xuất không giới hạn
            </span>
          ) : (
            <span>
              Miễn phí cho tài khoản thành viên • Tương thích mọi nguồn video có phụ đề hoặc giọng đọc chuẩn
            </span>
          )}
        </p>
      </section>

      {/* 6. INTERACTIVE VIDEO PLAYER & SPEECH-TO-RECIPE MODAL */}
      {selectedVideo && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1.25rem'
          }}
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              padding: '2rem 2.25rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedVideo(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                transition: 'background 0.2s'
              }}
            >
              <X size={20} />
            </button>

            {/* Video Meta Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
              <span className="speech-to-recipe-pill">⚡ Speech-to-Recipe AI</span>
              <span style={{ fontSize: '0.82rem', color: '#047857', fontWeight: 700 }}>
                {selectedVideo.timeCategory || 'Video Hướng Dẫn'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', lineHeight: 1.35, margin: '0 0 0.5rem 0' }}>
              {selectedVideo.title}
            </h2>

            <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Đăng bởi: <strong>{selectedVideo.author}</strong> • {selectedVideo.views} • Thời lượng: {selectedVideo.duration || selectedVideo.time}
            </p>

            {/* Video Player Mockup */}
            <div style={{
              height: '320px',
              borderRadius: '16px',
              backgroundImage: `url('${selectedVideo.img || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.75rem',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)' }}></div>
              <div style={{
                position: 'relative',
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(4, 120, 87, 0.5)',
                cursor: 'pointer'
              }}>
                <Play fill="#ffffff" size={30} color="#ffffff" style={{ marginLeft: '4px' }} />
              </div>
              <span style={{ position: 'absolute', bottom: '14px', left: '16px', color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: '6px' }}>
                Đang sẵn sàng phát chất lượng cao (1080p 60fps)
              </span>
            </div>

            {/* AI Macro Nutrients Grid */}
            <div className="video-macro-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="video-macro-box">
                <div className="video-macro-label">Năng lượng</div>
                <div className="video-macro-val">{selectedVideo.macro?.calories || '250 kcal'}</div>
              </div>
              <div className="video-macro-box">
                <div className="video-macro-label">Protein</div>
                <div className="video-macro-val" style={{ color: '#047857' }}>{selectedVideo.macro?.protein || '12g'}</div>
              </div>
              <div className="video-macro-box">
                <div className="video-macro-label">Carbs sạch</div>
                <div className="video-macro-val">{selectedVideo.macro?.carbs || '30g'}</div>
              </div>
            </div>

            {/* 3 Mẹo cốt lõi */}
            {selectedVideo.aiCoreTips && (
              <div className="video-ai-summary-box" style={{ marginBottom: '1.5rem' }}>
                <div className="video-ai-box-header">
                  <span className="video-ai-box-title">
                    <Sparkles size={14} color="#047857" /> MẸO CỐT LÕI TÁCH TỰ ĐỘNG BẰNG AI
                  </span>
                </div>
                <ul className="video-ai-steps-list">
                  {selectedVideo.aiCoreTips.map((tip, idx) => (
                    <li key={idx} className="video-ai-step-item">
                      <span className="video-step-num">{idx + 1}</span>
                      <span><strong>{tip.title}</strong> {tip.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Nguyên liệu */}
            {selectedVideo.ingredients && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.65rem' }}>
                  📋 Nguyên liệu định lượng
                </h4>
                <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#334155', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {selectedVideo.ingredients.map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Các bước nấu */}
            {selectedVideo.steps && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '0.65rem' }}>
                  🍳 Tóm tắt các bước theo dòng thời gian video
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedVideo.steps.map((st, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.65rem', 
                        fontSize: '0.88rem', 
                        color: '#334155', 
                        lineHeight: 1.55,
                        background: '#ffffff',
                        border: '1px solid #f1f5f9',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '10px'
                      }}
                    >
                      <CheckCircle2 size={16} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', flexWrap: 'wrap' }}>
              <button
                className="btn-bookmark-meal"
                onClick={() => setSelectedVideo(null)}
              >
                Đóng
              </button>

              <button
                className="btn-bookmark-meal"
                onClick={handleSaveMealPlan}
              >
                {savedSuccess ? (
                  <>
                    <Check size={16} color="#047857" /> Đã lưu vào Thực Đơn
                  </>
                ) : (
                  <>
                    <Bookmark size={16} /> Lưu vào Thực Đơn
                  </>
                )}
              </button>

              <button 
                className="btn-watch-video-ai"
                onClick={() => {
                  setSelectedVideo(null);
                  if (onNavigate) onNavigate('register');
                }}
              >
                Đăng ký tài khoản để tải công thức PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. POPUP MỜI ĐĂNG KÝ KHI HẾT LƯỢT DÙNG THỬ (FREEMIUM HOOK) */}
      {showRegisterPopup && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3500,
            padding: '1.25rem'
          }}
          onClick={() => setShowRegisterPopup(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '2.25rem 2rem',
              position: 'relative',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.25)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRegisterPopup(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569'
              }}
            >
              <X size={18} />
            </button>

            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#fff7ed',
              border: '2px solid #fed7aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Lock size={32} color="#ea580c" />
            </div>

            <span style={{
              display: 'inline-block',
              background: '#fee2e2',
              color: '#b91c1c',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.25rem 0.75rem',
              borderRadius: '12px',
              marginBottom: '0.75rem',
              letterSpacing: '0.5px'
            }}>
              GIỚI HẠN DÙNG THỬ (FREEMIUM)
            </span>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#111827', margin: '0 0 0.75rem 0', lineHeight: 1.3 }}>
              Bạn Đã Dùng Hết {GUEST_EXTRACT_LIMIT} Lượt Trích Xuất AI Miễn Phí!
            </h3>

            <p style={{ color: '#4b5563', fontSize: '0.92rem', lineHeight: 1.6, margin: '0 0 1.5rem 0' }}>
              Tính năng <strong>Speech-to-Recipe</strong> ứng dụng mô hình AI xử lý giọng nói, định lượng nguyên liệu và tính toán Macro theo thời gian thực từ video. Khách vãng lai được trải nghiệm tối đa <strong>{GUEST_EXTRACT_LIMIT} lượt dùng thử</strong>.
            </p>

            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '16px',
              padding: '1rem 1.25rem',
              textAlign: 'left',
              marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', marginBottom: '0.5rem' }}>
                Đăng ký tài khoản miễn phí để nhận ngay quyền lợi:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#166534', fontSize: '0.84rem', lineHeight: 1.6 }}>
                <li>Trích xuất không giới hạn mọi video nấu ăn YouTube & TikTok</li>
                <li>Tự động định lượng Macro và thêm vào thực đơn cá nhân</li>
                <li>Tải công thức chi tiết dạng thẻ PDF tiện lợi</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <button
                onClick={() => {
                  setShowRegisterPopup(false);
                  if (onNavigate) onNavigate('register');
                }}
                style={{
                  background: '#047857',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '30px',
                  padding: '0.85rem 1.5rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(4, 120, 87, 0.25)',
                  transition: 'background 0.2s'
                }}
              >
                <Sparkles size={18} /> Đăng Ký Tài Khoản Miễn Phí Ngay <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setShowRegisterPopup(false)}
                style={{
                  background: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  padding: '0.5rem',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Để sau, tôi muốn xem video khác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
