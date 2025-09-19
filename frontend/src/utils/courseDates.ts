import formatDate from 'intl-dateformat';

type CourseLike = {
  fecha?: string;
  cantidad_dias?: number | null;
};

const LOCALE = 'es-AR';

export function normalizeCourseDate(isoDate: string): Date {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid course date: ${isoDate}`);
  }
  date.setUTCHours(12, 0, 0, 0);
  return date;
}

export function formatCourseDateRange(course: CourseLike): string | null {
  if (!course?.fecha) {
    return null;
  }

  const start = normalizeCourseDate(course.fecha);
  const end = new Date(start);

  if (course.cantidad_dias && course.cantidad_dias > 1) {
    end.setUTCDate(start.getUTCDate() + (course.cantidad_dias - 1));
  }

  const fmtDay = (date: Date) =>
    date.toLocaleDateString(LOCALE, { weekday: 'long', day: '2-digit' });

  const monthYear = start.toLocaleDateString(LOCALE, {
    month: 'long',
    year: 'numeric',
  });

  return `${fmtDay(start)} al ${fmtDay(end)} de ${monthYear}`;
}

export function formatCourseWeekday(date: Date): string {
  return formatDate(date, 'dddd', { locale: LOCALE });
}

export function formatCourseMonth(date: Date): string {
  return formatDate(date, 'MMMM', { locale: LOCALE });
}

export function formatCourseYear(date: Date): string {
  return formatDate(date, 'YYYY', { locale: LOCALE });
}
