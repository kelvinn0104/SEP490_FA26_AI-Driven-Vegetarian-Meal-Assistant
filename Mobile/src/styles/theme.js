import { Platform } from 'react-native';

export const font = {
  // Editorial Serif (Lora) — recipe titles, page headlines, chef identity
  serif: 'Lora_500Medium',
  serifBold: 'Lora_600SemiBold',
  serifItalic: 'Lora_400Regular_Italic',
  // Clean Interface & Tabular Numbers (Be Vietnam Pro)
  regular: 'BeVietnamPro_400Regular',
  medium: 'BeVietnamPro_500Medium',
  semi: 'BeVietnamPro_600SemiBold',
  bold: 'BeVietnamPro_600SemiBold',
};

export const theme = {
  colors: {
    // Giấy dó (handmade Vietnamese paper) & single focal surface
    background: '#F6F5EE',
    surface: '#FCFAF4',
    surfaceElevated: '#FFFEFA',
    surfaceMuted: '#E8E2D5',
    surfaceWarm: '#EDE5D6',
    stone: '#E6DEC9',

    // Mực xanh lá đậm (Ink & structure)
    ink: '#14261C',
    inkSoft: '#2D3F34',
    primary: '#1E4330',
    primaryDark: '#132B1E',
    primaryLight: '#E3E9DC',
    primarySoft: '#EAEFE3',
    muted: '#5F695E',
    subtle: '#889085',
    line: '#E2DFD2',
    lineStrong: '#C8C0B0',

    // Nâu men gốm (Ceramic Terracotta — Primary Brand CTA, max 1 per screen)
    terracotta: '#A4532F',
    terracottaDark: '#884122',
    terracottaSoft: '#F2E3DA',
    accent: '#A4532F',
    peach: '#ECC7AE',
    peachSoft: '#F6EAE0',

    // Lime — STRICTLY ONLY for completed states (Đã ăn / Đã mua / Đã ghi)
    lime: '#D8EE8E',
    limeSoft: '#EAF4C4',
    sage: '#6E8271',

    // Nghệ (Turmeric — Nutrition alerts: B12, Sắt, Đạm & expired notices)
    turmeric: '#B87B20',
    turmericBg: '#F6EBD4',
    amber: '#B87B20',
    amberBg: '#F6EBD4',

    // Bowl & meter tracks
    gaugeTrack: '#E4DDD0',
    gaugeFill: '#A4532F',
    gaugeComplete: '#2A6041',

    // Semantic feedback
    success: '#23593A',
    successBg: '#E3EFE6',
    error: '#983628',
    errorBg: '#F9E7E2',
    errorBorder: '#E5C2B8',
    overlay: 'rgba(20, 38, 28, 0.46)',
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    pill: 999,
  },
  shadow: {
    card: Platform.select({
      android: { elevation: 1, shadowColor: '#14261C' },
      default: {
        shadowColor: '#14261C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.035,
        shadowRadius: 12,
      },
    }),
    float: Platform.select({
      android: { elevation: 4, shadowColor: '#14261C' },
      default: {
        shadowColor: '#14261C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 18,
      },
    }),
  },
};

export const c = theme.colors;
export const r = theme.radius;
export const sh = theme.shadow;

export const mealTones = {
  breakfast: { bg: '#F2E8D2', text: '#7A541E', fill: '#DFB056' },
  lunch: { bg: '#F1E1D6', text: '#874326', fill: '#C46D45' },
  dinner: { bg: '#E1EAE0', text: '#1E4330', fill: '#356849' },
  snack: { bg: '#EAE7D9', text: '#4E5835', fill: '#7B8B52' },
};

// Warm paper tints for Editorial Text-First Recipe Cards (no clip-art!)
export const categoryTones = [
  { bg: '#E7ECE1', accent: '#1E4330', rule: '#C5D1BC' },
  { bg: '#EFE4D8', accent: '#874326', rule: '#DEC7B4' },
  { bg: '#E2E9E6', accent: '#234B46', rule: '#BFD0CA' },
  { bg: '#EEE8D5', accent: '#6B5220', rule: '#D8CCA9' },
];

export const aisleTones = {
  greens: { label: 'Quầy rau lá & rau thơm', color: '#2D5A3C', bg: '#E4EDE4' },
  produce: { label: 'Quầy củ quả & trái cây', color: '#A4532F', bg: '#F2E4DB' },
  protein: { label: 'Quầy đậu, hạt & đạm chay', color: '#8A6928', bg: '#F2EAD6' },
  mushroom: { label: 'Quầy nấm tươi & khô', color: '#634D3E', bg: '#ECE5DF' },
  pantry: { label: 'Quầy gia vị & đồ khô', color: '#4B564E', bg: '#E6E8E4' },
};
