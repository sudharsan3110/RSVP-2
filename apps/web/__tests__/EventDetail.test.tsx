import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EventDetail from '@/components/event-detail/EventDetail';
import type { Event as EventType } from '@/types/events';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/dynamic', () => ({
  default: (importer: any) => {
    const DynamicComponent = () => <div data-testid="get-tickets-button">Get Tickets Button</div>;

    return DynamicComponent;
  },
}));

vi.mock('@/utils/formatDate', () => ({
  formatDate: vi.fn(() => 'Jan 01, 2025'),
}));

vi.mock('@/utils/event', () => ({
  venueDisplay: () => 'Bangalore, India',
  getProfilePictureUrl: () => '/avatar.png',
}));

vi.mock('@/components/event/AvatarGroup', () => ({
  default: ({ additionalCount }: any) => <div data-testid="avatar-group">+{additionalCount}</div>,
}));

vi.mock('@/components/event-detail/AvatarGroup', () => ({
  default: ({ additionalCount, limit }: any) => (
    <div data-testid="avatar-group">
      AvatarGroup (limit={limit}, extra={additionalCount})
    </div>
  ),
}));

vi.mock('@/types/events', async () => {
  const actual = await vi.importActual<any>('@/types/events');

  return {
    ...actual,
    Event: class {
      constructor(event: any) {
        Object.assign(this, event);
      }
    },
  };
});

const createMockEvent = (overrides: Partial<any> = {}): EventType =>
  ({
    id: 'event-1',
    name: 'Tech Summit',
    slug: 'tech-summit',
    startTime: '2025-01-01T10:00:00Z',
    endTime: '2025-01-01T12:00:00Z',
    eventDate: '2025-01-01',
    eventImageUrl: '/event.jpg',
    isPhysical: true,
    isVirtual: false,
    isLater: false,
    city: 'Bangalore',
    country: 'India',
    venueName: 'Indiranagar Hall',
    venueAddress: '123 MG Road',
    discoverable: true,
    description: '<p>Event description</p>',
    category: { name: 'Technology' },
    venueUrl: 'https://meet.link',
    capacity: 100,
    creatorId: 'user-1',
    cohosts: [],
    creator: {
      userName: 'john',
      fullName: 'John Doe',
      profileIcon: 1,
      isDeleted: false,
    },
    isActive: true,
    hostPermissionRequired: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ACTIVE',
    checkInRequired: false,
    isPublic: true,
    ...overrides,
  }) as unknown as EventType;

const futureEvent = createMockEvent({
  endTime: '2099-12-31T10:00:00Z',
  capacity: 5,
});

describe('EventDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders event name and category', () => {
    const event = createMockEvent();

    render(<EventDetail eventData={{ event, totalAttendees: 3 }} />);

    expect(screen.getByText('Tech Summit')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
  });

  it('renders date and time', () => {
    const event = createMockEvent();

    render(<EventDetail eventData={{ event, totalAttendees: 3 }} />);

    expect(screen.getAllByText('Jan 01, 2025').length).toBeGreaterThan(0);
  });

  it('renders physical location info', () => {
    const event = createMockEvent({
      isPhysical: true,
      isVirtual: false,
      isLater: false,
      endTime: '2099-01-01T10:00:00Z',
      venueName: 'Tech Park',
      city: 'Bangalore',
      country: 'India',
    });

    render(<EventDetail eventData={{ event, totalAttendees: 3 }} />);
    expect(screen.getByText('Bangalore, India')).toBeInTheDocument();
  });

  it('renders About Event section when description exists', () => {
    const event = createMockEvent();

    render(<EventDetail eventData={{ event, totalAttendees: 3 }} />);

    expect(screen.getByText('About Event')).toBeInTheDocument();
  });

  it('shows Registration section for active events', () => {
    const futureEvent = createMockEvent({
      endTime: '2099-12-31T10:00:00Z',
      capacity: 100,
    });

    render(
      <EventDetail
        eventData={{
          event: futureEvent,
          totalAttendees: 10,
        }}
      />
    );

    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('90 Seats are Remaining.')).toBeInTheDocument();
  });

  it('shows "No Seats Remaining" when capacity is full', () => {
    const futureEvent = createMockEvent({
      endTime: '2099-12-31T10:00:00Z',
      capacity: 5,
    });

    render(
      <EventDetail
        eventData={{
          event: futureEvent,
          totalAttendees: 5,
        }}
      />
    );

    expect(screen.getByText('No Seats Remaining.')).toBeInTheDocument();
  });

  it('shows "Registration closed" for past events', () => {
    const event = createMockEvent({
      endTime: '2020-01-01T12:00:00Z',
    });

    render(<EventDetail eventData={{ event, totalAttendees: 10 }} />);

    expect(screen.getByText('Registration closed')).toBeInTheDocument();
  });

  it('shows cancelled message when event is inactive', () => {
    const event = createMockEvent({ isActive: false });

    render(<EventDetail eventData={{ event, totalAttendees: 5 }} />);

    expect(screen.getByText('Event has been cancelled')).toBeInTheDocument();
  });

  it('renders AvatarGroup and attendee count when attendees exist and event is not past', () => {
    const event = createMockEvent({
      endTime: '2099-12-31T10:00:00Z',
    });

    render(<EventDetail eventData={{ event, totalAttendees: 6 }} />);

    expect(screen.getByTestId('avatar-group')).toBeInTheDocument();
    expect(screen.getByText('6 going')).toBeInTheDocument();
  });

  it('does not render AvatarGroup for past events', () => {
    const event = createMockEvent({
      endTime: '2020-01-01T10:00:00Z',
    });

    render(<EventDetail eventData={{ event, totalAttendees: 6 }} />);

    expect(screen.queryByTestId('avatar-group')).not.toBeInTheDocument();
    expect(screen.queryByText('6 going')).not.toBeInTheDocument();
  });

  it('renders GetTicketsButton for active events', () => {
    const event = createMockEvent();

    render(<EventDetail eventData={{ event, totalAttendees: 2 }} />);

    expect(screen.getByTestId('get-tickets-button')).toBeInTheDocument();
  });
});
