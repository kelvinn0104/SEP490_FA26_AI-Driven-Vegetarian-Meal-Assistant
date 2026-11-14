/**
 * Text and Number formatting utilities
 */

export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('vi-VN');
}

export function formatCalories(kcal) {
  return `${formatNumber(kcal)} kcal`;
}

export function formatPercent(percent) {
  return `${Number(percent).toFixed(1)}%`;
}

export function truncateText(text, maxLength = 60) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export default {
  formatNumber,
  formatCalories,
  formatPercent,
  truncateText,
};
