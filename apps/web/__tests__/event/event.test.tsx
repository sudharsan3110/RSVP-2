import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Events from '../../app/(authenticated)/events/page.tsx';
import { useGetEvent } from '@/lib/react-query/event';

// Mock the required hooks and modules
vi.mock('@/lib/react-query/event', () => ({
  useGetEvent: vi.fn(),
}));

vi.mock('nuqs', () => ({
  useQueryStates: () => [{ page: 1, status: '', sort: '', search: '' }, vi.fn()],
  parseAsInteger: {
    withDefault: vi.fn(),
  },
  parseAsString: {
    withDefault: vi.fn(),
  },
}));

describe('Events Component', () => {
  const mockEvents = [
    {
      id: '1',
      title: 'Test Event 1',
      status: 'active',
      // Add other required event properties
    },
    {
      id: '2',
      title: 'Test Event 2',
      status: 'active',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    (useGetEvent as any).mockReturnValue({
      isLoading: true,
      error: null,
      data: null,
    });

    render(<Events />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('should render events when data is loaded', () => {
    (useGetEvent as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockEvents,
    });

    render(<Events />);
    expect(screen.getByText(/Manage Your/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Comic')).toBeInTheDocument();
    expect(screen.getByTestId('events-list')).toBeInTheDocument();
  });

  it('should handle search input', async () => {
    (useGetEvent as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: mockEvents,
    });

    render(<Events />);
    const searchInput = screen.getByPlaceholderText('Comic');

    fireEvent.change(searchInput, { target: { value: 'test search' } });

    // Wait for debounce
    await waitFor(
      () => {
        expect(searchInput).toHaveValue('test search');
      },
      { timeout: 600 }
    );
  });

  it('should display error message when API call fails', () => {
    const errorMessage = 'Failed to fetch events';
    (useGetEvent as any).mockReturnValue({
      isLoading: false,
      error: { message: errorMessage },
      data: null,
    });

    render(<Events />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should render no results when events array is empty', () => {
    (useGetEvent as any).mockReturnValue({
      isLoading: false,
      error: null,
      data: [],
    });

    render(<Events />);
    expect(screen.getByTestId('no-events')).toBeInTheDocument();
  });
});
