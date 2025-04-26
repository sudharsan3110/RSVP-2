import dayjs from 'dayjs';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Event } from '@/types/events';

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

export const helpCenterUrl = process.env.NEXT_PUBLIC_HELP_CENTER_URL ?? '';

export interface DateGroup {
  date: Date;
  events: Event[];
}

export const getDateGroups = (events: Event[]): DateGroup[] => {
  const dateGroups: DateGroup[] = [];

  events.forEach((event) => {
    const existingDateGroup = dateGroups.find((group) =>
      dayjs(group.date).isSame(event.eventDate, 'day')
    );

    if (existingDateGroup) {
      existingDateGroup.events.push(event);
    } else {
      dateGroups.push({ date: event.eventDate, events: [event] });
    }
  });

  return dateGroups;
};
