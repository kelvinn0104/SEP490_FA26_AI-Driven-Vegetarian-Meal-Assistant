// ============================================================================
// DOMAIN DATA & RICH CULINARY DATABASE FOR VEGGIEAI
// ============================================================================

export const RECIPES_DB = [
  {
    id: 'r1',
    title: 'Mì Soba Đậu Hũ Áp Chảo Mè Rang & Đậu Nành Nhật',
    englishSub: 'Crispy Sesame Tofu & Buckwheat Soba Bowl',
    subtitle: 'Đậu hũ non áo mè vàng giòn, mì kiều mạch giàu axit amin thiết yếu, đậu Edamame và sốt bơ mè gừng ấm áp.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85',
    prepTime: 22,
    matchScore: 96,
    mealTypes: ['lunch', 'dinner'],
    season: 'Mùa Thu-Đông • Thanh đạm',
    tags: ['Giàu Đạm', 'Thuần chay (Vegan)', 'Đủ 9 Axit Amin'],
    nutrients: { calories: 540, protein: 31, iron: 6.4, b12: 0.8, omega3: 0.9 },
    ingredients: [
      { name: 'Đậu hũ non hữu cơ', amount: '200g', category: 'Đạm thực vật' },
      { name: 'Mì Soba kiều mạch', amount: '120g', category: 'Ngũ cốc' },
      { name: 'Đậu nành Nhật (Edamame)', amount: '80g', category: 'Đậu hạt' },
      { name: 'Cải bó xôi & Bắp cải tím', amount: '100g', category: 'Rau củ' },
      { name: 'Dầu mè & Hạt mè rang', amount: '2 muỗng canh', category: 'Gia vị chay' }
    ],
    steps: [
      'Ép ráo nước đậu hũ trong 10 phút, cắt khối vuông 2cm rồi lăn qua lớp mỏng bột năng.',
      'Áp chảo đậu hũ với dầu mè ở lửa vừa 6 phút cho vàng giòn các mặt, rưới sốt Tamari gừng.',
      'Luộc mì Soba kiều mạch trong 4 phút, xả ngay qua nước đá lạnh để giữ độ dai.',
      'Xếp mì, đậu hũ, cải bó xôi chần sơ vào tô lớn và rắc hạt mè rang thơm lừng lên trên.'
    ],
    chefTips: [
      'Ép ráo nước đậu hũ non trong 10 phút trước khi áp chảo để lớp ngoài giòn mà bên trong vẫn mềm béo.',
      'Pha sốt bơ mè + nước tương Tamari + gừng tươi giã nhuyễn kích hoạt vị Umami tự nhiên không cần hạt nêm.',
      'Luộc mì Soba kiều mạch trong đúng 4 phút rồi xả nước đá lạnh để giữ độ dai và bảo tồn dưỡng chất Rutin.',
      'Rau cải bó xôi non giàu Vitamin C giúp tăng khả năng hấp thụ Sắt non-heme từ đậu hũ lên gấp 3 lần.'
    ],
    localSpots: [
      { name: 'Pi Vegetarian Bistro', address: '187/15 Điện Biên Phủ, Quận 1, TP.HCM', dist: '1.6 km', rating: '4.8', priceRange: '60.000đ - 120.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' },
      { name: 'Hum Vegetarian, Lounge & Restaurant', address: '32 Võ Văn Tần, Quận 3, TP.HCM', dist: '2.1 km', rating: '4.9', priceRange: '85.000đ - 220.000đ', openStatus: 'Đang mở cửa • Đóng lúc 22:00' }
    ],
    region: 'asia',
    matchReason: 'Bù đắp 31g Đạm hoàn chỉnh và 9 axit amin thiết yếu cho cơ bắp'
  },
  {
    id: 'r2',
    title: 'Mì Ý Nấm Đùi Gà Sốt Kem Hạt Điều & Men Dinh Dưỡng B12',
    englishSub: 'King Oyster Mushroom & Golden Nutritional Yeast Fettuccine',
    subtitle: 'Giải pháp bù đắp hơn 100% Vitamin B12 tự nhiên cho người ăn thuần chay nhờ lớp sốt kem hạt điều phối men dinh dưỡng.',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281298?auto=format&fit=crop&w=1000&q=85',
    prepTime: 20,
    matchScore: 95,
    mealTypes: ['lunch', 'dinner'],
    season: 'Quanh năm • Bù Vitamin B12',
    tags: ['Giàu Vitamin B12', 'Giàu Đạm', 'Nhanh ≤ 22 phút'],
    nutrients: { calories: 580, protein: 25, iron: 5.9, b12: 2.6, omega3: 0.5 },
    ingredients: [
      { name: 'Nấm đùi gà tươi', amount: '200g', category: 'Rau củ & Nấm' },
      { name: 'Men dinh dưỡng (Nutritional Yeast)', amount: '3 muỗng canh', category: 'Bổ sung B12' },
      { name: 'Cải bó xôi hữu cơ', amount: '100g', category: 'Rau củ' },
      { name: 'Mì nguyên cám Fettuccine', amount: '110g', category: 'Ngũ cốc' },
      { name: 'Sữa đậu nành không đường B12', amount: '150ml', category: 'Bổ sung B12' }
    ],
    steps: [
      'Khứa caro mặt nấm đùi gà cắt lát dày, áp chảo cùng dầu ô liu và tỏi đập dập cho vàng sém.',
      'Xay mịn sữa đậu nành, 3 muỗng canh men dinh dưỡng B12 và chút tiêu đen thành sốt kem sánh.',
      'Luộc mì nguyên cám đạt độ chín Al Dente, đảo nhanh trên chảo cùng sốt kem và cải bó xôi tươi.',
      'Tắt bếp ngay khi lá cải bó xôi vừa chín tới để bảo toàn Vitamin B12 và Sắt.'
    ],
    chefTips: [
      'Khứa caro trên thân nấm đùi gà cắt dày để bề mặt nấm hút trọn vẹn lớp sốt kem béo ngậy.',
      'Hòa Men dinh dưỡng B12 vào sốt khi chảo ở nhiệt độ ấm (dưới 70°C) để bảo tồn hoạt tính vi chất.',
      'Thêm một vá nước luộc mì Fettuccine giàu tinh bột vào chảo giúp nhũ hóa sốt kem bóng mượt không cần bơ sữa.',
      'Rắc tiêu đen xay thô và vài nhánh húng tây tươi trước khi dùng để kích thích vị giác tối đa.'
    ],
    localSpots: [
      { name: "L'Herbanyste Plant-Based Bistro", address: '215E4 Nguyễn Văn Hưởng, Thảo Điền', dist: '3.2 km', rating: '4.8', priceRange: '70.000đ - 150.000đ', openStatus: 'Đang mở cửa • Đóng lúc 20:30' },
      { name: 'Chay Garden Restaurant', address: '52 Võ Văn Tần, Quận 3, TP.HCM', dist: '2.0 km', rating: '4.7', priceRange: '65.000đ - 140.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' }
    ],
    region: 'western',
    matchReason: 'Bù đắp 108% định mức Vitamin B12 (2.6µg) khuyến nghị'
  },
  {
    id: 'r3',
    title: 'Cơm Hạt Diêm Mạch, Đậu Gà Nướng Thảo Mộc & Bơ Tươi',
    englishSub: 'Mediterranean Roasted Chickpea & Quinoa Power Bowl',
    subtitle: 'Tô năng lượng Địa Trung Hải cung cấp 7.4mg Sắt và axit béo Omega-3 từ hạt óc chó cùng nước sốt chanh vàng.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
    prepTime: 18,
    matchScore: 93,
    mealTypes: ['lunch', 'dinner'],
    season: 'Mùa Thu • Giàu Sắt',
    tags: ['Giàu Sắt & Vitamin B12', 'Không Gluten', 'Nhanh ≤ 22 phút'],
    nutrients: { calories: 510, protein: 22, iron: 7.4, b12: 0.6, omega3: 1.5 },
    ingredients: [
      { name: 'Đậu gà chín (Chickpeas)', amount: '160g', category: 'Đậu hạt' },
      { name: 'Cải bó xôi non', amount: '100g', category: 'Rau củ' },
      { name: 'Hạt óc chó rang', amount: '35g', category: 'Omega-3' },
      { name: 'Cà chua chín mọng', amount: '100g', category: 'Rau củ' },
      { name: 'Hạt diêm mạch (Quinoa)', amount: '100g', category: 'Ngũ cốc' }
    ],
    steps: [
      'Trộn đậu gà với bột ớt Paprika, thì là Cumin và nướng 12 phút ở 190°C cho giòn rụm.',
      'Nấu chín hạt diêm mạch trong 12 phút với nước dùng rau củ thanh ngọt.',
      'Trộn cải bó xôi, cà chua cùng nước cốt chanh vàng (Vitamin C giúp hấp thụ Sắt gấp 3 lần).',
      'Xếp đậu gà nướng, hạt Quinoa và rắc hạt óc chó giàu Omega-3 lên bề mặt.'
    ],
    chefTips: [
      'Lau khô hoàn toàn vỏ đậu gà bằng khăn giấy trước khi nướng để hạt đậu đạt độ giòn xốp lâu hơn.',
      'Vo hạt Quinoa dưới vòi nước chảy 1 phút để loại bỏ hoàn toàn vị đắng nhẹ tự nhiên của lớp vỏ Saponin.',
      'Pha sốt dầu ô liu nguyên chất cùng nước cốt chanh vàng kích hoạt khả năng hấp thụ Sắt non-heme.',
      'Thích hợp đóng hộp Meal Prep thủy tinh, bảo quản ngăn mát 3–4 ngày vẫn giữ trọn dưỡng chất.'
    ],
    localSpots: [
      { name: 'Kashew Cheese Deli & Bistro', address: '14 Trần Ngọc Diện, Thảo Điền', dist: '3.0 km', rating: '4.9', priceRange: '50.000đ - 110.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' }
    ],
    region: 'mediterranean',
    matchReason: 'Bù đắp 7.4mg Sắt non-heme và 1.5g Omega-3 ALA từ hạt óc chó'
  },
  {
    id: 'r4',
    title: 'Yến Mạch Ngâm Sữa Đậu Nành B12, Hạt Chia & Óc Chó',
    englishSub: 'Matcha Chia Seed & Walnut Fortified Overnight Oats',
    subtitle: 'Bữa sáng chuẩn bị trong 8 phút đáp ứng 150% nhu cầu Omega-3 và 1.8mcg Vitamin B12 cho cả ngày làm việc.',
    image: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&w=1000&q=85',
    prepTime: 10,
    matchScore: 92,
    mealTypes: ['breakfast'],
    season: 'Quanh năm • Bữa sáng 10p',
    tags: ['Giàu Vitamin B12', 'Giàu Omega-3', 'Nhanh ≤ 22 phút'],
    nutrients: { calories: 430, protein: 19, iron: 4.8, b12: 1.8, omega3: 2.4 },
    ingredients: [
      { name: 'Yến mạch cán dẹt nguyên cám', amount: '65g', category: 'Ngũ cốc' },
      { name: 'Sữa đậu nành tăng cường B12', amount: '220ml', category: 'Bổ sung B12' },
      { name: 'Hạt óc chó & Hạt chia', amount: '35g', category: 'Omega-3' }
    ],
    steps: [
      'Khuấy đều yến mạch cán dẹt, hạt chia và sữa đậu nành bổ sung B12 trong hũ thủy tinh.',
      'Để nghỉ 15 phút (hoặc để ngăn mát qua đêm) cho hạt chia nở mềm tạo độ sánh mịn.',
      'Rắc hạt óc chó đập dập và trái cây theo mùa lên trên trước khi thưởng thức.'
    ],
    chefTips: [
      'Tỷ lệ vàng 1 phần yến mạch : 1.5 phần sữa hạt giúp hũ yến mạch nở dẻo mịn như bánh pudding.',
      'Nghiền nhẹ hạt chia và hạt óc chó trước khi ngâm để giải phóng tối đa axit béo Omega-3 ALA dễ hấp thụ.',
      'Ưu tiên chọn sữa hạt có nhãn Fortified Vitamin B12 để bổ sung hơn 75% định mức B12 khuyến nghị.',
      'Thay đổi topping theo mùa như chuối tiêu, dâu tây hoặc bột quế Ceylon để đổi vị mỗi sáng.'
    ],
    localSpots: [
      { name: 'L’Herbanyste Organic Grocer', address: 'Thảo Điền, TP. Thủ Đức', dist: '3.2 km', rating: '4.8', priceRange: '50.000đ - 95.000đ', openStatus: 'Đang mở cửa • Đóng lúc 20:30' }
    ],
    region: 'western',
    matchReason: 'Bữa sáng nhanh 10 phút đáp ứng 150% Omega-3 và 1.8µg B12'
  },
  {
    id: 'r5',
    title: 'Tempeh Kho Tộ Sả Nghệ & Cơm Gạo Lứt Hạt Sen Huế',
    englishSub: 'Saigon Lemongrass Braised Tempeh & Lotus Seed Brown Rice',
    subtitle: 'Đạm tương nén lên men tự nhiên giàu lợi khuẩn kết hợp hạt sen bùi ngọt, đậm đà hương vị truyền thống miền Nam.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
    prepTime: 26,
    matchScore: 90,
    mealTypes: ['lunch', 'dinner'],
    season: 'Mùa Mưa / Thu-Đông Nam Bộ',
    tags: ['Giàu Đạm', 'Lên men tự nhiên', 'Ẩm thực Việt'],
    nutrients: { calories: 560, protein: 29, iron: 6.2, b12: 0.9, omega3: 0.6 },
    ingredients: [
      { name: 'Đạm tương nén Tempeh', amount: '180g', category: 'Đạm thực vật' },
      { name: 'Nấm đùi gà cắt khoanh', amount: '120g', category: 'Rau củ & Nấm' },
      { name: 'Hạt sen tươi & Gạo lứt', amount: '150g', category: 'Ngũ cốc' }
    ],
    steps: [
      'Cắt Tempeh thành miếng vuông vừa ăn, áp chảo sơ cho vàng thơm mùi hạt đậu lên men.',
      'Phi thơm sả băm và nghệ tươi, cho nấm đùi gà và Tempeh vào đảo săn cùng nước tương.',
      'Thêm nước dừa tươi kho lửa nhỏ trong nồi đất 12 phút đến khi nước sốt sánh kẹo.',
      'Dùng nóng với cơm gạo lứt nấu hạt sen và rau luộc theo mùa.'
    ],
    chefTips: [
      'Chần sơ Tempeh trong nước sôi 2 phút để khử mùi nồng lên men cho người mới tập làm quen.',
      'Thắng màu tự nhiên cho tộ kho bằng nước dừa tươi nấu cùng nghệ củ già, không dùng phẩm màu công nghiệp.',
      'Kho liu riu trong nồi đất nung giúp gia vị thẩm thấu sâu vào từng hạt đậu tương nén.',
      'Nấu cơm gạo lứt hạt sen cùng nhúm muối hồng và lá dứa để hạt cơm dẻo thơm không bị khô.'
    ],
    localSpots: [
      { name: 'Nhà Hàng Chay Phương Mai', address: '86F Võ Thị Sáu, Quận 1, TP.HCM', dist: '1.4 km', rating: '4.7', priceRange: '55.000đ - 115.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' },
      { name: 'Bếp Xanh An Duyên', address: '10 Nguyễn Tri Phương, Quận 5, TP.HCM', dist: '3.5 km', rating: '4.8', priceRange: '50.000đ - 95.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' }
    ],
    region: 'vietnam',
    matchReason: 'Đạm tương nén lên men tự nhiên 29g đạm, tốt cho vi sinh đường ruột'
  },
  {
    id: 'r6',
    title: 'Cà Ri Đậu Lăng Đỏ, Bông Cải Trắng & Cải Bó Xôi Tươi',
    englishSub: 'Golden Red Lentil, Cauliflower & Spinach Coconut Curry',
    subtitle: 'Món hầm ấm bụng giàu vi chất, cung cấp tới 7.8mg Sắt và 25g Đạm thực vật dễ tiêu hóa cho bữa tối nhẹ nhàng.',
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=85',
    prepTime: 24,
    matchScore: 89,
    mealTypes: ['dinner', 'lunch'],
    season: 'Mùa Thu-Đông • Giàu Sắt',
    tags: ['Giàu Sắt & Vitamin B12', 'Giàu Đạm', 'Không Gluten'],
    nutrients: { calories: 495, protein: 25, iron: 7.8, b12: 0.5, omega3: 0.5 },
    ingredients: [
      { name: 'Cải bó xôi tươi', amount: '120g', category: 'Rau củ' },
      { name: 'Cà chua chín băm', amount: '150g', category: 'Rau củ' },
      { name: 'Đậu gà / Đậu lăng đỏ', amount: '140g', category: 'Đậu hạt' }
    ],
    steps: [
      'Xào thơm hành tím, gừng tươi và cà chua băm cùng bột nghệ và bột cà ri thảo mộc.',
      'Cho đậu lăng đỏ và bông cải vào ninh nhỏ lửa 15 phút cho đậu mềm sánh tự nhiên.',
      'Cho toàn bộ bó cải bó xôi tươi vào đảo đều 2 phút trước khi tắt bếp.'
    ],
    chefTips: [
      'Rang khô bột thì là Ai Cập và bột nghệ trên chảo 30 giây để đánh thức tinh dầu thơm trước khi xào dầu.',
      'Đậu lăng đỏ ninh 15 phút sẽ tự phân rã tạo độ sánh mịn cho sốt cà ri mà không cần bột năng hay bột bắp.',
      'Chỉ cho cải bó xôi vào đảo 2 phút cuối để giữ nguyên sắc xanh ngọc bích và không làm phân hủy Vitamin C.',
      'Vắt 1/2 quả chanh tươi ngay khi múc ra tô để tối ưu hóa sinh khả dụng của 7.8mg Sắt thực vật.'
    ],
    localSpots: [
      { name: 'Shamballa Vegetarian Restaurant', address: '17-19 Trịnh Văn Cấn, Quận 1', dist: '1.9 km', rating: '4.8', priceRange: '80.000đ - 180.000đ', openStatus: 'Đang mở cửa • Đóng lúc 22:00' }
    ],
    region: 'asia',
    matchReason: 'Bữa tối giàu Sắt (7.8mg) và 25g đạm thực vật dễ tiêu hóa'
  },
  {
    id: 'r7',
    title: 'Bánh Mì Nguyên Cám Phết Bơ Đậu Gà Hummus & Men B12',
    englishSub: 'Artisanal Sourdough with B12 Chickpea Hummus & Avocado',
    subtitle: 'Bữa sáng hoặc bữa xế giàu đạm thực vật, chất béo tốt và bổ sung trực tiếp 1.4mcg Vitamin B12.',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=85',
    prepTime: 12,
    matchScore: 88,
    mealTypes: ['breakfast'],
    season: 'Quanh năm • Bữa sáng nhanh',
    tags: ['Giàu Vitamin B12', 'Nhanh ≤ 22 phút'],
    nutrients: { calories: 410, protein: 17, iron: 4.2, b12: 1.4, omega3: 0.8 },
    ingredients: [
      { name: 'Đậu gà chín xay mịn', amount: '100g', category: 'Đậu hạt' },
      { name: 'Men dinh dưỡng B12', amount: '2 muỗng canh', category: 'Bổ sung B12' },
      { name: 'Cà chua & Cải bó xôi non', amount: '60g', category: 'Rau củ' }
    ],
    steps: [
      'Xay nhuyễn đậu gà cùng bơ mè Tahini, nước cốt chanh và men dinh dưỡng B12.',
      'Nướng giòn 2 lát bánh mì nguyên cám, phết dày sốt Hummus đậu gà lên mặt bánh.',
      'Xếp lá cải bó xôi non, cà chua thái lát và rắc hạt mè rang.'
    ],
    chefTips: [
      'Bí quyết xay sốt Hummus đậu gà mịn như nhung: Cho 2 viên đá lạnh vào cối xay sinh tố khi đang xay.',
      'Men dinh dưỡng tạo hương vị béo ngậy tương tự phô mai Parmesan mà hoàn toàn 100% thuần thực vật.',
      'Nướng bánh mì Sourdough vàng giòn 2 mặt giúp kết cấu bánh vững chắc không bị nhũn khi phết sốt.',
      'Sốt Hummus tự làm có thể bảo quản trong hũ thủy tinh đậy kín ngăn mát tủ lạnh suốt 5–7 ngày.'
    ],
    localSpots: [
      { name: 'Kashew Cheese Deli', address: 'Thảo Điền, TP. Thủ Đức', dist: '3.0 km', rating: '4.9', priceRange: '50.000đ - 110.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' }
    ],
    region: 'mediterranean',
    matchReason: 'Bữa phụ bổ sung 1.4µg Vitamin B12 và chất béo tốt từ quả bơ'
  },
  {
    id: 'r8',
    title: 'Phở Trộn Đậu Hũ Non, Nấm Đùi Gà Nướng & Nước Sốt Mè Đen',
    englishSub: 'Roasted King Oyster Mushroom & Silken Tofu Dry Pho Bowl',
    subtitle: 'Biến tấu thanh mát từ sợi phở lứt, nấm đùi gà xé sợi dai ngọt và sốt mè đen giàu canxi, sắt.',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=85',
    prepTime: 19,
    matchScore: 87,
    mealTypes: ['lunch', 'dinner'],
    season: 'Mùa Thu • Thanh mát',
    tags: ['Giàu Đạm', 'Nhanh ≤ 22 phút', 'Ẩm thực Việt'],
    nutrients: { calories: 485, protein: 24, iron: 5.5, b12: 0.4, omega3: 0.7 },
    ingredients: [
      { name: 'Đậu hũ non & Đậu hũ chiên', amount: '180g', category: 'Đạm thực vật' },
      { name: 'Nấm đùi gà xé sợi', amount: '150g', category: 'Rau củ & Nấm' },
      { name: 'Cải bó xôi & Giá đỗ', amount: '100g', category: 'Rau củ' }
    ],
    steps: [
      'Nấm đùi gà dùng nĩa xé sợi dọc thân, áp chảo cùng chút dầu mè và nước tương cho dai thơm.',
      'Trụng bánh phở gạo lứt qua nước sôi, trộn đều cùng sốt mè đen rang và tỏi phi.',
      'Xếp đậu hũ, nấm đùi gà xé sợi, rau thơm và cải bó xôi chần lên trên.'
    ],
    chefTips: [
      'Dùng nĩa cào dọc thân nấm đùi gà để xé sợi tạo vân nhám tự nhiên giúp ngấm đẫm nước sốt trộn.',
      'Trụng phở lứt nhanh trong nước sôi 20 giây rồi xả nước lạnh ngay để sợi phở tơi dai không dính nát.',
      'Sốt mè đen xay cùng giấm táo và nước tương Tamari bổ sung Canxi và Sắt thực vật dồi dào.',
      'Rắc thêm đậu phộng rang giòn và ngò gai Nam Bộ để gia tăng hương vị ẩm thực Việt truyền thống.'
    ],
    localSpots: [
      { name: 'Phở Chay Như', address: '54 Trương Quyền, Quận 3, TP.HCM', dist: '1.8 km', rating: '4.7', priceRange: '40.000đ - 65.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' }
    ],
    region: 'vietnam',
    matchReason: 'Giàu Canxi & Sắt thực vật (5.5mg) từ mè đen và nấm đùi gà'
  },
  {
    id: 'r9',
    title: 'Phở Chay Nấm Bào Ngư & Nước Dùng Củ Cải Quả Lê',
    englishSub: 'Vietnamese Mushroom Pho Chay',
    subtitle: 'Nước dùng thanh ngọt nấu từ lê, táo đỏ, củ cải trắng và hoa hồi nướng, ăn kèm nấm bào ngư xé sợi áp chảo và chả lụa chay.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=1000&q=85',
    prepTime: 20,
    matchScore: 95,
    mealTypes: ['breakfast', 'lunch'],
    season: 'Quanh năm • Thanh nhiệt',
    tags: ['Ẩm thực Việt', 'Thuần chay (Vegan)', 'Nước dùng thảo mộc'],
    nutrients: { calories: 390, protein: 24, iron: 4.9, b12: 1.4, omega3: 0.6 },
    ingredients: [
      { name: 'Bánh phở tươi gạo lứt', amount: '200g', category: 'Ngũ cốc' },
      { name: 'Nấm bào ngư trắng & nấm đông cô', amount: '180g', category: 'Rau củ & Nấm' },
      { name: 'Chả lụa chay đậu hũ non', amount: '80g', category: 'Đạm thực vật' },
      { name: 'Quả lê & củ cải trắng ninh nước dùng', amount: '1 củ', category: 'Rau củ' },
      { name: 'Hoa hồi, quế chi, thảo quả nướng thơm', amount: '1 gói thảo mộc', category: 'Gia vị chay' },
      { name: 'Ngò gai, húng quế, giá đỗ tươi', amount: '1 nắm', category: 'Rau củ' }
    ],
    steps: [
      'Nướng thơm hoa hồi, quế, thảo quả và hành tây nướng cho vào nồi hầm cùng lê cắt miếng, củ cải trắng trong 20 phút.',
      'Xé sợi nấm bào ngư, áp chảo với hành baro và 1 muỗng canh nước tương nấm cho xém cạnh thơm phức.',
      'Trần bánh phở qua nước sôi, xếp vào tô cùng nấm xào, chả lụa chay và chan nước dùng thảo mộc sôi bùng lên trên.'
    ],
    chefTips: [
      'Lê và củ cải tạo độ ngọt thanh tự nhiên cho nước dùng phở mà không cần đường tinh luyện hay bột ngọt.',
      'Nướng xém cạnh hoa hồi và quế chi trước khi hầm giúp kích hoạt tối đa tinh dầu thơm đặc trưng của phở truyền thống.',
      'Dùng kèm chanh tươi và ớt sừng để tăng khả năng hấp thụ sắt thực vật từ nấm.'
    ],
    localSpots: [
      { name: 'Phở Chay Như', address: '54 Trương Quyền, Quận 3, TP.HCM', dist: '1.8 km', rating: '4.7', priceRange: '40.000đ - 65.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' },
      { name: 'Pi Vegetarian Bistro', address: '187/15 Điện Biên Phủ, Quận 1', dist: '1.6 km', rating: '4.8', priceRange: '60.000đ - 120.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' }
    ],
    region: 'vietnam',
    matchReason: 'Cung cấp 24g đạm thực vật và 1.4µg Vitamin B12 cho bữa sáng thanh nhẹ'
  },
  {
    id: 'r10',
    title: 'Canh Chua Chay Nấm Đùi Gà, Bạc Hà & Đậu Bắp Nam Bộ',
    englishSub: 'Mekong Delta Sweet & Sour Mushroom Soup',
    subtitle: 'Vị chua thanh dịu từ me chín, ngọt thơm của dứa thơm, nấm đùi gà giòn ngọt, dọc mùng đậu bắp xanh mướt chuẩn vị Nam Bộ.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85',
    prepTime: 18,
    matchScore: 93,
    mealTypes: ['lunch', 'dinner'],
    season: 'Mùa Khô / Nắng Nam Bộ',
    tags: ['Ẩm thực Việt', 'Giàu Vitamin C', 'Giải nhiệt'],
    nutrients: { calories: 280, protein: 18, iron: 5.2, b12: 0.9, omega3: 0.5 },
    ingredients: [
      { name: 'Nấm đùi gà tươi cắt khoanh', amount: '180g', category: 'Rau củ & Nấm' },
      { name: 'Đậu hũ non trắng mềm', amount: '1 bìa (150g)', category: 'Đạm thực vật' },
      { name: 'Thơm (Dứa) chín ngọt', amount: '1/4 quả', category: 'Rau củ' },
      { name: 'Cà chua chín mọng', amount: '2 quả', category: 'Rau củ' },
      { name: 'Dọc mùng (bạc hà) & Đậu bắp', amount: '120g', category: 'Rau củ' },
      { name: 'Nước cốt me chua & ngò om, ngò gai', amount: '2 muỗng canh', category: 'Gia vị chay' }
    ],
    steps: [
      'Phi thơm đầu hành baro, cho cà chua và dứa vào xào thơm tạo màu nước canh vàng đỏ óng tự nhiên.',
      'Thêm 700ml nước lọc, cho nước cốt me vào đun sôi, nêm hạt nêm nấm và chút đường thốt nốt cho vị chua ngọt hài hòa.',
      'Cho nấm đùi gà, đậu hũ non, đậu bắp và dọc mùng đun sôi bùng 2 phút. Tắt bếp, rắc ngò om và vài lát ớt sừng.'
    ],
    chefTips: [
      'Xào kỹ cà chua với dứa trước khi châm nước để nước canh có màu sắc tự nhiên không cần phẩm màu.',
      'Dọc mùng tước vỏ bóp nhẹ với chút muối hạt rồi xả sạch nước giúp giữ độ giòn xốp và không gây ngứa cổ.',
      'Vitamin C từ dứa, cà chua và me làm tăng tỷ lệ hấp thụ Sắt non-heme của nấm lên gấp 3 lần.'
    ],
    localSpots: [
      { name: 'Bếp Xanh An Duyên', address: '10 Nguyễn Tri Phương, Quận 5', dist: '3.5 km', rating: '4.8', priceRange: '50.000đ - 95.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:00' },
      { name: 'Nhà Hàng Chay Phương Mai', address: '86F Võ Thị Sáu, Quận 1', dist: '1.4 km', rating: '4.7', priceRange: '55.000đ - 115.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' }
    ],
    region: 'vietnam',
    matchReason: 'Giàu Vitamin C giúp tăng sinh khả dụng Sắt non-heme lên 300%'
  },
  {
    id: 'r11',
    title: 'Cơm Chiên Hoàng Bào Chay Hạt Sen, Cà Rốt & Đậu Hà Lan',
    englishSub: 'Royal Lotus Seed & Garden Veggie Fried Brown Rice',
    subtitle: 'Cơm gạo lứt dẻo thơm áo màu nghệ tươi vàng óng, hạt sen Huế bùi ngậy, nấm đông cô và đậu Hà Lan giòn ngọt.',
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=85',
    prepTime: 22,
    matchScore: 92,
    mealTypes: ['lunch', 'dinner'],
    season: 'Quanh năm • Truyền thống',
    tags: ['Ẩm thực Việt', 'Giàu Đạm', 'Gạo lứt dinh dưỡng'],
    nutrients: { calories: 490, protein: 22, iron: 5.6, b12: 0.8, omega3: 0.7 },
    ingredients: [
      { name: 'Cơm gạo lứt nấu hạt sen để nguội', amount: '200g', category: 'Ngũ cốc' },
      { name: 'Hạt sen Huế tươi luộc mềm', amount: '60g', category: 'Ngũ cốc' },
      { name: 'Đậu Hà Lan & Cà rốt hạt lựu', amount: '80g', category: 'Rau củ' },
      { name: 'Nấm đông cô tươi cắt hạt lựu', amount: '60g', category: 'Rau củ & Nấm' },
      { name: 'Bột nghệ củ & Dầu đậu phộng', amount: '1 muỗng cà phê', category: 'Gia vị chay' }
    ],
    steps: [
      'Trộn đều cơm gạo lứt với 1 thìa cà phê bột nghệ tươi và chút muối hồng để hạt cơm tơi xốp, vàng óng.',
      'Phi thơm boa-rô trên chảo nóng, xào săn nấm đông cô, cà rốt và đậu Hà Lan cùng nước tương nấm.',
      'Trút cơm gạo lứt và hạt sen vào đảo đều ở lửa lớn trong 5 phút đến khi hạt cơm săn giòn thơm lừng.'
    ],
    chefTips: [
      'Cơm gạo lứt nên để ngăn mát tủ lạnh 2 tiếng trước khi chiên để hạt cơm săn chắc, giòn tơi không bị nhão.',
      'Hạt sen hấp chín mềm tới, không luộc nát để khi xào cùng cơm vẫn giữ nguyên dáng hạt tròn bùi.',
      'Bột nghệ vừa tạo sắc hoàng bào cung đình Huế vừa bổ sung Curcumin kháng viêm tự nhiên.'
    ],
    localSpots: [
      { name: 'Nhà Hàng Chay Phương Mai', address: '86F Võ Thị Sáu, Quận 1', dist: '1.4 km', rating: '4.7', priceRange: '55.000đ - 115.000đ', openStatus: 'Đang mở cửa • Đóng lúc 21:30' }
    ],
    region: 'vietnam',
    matchReason: 'Bổ sung tinh bột hấp thu chậm và năng lượng bền vững cho cả buổi chiều'
  },
  {
    id: 'r12',
    title: 'Cà Ri Cà Tím Om Đậu Phộng Nước Dừa Béo Thơm Nam Bộ',
    englishSub: 'Southern Braised Eggplant & Coconut Peanut Curry',
    subtitle: 'Cà tím áp chảo mềm ngọt, đậu phộng rang giã dập và sốt nước cốt dừa sả ớt thơm béo đặc trưng ẩm thực miền Tây.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1000&q=85',
    prepTime: 22,
    matchScore: 91,
    mealTypes: ['dinner'],
    season: 'Mùa Mưa Nam Bộ',
    tags: ['Ẩm thực Việt', 'Đậm đà Nam Bộ', 'Không Gluten'],
    nutrients: { calories: 460, protein: 18, iron: 4.8, b12: 0.5, omega3: 1.1 },
    ingredients: [
      { name: 'Cà tím cắt khúc dày', amount: '250g', category: 'Rau củ' },
      { name: 'Đậu hũ chiên vàng', amount: '120g', category: 'Đạm thực vật' },
      { name: 'Đậu phộng rang giã dập', amount: '40g', category: 'Đậu hạt' },
      { name: 'Nước cốt dừa tươi Bến Tre', amount: '120ml', category: 'Gia vị chay' },
      { name: 'Sả băm, ớt sừng & Bột cà ri Nam Ấn', amount: '2 muỗng canh', category: 'Gia vị chay' }
    ],
    steps: [
      'Cà tím ngâm nước muối loãng 5 phút, vớt ráo và áp chảo sơ 2 mặt cho vàng thơm.',
      'Phi sả băm và bột cà ri với chút dầu, trút nước dừa tươi và nước cốt dừa vào đun sôi lăn tăn.',
      'Cho cà tím, đậu hũ chiên vào om nhỏ lửa 10 phút đến khi sốt ngấm mềm, rắc đậu phộng rang lên trên.'
    ],
    chefTips: [
      'Ngâm cà tím vào nước muối loãng pha chút chanh để cà không bị thâm đen và giảm bớt vị chát tự nhiên.',
      'Chỉ cho nước cốt dừa đặc vào ở 3 phút cuối để giữ nguyên độ béo thanh không bị tách dầu.',
      'Đậu phộng giã vỡ vừa phải tạo độ giòn bùi tương phản với miếng cà tím mềm tan.'
    ],
    localSpots: [
      { name: 'Hum Vegetarian', address: '32 Võ Văn Tần, Quận 3', dist: '2.1 km', rating: '4.9', priceRange: '85.000đ - 220.000đ', openStatus: 'Đang mở cửa • Đóng lúc 22:00' }
    ],
    region: 'vietnam',
    matchReason: 'Giàu chất béo thực vật lành mạnh và chất chống oxy hóa Nasunin tốt cho tim mạch'
  }
];

export const isRecipeSafeForAllergies = (r, allergies) => {
  if (!allergies || allergies.length === 0) return true;
  return !allergies.some(allergy => {
    const aLower = allergy.toLowerCase();
    if (aLower.includes('gluten') || aLower.includes('lúa mì')) {
      return r.ingredients.some(
        i =>
          i.name.toLowerCase().includes('mì fettuccine') ||
          i.name.toLowerCase().includes('bánh mì') ||
          i.name.toLowerCase().includes('sourdough') ||
          i.name.toLowerCase().includes('mì căn') ||
          i.name.toLowerCase().includes('seitan') ||
          i.name.toLowerCase().includes('bột mì') ||
          i.name.toLowerCase().includes('lúa mì')
      );
    }
    if (aLower.includes('đậu phộng') || aLower.includes('lạc')) {
      return r.ingredients.some(
        i =>
          i.name.toLowerCase().includes('đậu phộng') ||
          i.name.toLowerCase().includes('lạc') ||
          i.name.toLowerCase().includes('bơ đậu phộng')
      );
    }
    if (aLower.includes('đậu nành')) {
      return r.ingredients.some(
        i =>
          i.name.toLowerCase().includes('đậu nành') ||
          i.name.toLowerCase().includes('đậu hũ') ||
          i.name.toLowerCase().includes('edamame') ||
          i.name.toLowerCase().includes('tempeh')
      );
    }
    if (aLower.includes('nấm')) {
      return r.ingredients.some(i => i.name.toLowerCase().includes('nấm'));
    }
    if (aLower.includes('hành') || aLower.includes('tỏi') || aLower.includes('ngũ vị tân')) {
      return r.ingredients.some(
        i =>
          i.name.toLowerCase().includes('hành') ||
          i.name.toLowerCase().includes('tỏi') ||
          i.name.toLowerCase().includes('hẹ') ||
          i.name.toLowerCase().includes('kiệu')
      );
    }
    if (aLower.includes('ớt')) {
      return r.ingredients.some(i => i.name.toLowerCase().includes('ớt'));
    }
    return r.ingredients.some(i => i.name.toLowerCase().includes(aLower));
  });
};

export const DEFAULT_PROFILE = {
  name: 'Minh Anh',
  username: '@minhanh.vegan',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Người ăn thuần chay hướng tới lối sống bền vững, yêu thích ẩm thực thực vật Nam Bộ & yoga hàng ngày.',
  diet: 'Thuần chay (Vegan)',
  height: 165,
  weight: 56,
  age: 23,
  gender: 'female',
  activity: 'moderate',
  goal: 'maintain',
  allergies: ['Đậu phộng'],
  savedRecipeIds: ['r1', 'r2', 'r3'],
  streakDays: 48,
  targetB12AchievedPct: 94,
  appleHealthConnected: true,
  caloriesBurnedToday: 420
};

export const DEMO_PROFILES = [
  {
    id: 'p1',
    name: 'Minh Anh',
    email: 'minhanh.vegan@veggieai.vn',
    tagline: 'Thuần chay Vegan • Bù đắp B12 & Sắt • Khí hậu Nam Bộ',
    badge: 'Thuần Chay 100%',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    profile: DEFAULT_PROFILE,
    plan: [
      { day: 'Thứ 2', date: '19/10', breakfast: 'r4', lunch: 'r1', dinner: 'r6', completedBreakfast: true },
      { day: 'Thứ 3', date: '20/10', breakfast: 'r7', lunch: 'r3', dinner: 'r2' },
      { day: 'Thứ 4', date: '21/10', breakfast: 'r4', lunch: 'r5', dinner: 'r8' },
      { day: 'Thứ 5', date: '22/10', breakfast: 'r7', lunch: 'r2', dinner: 'r3' },
      { day: 'Thứ 6', date: '23/10', breakfast: 'r4', lunch: 'r1', dinner: 'r5' },
      { day: 'Thứ 7', date: '24/10', breakfast: 'r7', lunch: 'r3', dinner: 'r6' },
      { day: 'Chủ Nhật', date: '25/10', breakfast: 'r4', lunch: 'r2', dinner: 'r5' }
    ]
  },
  {
    id: 'p2',
    name: 'Hoàng Nam',
    email: 'nam.calisthenics@veggieai.vn',
    tagline: 'Ăn chay Thể thao High-Protein • 116g Đạm thực vật • Tăng cơ lean',
    badge: 'Lacto-Ovo Gym',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    profile: {
      name: 'Hoàng Nam',
      username: '@nam.calisthenics',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      bio: 'Vận động viên Calisthenics & Gym ăn chay có trứng sữa. Mục tiêu nạp 116g đạm thực vật/ngày để xây dựng cơ bắp săn chắc.',
      diet: 'Ăn chay có trứng sữa (Lacto-Ovo)',
      height: 178,
      weight: 73,
      age: 27,
      gender: 'male',
      activity: 'active',
      goal: 'muscle',
      allergies: ['Không Gluten'],
      savedRecipeIds: ['r1', 'r3', 'r5'],
      streakDays: 26,
      targetB12AchievedPct: 100,
      appleHealthConnected: true,
      caloriesBurnedToday: 680
    },
    plan: [
      { day: 'Thứ 2', date: '19/10', breakfast: 'r7', lunch: 'r1', dinner: 'r3', completedBreakfast: true, completedLunch: true },
      { day: 'Thứ 3', date: '20/10', breakfast: 'r4', lunch: 'r5', dinner: 'r1' },
      { day: 'Thứ 4', date: '21/10', breakfast: 'r7', lunch: 'r3', dinner: 'r6' },
      { day: 'Thứ 5', date: '22/10', breakfast: 'r4', lunch: 'r1', dinner: 'r2' },
      { day: 'Thứ 6', date: '23/10', breakfast: 'r7', lunch: 'r5', dinner: 'r3' },
      { day: 'Thứ 7', date: '24/10', breakfast: 'r4', lunch: 'r1', dinner: 'r6' },
      { day: 'Chủ Nhật', date: '25/10', breakfast: 'r7', lunch: 'r3', dinner: 'r5' }
    ]
  },
  {
    id: 'p3',
    name: 'Cô Bích Vân',
    email: 'bichvan.thucduong@veggieai.vn',
    tagline: 'Thực dưỡng Ohsawa • Ngũ cốc lứt & Hỗ trợ tim mạch khỏe mạnh',
    badge: 'Thực Dưỡng 12 Năm',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    profile: {
      name: 'Cô Bích Vân',
      username: '@bichvan.thucduong',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      bio: 'Thực dưỡng Ohsawa hơn 12 năm. Chú trọng gạo lứt huyết rồng, rong biển, tương miso và rau củ mùa thu tự nhiên.',
      diet: 'Thực dưỡng (Macrobiotic)',
      height: 158,
      weight: 52,
      age: 46,
      gender: 'female',
      activity: 'sedentary',
      goal: 'maintain',
      allergies: ['Đường tinh luyện', 'Bột ngọt'],
      savedRecipeIds: ['r4', 'r6', 'r7'],
      streakDays: 112,
      targetB12AchievedPct: 88,
      appleHealthConnected: false,
      caloriesBurnedToday: 210
    },
    plan: [
      { day: 'Thứ 2', date: '19/10', breakfast: 'r4', lunch: 'r6', dinner: 'r7', completedBreakfast: true },
      { day: 'Thứ 3', date: '20/10', breakfast: 'r4', lunch: 'r3', dinner: 'r6' },
      { day: 'Thứ 4', date: '21/10', breakfast: 'r7', lunch: 'r5', dinner: 'r8' },
      { day: 'Thứ 5', date: '22/10', breakfast: 'r4', lunch: 'r2', dinner: 'r3' },
      { day: 'Thứ 6', date: '23/10', breakfast: 'r7', lunch: 'r1', dinner: 'r5' },
      { day: 'Thứ 7', date: '24/10', breakfast: 'r4', lunch: 'r3', dinner: 'r6' },
      { day: 'Chủ Nhật', date: '25/10', breakfast: 'r7', lunch: 'r2', dinner: 'r5' }
    ]
  }
];

export const INITIAL_WEEKLY_PLAN = DEMO_PROFILES[0].plan;

export const RDA_MICRONUTRIENTS = {
  b12: { target: 2.4, unit: 'µg', name: 'Vitamin B12' },
  iron: { target: 18.0, unit: 'mg', name: 'Sắt Non-Heme' },
  omega3: { target: 1.6, unit: 'g', name: 'Omega-3 ALA' },
  calcium: { target: 1000, unit: 'mg', name: 'Canxi Thực Vật' }
};
