import AddCoHost from '@/components/manage-event/add-host';
import { useGetAttendeeByEventId } from '@/lib/react-query/event';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'event-123' }),
}));

vi.mock('@/hooks/useDebounce', () => ({
  default: (value: string) => value,
}));

vi.mock('@/lib/react-query/event', () => ({
  useGetAttendeeByEventId: vi.fn(() => ({ data: { attendees: [] } })),
  useAddEventCohost: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/common/NoResults.tsx', () => ({
  default: ({ title }: { title: string }) => <div data-testid="no-results">{title}</div>,
}));

vi.mock('@/components/manage-event/confirm-host.tsx', () => ({
  default: ({ isConfirmationDialogOpen, selectedCoHost, setIsConfirmationDialogOpen }: any) => {
    if (!isConfirmationDialogOpen) return null;
    return (
      <div data-testid="confirm-cohost-mock">
        <p>Confirm Dialog Open</p>
        <p>Selected: {selectedCoHost}</p>
        <button onClick={() => setIsConfirmationDialogOpen(false)}>Close Confirm</button>
      </div>
    );
  },
}));

const mockAttendees = [
  {
    id: '1',
    user: {
      id: 'u1',
      fullName: 'John Doe',
      primaryEmail: 'john@example.com',
      profileIconUrl: 'http://img.com/1',
      initials: 'JD',
    },
  },
  {
    id: '2',
    user: {
      id: 'u2',
      fullName: 'Jane Smith',
      primaryEmail: 'jane@example.com',
      profileIconUrl: 'http://img.com/2',
      initials: 'JS',
    },
  },
];

describe('AddCoHost Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('verifies the Co-host selection dialog is initially closed', () => {
    render(<AddCoHost />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search email.')).not.toBeInTheDocument();
  });

  it('renders the "Add host" trigger button initially', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: [] } });
    render(<AddCoHost />);
    expect(screen.getByRole('button', { name: /add host/i })).toBeInTheDocument();
  });

  it('opens the dialog and displays Title and Description', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    expect(screen.getByRole('heading', { name: 'Add Co-host' })).toBeInTheDocument();
    expect(screen.getByText('Search your host with email or name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search email.')).toBeInTheDocument();
  });

  it('renders a list of attendees with correct count, avatar initials, and emails', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();

    const addButtons = screen.getAllByRole('button', { name: /add host/i });
    expect(addButtons).toHaveLength(2);
  });

  it('filters attendees based on search query', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const searchInput = screen.getByPlaceholderText('Search email.');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('shows NoResults component when search yields no matches', async () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const searchInput = screen.getByPlaceholderText('Search email.');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByTestId('no-results')).toHaveTextContent('No User found');
    });
  });

  it('does NOT show "Invite... as Co-host" button when search query is invalid email text', async () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const searchInput = screen.getByPlaceholderText('Search email.');
    fireEvent.change(searchInput, { target: { value: 'hello' } });

    await waitFor(() => {
      expect(screen.getByTestId('no-results')).toBeInTheDocument();
      const inviteBtn = screen.queryByRole('button', { name: /invite/i });
      expect(inviteBtn).not.toBeInTheDocument();
    });
  });

  it('shows "Invite... as Co-host" button when valid email is entered but not found in list', async () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const newEmail = 'newuser@test.com';
    const searchInput = screen.getByPlaceholderText('Search email.');
    fireEvent.change(searchInput, { target: { value: newEmail } });

    await waitFor(() => {
      expect(screen.getByTestId('no-results')).toHaveTextContent('No User found');

      const inviteBtn = screen.getByRole('button', {
        name: (content) => {
          return (
            content.includes('Invite') &&
            content.includes('newuser@te') &&
            content.includes('as Co-host')
          );
        },
      });
      expect(inviteBtn).toBeInTheDocument();
    });
  });

  it('opens ConfirmCoHost dialog and closes Selection UI when an EXISTING user is selected', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const johnRow = screen.getByText('John Doe').closest('.bg-dark-600');
    const addHostBtn = within(johnRow as HTMLElement).getByRole('button', { name: /add host/i });

    fireEvent.click(addHostBtn);

    expect(screen.getByTestId('confirm-cohost-mock')).toBeInTheDocument();
    expect(screen.getByText('Selected: john@example.com')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search email.')).not.toBeInTheDocument();
  });

  it('opens ConfirmCoHost dialog when inviting a NEW email', async () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    const email = 'guest@test.com';
    const searchInput = screen.getByPlaceholderText('Search email.');

    fireEvent.change(searchInput, { target: { value: email } });

    await waitFor(() => {
      const inviteBtn = screen.getByRole('button', {
        name: (content) => content.includes('Invite') && content.includes('guest@test'),
      });
      fireEvent.click(inviteBtn);
    });

    const dialog = await screen.findByTestId('confirm-cohost-mock');

    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(`Selected: ${email}`)).toBeInTheDocument();
  });

  it('clears search query when selection dialog is closed', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: mockAttendees } });
    render(<AddCoHost />);

    const triggerBtn = screen.getByRole('button', { name: /add host/i });

    fireEvent.click(triggerBtn);
    const searchInput = screen.getByPlaceholderText('Search email.');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });

    fireEvent.click(triggerBtn);
    const reopenedInput = screen.getByPlaceholderText('Search email.');
    expect(reopenedInput).toHaveValue('');
  });

  it('uses fallback empty array when attendees data is undefined', () => {
    (useGetAttendeeByEventId as any).mockReturnValue({ data: { attendees: undefined } });
    render(<AddCoHost />);

    fireEvent.click(screen.getByRole('button', { name: /add host/i }));

    expect(screen.getByTestId('no-results')).toBeInTheDocument();
    expect(screen.getByText('No User found')).toBeInTheDocument();
  });
});
