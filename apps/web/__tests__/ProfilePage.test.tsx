import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProfilePage from '@/app/(authenticated)/profile/page';
import { User } from '@/types/user';
import { baseUser } from '@/utils/test-constants';

const mockUserData = {
  data: null as User | null,
  isSuccess: false,
  isLoading: false,
  isError: false,
  error: null,
};

const useCurrentUserMock = vi.fn(() => mockUserData);

vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: () => useCurrentUserMock(),
}));

const mutateMock = vi.fn();
const mockIsPending = { current: false };

vi.mock('@/lib/react-query/user', () => ({
  useProfileUpdate: () => ({
    mutate: mutateMock,
    isPending: mockIsPending.current,
  }),
  useDeactivateAccount: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserData.data = null;
    mockUserData.isSuccess = false;
    mockUserData.isLoading = false;
    mockUserData.isError = false;
    mockUserData.error = null;
    mockIsPending.current = false;
  });

  it('renders the page title and description', () => {
    mockUserData.isLoading = true;
    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Manage your profile settings')).toBeInTheDocument();
  });

  it('shows loading skeleton when data is loading', () => {
    mockUserData.isLoading = true;
    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(screen.getByText('Public profile')).toBeInTheDocument();
    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
  });

  it('renders all profile forms when user data is successfully loaded and user is completed', () => {
    const completedUser = new User({
      ...baseUser,
      id: 'user-123',
      fullName: 'John Doe',
      userName: 'johndoe',
      isCompleted: true,
    });

    mockUserData.data = completedUser;
    mockUserData.isSuccess = true;
    mockUserData.isLoading = false;

    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bio/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    expect(screen.getByLabelText(/phone number input/i)).toBeInTheDocument();
  });

  it('does not show incomplete profile warning when user is completed', () => {
    const completedUser = new User({
      ...baseUser,
      isCompleted: true,
    });

    mockUserData.data = completedUser;
    mockUserData.isSuccess = true;
    mockUserData.isLoading = false;

    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(
      screen.queryByText(/complete your profile to increase your ticket approval chances/i)
    ).not.toBeInTheDocument();
  });

  it('shows incomplete profile warning when user is not completed', () => {
    const incompleteUser = new User({
      ...baseUser,
      isCompleted: false,
    });

    mockUserData.data = incompleteUser;
    mockUserData.isSuccess = true;
    mockUserData.isLoading = false;

    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(
      screen.getByText(/complete your profile to increase your ticket approval chances/i)
    ).toBeInTheDocument();
  });

  it('renders account management sections when user is valid and profile is completed', () => {
    const completedUser = new User({
      ...baseUser,
      id: 'user-456',
      isCompleted: true,
    });

    mockUserData.data = completedUser;
    mockUserData.isSuccess = true;
    mockUserData.isLoading = false;

    render(<ProfilePage />, { wrapper: createWrapper() });

    // Download Section
    expect(screen.getByText('Download your personal data')).toBeInTheDocument();
    expect(
      screen.getByText(/this feature is coming soon. in case of urgent requirements/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download/i })).toBeDisabled();

    // Delete / Deactivate Section
    expect(screen.getByText('Delete my account')).toBeInTheDocument();
    expect(
      screen.getByText(/if you no longer wish to use rsvp, you can deactivate your account/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deactivate my account/i })).toBeInTheDocument();
  });

  it('does not render profile forms and deactivate dialog when user is null', () => {
    mockUserData.isLoading = true;
    render(<ProfilePage />, { wrapper: createWrapper() });

    expect(screen.queryByLabelText('Full name')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Phone number input')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /deactivate my account/i })
    ).not.toBeInTheDocument();
  });

  it('passes correct user data to ProfileForm', () => {
    const testUser = new User({
      ...baseUser,
      id: 'test-user-1',
      fullName: 'Test User',
      userName: 'testuser',
      isCompleted: true,
      location: 'Test Location',
      bio: 'Test Bio',
      twitter: 'https://x.com/testuser',
      instagram: 'https://instagram.com/testuser',
      website: 'https://testuser.com',
      contact: '9874563210',
      secondaryEmail: 'test2@example.com',
    });

    mockUserData.data = testUser;
    mockUserData.isSuccess = true;
    mockUserData.isLoading = false;

    render(<ProfilePage />, { wrapper: createWrapper() });

    const fullNameInput = screen.getByLabelText('full name') as HTMLInputElement;
    expect(fullNameInput.value).toBe('Test User');

    const locationInput = screen.getByLabelText('location') as HTMLInputElement;
    expect(locationInput.value).toBe('Test Location');

    const bioInput = screen.getByLabelText('bio') as HTMLTextAreaElement;
    expect(bioInput.value).toBe('Test Bio');

    const twitterInput = screen.getByLabelText('twitter/x') as HTMLInputElement;
    expect(twitterInput.value).toBe('https://x.com/testuser');

    const instagramInput = screen.getByLabelText('instagram') as HTMLInputElement;
    expect(instagramInput.value).toBe('https://instagram.com/testuser');

    const websiteInput = screen.getByLabelText('website') as HTMLInputElement;
    expect(websiteInput.value).toBe('https://testuser.com');

    const emailInput = screen.getByLabelText('email') as HTMLInputElement;
    expect(emailInput.value).toBe('test@example.com');

    const secondaryEmailInput = screen.getByLabelText('secondary email') as HTMLInputElement;
    expect(secondaryEmailInput.value).toBe('test2@example.com');
  });
});
