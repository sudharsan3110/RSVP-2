import { render, screen } from '@testing-library/react';
import AvatarGroup from '@/components/event-detail/AvatarGroup';
import { userAvatarOptions } from '@/utils/constants';

describe('AvatarGroup', () => {
  it('should render avatars with default props', () => {
    render(<AvatarGroup />);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(4);
    const countIndicator = screen.queryByText(/\+\d+/);
    expect(countIndicator).not.toBeInTheDocument();
  });

  it('should respect the limit prop', () => {
    render(<AvatarGroup limit={2} />);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(2);
  });

  it('should display additional count when provided', () => {
    render(<AvatarGroup additionalCount={5} />);

    const countIndicator = screen.getByText('+5');
    expect(countIndicator).toBeInTheDocument();
  });

  it('should display correct avatar images', () => {
    render(<AvatarGroup limit={3} />);

    const avatars = screen.getAllByRole('img');
    for (let i = 0; i < 3; i++) {
      expect(avatars[i]).toHaveAttribute('src', expect.stringContaining(userAvatarOptions[i].src));
      expect(avatars[i]).toHaveAttribute('alt', `Avatar ${i + 1}`);
    }
  });

  it('should handle limit greater than available avatars', () => {
    const optionsLength = userAvatarOptions.length;
    render(<AvatarGroup limit={optionsLength + 5} />);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(optionsLength);
  });
});
