/**
 * General helper utilities
 */

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function formatCalorie(calories) {
  return `${Math.round(calories || 0)} kcal`;
}

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return (weightKg / (heightM * heightM)).toFixed(1);
}

export default {
  classNames,
  generateId,
  formatCalorie,
  calculateBMI,
};
