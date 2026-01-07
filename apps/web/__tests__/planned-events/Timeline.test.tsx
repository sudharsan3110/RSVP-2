import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Timeline from '@/components/planned-events/Timeline';
import { Event } from '@/types/events';

// Mock formatDate
const mockFormatDate = vi.fn((date: Date | string, options?: { withTime?: boolean }) => {
  if (options?.withTime) {
    return '5:00 PM, Wed, 29 Oct, 2025';
  }
  return '29 Oct, 2025';
});

// Mock getDateGroups - we'll use the real implementation but can override if needed
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual,
    getDateGroups: vi.fn((events: Event[]) => {
      // Group events by date
      const dateGroups: { date: Date; events: Event[] }[] = [];
      events.forEach((event) => {
        const existingGroup = dateGroups.find(
          (group) => group.date.toDateString() === event.eventDate.toDateString()
        );
        if (existingGroup) {
          existingGroup.events.push(event);
        } else {
          dateGroups.push({ date: event.eventDate, events: [event] });
        }
      });
      return dateGroups;
    }),
  };
});

// Mock formatDate
vi.mock('@/utils/formatDate', () => ({
  formatDate: (...args: Parameters<typeof mockFormatDate>) => mockFormatDate(...args),
}));

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) => (
    <img src={src} alt={alt} data-priority={priority ? 'true' : 'false'} />
  ),
}));

// Mock Icons
vi.mock('@/components/common/Icon', () => ({
  Icons: {
    tick: () => <svg data-testid="tick-icon" />,
    ticket: () => <svg data-testid="ticket-icon" />,
  },
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// Helper function to create mock events
const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  const baseDate = new Date('2025-10-29T17:00:00.000Z');
  return {
    id: 'event-1',
    creatorId: 'creator-1',
    name: 'Test Event',
    slug: 'test-event',
    category: { id: 'cat-1', name: 'Technology' },
    startTime: baseDate,
    endTime: new Date('2025-10-29T18:00:00.000Z'),
    eventDate: baseDate,
    description: 'Test description',
    eventImageUrl: 'https://example.com/image.jpg',
    venueType: 'PHYSICAL',
    venueAddress: '123 Test Street',
    hostPermissionRequired: false,
    discoverable: true,
    capacity: 100,
    isActive: true,
    isCancelled: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    totalAttendees: 50,
    ...overrides,
  } as Event;
};

describe('Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormatDate.mockClear();
  });

  describe('Empty state', () => {
    it('should render "No Events Found" message when events is undefined', () => {
      render(<Timeline events={undefined} />);

      expect(screen.getByText('No Events Found')).toBeInTheDocument();
      expect(
        screen.getByText(
          /It seems like there are no events matching your search criteria at the moment/
        )
      ).toBeInTheDocument();
    });

    it('should render "No Events Found" message when events is an empty array', () => {
      render(<Timeline events={[]} />);

      expect(screen.getByText('No Events Found')).toBeInTheDocument();
    });
  });

  describe('Timeline rendering', () => {
    it('should render timeline with a single event', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('123 Test Street')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('should render multiple events on the same date', () => {
      const event1 = createMockEvent({ id: 'event-1', name: 'Event 1', slug: 'event-1' });
      const event2 = createMockEvent({ id: 'event-2', name: 'Event 2', slug: 'event-2' });

      render(<Timeline events={[event1, event2]} />);

      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    it('should render events on different dates', () => {
      const event1 = createMockEvent({
        id: 'event-1',
        name: 'Event 1',
        eventDate: new Date('2025-10-29T17:00:00.000Z'),
      });
      const event2 = createMockEvent({
        id: 'event-2',
        name: 'Event 2',
        eventDate: new Date('2025-10-30T17:00:00.000Z'),
      });

      render(<Timeline events={[event1, event2]} />);

      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    it('should call formatDate for date group dates', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(mockFormatDate).toHaveBeenCalledWith(event.eventDate);
    });

    it('should call formatDate with withTime option for event startTime', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(mockFormatDate).toHaveBeenCalledWith(event.startTime, { withTime: true });
    });
  });

  describe('Event card details', () => {
    it('should render event name', () => {
      const event = createMockEvent({ name: 'My Special Event' });
      render(<Timeline events={[event]} />);

      expect(screen.getByText('My Special Event')).toBeInTheDocument();
    });

    it('should render category name in badge', () => {
      const event = createMockEvent({ category: { id: 'cat-1', name: 'Music' } });
      render(<Timeline events={[event]} />);

      expect(screen.getByText('Music')).toBeInTheDocument();
    });

    it('should render venue address', () => {
      const event = createMockEvent({ venueAddress: '456 Main St' });
      render(<Timeline events={[event]} />);

      expect(screen.getByText('456 Main St')).toBeInTheDocument();
    });

    it('should render total attendees', () => {
      const event = createMockEvent({ totalAttendees: 75 });
      render(<Timeline events={[event]} />);

      expect(screen.getByText('75')).toBeInTheDocument();
    });

    it('should render "Free" text', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('should render event image with correct src and alt', () => {
      const event = createMockEvent({
        eventImageUrl: 'https://example.com/custom-image.jpg',
        name: 'Custom Event',
      });
      render(<Timeline events={[event]} />);

      const image = screen.getByAltText('Custom Event');
      expect(image).toHaveAttribute('src', 'https://example.com/custom-image.jpg');
    });
  });

  describe('Links', () => {
    it('should render link with correct href for event slug', () => {
      const event = createMockEvent({ slug: 'my-event-slug' });
      render(<Timeline events={[event]} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/my-event-slug');
    });

    it('should render multiple links for multiple events', () => {
      const event1 = createMockEvent({ id: 'event-1', slug: 'event-1' });
      const event2 = createMockEvent({ id: 'event-2', slug: 'event-2' });

      render(<Timeline events={[event1, event2]} />);

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      expect(links[0]).toHaveAttribute('href', '/event-1');
      expect(links[1]).toHaveAttribute('href', '/event-2');
    });
  });

  describe('Icons', () => {
    it('should render tick icon', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(screen.getByTestId('tick-icon')).toBeInTheDocument();
    });

    it('should render ticket icon', () => {
      const event = createMockEvent();
      render(<Timeline events={[event]} />);

      expect(screen.getByTestId('ticket-icon')).toBeInTheDocument();
    });
  });

  describe('Image priority', () => {
    it('should set priority to true for first 3 images', () => {
      const events = [
        createMockEvent({ id: 'event-1', slug: 'event-1' }),
        createMockEvent({ id: 'event-2', slug: 'event-2' }),
        createMockEvent({ id: 'event-3', slug: 'event-3' }),
        createMockEvent({ id: 'event-4', slug: 'event-4' }),
      ];

      render(<Timeline events={events} />);

      const images = screen.getAllByRole('img');
      expect(images[0]).toHaveAttribute('data-priority', 'true');
      expect(images[1]).toHaveAttribute('data-priority', 'true');
      expect(images[2]).toHaveAttribute('data-priority', 'true');
      expect(images[3]).toHaveAttribute('data-priority', 'false');
    });
  });

  describe('Timeline structure', () => {
    it('should render timeline rod', () => {
      const event = createMockEvent();
      const { container } = render(<Timeline events={[event]} />);

      const timelineRod = container.querySelector('.bg-gray-700');
      expect(timelineRod).toBeInTheDocument();
    });

    it('should render event bullet', () => {
      const event = createMockEvent();
      const { container } = render(<Timeline events={[event]} />);

      const bullet = container.querySelector('.bg-purple-500');
      expect(bullet).toBeInTheDocument();
    });
  });
});
