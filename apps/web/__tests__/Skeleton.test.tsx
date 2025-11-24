import { Skeleton } from '@/components/ui/skeleton';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Skeleton', () => {
  it('renders successfully', () => {
    render(<Skeleton data-testid="skeleton" />);
    const element = screen.getByTestId('skeleton');
    expect(element).toBeInTheDocument();
  });

  it('applies default tailwind classes', () => {
    render(<Skeleton data-testid="skeleton" />);
    const element = screen.getByTestId('skeleton');
    expect(element).toHaveClass('animate-pulse');
    expect(element).toHaveClass('rounded-md');
    expect(element).toHaveClass('bg-muted');
  });

  it('merges custom className with default classes', () => {
    render(<Skeleton data-testid="skeleton" className="h-12 w-12 bg-red-500" />);
    const element = screen.getByTestId('skeleton');
    expect(element).toHaveClass('animate-pulse');
    expect(element).toHaveClass('h-12');
    expect(element).toHaveClass('w-12');
    expect(element).toHaveClass('bg-red-500');
  });

  it('passes additional props to the underlying div', () => {
    render(<Skeleton data-testid="skeleton" id="test-id" role="status" aria-label="loading" />);
    const element = screen.getByTestId('skeleton');
    expect(element).toHaveAttribute('id', 'test-id');
    expect(element).toHaveAttribute('role', 'status');
    expect(element).toHaveAttribute('aria-label', 'loading');
  });

  it('renders a list of skeletons correctly', () => {
    render(
      <>
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} data-testid="skeleton-item" className="w-full min-h-[20rem]" />
        ))}
      </>
    );
    const items = screen.getAllByTestId('skeleton-item');
    expect(items).toHaveLength(9);
    expect(items[0]).toHaveClass('w-full');
    expect(items[0]).toHaveClass('min-h-[20rem]');
  });
});
