import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, render, screen, waitFor } from '@testing-library/react';
import SigninDialog from '@/components/auth/SigninDialog';
import { Button } from '../components/ui/button';
import { useSignInMutation } from '@/lib/react-query/auth';

// Mock `next/navigation`
const { useRouter } = vi.hoisted(() => {
  const mockedRouterPush = vi.fn();
  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush,
  };
});

vi.mock('@/lib/react-query/auth', () => ({
  useSignInMutation: vi.fn(),
}));

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter,
  };
});

describe('Sign In Dialog', () => {
  const mockMutate = vi.fn((_, { onSuccess }) => {
    onSuccess(); // Simulate successful mutation
  });

  beforeEach(() => {
    (useSignInMutation as any).mockReturnValue({ mutate: mockMutate });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should open and close the Sign In dialog correctly', async () => {
    render(
      <SigninDialog variant="signin">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign In
        </Button>
      </SigninDialog>
    );

    const user = userEvent.setup();

    const signInbutton = await screen.findByRole('button', { name: /Sign In/i });

    await user.click(signInbutton);

    expect(screen.getByRole('dialog'));

    const closeButton = await screen.findByRole('button', { name: /Close/i });
    await user.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render Sign Up content when sign up button is clicked', async () => {
    render(
      <SigninDialog variant="signup">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign up
        </Button>
      </SigninDialog>
    );

    const user = userEvent.setup();

    const signUpbutton = await screen.findByRole('button', { name: /Sign up/i });

    await user.click(signUpbutton);

    expect(screen.getByText('Sign Up for an Account')).toBeInTheDocument();
    expect(screen.getByText('Create an account to get started')).toBeInTheDocument();
  });

  it('should render Sign in content when sign in button is clicked', async () => {
    render(
      <SigninDialog variant="signin">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign In
        </Button>
      </SigninDialog>
    );

    const user = userEvent.setup();

    const signUpbutton = await screen.findByRole('button', { name: /Sign In/i });

    await user.click(signUpbutton);

    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument();
    expect(
      screen.getByText('Please provide the email so we can send the magic link')
    ).toBeInTheDocument();
  });

  it('should show validation error when email format is incorrect', async () => {
    render(
      <SigninDialog variant="signin">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign In
        </Button>
      </SigninDialog>
    );

    const user = userEvent.setup();
    const signInbutton = await screen.findByRole('button', { name: /Sign In/i });

    user.click(signInbutton);

    const emailInput = await screen.findByLabelText('email');
    const button = await screen.findByRole('button', { name: /send magic link/i });

    // Check for validation error message
    await user.type(emailInput, 'invalid-email');
    await user.click(button);

    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should show success message after clicking submit', async () => {
    render(
      <SigninDialog variant="signin">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign In
        </Button>
      </SigninDialog>
    );

    const user = userEvent.setup();

    const signInbutton = await screen.findByRole('button', { name: /Sign In/i });

    user.click(signInbutton);

    const emailInput = await screen.findByLabelText('email');
    const button = await screen.findByRole('button', { name: /send magic link/i });

    await user.type(emailInput, 'test@gmail.com');
    await user.click(button);

    expect(mockMutate).toHaveBeenCalled();

    await waitFor(async () => {
      expect(screen.getByText('Check your email!')).toBeInTheDocument();
      expect(
        screen.getByText("We've just sent an email to you at test@gmail.com. Click to verify.")
      ).toBeInTheDocument();
    });
  });

  it('should enable resend button after 2 minute of clicking submit', async () => {
    const user = userEvent.setup({ delay: null });

    vi.useFakeTimers({ shouldAdvanceTime: true });

    render(
      <SigninDialog variant="signin">
        <Button variant={'outline'} className="text-md border-[#AC6AFF]">
          Sign In
        </Button>
      </SigninDialog>
    );

    const signInbutton = await screen.findByRole('button', { name: /Sign In/i });

    user.click(signInbutton);

    const emailInput = await screen.findByLabelText('email');
    const button = await screen.findByRole('button', { name: /send magic link/i });

    await user.type(emailInput, 'test@gmail.com');
    await user.click(button);

    expect(mockMutate).toHaveBeenCalled();

    const resendButton = await screen.findByTestId('resend-btn');
    expect(resendButton).toBeDisabled();
    expect(resendButton).toHaveTextContent('Resend in 2:00');

    act(() => {
      vi.advanceTimersByTime(120000);
    });

    expect(resendButton).not.toBeDisabled();
    expect(resendButton).toHaveTextContent('Click to resend');
    vi.useRealTimers();
  });

  it('should show loading state while submitting the form', async () => {
    const mockMutateWithDelay = vi.fn((_, { onSuccess }) => {
      setTimeout(() => {
        onSuccess();
      }, 120000);
    });
    (useSignInMutation as any).mockReturnValue({
      mutate: mockMutateWithDelay,
      isPending: true,
    });

    render(
      <SigninDialog variant="signin">
        <Button>Sign In</Button>
      </SigninDialog>
    );

    const user = userEvent.setup();
    const signInButton = await screen.findByRole('button', { name: /Sign In/i });
    await user.click(signInButton);

    const emailInput = await screen.findByLabelText('email');
    await user.type(emailInput, 'test@gmail.com');

    const submitButton = await screen.findByRole('button', {
      name: /send magic link|sending\.\.\./i,
    });
    await user.click(submitButton);
    expect(screen.getByText('Sending...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    const spinner = screen
      .getByRole('button', { name: /sending\.\.\./i })
      .querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
