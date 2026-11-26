export const theme = {
  colors: {
    primary: '#10b981',       // Emerald green
    primaryDark: '#059669',
    primaryLight: '#d1fae5',
    accent: '#f59e0b',        // Amber for calories/highlights
    secondary: '#3b82f6',     // Blue for protein/info
    
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    
    // Nutrition macros
    calories: '#f59e0b',
    protein: '#3b82f6',
    carbs: '#10b981',
    fat: '#8b5cf6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 4,
    },
  }
};
