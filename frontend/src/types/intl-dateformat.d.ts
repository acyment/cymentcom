declare module 'intl-dateformat' {
  type InputDate = string | number | Date;

  interface FormatOptions {
    locale?: string;
    timeZone?: string;
    [key: string]: unknown;
  }

  export default function formatDate(
    date: InputDate,
    format?: string,
    options?: FormatOptions,
  ): string;
}
