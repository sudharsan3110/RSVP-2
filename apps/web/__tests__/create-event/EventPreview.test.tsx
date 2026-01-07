import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import EventPreview from '@/components/create-event/EventPreview';
import { CreateEventFormType } from '@/lib/zod/event';
import { it, describe, expect } from 'vitest';

const Wrapper = ({ children, defaultValues }: any) => {
  const methods = useForm<CreateEventFormType>({
    defaultValues,
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
};

const renderPreview = (defaultValues: any, props = {}) => {
  return render(
    <Wrapper defaultValues={defaultValues}>
      <EventPreview {...props} />
    </Wrapper>
  );
};

describe('EventPreview UI Tests', () => {
  const baseValues = {
    eventImageUrl: '',
    name: '',
    location: '',
    fromDate: null,
    toDate: null,
    fromTime: '',
    toTime: '',
  };

  it('renders provided name correctly', () => {
    renderPreview({ ...baseValues, name: 'Music Fest' });

    expect(screen.getByText('Music Fest')).toBeInTheDocument();
  });

  it('renders children inside the preview', () => {
    renderPreview(baseValues, {
      children: <div data-testid="child-element">Hello Child</div>,
    });

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });

  it('renders image preview when image exists', () => {
    renderPreview({ ...baseValues, eventImageUrl: 'test.jpg' });

    expect(screen.getByAltText('Event Image')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('removes image when remove button is clicked', () => {
    const values = { ...baseValues, eventImageUrl: 'test.jpg' };

    renderPreview(values);

    const img = screen.getByAltText('Event Image');
    expect(img).toBeInTheDocument();

    const removeBtn = screen.getByRole('button');
    fireEvent.click(removeBtn);

    expect(screen.queryByAltText('Event Image')).not.toBeInTheDocument();
  });

  it("renders physical location when venueType is 'physical'", () => {
    renderPreview({ ...baseValues, location: 'New York' }, { venueType: 'physical' });

    expect(screen.getByText('New York')).toBeInTheDocument();
  });

  it("hides location when venueType is not 'physical'", () => {
    renderPreview({ ...baseValues, location: 'New York' }, { venueType: 'virtual' });

    expect(screen.queryByText('New York')).not.toBeInTheDocument();
  });
});
