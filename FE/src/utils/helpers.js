/**
 * General helper utilities
 */

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export default {
  classNames,
  generateId,
};
