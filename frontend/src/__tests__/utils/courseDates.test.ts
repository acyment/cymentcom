import {
  formatCourseDateRange,
  normalizeCourseDate,
} from '@/utils/courseDates';

describe('course date helpers', () => {
  it('normalizes course dates to midday UTC to avoid timezone rollbacks', () => {
    const date = normalizeCourseDate('2025-09-18');
    expect(date.toISOString()).toBe('2025-09-18T12:00:00.000Z');
  });

  it('formats a multi-day course range without shifting days', () => {
    const range = formatCourseDateRange({
      fecha: '2025-09-18',
      cantidad_dias: 3,
    });
    expect(range).toBe('jueves 18 al sábado 20 de septiembre de 2025');
  });
});
