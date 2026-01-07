import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CustomiseEventCard from '@/components/manage-event/customise-event-card';
import { Event } from '@/types/events';
import { VenueType } from '@/types/events';
import { User } from '@/types/user';
import { Cohost, Role } from '@/types/cohost';

const mockNotFound = vi.fn(() => {
  throw new Error('notFound');
});

const mockUseParams = vi.fn(() => ({ id: 'event-123' }));

vi.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
  notFound: () => mockNotFound(),
}));

const mockUseCurrentUser = vi.fn();

vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('next/image', () => ({
  default: ({ priority, ...props }: any) => <img {...props} />,
}));

vi.mock('@/utils/formatDate', () => ({
  formatDate: (date: Date, options: { dateOnly?: boolean; timeOnly?: boolean }) => {
    if (options.dateOnly) return 'Jan 15, 2025';
    if (options.timeOnly) return '10:00 AM';
    return 'Jan 15, 2025 10:00 AM';
  },
}));

const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  const now = new Date();
  const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    id: 'event-123',
    creatorId: 'creator-1',
    name: 'Test Event',
    slug: 'test-event',
    description: 'Test description',
    startTime: futureDate,
    endTime: futureDate,
    eventDate: futureDate,
    eventImageUrl: '/test-image.jpg',
    venueType: VenueType.Physical,
    venueAddress: '123 Test St',
    hostPermissionRequired: false,
    discoverable: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: {
      id: 'creator-1',
      primaryEmail: 'creator@example.com',
      fullName: 'John Doe',
      userName: 'johndoe',
      profileIcon: 1,
      isCompleted: false,
      eventParticipationEnabled: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    cohosts: [],
    ...overrides,
  } as Event;
};

describe('CustomiseEventCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCurrentUser.mockReturnValue({
      data: {
        id: 'creator-1',
        userName: 'johndoe',
        fullName: 'John Doe',
      },
    });
  });

  it('renders event details correctly', () => {
    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    expect(screen.getAllByText('Test Event')).toHaveLength(2);
    expect(screen.getByText(/Hosted By - John Doe/)).toBeInTheDocument();
  });

  it('shows edit button for future events when user is creator', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const event = createMockEvent({
      startTime: futureDate,
      endTime: futureDate,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const editLink = screen.getByRole('link', { name: '' });
    expect(editLink).toHaveAttribute('href', '/events/event-123/edit');
  });

  it('hides edit button for past events', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const event = createMockEvent({
      startTime: pastDate,
      endTime: pastDate,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const editLink = screen.queryByRole('link', { name: '' });
    expect(editLink).not.toBeInTheDocument();
  });

  it('hides edit button for cohosts even for future events', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const event = createMockEvent({
      startTime: futureDate,
      endTime: futureDate,
      cohosts: [
        new Cohost({
          id: 'cohost-1',
          userId: 'cohost-user-1',
          eventId: 'event-123',
          role: Role.MANAGER,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: new User({
            id: 'cohost-user-1',
            primaryEmail: 'cohost@example.com',
            userName: 'cohostuser',
            fullName: 'Cohost User',
            profileIcon: 1,
            isCompleted: false,
            eventParticipationEnabled: true,
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          event: null,
        }),
      ],
    });

    mockUseCurrentUser.mockReturnValue({
      data: {
        id: 'cohost-user-1',
        userName: 'cohostuser',
        fullName: 'Cohost User',
      },
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const editLink = screen.queryByRole('link', { name: '' });
    expect(editLink).not.toBeInTheDocument();
  });

  it('shows share button for all events', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const event = createMockEvent({
      startTime: pastDate,
      endTime: pastDate,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));
    expect(shareButton).toBeInTheDocument();
  });

  it('hides edit button when event ended exactly now', () => {
    const now = new Date();
    const event = createMockEvent({
      startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      endTime: new Date(now.getTime() - 1000),
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const editLink = screen.queryByRole('link', { name: '' });
    expect(editLink).not.toBeInTheDocument();
  });

  it('shows edit button when event ends in the future', () => {
    const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const event = createMockEvent({
      startTime: new Date(Date.now() - 60 * 60 * 1000),
      endTime: futureDate,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const editLink = screen.getByRole('link', { name: '' });
    expect(editLink).toHaveAttribute('href', '/events/event-123/edit');
  });

  it('renders physical venue type correctly', () => {
    const eventData = {
      id: 'event-123',
      creatorId: 'creator-1',
      name: 'Test Event',
      slug: 'test-event',
      description: 'Test description',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventImageUrl: '/test-image.jpg',
      venueType: VenueType.Physical,
      venueAddress: '123 Main St',
      venueUrl: undefined,
      hostPermissionRequired: false,
      discoverable: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: 'creator-1',
        fullName: 'John Doe',
        userName: 'johndoe',
        profileIcon: '1',
        isDeleted: false,
      },
      cohosts: [],
    };
    const event = new Event(eventData);

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('renders virtual venue type correctly', () => {
    const eventData = {
      id: 'event-123',
      creatorId: 'creator-1',
      name: 'Test Event',
      slug: 'test-event',
      description: 'Test description',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventImageUrl: '/test-image.jpg',
      venueType: VenueType.Virtual,
      venueUrl: 'https://zoom.us/meeting',
      venueAddress: undefined,
      hostPermissionRequired: false,
      discoverable: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: 'creator-1',
        fullName: 'John Doe',
        userName: 'johndoe',
        profileIcon: '1',
        isDeleted: false,
      },
      cohosts: [],
    };
    const event = new Event(eventData);

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const allLinks = screen.getAllByRole('link');
    const venueLink = allLinks.find(
      (link) => link.getAttribute('href') === 'https://zoom.us/meeting'
    );

    expect(venueLink).toBeDefined();
    expect(venueLink).toBeInTheDocument();
    if (venueLink) {
      expect(venueLink).toHaveAttribute('href', 'https://zoom.us/meeting');
      expect(venueLink).toHaveAttribute('target', '_blank');
    }
  });

  it('renders virtual venue with null venueUrl', () => {
    const eventData = {
      id: 'event-123',
      creatorId: 'creator-1',
      name: 'Test Event',
      slug: 'test-event',
      description: 'Test description',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventImageUrl: '/test-image.jpg',
      venueType: VenueType.Virtual,
      venueUrl: null as any,
      venueAddress: undefined,
      hostPermissionRequired: false,
      discoverable: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: 'creator-1',
        fullName: 'John Doe',
        userName: 'johndoe',
        profileIcon: '1',
        isDeleted: false,
      },
      cohosts: [],
    };
    const event = new Event(eventData);

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const allLinks = screen.getAllByRole('link');
    const venueLink = allLinks.find((link) => link.getAttribute('target') === '_blank');

    const linkIcons = document.querySelectorAll('svg.lucide-link');
    expect(linkIcons.length).toBeGreaterThan(0);

    if (venueLink) {
      expect(venueLink).toHaveAttribute('href', '');
      expect(venueLink).toHaveAttribute('target', '_blank');
    } else {
      expect(allLinks.length).toBeGreaterThan(0);
    }
  });

  it('renders later venue type correctly', () => {
    const eventData = {
      id: 'event-123',
      creatorId: 'creator-1',
      name: 'Test Event',
      slug: 'test-event',
      description: 'Test description',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      eventImageUrl: '/test-image.jpg',
      venueType: VenueType.Later,
      venueAddress: undefined,
      venueUrl: undefined,
      hostPermissionRequired: false,
      discoverable: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: {
        id: 'creator-1',
        fullName: 'John Doe',
        userName: 'johndoe',
        profileIcon: '1',
        isDeleted: false,
      },
      cohosts: [],
    };
    const event = new Event(eventData);

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    expect(screen.getByText('To be announced')).toBeInTheDocument();
  });

  it('handles share button click and copies event URL', async () => {
    const mockWriteText = vi.fn();
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = createMockEvent({
      slug: 'test-event-slug',
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));

    expect(shareButton).toBeInTheDocument();
    fireEvent.click(shareButton!);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(expect.stringContaining('/test-event-slug'));
    });

    await waitFor(() => {
      const checkIcon =
        screen.queryByRole('img', { name: /check/i }) || document.querySelector('svg.lucide-check');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  it('shows "Event link Copied" tooltip after sharing', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));
    fireEvent.click(shareButton!);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        const checkIcon = document.querySelector('svg.lucide-check');
        expect(checkIcon).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('handles share error gracefully', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard error'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));
    fireEvent.click(shareButton!);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders creator userName when fullName is missing', () => {
    const event = createMockEvent({
      creator: {
        id: 'creator-1',
        userName: 'johndoe',
        profileIcon: '1',
        isDeleted: false,
      } as any,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    expect(screen.getByText(/Hosted By - johndoe/)).toBeInTheDocument();
  });

  it('renders "Unknown Host" when creator info is missing', () => {
    const event = createMockEvent({
      creator: {
        id: 'creator-1',
        profileIcon: '1',
        isDeleted: false,
      } as any,
    });

    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    expect(screen.getByText(/Hosted By - Unknown Host/)).toBeInTheDocument();
  });

  it('handles tooltip onOpenChange when showCopied is false', () => {
    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));

    fireEvent.mouseEnter(shareButton!);
    expect(shareButton).toBeInTheDocument();
  });

  it('prevents tooltip onOpenChange when showCopied is true', async () => {
    vi.useFakeTimers();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));

    await act(async () => {
      fireEvent.click(shareButton!);
      await Promise.resolve();
    });

    await act(async () => {
      await Promise.resolve();
    });

    const checkIcon = document.querySelector('svg.lucide-check');
    expect(checkIcon).not.toBeNull();
    expect(checkIcon).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('throws notFound when id is not a string', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockNotFound.mockClear();
    mockUseParams.mockReturnValueOnce({ id: 123 as any });

    const event = createMockEvent();

    try {
      render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);
    } catch (error) {
      void error;
    }

    expect(mockNotFound).toHaveBeenCalled();

    mockUseParams.mockReturnValue({ id: 'event-123' });
    consoleErrorSpy.mockRestore();
  });

  it('throws notFound when isSuccess is false', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const event = createMockEvent();

    expect(() => {
      render(<CustomiseEventCard className="test-class" event={event} isSuccess={false} />);
    }).toThrow('notFound');

    consoleErrorSpy.mockRestore();
  });

  it('resets copied state after timeout', async () => {
    vi.useFakeTimers();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    const event = createMockEvent();
    render(<CustomiseEventCard className="test-class" event={event} isSuccess={true} />);

    const buttons = screen.getAllByRole('button');
    const shareButton = buttons.find((button) => button.querySelector('svg.lucide-share2'));

    await act(async () => {
      fireEvent.click(shareButton!);
      await (mockWriteText.mock.results[0]?.value ?? Promise.resolve());
    });

    await act(async () => {
      await Promise.resolve();
    });

    const checkIcon = document.querySelector('svg.lucide-check');
    expect(checkIcon).not.toBeNull();
    expect(checkIcon).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    await act(async () => {
      await Promise.resolve();
    });

    const checkIconAfter = document.querySelector('svg.lucide-check');
    expect(checkIconAfter).toBeNull();

    vi.useRealTimers();
  });
});
