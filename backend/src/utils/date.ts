/**
 * Normalize a date string to a format accepted by JavaScript's Date constructor.
 * Returns blank string if the input is invalid or empty.
 */
export function normalizeDate(value: string): string {
  if (!value || !value.trim()) return '';

  const trimmed = value.trim();

  // Try direct parsing
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  // Try common Indian date formats: DD/MM/YYYY, DD-MM-YYYY
  const ddmmyyyy = trimmed.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Try YYYY/MM/DD format
  const yyyymmdd = trimmed.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
  if (yyyymmdd) {
    const [, year, month, day] = yyyymmdd;
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }

  // Could not parse — return blank
  return '';
}
