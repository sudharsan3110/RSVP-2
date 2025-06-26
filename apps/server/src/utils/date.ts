import { toZonedTime, format } from 'date-fns-tz';

// This function takes a Date object, converts it to Indian Standard Time (IST),
export function formatToIST(date: Date): string {
  const timeZone = 'Asia/Kolkata';
  const zonedDate = toZonedTime(date, timeZone);
  return format(zonedDate, 'MMMM d, yyyy h:mm a zzz', { timeZone });
}
