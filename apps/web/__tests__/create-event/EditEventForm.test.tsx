import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditEventForm from '@/components/create-event/EditEventForm';
import { useGetEventById } from '@/lib/react-query/event';

vi.mock('cropperjs/dist/cropper.css', () => ({}));

vi.mock('@/components/common/form/FormUploadImage', () => ({
  default: () => <div>Image Upload Mock</div>,
}));

vi.mock('@/lib/react-query/event', () => ({
  useGetEventById: vi.fn(),
  useUpdateEvent: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useGetCategoryList: () => ({ data: [{ value: 1, label: 'Technology' }], isLoading: false }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '123' }),
}));

vi.mock('@/components/create-event/EventForm', () => ({
  default: (props: any) => {
    return (
      <div>
        <input data-testid="name" name="name" value={props.defaultValues?.name ?? ''} readOnly />
        <input
          data-testid="location"
          name="location"
          value={props.defaultValues?.location ?? ''}
          readOnly
        />
        <input
          data-testid="capacity"
          name="capacity"
          value={String(props.defaultValues?.capacity ?? '')}
          readOnly
        />
        <button
          data-testid="mock-submit"
          onClick={() => props.onSubmit({ ...props.defaultValues, hostPermissionRequired: false })}
        >
          Mock Submit
        </button>
      </div>
    );
  },
}));

describe('EditEventForm UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading UI when data is loading', () => {
    (useGetEventById as any).mockReturnValue({
      isLoading: true,
      data: undefined,
    });

    render(<EditEventForm />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders form with populated default values', () => {
    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          name: 'Tech Meetup',
          category: { name: 'Technology' },
          description: 'Event Description',
          venueType: 'Physical',
          venueAddress: 'Bangalore',
          hostPermissionRequired: true,
          discoverable: true,
          capacity: 50,
          startTime: new Date('2025-01-01T10:00:00Z'),
          endTime: new Date('2025-01-01T12:00:00Z'),
          eventImageUrl: 'image.png',
        },
      },
    });

    render(<EditEventForm />);

    expect(screen.getByDisplayValue('Tech Meetup')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bangalore')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('opens alert dialog when host permission required is turned off', async () => {
    const user = userEvent.setup();

    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          name: 'Test',
          category: { name: 'Cat' },
          description: 'desc',
          venueType: 'Physical',
          venueAddress: '',
          hostPermissionRequired: true,
          discoverable: false,
          capacity: 10,
          startTime: new Date(),
          endTime: new Date(),
          eventImageUrl: '',
        },
      },
    });

    render(<EditEventForm />);

    const mockSubmit = screen.getByTestId('mock-submit');
    await user.click(mockSubmit);
    expect(screen.getByText(/change visibility/i)).toBeInTheDocument();
  });

  it('renders page title', () => {
    (useGetEventById as any).mockReturnValue({
      isLoading: false,
      data: {
        event: {
          name: '',
          category: { name: '' },
          startTime: '2025-01-01T10:00:00Z',
          endTime: '2025-01-01T12:00:00Z',
        },
      },
    });

    render(<EditEventForm />);

    expect(screen.getByText(/fill in the form below to create a new event/i)).toBeInTheDocument();
  });
});
