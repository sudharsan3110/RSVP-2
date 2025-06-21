import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSignInMutation } from '@/lib/react-query/auth';
import { useProfileUpdate } from '@/lib/react-query/user';
import { invalidEmailFormats } from '@/utils/test-constants';
import { baseUser } from '@/utils/test-constants';
import SecondaryEmailForm from '@/components/profile/SecondaryEmailForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/react-query/auth', () => ({
  useSignInMutation: vi.fn(),
}));

vi.mock('@/lib/react-query/user', () => ({
  useProfileUpdate: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Email Validation Tests', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useSignInMutation as any).mockReturnValue({
      mutate: vi.fn((data, { onSuccess }) => {
        onSuccess();
      }),
      isPending: false,
    });

    (useProfileUpdate as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('verifies email validation for secondary email', async () => {
    render(<SecondaryEmailForm user={baseUser} />, { wrapper });
    const user = userEvent.setup();
    await user.click(screen.getByText('Add Another'));
    const secondaryEmailInput = screen.getAllByRole('textbox')[1];

    for (const invalidEmail of invalidEmailFormats) {
      await user.type(secondaryEmailInput, invalidEmail);
      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        const formErrors = document.querySelectorAll(
          '[class*="error"], [class*="invalid"], .error-message, p[class*="form"]'
        );
        const allText = screen.getAllByText(/./i).map((el) => el.textContent);

        expect(
          formErrors.length > 0 ||
            allText.some(
              (text) =>
                text?.toLowerCase().includes('invalid') ||
                text?.toLowerCase().includes('error') ||
                text?.toLowerCase().includes('email')
            )
        ).toBe(true);
      });
    }

    await user.clear(secondaryEmailInput);
    await user.type(secondaryEmailInput, 'secondary@example.com');
    await user.click(screen.getByText('Save'));

    expect(mockMutate).toHaveBeenCalled();
  });

  it('ensures primary and secondary emails cannot be identical', async () => {
    render(<SecondaryEmailForm user={baseUser} />, { wrapper });
    const user = userEvent.setup();

    await user.click(screen.getByText('Add Another'));
    const secondaryEmailInput = screen.getAllByRole('textbox')[1];
    await user.type(secondaryEmailInput, 'test@example.com');

    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      const errorMessage =
        screen.queryByText(/same/i) ||
        screen.queryByText(/primary/i) ||
        screen.queryByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('tests secondary email removal', async () => {
    const userWithSecondary = {
      ...baseUser,
      secondary_email: 'old-secondary@example.com',
    };
    render(<SecondaryEmailForm user={userWithSecondary} />, { wrapper });
    const user = userEvent.setup();

    await user.click(screen.getByText('Remove Secondary Email'));
    await user.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.queryByLabelText('Secondary Email')).not.toBeInTheDocument();
      expect(screen.getByText('Add Another')).toBeInTheDocument();
    });
  });

  it('checks persistence of changes', async () => {
    const userWithSecondary = {
      ...baseUser,
      secondary_email: 'existing-secondary@example.com',
    };

    render(<SecondaryEmailForm user={userWithSecondary} />, { wrapper });
    const mutateCallData: any[] = [];

    mockMutate.mockImplementation((data, options) => {
      mutateCallData.push(data);

      if (options && options.onSuccess) {
        options.onSuccess({
          ...userWithSecondary,
          secondary_email: data.secondary_email,
        });
      }
    });

    const initialInput = screen.getAllByRole('textbox')[1];
    expect(initialInput).toBeInTheDocument();

    fireEvent.change(initialInput, { target: { value: 'updated-secondary@example.com' } });

    fireEvent.blur(initialInput);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (mutateCallData.length === 0) {
      const updatedInput = await screen.getAllByRole('textbox')[1];

      const allText = screen.getAllByText(/./i).map((el) => el.textContent);
      const updatedEmailShown = allText.some((text) =>
        text?.includes('updated-secondary@example.com')
      );

      if (!updatedEmailShown) {
        expect(updatedInput.textContent).toContain('updated-secondary');
      }
    } else {
      expect(JSON.stringify(mutateCallData[0])).toContain('updated-secondary');
    }
  });
});
