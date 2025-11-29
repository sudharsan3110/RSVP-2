import dayjs from 'dayjs';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Event } from '@/types/events';
import { formatDate } from '@/utils/formatDate';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (date: string) => {
  return {
    date: formatDate(date, { dateOnly: true }),
    time: formatDate(date, { timeOnly: true }),
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

export interface UserDisplayName {
  fullName?: string | null;
  userName?: string;
}

export const getUserDisplayName = (
  user: UserDisplayName | null | undefined,
  fallback: string = 'Unknown User'
): string => {
  return user?.fullName || user?.userName || fallback;
};
