import dayjs, { Dayjs, isDayjs } from 'dayjs';

type formatOptions = {
  withTime?: boolean;
  timeOnly?: boolean;
  dateOnly?: boolean;
  time24?: boolean;
};

const formatType: Record<string, string> = {
  default: 'D MMM, YYYY', // 29 Oct
  dateOnly: 'ddd, D MMM, YYYY', //Wed, 9 Oct, 2025
  withTime: 'h:mm A, ddd, D MMM, YYYY', // 5:00 PM, Wed, 9 Oct, 2025
  timeOnly: 'h:mm A', // 5:00 PM
  time24: 'HH:mm', // 17:00
};

export function formatDate(date: string | Date | Dayjs, options: formatOptions = {}): string {
  if (!date) return '';

  const d = isDayjs(date) ? date : dayjs(date);
  if (!d.isValid()) return '';

  const key =
    (options.timeOnly && 'timeOnly') ||
    (options.time24 && 'time24') ||
    (options.withTime && 'withTime') ||
    (options.dateOnly && 'dateOnly') ||
    'default';

  const pattern = formatType[key] || formatType.default;
  return d.format(pattern);
}
