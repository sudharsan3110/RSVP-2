import { cn, formatDateTime, getDateGroups } from '@/lib/utils';
import { Event } from '@/types/events';
import { describe, it, expect } from 'vitest';

describe('cn utility', () => {
  it('should merge simple string arguments', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes correctly', () => {
    const result = cn('text-base', true && 'visible', false && 'hidden', null, undefined);
    expect(result).toBe('text-base visible');
  });

  it('should handle arrays and objects', () => {
    const result = cn(['px-2', 'py-1'], { 'bg-red-500': true, 'bg-green-500': false });
    expect(result).toBe('px-2 py-1 bg-red-500');
  });

  it('should resolve tailwind class conflicts (last one wins)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle complex tailwind overrides', () => {
    expect(cn('pt-2', 'p-4')).toBe('p-4');
    expect(cn('p-4', 'pt-2')).toBe('p-4 pt-2');
  });

  it('should override colors correctly', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('should return an empty string for empty inputs', () => {
    expect(cn()).toBe('');
    expect(cn(null)).toBe('');
    expect(cn(undefined)).toBe('');
  });
});

describe('formatDateTime Utility', () => {
  it('should correctly format a valid ISO date string', () => {
    const inputDate = '2025-10-29T17:00:00';
    const result = formatDateTime(inputDate);

    expect(result).toEqual({
      date: 'Wed, 29 Oct, 2025',
      time: '5:00 PM',
    });
  });

  it('should correctly format single digit days', () => {
    const inputDate = '2024-01-05T09:30:00';
    const result = formatDateTime(inputDate);

    expect(result).toEqual({
      date: 'Fri, 5 Jan, 2024',
      time: '9:30 AM',
    });
  });

  it('should return empty strings for an empty input', () => {
    const result = formatDateTime('');

    expect(result).toEqual({
      date: '',
      time: '',
    });
  });

  it('should return empty strings for an invalid date string', () => {
    const result = formatDateTime('not-a-real-date');

    expect(result).toEqual({
      date: '',
      time: '',
    });
  });

  it('should handle null or undefined gracefully if passed', () => {
    expect(formatDateTime(null as any)).toEqual({ date: '', time: '' });
    expect(formatDateTime(undefined as any)).toEqual({ date: '', time: '' });
  });
});

const createEvent = (id: string, dateString: string): Event => {
  return new Event({
    id,
    name: `Event ${id}`,
    eventDate: new Date(dateString),
  });
};

describe('getDateGroups', () => {
  it('should return an empty array when provided an empty event list', () => {
    const result = getDateGroups([]);
    expect(result).toEqual([]);
  });

  it('should create a single group for a single event', () => {
    const event = createEvent('1', '2023-10-01T10:00:00Z');
    const result = getDateGroups([event]);

    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual(event.eventDate);
    expect(result[0].events).toHaveLength(1);
    expect(result[0].events[0].id).toBe('1');
  });

  it('should group multiple events occurring on the exact same date and time', () => {
    const dateStr = '2023-10-01T10:00:00Z';
    const event1 = createEvent('1', dateStr);
    const event2 = createEvent('2', dateStr);

    const result = getDateGroups([event1, event2]);

    expect(result).toHaveLength(1);
    expect(result[0].events).toHaveLength(2);
    expect(result[0].events.map((e) => e.id)).toEqual(['1', '2']);
  });

  it('should group events on the same day but different times (ignore time)', () => {
    const morningEvent = createEvent('1', '2023-10-01T09:00:00Z');
    const eveningEvent = createEvent('2', '2023-10-01T11:00:00Z');

    const result = getDateGroups([morningEvent, eveningEvent]);

    expect(result).toHaveLength(1);
    expect(result[0].events).toHaveLength(2);
  });

  it('should separate events occurring on different days', () => {
    const eventDay1 = createEvent('1', '2023-10-01T10:00:00Z');
    const eventDay2 = createEvent('2', '2023-10-02T10:00:00Z');

    const result = getDateGroups([eventDay1, eventDay2]);

    expect(result).toHaveLength(2);

    const group1 = result.find((g) => g.events[0].id === '1');
    const group2 = result.find((g) => g.events[0].id === '2');

    expect(group1).toBeDefined();
    expect(group2).toBeDefined();
  });

  it('should handle events spanning across different months correctly', () => {
    const octFirst = createEvent('1', '2023-10-01T10:00:00Z');
    const novFirst = createEvent('2', '2023-11-01T10:00:00Z');

    const result = getDateGroups([octFirst, novFirst]);

    expect(result).toHaveLength(2);
  });

  it('should maintain the order of insertion within the groups', () => {
    const event1 = createEvent('1', '2023-10-01T10:00:00Z');
    const event2 = createEvent('2', '2023-10-01T11:00:00Z');
    const event3 = createEvent('3', '2023-10-01T12:00:00Z');

    const result = getDateGroups([event1, event2, event3]);

    expect(result[0].events[0].id).toBe('1');
    expect(result[0].events[1].id).toBe('2');
    expect(result[0].events[2].id).toBe('3');
  });
});
