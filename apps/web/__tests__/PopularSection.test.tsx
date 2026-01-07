import SigninDialog from '@/components/auth/SigninDialog';
import EventCard from '@/components/common/EventCard';
import PopularSection from '@/components/home/PopularSection';
import { usePopularEvents } from '@/lib/react-query/event';
import { Event } from '@/types/events';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const BASE_EVENT_PROPS = {
  creatorId: 'mock-creator-id',
  description: 'Mock description',
  eventDate: new Date('2025-12-15T10:00:00.000Z'),
  startTime: new Date('2025-12-15T10:00:00.000Z'),
  endTime: new Date('2025-12-15T11:00:00.000Z'),
  eventImageUrl: 'https://placehold.co/400x200/52525B/white?text=Mock+Image',
  category: { id: 'tech-id', name: 'Technology' },
  venueType: 'PHYSICAL',
  capacity: 100,
};

const MOCK_EVENT_1 = {
  ...BASE_EVENT_PROPS,
  id: 'e1-physical',
  name: 'First Mock Event',
  slug: 'first-mock-slug',
  venueAddress: '123 Test St',
} as unknown as Event;

const MOCK_EVENT_2 = {
  ...BASE_EVENT_PROPS,
  id: 'e2-virtual',
  name: 'Second Mock Event',
  slug: 'second-mock-slug',
  venueType: 'VIRTUAL',
  venueUrl: 'https://mock.com/link',
} as unknown as Event;

const MOCK_EVENTS_ARRAY = [MOCK_EVENT_1, MOCK_EVENT_2];

vi.mock('@/lib/react-query/event', () => ({
  usePopularEvents: vi.fn(),
}));

vi.mock('@/components/auth/SigninDialog', () => ({
  default: vi.fn(({ children }) => <div data-testid="mock-signin-dialog">{children}</div>),
}));

vi.mock('@/components/common/Container', () => ({
  default: vi.fn(({ children }) => <div data-testid="mock-container">{children}</div>),
}));

vi.mock('@/components/common/EventCard', () => ({
  default: vi.fn((props) => <div data-testid={`mock-event-card-${props.event.id}`} />),
}));

vi.mock('next/link', () => ({
  default: vi.fn(({ children, href }) => <a href={href}>{children}</a>),
}));

describe('PopularSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing when data is loading', () => {
    vi.mocked(usePopularEvents).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      isError: false,
    } as any);

    const { container } = render(<PopularSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing when the events array is empty', () => {
    vi.mocked(usePopularEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { container } = render(<PopularSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render header, links, and all event cards when data is available', () => {
    vi.mocked(usePopularEvents).mockReturnValue({
      data: MOCK_EVENTS_ARRAY,
      isLoading: false,
    } as any);

    render(<PopularSection />);

    expect(screen.getByText('Popular Events')).toBeInTheDocument();

    const links = screen.getAllByRole('link', { name: /See all events/i });
    const desktopLink = links.find((link) => link.getAttribute('href') === '/discover');
    expect(desktopLink).toBeInTheDocument();

    expect(screen.getAllByTestId(/mock-event-card-/)).toHaveLength(MOCK_EVENTS_ARRAY.length);

    expect(EventCard).toHaveBeenCalledWith(
      expect.objectContaining({
        event: MOCK_EVENT_2,
        type: 'guest',
      }),
      {}
    );
  });

  it('should wrap the mobile "See all events" link within the SigninDialog component', () => {
    vi.mocked(usePopularEvents).mockReturnValue({
      data: MOCK_EVENTS_ARRAY,
      isLoading: false,
    } as any);

    render(<PopularSection />);

    const dialog = screen.getByTestId('mock-signin-dialog');
    expect(dialog).toBeInTheDocument();

    const mobileLink = screen
      .getAllByRole('link', { name: /See all events/i })
      .find((link) => dialog.contains(link));
    expect(mobileLink).toBeInTheDocument();

    expect(SigninDialog).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'signup',
      }),
      {}
    );
  });
});
