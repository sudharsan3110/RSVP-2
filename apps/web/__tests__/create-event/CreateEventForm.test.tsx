import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateEventForm from '@/components/create-event/CreateEventForm';

const mockMutate = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUsePersistentState = vi.fn();
const mockEventLimitDialog = vi.fn();

let mockIsPending = false;

vi.mock('@/components/create-event/EventForm', () => ({
  default: (props: any) => (
    <div data-testid="event-form-mock">
      <div data-testid="require-signin">{String(props.requireSignIn)}</div>
      <div data-testid="default-name">{props.defaultValues?.name}</div>
      <div data-testid="is-loading">{String(props.isLoading)}</div>
      <button data-testid="submit" onClick={() => props.onSubmit(props.defaultValues)} />
    </div>
  ),
}));

vi.mock('@/lib/react-query/auth', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('@/components/create-event/EventLimitDialog', () => ({
  default: (props: any) => {
    mockEventLimitDialog(props);
    return (
      <div data-testid="limit-dialog">
        <div data-testid="limit-open">{String(props.open)}</div>
        <div data-testid="limit-message">{props.message}</div>
      </div>
    );
  },
}));

vi.mock('@/lib/react-query/event', () => ({
  useCreateEvent: () => ({ mutate: mockMutate, isPending: mockIsPending }),
  useGetCategoryList: () => ({ data: [{ value: 1, label: 'Technology' }], isLoading: false }),
}));

vi.mock('@/hooks/useLocalStorage', () => ({
  usePersistentState: (k: any, d: any, e: any) => mockUsePersistentState(k, d, e),
}));

const defaultValues = {
  name: 'Test event',
  category: 'cat',
  description: 'desc',
  plaintextDescription: 'desc',
  venueType: 0,
  location: 'loc',
  hostPermissionRequired: false,
  discoverable: true,
  fromTime: '17:00',
  fromDate: new Date(),
  toTime: '18:00',
  toDate: new Date(),
  capacity: 20,
  eventImageUrl: '',
};

describe('CreateEventForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders EventForm and passes persisted default values when user exists', async () => {
    mockUseCurrentUser.mockReturnValue({ data: { id: 'u1' } });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    render(<CreateEventForm />);

    expect(screen.getByText(/Fill in the form below to create a new event/i)).toBeInTheDocument();
    expect(screen.getByTestId('event-form-mock')).toBeInTheDocument();
    expect(screen.getByTestId('require-signin')).toHaveTextContent('false');
    expect(screen.getByTestId('default-name')).toHaveTextContent('Test event');
  });

  it('sets requireSignIn true when no user', async () => {
    mockUseCurrentUser.mockReturnValue({ data: null });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    render(<CreateEventForm />);

    expect(screen.getByTestId('require-signin')).toHaveTextContent('true');
  });

  it('calls mutate when EventForm submits', async () => {
    const user = userEvent.setup();
    mockUseCurrentUser.mockReturnValue({ data: { id: 'u1' } });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    render(<CreateEventForm />);

    await user.click(screen.getByTestId('submit'));

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const calledWith = mockMutate.mock.calls[0][0];
    expect(calledWith).toHaveProperty('name', defaultValues.name);
  });

  it('opens limit dialog when create fails with limit error', async () => {
    const user = userEvent.setup();
    mockUseCurrentUser.mockReturnValue({ data: { id: 'u1' } });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    const limitMessage =
      'You have reached the monthly limit of creating 5 private events. Need to create more private events?';
    mockMutate.mockImplementationOnce((_payload: any, options: any) => {
      options?.onError?.({
        response: { data: { message: limitMessage, errorCode: 'EVENT_LIMIT_PRIVATE' } },
      });
    });

    render(<CreateEventForm />);

    await user.click(screen.getByTestId('submit'));

    expect(screen.getByTestId('limit-open')).toHaveTextContent('true');
    expect(screen.getByTestId('limit-message')).toHaveTextContent(limitMessage);
  });

  it('does not open limit dialog for non-limit errors', async () => {
    const user = userEvent.setup();
    mockUseCurrentUser.mockReturnValue({ data: { id: 'u1' } });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    mockMutate.mockImplementationOnce((_payload: any, options: any) => {
      options?.onError?.({
        response: { data: { message: 'Something went wrong', errorCode: 'SOME_OTHER_ERROR' } },
      });
    });

    render(<CreateEventForm />);

    await user.click(screen.getByTestId('submit'));

    expect(screen.queryByTestId('limit-dialog')).not.toBeInTheDocument();
  });

  it('passes react-query isPending to EventForm as isLoading', async () => {
    mockUseCurrentUser.mockReturnValue({ data: { id: 'u1' } });
    mockUsePersistentState.mockReturnValue([defaultValues, vi.fn()]);

    mockIsPending = false;
    const { rerender } = render(<CreateEventForm />);
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

    mockIsPending = true;
    rerender(<CreateEventForm />);
    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
  });
});

export default {} as unknown;
