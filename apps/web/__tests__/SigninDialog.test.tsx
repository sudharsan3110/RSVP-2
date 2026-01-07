import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

const mutateMock = vi.fn();
const loginWithGoogleMock = vi.fn();
const pendingState = { current: false };
const pendingSubscribers = new Set<() => void>();
const notifyPendingSubscribers = () => {
  if (pendingSubscribers.size === 0) return;

  act(() => {
    pendingSubscribers.forEach((listener) => listener());
  });
};
const storageData = new Map<string, string>();
let mutateCalled = false;
const localStorageMock = {
  getItem: vi.fn((key: string) => (storageData.has(key) ? storageData.get(key)! : null)),
  setItem: vi.fn((key: string, value: string) => {
    storageData.set(key, String(value));
  }),
  removeItem: vi.fn((key: string) => {
    storageData.delete(key);
  }),
  clear: vi.fn(() => {
    storageData.clear();
  }),
};

vi.mock('@/lib/react-query/auth', async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return {
    ...actual,
    useSignInMutation: () => {
      const [, forceRender] = React.useReducer((count) => count + 1, 0);

      React.useEffect(() => {
        pendingSubscribers.add(forceRender);
        return () => {
          pendingSubscribers.delete(forceRender);
        };
      }, [forceRender]);

      const mutate = (...args: Parameters<typeof mutateMock>) => {
        if (pendingState.current) return;

        pendingState.current = true;
        notifyPendingSubscribers();
        const release = () => {
          pendingState.current = false;
          notifyPendingSubscribers();
        };

        try {
          const result = mutateMock(...args);
          if (result && typeof (result as Promise<unknown>).finally === 'function') {
            (result as Promise<unknown>).finally(release);
          } else {
            Promise.resolve().then(release);
          }
          return result;
        } catch (error) {
          release();
          throw error;
        }
      };

      return {
        mutate,
        get isPending() {
          return pendingState.current;
        },
      };
    },
    useGoogleOAuth: () => ({
      loginWithGoogle: loginWithGoogleMock,
    }),
  };
});

import SigninDialog from '@/components/auth/SigninDialog';

function renderDialog() {
  return render(
    <SigninDialog variant="signin">
      <button>Open Signin</button>
    </SigninDialog>
  );
}

beforeEach(() => {
  mutateMock.mockReset();
  loginWithGoogleMock.mockReset();
  pendingState.current = false;
  mutateCalled = false;
  storageData.clear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: localStorageMock,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('SigninDialog (frontend login)', () => {
  it('opens dialog and submits email -> shows success UI and disables resend initially', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    mutateMock.mockImplementation((_payload, opts) => {
      mutateCalled = true;
      opts?.onSuccess?.({});
    });

    renderDialog();
    await user.click(screen.getByText('Open Signin'));

    const emailInput = await screen.findByLabelText('email');
    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');
    const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);
    await user.click(submitBtn);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    await waitFor(() => expect(localStorageMock.setItem).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mutateCalled).toBe(true));
    expect(mutateMock).toHaveBeenCalledTimes(1);
    expect(mutateMock).toHaveBeenCalledWith(
      { email: 'user@example.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );

    await screen.findByText(/check your email!/i);
    const resendBtn = await screen.findByTestId('resend-btn');
    expect(resendBtn).toBeDisabled();
    expect(resendBtn).toHaveTextContent(/resend in/i);

    act(() => {
      vi.advanceTimersByTime(121_000);
    });
    await waitFor(() => expect(resendBtn).not.toBeDisabled());
    expect(resendBtn).toHaveTextContent(/click to resend/i);
  });

  it.each([
    {
      scenario: 'no email is provided',
      value: '',
      expectedMessage: /invalid email/i,
    },
    {
      scenario: 'email format is invalid',
      value: 'not-an-email',
      expectedMessage: /invalid email/i,
    },
    {
      scenario: 'email domain is disposable',
      value: 'user@10minutemail.com',
      expectedMessage: /disposable email addresses are not allowed/i,
    },
  ])('shows validation feedback when $scenario', async ({ value, expectedMessage }) => {
    const user = userEvent.setup();

    renderDialog();
    await user.click(screen.getByText('Open Signin'));

    const emailInput = await screen.findByLabelText('email');
    await user.clear(emailInput);
    if (value) {
      await user.type(emailInput, value);
    }

    const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
    await user.click(submitBtn);

    expect(await screen.findByText(expectedMessage)).toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
    expect(mutateMock).not.toHaveBeenCalled();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('keeps the form active when the mutation fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mutateMock.mockImplementation(() =>
      Promise.reject(new Error('Request failed'))
        .catch(() => undefined)
        .finally(() => {})
    );

    try {
      renderDialog();
      await user.click(screen.getByText('Open Signin'));

      const emailInput = await screen.findByLabelText('email');
      await user.clear(emailInput);
      await user.type(emailInput, 'user@example.com');

      const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
      await user.click(submitBtn);

      await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1));
      await waitFor(() => expect(submitBtn).not.toBeDisabled());

      expect(screen.queryByText(/check your email!/i)).toBeNull();
      await waitFor(() =>
        expect(localStorageMock.setItem).toHaveBeenCalledWith('redirect', window.location.pathname)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('prevents resend until cooldown finishes, then allows another attempt', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    mutateMock.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({});
      return Promise.resolve();
    });

    renderDialog();
    await user.click(screen.getByText('Open Signin'));

    const emailInput = await screen.findByLabelText('email');
    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');

    const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
    await user.click(submitBtn);
    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    const resendBtn = await screen.findByRole('button', { name: /resend/i });
    expect(resendBtn).toBeDisabled();
    expect(mutateMock).toHaveBeenCalledTimes(1);

    await user.click(resendBtn);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(121_000);
    });
    await waitFor(() => expect(resendBtn).not.toBeDisabled());

    await user.click(resendBtn);
    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(2));

    expect(mutateMock).toHaveBeenNthCalledWith(
      2,
      { email: 'user@example.com' },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(resendBtn).toBeDisabled());
  });

  it('shows loading state while sending', () => {
    pendingState.current = true;

    renderDialog();
    fireEvent.click(screen.getByText('Open Signin'));

    const submitBtn = screen.getByRole('button', { name: /sending/i });
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveTextContent(/sending/i);
  });

  it('triggers Google OAuth login when clicking the Google button', () => {
    renderDialog();
    fireEvent.click(screen.getByText('Open Signin'));

    fireEvent.click(screen.getByRole('button', { name: /sign in with google oauth/i }));
    expect(loginWithGoogleMock).toHaveBeenCalledTimes(1);
  });
  it('resets UI when dialog closes', async () => {
    mutateMock.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({});
    });

    renderDialog();
    fireEvent.click(screen.getByText('Open Signin'));

    const emailInput = await screen.findByLabelText('email');
    fireEvent.change(emailInput, {
      target: { value: 'user@example.com' },
    });
    const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
    fireEvent.click(submitBtn);
    await screen.findByText(/check your email!/i);

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    fireEvent.click(screen.getByText('Open Signin'));
    await screen.findByRole('button', { name: /send magic link/i });
    expect(screen.queryByText(/check your email!/i)).toBeNull();
  });

  it('does not resend while countdown is active and resumes countdown after manual close and reopen', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    mutateMock.mockImplementation((_payload, opts) => {
      opts?.onSuccess?.({});
      return Promise.resolve();
    });

    renderDialog();
    await user.click(screen.getByText('Open Signin'));

    const emailInput = await screen.findByLabelText('email');
    await user.clear(emailInput);
    await user.type(emailInput, 'user@example.com');

    const submitBtn = await screen.findByRole('button', { name: /send magic link/i });
    await user.click(submitBtn);

    await act(async () => {
      await vi.runOnlyPendingTimersAsync();
    });

    const resendBtn = await screen.findByTestId('resend-btn');
    expect(resendBtn).toBeDisabled();

    await user.click(resendBtn);
    expect(mutateMock).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(resendBtn).toBeDisabled();

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    await user.click(screen.getByText('Open Signin'));
    await screen.findByRole('button', { name: /send magic link/i });
    expect(screen.queryByText(/check your email!/i)).toBeNull();
  });
});
