/**
 * Comprehensive Culinary Ingredients Database & Extractor for VeggieAI
 * Maps all database recipes (r1 - r31) and extracts ingredients into 4 supermarket aisles:
 * 1. Rau củ tươi
 * 2. Đậu hạt & Đạm thực vật
 * 3. Ngũ cốc & Mì
 * 4. Gia vị & Vi chất B12
 */

export const RECIPE_INGREDIENTS_MAP = {
  // --- Bữa Sáng (Breakfast) ---
  'r1': [
    { name: 'Yến mạch cán dẹt hữu cơ', amount: '100g', category: 'Ngũ cốc & Mì' },
    { name: 'Sữa đậu nành không đường', amount: '250ml', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Chuối già chín mọng', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Hạt chia hữu cơ', amount: '15g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Quế hồi & mật mía nguyên chất', amount: '1 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r2': [
    { name: 'Bánh mì nguyên cám', amount: '2 lát', category: 'Ngũ cốc & Mì' },
    { name: 'Đậu phụ non áp chảo', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cà chua chín & dưa leo', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Rau xà lách & ngò rí', amount: '50g', category: 'Rau củ tươi' },
    { name: 'Sốt cà chua tiêu đen', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r3': [
    { name: 'Gạo nếp cái hoa vàng', amount: '120g', category: 'Ngũ cốc & Mì' },
    { name: 'Đậu xanh cà đãi vỏ', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Mè trắng rang thơm', amount: '20g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Nước cốt dừa tươi', amount: '30ml', category: 'Gia vị & Vi chất B12' },
    { name: 'Muối hồng Himalaya', amount: '1/2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r4': [
    { name: 'Yến mạch nguyên hạt', amount: '80g', category: 'Ngũ cốc & Mì' },
    { name: 'Nấm hương tươi', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Đậu hũ non cắt quân cờ', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cà rốt băm hạt lựu', amount: '50g', category: 'Rau củ tươi' },
    { name: 'Hành boaro & tiêu sọ', amount: '10g', category: 'Gia vị & Vi chất B12' }
  ],
  'r5': [
    { name: 'Quả bơ sáp chín', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Chuối tiêu chín ngọt', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Sữa đậu nành hữu cơ', amount: '200ml', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Hạt lanh rang xay mịn', amount: '15g', category: 'Đậu hạt & Đạm thực vật' }
  ],

  // --- Món Chính (Main Dish) ---
  'r6': [
    { name: 'Đậu phụ mơ chiên vàng', amount: '180g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cà chua chín mọng', amount: '2 quả (150g)', category: 'Rau củ tươi' },
    { name: 'Cơm gạo lứt huyết rồng', amount: '1 chén (150g)', category: 'Ngũ cốc & Mì' },
    { name: 'Hành boaro & ngò rí', amount: '20g', category: 'Rau củ tươi' },
    { name: 'Nước tương Tamari & dầu mè', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r7': [
    { name: 'Đậu gà hữu cơ luộc mềm', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Khoai lang mật & cà rốt', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Nước cốt dừa béo thanh', amount: '100ml', category: 'Gia vị & Vi chất B12' },
    { name: 'Bột cà ri & sả cây', amount: '20g', category: 'Gia vị & Vi chất B12' },
    { name: 'Bánh mì hoặc cơm lứt', amount: '1 phần', category: 'Ngũ cốc & Mì' }
  ],
  'r8': [
    { name: 'Bún gạo lứt xào khô', amount: '120g', category: 'Ngũ cốc & Mì' },
    { name: 'Tempeh đậu nành lên men', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Bông cải xanh & cà rốt sợi', amount: '120g', category: 'Rau củ tươi' },
    { name: 'Giá đỗ & nấm bào ngư', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Dầu mè & tương ớt chay', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r9': [
    { name: 'Cơm nguội gạo dẻo / gạo lứt', amount: '1 tô (180g)', category: 'Ngũ cốc & Mì' },
    { name: 'Đậu nành Nhật (Edamame)', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Bắp ngọt hạt tươi', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Cà rốt cắt hạt lựu', amount: '40g', category: 'Rau củ tươi' },
    { name: 'Dầu mè hạt & tiêu xay', amount: '15g', category: 'Gia vị & Vi chất B12' }
  ],
  'r10': [
    { name: 'Rau muống non giòn', amount: '250g', category: 'Rau củ tươi' },
    { name: 'Đậu phụ chiên giòn', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cơm gạo trắng / gạo lứt', amount: '1 chén', category: 'Ngũ cốc & Mì' },
    { name: 'Hành boaro & dầu hào nấm chay', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r11': [
    { name: 'Nấm sò / Nấm bào ngư xám', amount: '180g', category: 'Rau củ tươi' },
    { name: 'Đậu phụ cắt khối vuông', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cơm gạo lứt huyết rồng', amount: '1 chén (150g)', category: 'Ngũ cốc & Mì' },
    { name: 'Tiêu xanh & ớt hiểm', amount: '15g', category: 'Gia vị & Vi chất B12' },
    { name: 'Nước tương đen kho kẹo', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r12': [
    { name: 'Đậu lăng nâu / đỏ hầm', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Rau bina (cải bó xôi) tươi', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Cà chua nghiền cô đặc', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Bánh mì nguyên cám', amount: '1 ổ nhỏ', category: 'Ngũ cốc & Mì' },
    { name: 'Dầu ô liu nguyên chất & lá oregano', amount: '1 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r13': [
    { name: 'Bông cải xanh chần giòn', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Nấm hương tươi', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Đậu phụ áp chảo vàng', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cơm gạo lứt', amount: '1 chén (150g)', category: 'Ngũ cốc & Mì' },
    { name: 'Dầu hào chay & tỏi boaro', amount: '2 thìa', category: 'Gia vị & Vi chất B12' }
  ],

  // --- Canh & Súp (Soup) ---
  'r14': [
    { name: 'Hạt sen tươi Huế', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Nấm đùi gà & nấm linh chi', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Cà rốt & bắp non', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Đậu hũ trắng', amount: '100g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Ngò rí & muối hồng', amount: '10g', category: 'Gia vị & Vi chất B12' }
  ],
  'r15': [
    { name: 'Bí đỏ hồ lô dẻo ngọt', amount: '200g', category: 'Rau củ tươi' },
    { name: 'Đậu xanh cà vỏ', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Ngò gai & rau om', amount: '20g', category: 'Rau củ tươi' },
    { name: 'Hạt nêm nấm hữu cơ', amount: '1 thìa', category: 'Gia vị & Vi chất B12' }
  ],
  'r16': [
    { name: 'Bánh phở tươi sợi mềm', amount: '180g', category: 'Ngũ cốc & Mì' },
    { name: 'Nấm đùi gà & nấm rơm', amount: '120g', category: 'Rau củ tươi' },
    { name: 'Đậu phụ chiên & tàu hũ ky', amount: '100g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Hồi, quế, đinh hương, gừng nướng', amount: '20g', category: 'Gia vị & Vi chất B12' },
    { name: 'Giá đỗ, húng quế & ngò gai', amount: '50g', category: 'Rau củ tươi' }
  ],
  'r17': [
    { name: 'Đậu lăng vàng nấu nhừ', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cà rốt Đà Lạt bào nhuyễn', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Bánh mì nướng bơ tỏi', amount: '2 lát', category: 'Ngũ cốc & Mì' },
    { name: 'Men dinh dưỡng bổ sung B12', amount: '15g', category: 'Gia vị & Vi chất B12' }
  ],
  'r18': [
    { name: 'Đậu đen xanh lòng hầm mềm', amount: '100g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Bí đỏ hồ lô', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Nước cốt dừa nguyên chất', amount: '60ml', category: 'Gia vị & Vi chất B12' },
    { name: 'Đường thốt nốt & lá dứa', amount: '20g', category: 'Gia vị & Vi chất B12' }
  ],

  // --- Gỏi & Salad (Salad) ---
  'r19': [
    { name: 'Bánh tráng gạo dẻo', amount: '6 cái', category: 'Ngũ cốc & Mì' },
    { name: 'Bún tươi', amount: '80g', category: 'Ngũ cốc & Mì' },
    { name: 'Đậu phụ chiên thái sợi', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Xà lách, dưa leo, rau thơm', amount: '120g', category: 'Rau củ tươi' },
    { name: 'Tương bơ đậu phộng chấm', amount: '40g', category: 'Gia vị & Vi chất B12' }
  ],
  'r20': [
    { name: 'Quả bơ sáp cắt lát', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Đậu gà hữu cơ nấu chín', amount: '100g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Rau bina (cải bó xôi) non', amount: '100g', category: 'Rau củ tươi' },
    { name: 'Cà chua bi ngọt', amount: '60g', category: 'Rau củ tươi' },
    { name: 'Sốt chanh vàng mù tạt mật mía', amount: '30ml', category: 'Gia vị & Vi chất B12' }
  ],
  'r21': [
    { name: 'Tempeh đậu nành áp chảo', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Bông cải xanh chần giòn', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Cà chua bi & bắp cải tím', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Sốt mè rang béo ngậy', amount: '30ml', category: 'Gia vị & Vi chất B12' }
  ],

  // --- Tráng miệng & Ăn nhẹ (Dessert / Snack) ---
  'r22': [
    { name: 'Đậu xanh hạt đãi vỏ', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Hạt sen tươi hầm mềm', amount: '80g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Phổ tai giòn & bột sắn dây', amount: '30g', category: 'Rau củ tươi' },
    { name: 'Đường phèn thanh ngọt', amount: '30g', category: 'Gia vị & Vi chất B12' }
  ],
  'r23': [
    { name: 'Hạt chia hữu cơ', amount: '40g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Xoài cát chín ngọt thơm', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Sữa hạnh nhân không đường', amount: '150ml', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Vụn dừa nướng & lá bạc hà', amount: '10g', category: 'Gia vị & Vi chất B12' }
  ],
  'r24': [
    { name: 'Hạt điều rang vỏ lụa', amount: '60g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Cam vàng Navel mọng nước', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Hạnh nhân sấy giòn', amount: '30g', category: 'Đậu hạt & Đạm thực vật' }
  ],
  'r25': [
    { name: 'Khoai lang mật luộc dẻo', amount: '200g', category: 'Rau củ tươi' },
    { name: 'Sữa đậu nành nấu lá dứa', amount: '250ml', category: 'Đậu hạt & Đạm thực vật' }
  ],
  'r26': [
    { name: 'Sữa chua đậu nành lên men', amount: '1 hũ (120g)', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Men dinh dưỡng bổ sung Vitamin B12', amount: '2 thìa (10g)', category: 'Gia vị & Vi chất B12' },
    { name: 'Chuối tiêu thái lát', amount: '1 quả', category: 'Rau củ tươi' },
    { name: 'Hạt Granola yến mạch giòn', amount: '30g', category: 'Ngũ cốc & Mì' }
  ],

  // --- Món Kho, Canh Dưỡng Sinh & Bánh Truyền Thống ---
  'r27': [
    { name: 'Bí đỏ hồ lô dẻo bùi', amount: '200g', category: 'Rau củ tươi' },
    { name: 'Đậu hũ chiên phồng & khoai môn', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Nước cốt dừa Nam Bộ', amount: '100ml', category: 'Gia vị & Vi chất B12' },
    { name: 'Sả cây & bột nghệ vàng', amount: '20g', category: 'Gia vị & Vi chất B12' },
    { name: 'Bánh mì giòn hoặc bún tươi', amount: '1 phần', category: 'Ngũ cốc & Mì' }
  ],
  'r28': [
    { name: 'Rong biển Wakame Hàn Quốc', amount: '30g', category: 'Rau củ tươi' },
    { name: 'Đậu hũ non cắt quân cờ', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Nấm kim châm & cà rốt', amount: '80g', category: 'Rau củ tươi' },
    { name: 'Dầu mè thơm & gừng tươi', amount: '10g', category: 'Gia vị & Vi chất B12' }
  ],
  'r29': [
    { name: 'Bánh tráng dẻo cuốn gỏi', amount: '6 cái', category: 'Ngũ cốc & Mì' },
    { name: 'Đậu hũ áp chảo vàng & bún', amount: '120g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Bắp cải tím, dưa leo, cà rốt', amount: '120g', category: 'Rau củ tươi' },
    { name: 'Bơ đậu phộng & tương đen chấm gỏi', amount: '40g', category: 'Gia vị & Vi chất B12' }
  ],
  'r30': [
    { name: 'Bột bánh xèo hương nghệ cốt dừa', amount: '150g', category: 'Ngũ cốc & Mì' },
    { name: 'Nấm mối & nấm rơm tươi', amount: '120g', category: 'Rau củ tươi' },
    { name: 'Đậu xanh hấp chín & giá đỗ non', amount: '100g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Rau cải xanh, xà lách & rau thơm rừng', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Nước mắm chua ngọt chay', amount: '40ml', category: 'Gia vị & Vi chất B12' }
  ],
  'r31': [
    { name: 'Ngó sen tươi ngâm chua ngọt', amount: '150g', category: 'Rau củ tươi' },
    { name: 'Nấm tuyết ngâm nở giòn', amount: '50g', category: 'Rau củ tươi' },
    { name: 'Cà rốt bào sợi & rau răm', amount: '60g', category: 'Rau củ tươi' },
    { name: 'Đậu phộng rang giã dập', amount: '30g', category: 'Đậu hạt & Đạm thực vật' },
    { name: 'Sốt tắc đường thốt nốt', amount: '30ml', category: 'Gia vị & Vi chất B12' }
  ]
};

/**
 * Phân loại nguyên liệu vào 1 trong 4 quầy siêu thị dựa trên từ khóa
 */
export function assignIngredientCategory(name = '') {
  const lower = name.toLowerCase();

  // 1. Rau củ tươi & Nấm
  if (
    lower.includes('rau') || lower.includes('nấm') || lower.includes('cà') || 
    lower.includes('bí') || lower.includes('chuối') || lower.includes('bơ') || 
    lower.includes('xoài') || lower.includes('cam') || lower.includes('khoai') || 
    lower.includes('xà lách') || lower.includes('dưa') || lower.includes('ngó sen') || 
    lower.includes('bắp') || lower.includes('giá') || lower.includes('bông cải') ||
    lower.includes('củ') || lower.includes('trái') || lower.includes('quả') ||
    lower.includes('rong biển')
  ) {
    return 'Rau củ tươi';
  }

  // 2. Đậu hạt & Đạm thực vật
  if (
    lower.includes('đậu') || lower.includes('đạm') || lower.includes('hạt') || 
    lower.includes('tempeh') || lower.includes('tàu hũ') || lower.includes('tofu') || 
    lower.includes('sữa đậu') || lower.includes('sữa hạnh nhân') || lower.includes('lạc') || 
    lower.includes('sữa chua')
  ) {
    return 'Đậu hạt & Đạm thực vật';
  }

  // 3. Ngũ cốc & Mì
  if (
    lower.includes('gạo') || lower.includes('cơm') || lower.includes('mì') || 
    lower.includes('bún') || lower.includes('phở') || lower.includes('yến mạch') || 
    lower.includes('bánh mì') || lower.includes('bánh tráng') || lower.includes('bánh xèo') || 
    lower.includes('bột') || lower.includes('xôi') || lower.includes('nếp') ||
    lower.includes('granola')
  ) {
    return 'Ngũ cốc & Mì';
  }

  // 4. Gia vị & Vi chất B12 (mặc định)
  return 'Gia vị & Vi chất B12';
}

/**
 * Bóc tách nguyên liệu tự động từ tiêu đề và hướng dẫn nấu nếu công thức chưa có cấu trúc sẵn
 */
export function extractIngredientsFromText(title = '', instructions = '') {
  const text = `${title} ${instructions}`;
  const detected = [];

  const KNOWN_KEYWORDS = [
    { kw: 'đậu hũ', name: 'Đậu hũ non hữu cơ', amount: '150g' },
    { kw: 'đậu phụ', name: 'Đậu phụ non tươi', amount: '150g' },
    { kw: 'tàu hũ ky', name: 'Tàu hũ ky lá', amount: '80g' },
    { kw: 'tempeh', name: 'Tempeh đậu nành', amount: '120g' },
    { kw: 'đậu gà', name: 'Đậu gà hữu cơ', amount: '100g' },
    { kw: 'đậu lăng', name: 'Đậu lăng đỏ/nâu', amount: '120g' },
    { kw: 'đậu xanh', name: 'Đậu xanh cà vỏ', amount: '80g' },
    { kw: 'đậu đen', name: 'Đậu đen xanh lòng', amount: '100g' },
    { kw: 'hạt sen', name: 'Hạt sen tươi', amount: '80g' },
    { kw: 'hạt chia', name: 'Hạt chia hữu cơ', amount: '15g' },
    { kw: 'hạt điều', name: 'Hạt điều rang', amount: '50g' },
    { kw: 'mè rang', name: 'Mè rang thơm', amount: '20g' },
    { kw: 'nấm hương', name: 'Nấm hương tươi', amount: '80g' },
    { kw: 'nấm đùi gà', name: 'Nấm đùi gà', amount: '100g' },
    { kw: 'nấm mối', name: 'Nấm mối tươi', amount: '100g' },
    { kw: 'nấm tuyết', name: 'Nấm tuyết', amount: '50g' },
    { kw: 'nấm rơm', name: 'Nấm rơm tươi', amount: '80g' },
    { kw: 'nấm sò', name: 'Nấm sò tươi', amount: '120g' },
    { kw: 'nấm', name: 'Nấm tươi các loại', amount: '100g' },
    { kw: 'bí đỏ', name: 'Bí đỏ hồ lô', amount: '200g' },
    { kw: 'cà rốt', name: 'Cà rốt Đà Lạt', amount: '100g' },
    { kw: 'cà chua', name: 'Cà chua chín mọng', amount: '2 quả' },
    { kw: 'rau bina', name: 'Rau bina (cải bó xôi)', amount: '100g' },
    { kw: 'rau muống', name: 'Rau muống non', amount: '200g' },
    { kw: 'bông cải', name: 'Bông cải xanh', amount: '150g' },
    { kw: 'chuối', name: 'Chuối già chín', amount: '1 quả' },
    { kw: 'bơ', name: 'Quả bơ sáp', amount: '1 quả' },
    { kw: 'khoai lang', name: 'Khoai lang mật', amount: '150g' },
    { kw: 'cơm gạo lứt', name: 'Cơm gạo lứt', amount: '1 chén' },
    { kw: 'gạo lứt', name: 'Gạo lứt nguyên cám', amount: '1 chén' },
    { kw: 'yến mạch', name: 'Yến mạch cán dẹt', amount: '80g' },
    { kw: 'bánh mì', name: 'Bánh mì nguyên cám', amount: '2 lát' },
    { kw: 'bún', name: 'Bún tươi', amount: '150g' },
    { kw: 'phở', name: 'Bánh phở tươi', amount: '150g' },
    { kw: 'xôi', name: 'Gạo nếp ngon', amount: '120g' },
    { kw: 'nước cốt dừa', name: 'Nước cốt dừa nguyên chất', amount: '60ml' },
    { kw: 'men dinh dưỡng', name: 'Men dinh dưỡng bổ sung B12', amount: '2 thìa' }
  ];

  const lower = text.toLowerCase();
  KNOWN_KEYWORDS.forEach(item => {
    if (lower.includes(item.kw) && !detected.some(d => d.name === item.name)) {
      detected.push({
        name: item.name,
        amount: item.amount,
        category: assignIngredientCategory(item.name)
      });
    }
  });

  if (detected.length === 0) {
    detected.push(
      { name: 'Rau xanh & nấm tươi', amount: '150g', category: 'Rau củ tươi' },
      { name: 'Đậu hũ non hữu cơ', amount: '150g', category: 'Đậu hạt & Đạm thực vật' },
      { name: 'Cơm lứt / Bánh mì', amount: '1 phần', category: 'Ngũ cốc & Mì' },
      { name: 'Gia vị thuần chay & dầu hạt', amount: '1 ít', category: 'Gia vị & Vi chất B12' }
    );
  }

  return detected;
}

/**
 * Trả về danh sách nguyên liệu đầy đủ và chuẩn hóa cho một món ăn bất kỳ
 */
export function getIngredientsForRecipe(recipe) {
  if (!recipe) return [];

  // 1. Kiểm tra mảng ingredients có sẵn
  if (Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0) {
    return recipe.ingredients.map(ing => {
      const name = typeof ing === 'string' ? ing : (ing.name || ing.ingredientName || 'Nguyên liệu thực vật');
      const amount = typeof ing === 'string' ? '' : (ing.amount || `${ing.quantity || ''} ${ing.unit || ''}`.trim());
      const category = (ing && ing.category) ? ing.category : assignIngredientCategory(name);
      return { name, amount, category };
    });
  }

  // 2. Tra cứu theo ID (r1 - r31)
  const idStr = String(recipe.id || '').trim();
  const normalizedId = idStr.startsWith('r') ? idStr : `r${idStr}`;
  if (RECIPE_INGREDIENTS_MAP[normalizedId]) {
    return RECIPE_INGREDIENTS_MAP[normalizedId];
  }

  // 3. Tự động bóc tách thông minh từ tên và hướng dẫn
  return extractIngredientsFromText(recipe.title || '', recipe.instructions || recipe.description || '');
}
