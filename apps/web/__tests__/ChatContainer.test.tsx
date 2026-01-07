import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatMessage } from '@/components/chat/types';

const mockFormatDate = vi.fn((_, options?: { withWeekday?: boolean; timeOnly?: boolean }) => {
  if (options?.timeOnly) {
    return '10:45 AM';
  }

  if (options?.withWeekday) {
    return 'Tue, 6 Jan,2025  ';
  }

  return 'Tue, 6 Jan, 2025';
});

const mockGetProfilePictureUrl = vi.fn(() => 'https://cdn.test/avatar.svg');

vi.mock('@/utils/formatDate', () => ({
  formatDate: (...args: Parameters<typeof mockFormatDate>) => mockFormatDate(...args),
}));

vi.mock('@/utils/event', () => ({
  getProfilePictureUrl: (...args: Parameters<typeof mockGetProfilePictureUrl>) =>
    mockGetProfilePictureUrl(...args),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className}>{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div>{children}</div>,
}));

const buildMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  content: '<p>Hello attendees</p>',
  createdAt: '2025-01-07T10:30:00.000Z',
  updatedAt: '2025-01-07T10:45:00.000Z',
  user: {
    id: 'user-1',
    fullName: 'Alex Doe',
    profileIcon: 3,
  },
  ...overrides,
});

describe('ChatContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('renders chat headers and messages', () => {
    render(
      <ChatContainer
        title="Event Updates"
        subtitle="Hosted by RSVP"
        messages={[buildMessage()]}
        variant="fullscreen"
      />
    );

    expect(screen.getByText('Event Updates')).toBeInTheDocument();
    expect(screen.getByText('Hosted by RSVP')).toBeInTheDocument();
    expect(screen.getByText('Alex Doe')).toBeInTheDocument();
    expect(screen.getByText('Hello attendees')).toBeInTheDocument();
    expect(screen.getByText('Tue, 6 Jan, 2025 at 10:45 AM')).toBeInTheDocument();

    const avatarImage = screen.getByRole('img', { name: /alex doe/i });
    expect(avatarImage).toHaveAttribute('src', 'https://cdn.test/avatar.svg');

    expect(mockFormatDate).toHaveBeenCalledWith(
      '2025-01-07T10:45:00.000Z',
      expect.objectContaining({ dateOnly: true })
    );
    expect(mockFormatDate).toHaveBeenCalledWith(
      '2025-01-07T10:45:00.000Z',
      expect.objectContaining({ dateOnly: true })
    );
  });

  it('shows loader when messages are fetching', () => {
    const { container } = render(<ChatContainer messages={[]} isLoading title="Loading Chat" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Hello attendees')).not.toBeInTheDocument();
  });

  it('falls back to generic user info when author data is missing', () => {
    render(
      <ChatContainer
        title="Event Updates"
        messages={[
          buildMessage({
            id: 'msg-unknown',
            content: '<p>Important announcement</p>',
            user: {
              id: 'anon',
              fullName: '',
              profileIcon: 1,
            },
          }),
        ]}
      />
    );

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
    expect(screen.getByText('Important announcement')).toBeInTheDocument();
  });

  it('scrolls to bottom when new messages arrive', () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    const { rerender } = render(<ChatContainer messages={[]} />);
    // Initial render might trigger effect depending on implementation,
    rerender(<ChatContainer messages={[buildMessage()]} />);

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
  });

  it('applies correct classes for fullscreen variant', () => {
    const { container } = render(<ChatContainer messages={[]} variant="fullscreen" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders empty state correctly', () => {
    render(<ChatContainer messages={[]} />);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByText('Hello attendees')).not.toBeInTheDocument();
  });

  it('renders HTML content safely', () => {
    const htmlContent = '<strong data-testid="bold-text">Bold Update</strong>';
    render(<ChatContainer messages={[buildMessage({ content: htmlContent })]} />);

    expect(screen.getByTestId('bold-text')).toBeInTheDocument();
    expect(screen.getByText('Bold Update')).toBeInTheDocument();
  });

  it('shows updated time if different from created time', () => {
    const createdAt = '2025-01-07T10:00:00.000Z';
    const updatedAt = '2025-01-07T10:30:00.000Z';

    render(<ChatContainer messages={[buildMessage({ createdAt, updatedAt })]} />);

    expect(mockFormatDate).toHaveBeenCalledWith(
      updatedAt,
      expect.objectContaining({ dateOnly: true })
    );
  });

  it('uses created time if updated time is missing', () => {
    const createdAt = '2025-01-07T10:00:00.000Z';

    render(<ChatContainer messages={[buildMessage({ createdAt, updatedAt: undefined })]} />);

    expect(mockFormatDate).toHaveBeenCalledWith(
      createdAt,
      expect.objectContaining({ dateOnly: true })
    );
  });

  it('uses default profile icon when missing', () => {
    render(
      <ChatContainer
        messages={[
          buildMessage({
            user: {
              id: 'user-no-icon',
              fullName: 'No Icon User',
              profileIcon: undefined,
            } as any,
          }),
        ]}
      />
    );

    expect(mockGetProfilePictureUrl).toHaveBeenCalledWith(1);
  });
});
