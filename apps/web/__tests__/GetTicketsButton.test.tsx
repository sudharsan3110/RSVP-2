import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GetTicketsButton from '@/components/event-detail/GetTicketsButton';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('next/dynamic', () => ({
  default: () => {
    const Component = () => <div data-testid="calendar-dropdown">Calendar</div>;
    return Component;
  },
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/auth/SigninDialog', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

const mockUseCurrentUser = vi.fn();
const mockUseCreateAttendee = vi.fn();
const mockUseGetAttendeeTicketDetails = vi.fn();
const mockUseSoftDeleteAttendee = vi.fn();

vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('@/lib/react-query/event', () => ({
  useCreateAttendee: () => mockUseCreateAttendee(),
  useGetAttendeeTicketDetails: () => mockUseGetAttendeeTicketDetails(),
  useSoftDeleteAttendee: () => mockUseSoftDeleteAttendee(),
}));

const mockIsCurrentUserCohost = vi.fn();
const mockCheckIfUserIsNotCohost = vi.fn();

vi.mock('@/utils/event', () => ({
  isCurrentUserCohost: (...args: any[]) => mockIsCurrentUserCohost(...args),
  checkIfUserIsNotCohost: (...args: any[]) => mockCheckIfUserIsNotCohost(...args),
}));

const mockUser = {
  id: 'user-1',
  primaryEmail: 'user@test.com',
  isCompleted: true,
  profileIcon: 1,
  eventParticipationEnabled: true,
  role: 'USER',
} as any;

const defaultProps = {
  eventId: 'event-1',
  eventSlug: '/events/event-1',
  creatorId: 'creator-1',
  remainingSeats: 10,
  isPermissionRequired: false,
  isPastEvent: false,
  cohosts: [],
};

describe('GetTicketsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseCurrentUser.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    mockUseCreateAttendee.mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
      isPending: false,
      reset: vi.fn(),
    });

    mockUseGetAttendeeTicketDetails.mockReturnValue({
      isSuccess: false,
      isLoading: false,
      data: null,
    });

    mockUseSoftDeleteAttendee.mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
      isPending: false,
      reset: vi.fn(),
    });

    mockIsCurrentUserCohost.mockReturnValue(false);
    mockCheckIfUserIsNotCohost.mockReturnValue(true);
  });

  it('renders "No Tickets Remaining" when seats are full', () => {
    render(<GetTicketsButton {...defaultProps} remainingSeats={0} />);
    expect(screen.getByText('No Tickets Remaining')).toBeInTheDocument();
  });

  it('shows loading state while user data is loading', () => {
    mockUseCurrentUser.mockReturnValue({ data: null, isLoading: true });
    render(<GetTicketsButton {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows Get Tickets button for logged-in user', () => {
    render(<GetTicketsButton {...defaultProps} />);
    expect(screen.getByText('Get Tickets')).toBeInTheDocument();
  });

  it('calls create attendee when Get Tickets is clicked', () => {
    const mutateSpy = vi.fn();
    mockUseCreateAttendee.mockReturnValue({
      mutate: mutateSpy,
      isSuccess: false,
      isPending: false,
      reset: vi.fn(),
    });

    render(<GetTicketsButton {...defaultProps} />);
    fireEvent.click(screen.getByText('Get Tickets'));

    expect(mutateSpy).toHaveBeenCalledWith({
      eventId: 'event-1',
      requiresApproval: false,
    });
  });

  it('shows Manage Events for creator', () => {
    render(<GetTicketsButton {...defaultProps} creatorId="user-1" />);
    expect(screen.getByText('Manage Events')).toBeInTheDocument();
  });

  it('shows approved attendee actions when allowed', () => {
    mockUseGetAttendeeTicketDetails.mockReturnValue({
      isSuccess: true,
      isLoading: false,
      data: { allowedStatus: true },
    });

    render(<GetTicketsButton {...defaultProps} />);

    expect(screen.getByText('Updates')).toBeInTheDocument();
    expect(screen.getByText('Show Ticket')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-dropdown')).toBeInTheDocument();
  });

  it('shows waiting for approval when not allowed', () => {
    mockUseGetAttendeeTicketDetails.mockReturnValue({
      isSuccess: true,
      isLoading: false,
      data: { allowedStatus: false },
    });

    render(<GetTicketsButton {...defaultProps} />);
    expect(screen.getByText('Waiting for Approval')).toBeInTheDocument();
  });

  it('shows past event message when event has ended', () => {
    render(<GetTicketsButton {...defaultProps} isPastEvent />);
    expect(screen.getByText('Event has passed')).toBeInTheDocument();
  });

  it('shows only past event message for approved attendee when event is past', () => {
    mockUseGetAttendeeTicketDetails.mockReturnValue({
      isSuccess: true,
      isLoading: false,
      data: { allowedStatus: true },
    });

    render(<GetTicketsButton {...defaultProps} isPastEvent />);

    expect(screen.getByText('Event has passed')).toBeInTheDocument();
    expect(screen.queryByText('Updates')).not.toBeInTheDocument();
    expect(screen.queryByText('Show Ticket')).not.toBeInTheDocument();
    expect(screen.queryByTestId('calendar-dropdown')).not.toBeInTheDocument();
  });

  it('shows waiting for approval for past event when attendee is not approved', () => {
    mockUseGetAttendeeTicketDetails.mockReturnValue({
      isSuccess: true,
      isLoading: false,
      data: { allowedStatus: false },
    });

    render(<GetTicketsButton {...defaultProps} isPastEvent />);

    expect(screen.getByText('Waiting for Approval')).toBeInTheDocument();
    expect(screen.queryByText('Event has passed')).not.toBeInTheDocument();
  });
});
