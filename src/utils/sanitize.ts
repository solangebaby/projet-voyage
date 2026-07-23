/**
 * Sanitize a string to prevent XSS by escaping HTML special characters.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Strip all HTML tags from a string.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Validate a Cameroonian phone number (237XXXXXXXXX format).
 */
export function validateCameroonPhone(phone: string): boolean {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const normalized = cleaned.startsWith('237') ? cleaned : '237' + cleaned.replace(/^0/, '');
  return /^237[0-9]{9}$/.test(normalized);
}

/**
 * Normalize a Cameroonian phone number to 237XXXXXXXXX format.
 */
export function normalizeCameroonPhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, '');
  const withoutLeadingZero = cleaned.replace(/^0/, '');
  return withoutLeadingZero.startsWith('237') ? withoutLeadingZero : '237' + withoutLeadingZero;
}

/**
 * Validate an email address.
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validate a CNI/passport number (basic check: alphanumeric, 5-20 chars).
 */
export function validateCNI(cni: string): boolean {
  return /^[a-zA-Z0-9]{5,20}$/.test(cni.trim());
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
