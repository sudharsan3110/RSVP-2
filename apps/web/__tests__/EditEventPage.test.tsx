import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import EditEventPage from '@/app/(authenticated)/events/[id]/edit/page';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useGetEventById } from '@/lib/react-query/event';

const mockBack = vi.fn();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: vi.fn(),
}));

vi.mock('@/lib/react-query/event', () => ({
  useGetEventById: vi.fn(),
}));

vi.mock('@/components/common/Container', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/create-event/EditEventForm', () => ({
  default: () => <div>EditEventFormMock</div>,
}));

vi.mock('@/components/common/NoResults', () => ({
  default: ({ title, message }: any) => (
    <div>
      <h1>{title}</h1>
      <p>{message}</p>
    </div>
  ),
}));

describe('EditEventPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    window.history.pushState({}, '', '/prev');
  });

  it('redirects back for past events (creator)', async () => {
    (useCurrentUser as any).mockReturnValue({ data: { id: 'user-1' } });
    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          endTime: new Date(Date.now() - 60_000),
          checkCreator: () => true,
        },
      },
    });

    render(<EditEventPage params={{ id: 'event-1' }} />);

    await waitFor(() => {
      expect(mockBack).toHaveBeenCalledTimes(1);
    });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows Page not found for non-creator (no redirect)', () => {
    (useCurrentUser as any).mockReturnValue({ data: { id: 'user-1' } });
    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          endTime: new Date(Date.now() + 60_000),
          checkCreator: () => false,
        },
      },
    });

    render(<EditEventPage params={{ id: 'event-1' }} />);

    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.queryByText('EditEventFormMock')).not.toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('renders edit page + form for future events when creator', () => {
    (useCurrentUser as any).mockReturnValue({ data: { id: 'user-1' } });
    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          endTime: new Date(Date.now() + 60_000),
          checkCreator: () => true,
        },
      },
    });

    render(<EditEventPage params={{ id: 'event-1' }} />);

    expect(screen.getByText('Edit Event')).toBeInTheDocument();
    expect(screen.getByText('EditEventFormMock')).toBeInTheDocument();
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
