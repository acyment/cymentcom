import { describe, expect, it } from 'vitest';
import {
  normalizeCourseDate,
  formatCourseDateRange,
  formatCourseWeekday,
  formatCourseMonth,
  formatCourseYear,
} from '../courseDates';

describe('courseDates utilities', () => {
  it('normalizes ISO strings to noon UTC', () => {
    const normalized = normalizeCourseDate('2024-05-10');

    expect(normalized.toISOString()).toBe('2024-05-10T12:00:00.000Z');
  });

  it('formats multi-day ranges for es-AR locale', () => {
    const formatted = formatCourseDateRange({
      fecha: '2024-05-10',
      cantidad_dias: 3,
    });

    expect(formatted).toBe('viernes 10 al domingo 12 de mayo de 2024');
  });

  it('formats weekday, month and year labels', () => {
    const date = normalizeCourseDate('2024-05-10');

    expect(formatCourseWeekday(date).toLowerCase()).toContain('viernes');
    expect(formatCourseMonth(date).toLowerCase()).toContain('mayo');
    expect(formatCourseYear(date)).toBe('2024');
  });
});
