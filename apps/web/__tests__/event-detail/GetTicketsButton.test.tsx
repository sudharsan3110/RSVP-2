import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GetTicketsButton from '@/components/event-detail/GetTicketsButton';
import { useCurrentUser } from '@/lib/react-query/auth';
import {
  useCreateAttendee,
  useGetAttendeeTicketDetails,
  useSoftDeleteAttendee,
} from '@/lib/react-query/event';
import { renderWithQueryClient } from '@/__tests__/utils/tanstack-query';
import { TEST_EVENT } from '@/utils/test-constants';
vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: vi.fn(),
  useSignInMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/lib/react-query/event', () => ({
  useCreateAttendee: vi.fn(),
  useGetAttendeeTicketDetails: vi.fn(),
  useSoftDeleteAttendee: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

describe('GetTicketsButton', () => {
  const eventId = TEST_EVENT.id;
  const creatorId = TEST_EVENT.creatorId;

  beforeEach(() => {
    vi.resetAllMocks();

    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: null,
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });

    (useCreateAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });

    (useSoftDeleteAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
      reset: vi.fn(),
    });
  });

  it('should show loading state when data is loading', () => {
    (useCurrentUser as any).mockReturnValue({
      isLoading: true,
      data: null,
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: true,
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });

  it('should render SigninDialog when user is not logged in', async () => {
    const user = userEvent.setup();

    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: null,
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    const triggerButton = screen.getByRole('button', { name: 'Get Tickets' });
    expect(triggerButton).toBeInTheDocument();

    await user.click(triggerButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
  });

  it('should show "Waiting for Approval" when permission is required', () => {
    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={true} creatorId={creatorId} />
    );

    expect(screen.getByText('Waiting for Approval')).toBeInTheDocument();
  });

  it('should show "Get Tickets" button when user is logged in and no permission required', async () => {
    const user = userEvent.setup();

    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    const button = screen.getByRole('button', { name: 'Get Tickets' });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();

    await user.click(button);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign In to Your Account')).not.toBeInTheDocument();
  });

  it('should call mutate when "Get Tickets" button is clicked', async () => {
    const mockMutate = vi.fn();

    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: false,
    });

    (useCreateAttendee as any).mockReturnValue({
      mutate: mockMutate,
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    const button = screen.getByText('Get Tickets');
    await userEvent.click(button);

    expect(mockMutate).toHaveBeenCalledWith(eventId);
  });

  it('should show ticket details when registration is successful', () => {
    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });

    (useCreateAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    expect(screen.getByText('Show Tickets')).toBeInTheDocument();
    expect(screen.getByText('Cancel Registration')).toBeInTheDocument();
  });

  it('should call cancelRegistration when "Cancel Registration" is clicked', async () => {
    const mockCancelRegistration = vi.fn();

    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });

    (useCreateAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });

    (useSoftDeleteAttendee as any).mockReturnValue({
      mutate: mockCancelRegistration,
      isSuccess: false,
      reset: vi.fn(),
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    const cancelButton = screen.getByText('Cancel Registration');
    await userEvent.click(cancelButton);

    expect(mockCancelRegistration).toHaveBeenCalledWith(eventId);
  });

  it('should show "Get Tickets" button after successful cancellation', () => {
    (useCurrentUser as any).mockReturnValue({
      isLoading: false,
      data: { data: { data: { id: 'user-123' } } },
    });

    (useGetAttendeeTicketDetails as any).mockReturnValue({
      isLoading: false,
      isSuccess: true,
    });

    (useCreateAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: false,
    });

    (useSoftDeleteAttendee as any).mockReturnValue({
      mutate: vi.fn(),
      isSuccess: true,
      reset: vi.fn(),
    });

    renderWithQueryClient(
      <GetTicketsButton eventId={eventId} isPermissionRequired={false} creatorId={creatorId} />
    );

    expect(screen.getByText('Get Tickets')).toBeInTheDocument();
  });
});
