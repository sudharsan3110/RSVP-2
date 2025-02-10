import dayjs from 'dayjs';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fileFromUrl = async (url: string, filename: string): Promise<File> => {
  const blob = await fetch(url).then((r) => r.blob());
  URL.revokeObjectURL(url);
  return new File([blob], filename);
};

export const formatDateTime = (date: string) => {
  return {
    date: dayjs(date).format('DD MMM YYYY'),
    time: dayjs(date).format('h:mm A'),
  };
};
