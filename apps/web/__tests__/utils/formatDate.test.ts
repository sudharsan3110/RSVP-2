import { describe, it, expect } from 'vitest';
import { formatDate } from '@/utils/formatDate';
import dayjs from 'dayjs';

describe('formatDate', () => {
  const testDate = '2025-10-29T17:00:00'; // 5:00 PM

  it('should return empty string for null or undefined date', () => {
    expect(formatDate(null as any)).toBe('');
    expect(formatDate(undefined as any)).toBe('');
  });

  it('should return empty string for invalid date', () => {
    expect(formatDate('invalid-date')).toBe('');
  });

  it('should format with default pattern when no options provided', () => {
    // default: 'D MMM' -> 29 Oct
    expect(formatDate(testDate)).toBe('29 Oct, 2025');
  });

  it('should format with timeOnly pattern', () => {
    // timeOnly: 'h:mm A' -> 5:00 PM
    expect(formatDate(testDate, { timeOnly: true })).toBe('5:00 PM');
  });

  it('should format with time24 pattern', () => {
    // time24: 'HH:mm' -> 17:00
    expect(formatDate(testDate, { time24: true })).toBe('17:00');
  });

  it('should format with withTime pattern', () => {
    // withTime: 'h:mm A, D MMM, YYYY' -> 5:00 PM, 29 Oct, 2025
    expect(formatDate(testDate, { withTime: true })).toBe('5:00 PM, Wed, 29 Oct, 2025');
  });

  it('should format with dateOnly pattern', () => {
    // dateOnly: 'D MMM, YYYY' -> 29 Oct, 2025
    expect(formatDate(testDate, { dateOnly: true })).toBe('Wed, 29 Oct, 2025');
  });

  it('should prioritize options in correct order', () => {
    // This test verifies only specific precedence cases (timeOnly > time24, time24 > withTime), not the entire option priority chain.
    expect(formatDate(testDate, { timeOnly: true, time24: true })).toBe('5:00 PM');
    expect(formatDate(testDate, { time24: true, withTime: true })).toBe('17:00');
  });

  it('should handle Dayjs object input', () => {
    const d = dayjs(testDate);
    expect(formatDate(d)).toBe('29 Oct, 2025');
  });

  it('should handle Date object input', () => {
    const d = new Date(testDate);
    expect(formatDate(d)).toBe('29 Oct, 2025');
  });
});
