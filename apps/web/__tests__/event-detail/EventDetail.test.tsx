import { screen } from '@testing-library/react';
import { renderWithQueryClient } from '@/__tests__/utils/tanstack-query';
import EventDetail from '@/components/event-detail/EventDetail';
import { VenueType } from '@/types/event';
import { TEST_EVENT_DATA, TEST_EVENT } from '@/utils/test-constants';
import dayjs from 'dayjs';

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));

describe('EventDetail', () => {
  it('should render event basic information correctly', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    const eventImage = screen.getAllByRole('img')[0];

    expect(screen.getByText('Tech Conference 2024')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(eventImage).toHaveAttribute('src', '/images/tech-conf.jpg');
  });

  it('should format and display date and time correctly', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    const formattedDate = dayjs(TEST_EVENT.startTime).format('dddd, MMMM D');
    const startTime = dayjs(TEST_EVENT.startTime).format('h:mm A');
    const endTime = dayjs(TEST_EVENT.endTime).format('h:mm A');

    expect(screen.getByText(formattedDate)).toBeInTheDocument();
    expect(screen.getByText(`${startTime} - ${endTime}`)).toBeInTheDocument();
  });

  it('should display virtual venue information correctly', () => {
    const virtualEvent = {
      ...TEST_EVENT_DATA,
      event: {
        ...TEST_EVENT,
        venueType: 'virtual' as VenueType,
        venueUrl: 'https://meet.google.com',
      },
    };

    renderWithQueryClient(<EventDetail eventData={virtualEvent} />);

    expect(screen.getByText('Event Link')).toBeInTheDocument();
    expect(screen.getByText('https://meet.google.com')).toBeInTheDocument();
  });

  it('should display TBA venue information correctly', () => {
    const tbaEvent = {
      ...TEST_EVENT_DATA,
      event: { ...TEST_EVENT, venueType: 'later' as VenueType, venue: '' },
    };

    renderWithQueryClient(<EventDetail eventData={tbaEvent} />);

    expect(screen.getByText('To be announced')).toBeInTheDocument();
  });

  it('should display host information correctly', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    const cohostImages = screen.getAllByAltText('Host Avatar');
    expect(screen.getByText('Hosted & Cohosted By')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(cohostImages).toHaveLength(2);
  });

  it('should display registration information correctly', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    expect(screen.getByText('Registration')).toBeInTheDocument();
    expect(screen.getByText('95 Seats are Remaining.')).toBeInTheDocument();
    expect(screen.getByText('5 going')).toBeInTheDocument();
  });

  it('should display approval requirement when enabled', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    expect(screen.getByText('Required Approval')).toBeInTheDocument();
    expect(screen.getByText('Needs host permission to join event')).toBeInTheDocument();
  });

  it('should render event description when provided', () => {
    renderWithQueryClient(<EventDetail eventData={TEST_EVENT_DATA} />);

    expect(screen.getByText('About Event')).toBeInTheDocument();
    expect(screen.getByText('A great tech conference')).toBeInTheDocument();
  });

  it('should not render description section when description is empty', () => {
    const eventWithoutDescription = {
      ...TEST_EVENT_DATA,
      event: { ...TEST_EVENT, description: '' },
    };

    renderWithQueryClient(<EventDetail eventData={eventWithoutDescription} />);

    expect(screen.queryByText('About Event')).not.toBeInTheDocument();
  });

  it('should handle events with no cohosts', () => {
    const eventWithoutCohosts = {
      ...TEST_EVENT_DATA,
      event: { ...TEST_EVENT, Cohost: [] },
    };

    renderWithQueryClient(<EventDetail eventData={eventWithoutCohosts} />);

    expect(screen.getByText('Hosted By')).toBeInTheDocument();
    expect(screen.queryByText('& Cohosted')).not.toBeInTheDocument();
  });
});
