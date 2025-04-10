import GuestLayout from '@/app/(guest)/layout';
import Home from '@/app/(guest)/page';
import { cleanup, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithQueryClient } from './utils/tanstack-query';

beforeEach(() => {
  cleanup();
});

// Mock `next/navigation`
const { useRouter } = vi.hoisted(() => {
  const mockedRouterPush = vi.fn();
  return {
    useRouter: () => ({ push: mockedRouterPush }),
    mockedRouterPush,
  };
});

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useSearchParams: () => new URLSearchParams(),
    useRouter,
  };
});

describe('Unauthenticated User Home Page', () => {
  it('renders the home page with unauthenticated Navbar & Footer', async () => {
    renderWithQueryClient(
      <GuestLayout>
        <Home />
      </GuestLayout>
    );

    //  Check if unauthenticated navbar and footer links are present
    expect(screen.getByText('Get Started')).toBeDefined();
    expect(screen.getByText('Help')).toBeDefined();
    expect(screen.getByText('About')).toBeDefined();
    expect(within(screen.getByRole('navigation')).getByAltText('Logo')).toBeInTheDocument();

    //  Ensure that authenticated-only links are NOT present
    expect(screen.queryByText('Create Event')).toBeNull();
    expect(screen.queryByText('Disocver')).toBeNull();
    expect(screen.queryByText('Planned')).toBeNull();
    expect(screen.queryByText('Profile')).toBeNull();
  });
});
