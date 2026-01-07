import EventForm from '@/components/create-event/EventForm';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('cropperjs/dist/cropper.css', () => ({}));

vi.mock('@/components/ui/button', () => ({ Button: (props: any) => <button {...props} /> }));

vi.mock('@/components/ui/drawer', () => ({
  Drawer: (p: any) => <div>{p.children}</div>,
  DrawerContent: (p: any) => <div>{p.children}</div>,
  DrawerTrigger: (p: any) => <span>{p.children}</span>,
}));

vi.mock('@/components/ui/form', () => ({
  Form: (p: any) => <div>{p.children}</div>,
  FormField: (p: any) => (
    <div>
      {typeof p.render === 'function'
        ? p.render({ field: { value: p.value, onChange: () => {} } })
        : p.children}
    </div>
  ),
  FormItem: (p: any) => <div>{p.children}</div>,
  FormLabel: (p: any) => <label>{p.children}</label>,
  FormMessage: (p: any) => <span>{p.children}</span>,
}));

vi.mock('@/components/common/form/FormCombobox', () => ({
  default: vi.fn(() => <div data-testid="mock-combobox">Mock Combobox</div>),
}));

vi.mock('@/components/common/form/FormDatePicker', () => ({
  default: ({ label }: { label?: string }) => (
    <div data-testid="mock-date-picker">
      {label ? `Mocked Date Picker - ${label}` : 'Mocked Date Picker'}
    </div>
  ),
}));
vi.mock('@/components/common/form/FormInput', () => ({
  default: ({ label, name }: { label?: string; name?: string }) => (
    <input data-testid={`mock-input-${name}`} placeholder={label} name={name} />
  ),
}));

vi.mock('@/components/common/form/FormSelect', () => ({
  default: ({ label, name, options }: any) => (
    <select data-testid={`mock-select-${name}`} name={name}>
      {options?.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock('@/components/common/form/FormSelectInput', () => ({
  default: (props: any) => (
    <input
      data-testid={props.name}
      placeholder={props.placeholder}
      onChange={(e) => props.onChange?.(e.target.value)}
    />
  ),
}));

vi.mock('@/components/common/form/FormSwitch', () => ({
  default: ({ name }: any) => <input type="checkbox" data-testid={`mock-switch-${name}`} />,
}));

vi.mock('@/components/common/form/FormTextArea', () => ({
  default: (props: any) => (
    <textarea
      data-testid={`mock-textarea-${props.name}`}
      defaultValue={props.defaultValue}
      onChange={props.onChange}
    />
  ),
}));

vi.mock('@/components/common/form/FormUploadImage', () => ({
  default: (props: any) => <input data-testid={props.name} onChange={props.onChange} />,
}));

vi.mock('@/components/ui/tiptap', () => ({
  default: (props: any) => (
    <div data-testid="tiptap-editor">
      <textarea
        data-testid="tiptap-input"
        defaultValue={props.description}
        onChange={(e) => props.onChange(e.target.value, e.target.value)}
      />
    </div>
  ),
}));

vi.mock('@/components/ui/toggle-group', () => ({
  ToggleGroup: (p: any) => {
    // Ensure venueType defaults to Physical (0) for tests
    p.onValueChange?.(0);
    return <div>{p.children}</div>;
  },
  ToggleGroupItem: (p: any) => <button>{p.children}</button>,
}));

vi.mock('@/components/create-event/EventPreview', () => ({
  default: (props: any) => <div data-testid="event-preview">{props.children}</div>,
}));

vi.mock('@/components/auth/SigninDialog', () => ({
  default: ({ children, variant }: { children?: React.ReactNode; variant?: string }) => (
    <div data-testid="signin-dialog" data-variant={variant}>
      {children}
    </div>
  ),
}));

const defaultValues = {
  name: 'Test Event',
  category: 'General',
  description: '<p>x</p>',
  plaintextDescription: 'x',
  venueType: 'PHYSICAL',
  location: 'Somewhere',
  hostPermissionRequired: false,
  discoverable: true,
  fromTime: '17:00',
  fromDate: new Date(),
  toTime: '18:00',
  toDate: new Date(),
  capacity: 20,
  eventImageUrl: '',
};

describe('EventForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Create Event button when not editing', () => {
    const onSubmit = vi.fn();
    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={onSubmit}
        requireSignIn={false}
        setPersistentValue={vi.fn()}
        isLoading={false}
      />
    );

    const btn = screen.getByRole('button', { name: 'Create Event' });
    expect(btn).toBeInTheDocument();
  });

  it('does not call onSubmit when requireSignIn is true', async () => {
    const onSubmit = vi.fn();

    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={onSubmit}
        requireSignIn={true}
        setPersistentValue={vi.fn()}
        isLoading={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Create Event' });

    await userEvent.click(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('disables submit button when loading is true', () => {
    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={true}
      />
    );

    const btn = screen.getByRole('button', { name: '' });
    expect(btn).toBeDisabled();
  });

  it('renders all form fields', () => {
    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('mock-input-name')).toBeInTheDocument();
    expect(screen.getAllByTestId('mock-date-picker')).toHaveLength(2);
    expect(screen.getByTestId('mock-input-location')).toBeInTheDocument();
  });

  it('shows submit button when requireSignIn is false (Create Event)', () => {
    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={false}
      />
    );

    const submitBtn = screen.getByRole('button', { name: 'Create Event' });
    expect(submitBtn).toBeInTheDocument();
  });

  it('renders correct button text when editing (Update Event)', () => {
    render(
      <EventForm
        defaultValues={defaultValues as any}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={false}
        isEditing={true}
      />
    );

    const updateBtn = screen.getByRole('button', { name: 'Update Event' });
    expect(updateBtn).toBeInTheDocument();
  });

  it('renders virtual venue branch (location input only, no map URL)', () => {
    const virtValues = { ...defaultValues, venueType: 'VIRTUAL' } as any;
    render(
      <EventForm
        defaultValues={virtValues}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('mock-input-location')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-input-locationMapUrl')).not.toBeInTheDocument();
  });

  it('renders map URL input and icon span for physical venue', () => {
    const physValues = { ...defaultValues, venueType: 'PHYSICAL' } as any;
    render(
      <EventForm
        defaultValues={physValues}
        onSubmit={vi.fn()}
        setPersistentValue={vi.fn()}
        requireSignIn={false}
        isLoading={false}
      />
    );

    expect(screen.getByTestId('mock-input-location')).toBeInTheDocument();
    expect(screen.getByTestId('mock-input-locationMapUrl')).toBeInTheDocument();
  });
});
