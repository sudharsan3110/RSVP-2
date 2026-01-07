import React from 'react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EventLimitDialog from '@/components/create-event/EventLimitDialog';

describe('EventLimitDialog', () => {
  const onOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders when open is true', () => {
    render(
      <EventLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        message="You have reached the monthly limit of creating 5 private events."
      />
    );

    expect(screen.getByText(/event limit reached/i)).toBeInTheDocument();
  });

  it('shows private limit text (5) when message contains "private"', () => {
    render(
      <EventLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        message="You have reached the monthly limit of creating 5 private events."
      />
    );

    expect(screen.getByText(/monthly limit of creating 5 private events/i)).toBeInTheDocument();
  });

  it('shows public limit text (10) when message does not contain "private"', () => {
    render(
      <EventLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        message="You have reached the monthly limit of creating 10 public events."
      />
    );

    expect(screen.getByText(/monthly limit of creating 10 public events/i)).toBeInTheDocument();
  });

  it('renders Contact Us as an external link to X', async () => {
    render(
      <EventLimitDialog
        open={true}
        onOpenChange={onOpenChange}
        message="You have reached the monthly limit of creating 5 private events."
      />
    );

    const link = screen.getByRole('link', { name: /contact support on x/i });
    expect(link).toHaveAttribute('href', 'https://x.com/TeamShiksha');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
