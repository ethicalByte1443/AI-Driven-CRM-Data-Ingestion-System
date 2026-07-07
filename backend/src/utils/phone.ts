/**
 * Phone normalization utilities.
 * Supports Indian phone numbers with various formats.
 */

/**
 * Extract all phone number candidates from a string value.
 * Handles comma/semicolon/slash separated numbers.
 */
export function extractPhoneCandidates(value: string): string[] {
  if (!value || !value.trim()) return [];

  // Split by common separators
  const parts = value.split(/[,;\/|]+/).map((p) => p.trim()).filter(Boolean);

  const candidates: string[] = [];
  for (const part of parts) {
    // Remove non-digit characters except +
    const cleaned = part.replace(/[^\d+]/g, '');
    if (cleaned.length >= 7) {
      candidates.push(cleaned);
    }
  }

  return candidates;
}

/**
 * Normalize a phone number, extracting country code and local number.
 * Focuses on Indian numbers (+91, 91 prefix).
 */
export function normalizePhone(phone: string): {
  country_code: string;
  mobile_without_country_code: string;
} {
  if (!phone || !phone.trim()) {
    return { country_code: '', mobile_without_country_code: '' };
  }

  // Remove all non-digit characters except leading +
  let cleaned = phone.replace(/[^\d+]/g, '');

  // Handle +91 prefix
  if (cleaned.startsWith('+91') && cleaned.length >= 13) {
    return {
      country_code: '+91',
      mobile_without_country_code: cleaned.slice(3),
    };
  }

  // Handle 91 prefix (without +) for 12-digit numbers
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return {
      country_code: '+91',
      mobile_without_country_code: cleaned.slice(2),
    };
  }

  // Handle 0 prefix (Indian landline/mobile with trunk prefix)
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return {
      country_code: '+91',
      mobile_without_country_code: cleaned.slice(1),
    };
  }

  // Handle 10-digit Indian mobile numbers (assume +91)
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return {
      country_code: '+91',
      mobile_without_country_code: cleaned,
    };
  }

  // Handle other international numbers with + prefix
  if (cleaned.startsWith('+') && cleaned.length > 7) {
    // Try to extract country code (1-3 digits after +)
    const match = cleaned.match(/^\+(\d{1,3})(\d{7,})$/);
    if (match) {
      return {
        country_code: `+${match[1]}`,
        mobile_without_country_code: match[2],
      };
    }
  }

  // Fallback: return as-is without country code
  return {
    country_code: '',
    mobile_without_country_code: cleaned.replace(/^\+/, ''),
  };
}
