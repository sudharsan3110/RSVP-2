import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Communication from '@/components/event-detail/communcation'; // Note the typo in filename
import { Event, VenueType } from '@/types/events';

vi.mock('@/components/chat/chat-container', () => ({
  ChatContainer: (props: any) => (
    <div data-testid="chat-container">
      <span data-testid="chat-title">{props.title}</span>
      <span data-testid="chat-subtitle">{props.subtitle}</span>
      <span data-testid="chat-messages-count">{props.messages?.length}</span>
    </div>
  ),
}));

const mockVenueDisplay = vi.fn((event: any) => {
  if (event.isPhysical) return event.venueAddress || 'No address';
  if (event.isVirtual) return event.venueUrl || event.venueType || 'Online';
  return 'To be announced';
});
vi.mock('@/utils/event', () => ({
  venueDisplay: (event: any) => mockVenueDisplay(event),
}));

const mockFormatDate = vi.fn((...args: any[]) => 'Wed, 15 Jan, 2025');
vi.mock('@/utils/formatDate', () => ({
  formatDate: (...args: any[]) => mockFormatDate(...args),
}));

// Mock useEventCommunications
const mockUseEventCommunications = vi.fn();
vi.mock('@/lib/react-query/communication', () => ({
  useEventCommunications: (...args: any[]) => mockUseEventCommunications(...args),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt} />,
}));

const mockEvent: Event = {
  id: 'event-1',
  name: 'Tech Conference',
  slug: 'tech-conf',
  description: 'A great conference',
  startTime: '2025-01-15T09:00:00.000Z',
  endTime: '2025-01-15T17:00:00.000Z',
  eventImageUrl: 'https://test.com/image.jpg',
  capacity: 100,
  isPhysical: true,
  venueType: VenueType.Physical,
  venueAddress: 'Convention Center',
  venue: 'Convention Center',
  venueUrl: 'https://maps.google.com',
  creator: {
    id: 'user-1',
    fullName: 'John Doe',
    userName: 'johndoe',
  },
  cohosts: [],
} as unknown as Event;

describe('Event Detail Communication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseEventCommunications.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });
  });

  it('renders event details correctly', () => {
    render(<Communication event={mockEvent} totalAttendees={50} />);

    expect(screen.getAllByText('Tech Conference')).toHaveLength(2);
    expect(screen.getByText('50 attending • 100 capacity')).toBeInTheDocument();
    expect(screen.getByText('50 seats remaining')).toBeInTheDocument();
    expect(screen.getByText('Single host')).toBeInTheDocument();

    const image = screen.getByRole('img', { name: /tech conference/i });
    expect(image).toHaveAttribute('src', 'https://test.com/image.jpg');
  });

  it('passes correct props to ChatContainer', () => {
    const messages = [{ id: '1', content: 'hello' }];
    mockUseEventCommunications.mockReturnValue({
      data: { data: messages },
      isLoading: false,
    });

    render(<Communication event={mockEvent} totalAttendees={50} />);

    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-title')).toHaveTextContent('Tech Conference');
    expect(screen.getByTestId('chat-subtitle')).toHaveTextContent('Hosted by John Doe');
    expect(screen.getByTestId('chat-messages-count')).toHaveTextContent('1');
  });

  it('handles loading state', () => {
    mockUseEventCommunications.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Communication event={mockEvent} totalAttendees={0} />);
    // ChatContainer always renders and receives isLoading, even though the mock won't show a spinner.
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
  });

  it('displays cohost count correctly', () => {
    const eventWithCohosts = {
      ...mockEvent,
      cohosts: [{ id: '2' }, { id: '3' }],
    } as unknown as Event;

    render(<Communication event={eventWithCohosts} totalAttendees={10} />);

    expect(screen.getByText('2 cohosts')).toBeInTheDocument();
  });

  it('renders virtual event details correctly', () => {
    const virtualEvent = {
      ...mockEvent,
      venueType: VenueType.Virtual,
      venueUrl: 'https://zoom.us/j/123',
      isPhysical: false,
      isVirtual: true,
    } as unknown as Event;

    render(<Communication event={virtualEvent} totalAttendees={10} />);

    const link = screen.getByRole('link', { name: /zoom.us/i });
    expect(link).toHaveAttribute('href', 'https://zoom.us/j/123');
  });

  it('renders event category badge', () => {
    const categoryEvent = {
      ...mockEvent,
      category: { name: 'Workshops' },
    } as unknown as Event;

    render(<Communication event={categoryEvent} totalAttendees={10} />);

    expect(screen.getByText('Workshops')).toBeInTheDocument();
  });

  it('handles multi-day event date formatting', () => {
    mockFormatDate.mockImplementation((date: any, options: any) => {
      if (options?.dateOnly) {
        return date === '2025-01-15T09:00:00.000Z' ? 'Wed, 15 Jan, 2025' : 'Thu, 16 Jan, 2025';
      }
      return '10:00 AM';
    });

    const multiDayEvent = {
      ...mockEvent,
      startTime: '2025-01-15T09:00:00.000Z',
      endTime: '2025-01-16T17:00:00.000Z',
    } as unknown as Event;

    render(<Communication event={multiDayEvent} totalAttendees={10} />);

    expect(screen.getByText('Wed, 15 Jan, 2025 - Thu, 16 Jan, 2025')).toBeInTheDocument();
  });

  it('renders event category badge', () => {
    const categoryEvent = {
      ...mockEvent,
      category: { name: 'Workshops' },
    } as unknown as Event;

    render(<Communication event={categoryEvent} totalAttendees={10} />);

    expect(screen.getByText('Workshops')).toBeInTheDocument();
  });

  it('displays "Single host" when no cohosts', () => {
    const eventNoCohosts = {
      ...mockEvent,
      cohosts: [],
    } as unknown as Event;

    render(<Communication event={eventNoCohosts} totalAttendees={10} />);

    expect(screen.getByText('Single host')).toBeInTheDocument();
  });

  it('displays "1 cohost" correctly (singular)', () => {
    const eventOneCohost = {
      ...mockEvent,
      cohosts: [{ id: '2' }],
    } as unknown as Event;

    render(<Communication event={eventOneCohost} totalAttendees={10} />);

    expect(screen.getByText('1 cohost')).toBeInTheDocument();
  });

  it('does not show remaining seats badge when full', () => {
    const fullEvent = {
      ...mockEvent,
      capacity: 10,
    } as unknown as Event;

    render(<Communication event={fullEvent} totalAttendees={10} />);

    expect(screen.queryByText(/seats remaining/)).not.toBeInTheDocument();
  });

  it('handles undefined capacity and cohosts gracefully', () => {
    const minimalEvent = {
      ...mockEvent,
      capacity: undefined,
      cohosts: undefined,
    } as unknown as Event;

    render(<Communication event={minimalEvent} totalAttendees={5} />);

    expect(screen.getByText('Single host')).toBeInTheDocument();
    // Capacity 0 - 5 attendees = -5 remaining. Logic check: remainingSeats > 0.
    expect(screen.queryByText(/seats remaining/)).not.toBeInTheDocument();
    expect(screen.getByText('5 attending • 0 capacity')).toBeInTheDocument();
  });

  it('handles multi-day event date formatting', () => {
    mockFormatDate.mockImplementation((date: any, options: any) => {
      if (options?.dateOnly) {
        return date === '2025-01-15T09:00:00.000Z' ? 'Wed, 15 Jan, 2025' : 'Thu, 16 Jan, 2025';
      }
      return '10:00 AM';
    });

    const multiDayEvent = {
      ...mockEvent,
      startTime: '2025-01-15T09:00:00.000Z',
      endTime: '2025-01-16T17:00:00.000Z',
    } as unknown as Event;

    render(<Communication event={multiDayEvent} totalAttendees={10} />);

    expect(screen.getByText('Wed, 15 Jan, 2025 - Thu, 16 Jan, 2025')).toBeInTheDocument();
  });

  it('displays creator username if fullname is missing', () => {
    const eventWithUsernameOnly = {
      ...mockEvent,
      creator: {
        ...mockEvent.creator,
        fullName: undefined,
        userName: 'johndoe',
      },
    } as unknown as Event;

    render(<Communication event={eventWithUsernameOnly} totalAttendees={10} />);

    expect(screen.getByTestId('chat-container')).toHaveTextContent('Hosted by johndoe');
  });

  it('handles virtual event without venueUrl', () => {
    const virtualEventNoUrl = {
      ...mockEvent,
      isPhysical: false,
      isVirtual: true,
      venueType: 'Google Meet',
      venueUrl: undefined,
    } as unknown as Event;

    render(<Communication event={virtualEventNoUrl} totalAttendees={10} />);

    const linkElement = screen.getByText('Google Meet');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe('A');
    expect(linkElement).toHaveAttribute('href', '');
  });

  it('renders "To be announced" for Later venue type', () => {
    const laterEvent = {
      ...mockEvent,
      isPhysical: false,
      isVirtual: false,
      isLater: true,
      venueType: VenueType.Later,
    } as unknown as Event;

    render(<Communication event={laterEvent} totalAttendees={10} />);

    expect(screen.getByText('To be announced')).toBeInTheDocument();
  });
});
