'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createEventFormSchema, CreateEventFormType, EventFromProps } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { capacityOptions, evenTimeOptions } from '@/utils/constants';
import { BuildingOfficeIcon, LinkIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock1, Link, LoaderCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FormCombobox from '../common/form/FormCombobox';
import FormDatePicker from '../common/form/FormDatePicker';
import FormInput from '../common/form/FormInput';
import FormGroupSelect from '../common/form/FormSelect';
import FormSwitch from '../common/form/FormSwitch';
import FormImageUpload from '../common/form/FormUploadImage';
import Tiptap from '../ui/tiptap';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import EventPreview from './EventPreview';
import FormSelectInput from '../common/form/FormSelectInput';
import SigninDialog from '../auth/SigninDialog';
import { useEffect, useState } from 'react';
const EventForm = ({
  defaultValues,
  isEditing = false,
  isLoading,
  onSubmit,
  requireSignIn,
  setPersistentValue,
  eventCategoryOptions,
}: EventFromProps) => {
  const allowedDate = new Date();
  allowedDate.setHours(0, 0, 0, 0);
  const form = useForm<CreateEventFormType>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });
  const [submitted, setSubmitted] = useState(false);
  const buttonText = isEditing ? 'Update Event' : 'Create Event';
  const {
    control,
    watch,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid, isDirty },
  } = form;
  useEffect(() => {
    const subscription = watch((value) => {
      setPersistentValue?.(value as CreateEventFormType);
    });
    return () => subscription.unsubscribe();
  }, [watch, setPersistentValue]);

  const image = watch('eventImageUrl');

  useEffect(() => {
    const subscription = watch((values, { name }) => {
      if ((name === 'fromTime' || name === 'fromDate') && values.fromDate && values.fromTime) {
        const [hours, minutes] = values.fromTime.split(':').map(Number);
        const endHour = hours + 1;

        const normalizedEndHour = endHour % 24;
        const endTime = `${normalizedEndHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        setValue('toTime', endTime);

        if (endHour >= 24) {
          const nextDay = new Date(values.fromDate);
          nextDay.setDate(nextDay.getDate() + 1);
          setValue('toDate', nextDay);
        } else {
          setValue('toDate', values.fromDate);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isButtonDisabled = isEditing ? !isDirty || isLoading : isLoading || submitted;
  const venueType = watch('venueType');

  const handleFormSubmit = (data: CreateEventFormType) => {
    setSubmitted(true);
    onSubmit(data);
    reset(data);
  };

  return (
    <Form {...form}>
      <section className="flex items-start justify-between gap-20">
        <form
          onSubmit={
            requireSignIn
              ? (e) => {
                  e.preventDefault();
                }
              : handleSubmit(handleFormSubmit)
          }
          className="flex max-w-[585px] grow flex-col gap-[1.125rem]"
        >
          <FormImageUpload
            control={control}
            name="eventImageUrl"
            label="Event Image"
            labelClassName={image ? 'lg:hidden' : ''}
          />
          <FormInput label="Event Name" name="name" control={control} isRequired />
          <FormCombobox
            control={control}
            label="Category"
            name="category"
            placeholder="Select a category"
            options={eventCategoryOptions || []}
          />
          <div className="flex max-w-96 items-end gap-3.5">
            <FormGroupSelect
              control={control}
              label="From"
              name="fromTime"
              defaultValue="17:00"
              options={evenTimeOptions}
            />
            <FormDatePicker
              control={control}
              name="fromDate"
              iconClassName="opacity-100"
              disabled={(date) => {
                return isEditing ? date < defaultValues.fromDate : date < allowedDate;
              }}
            />
          </div>
          {errors.fromDateTime && (
            <p className="text-sm font-medium text-destructive">{errors.fromDateTime.message}</p>
          )}
          <div className="flex max-w-96 items-end gap-3.5">
            <FormGroupSelect
              control={control}
              label="To"
              name="toTime"
              defaultValue="18:00"
              options={evenTimeOptions}
            />
            <FormDatePicker
              control={control}
              name="toDate"
              iconClassName="opacity-100"
              initialFocus={true}
              disabled={(date) => date < getValues('fromDate')}
            />
          </div>
          {errors.toDateTime && (
            <p className="text-sm font-medium text-destructive">{errors.toDateTime.message}</p>
          )}
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Tiptap
                  description={field.value ?? ''}
                  limit={300}
                  onChange={(richtext, plaintext) => {
                    field.onChange(richtext);
                    setValue('plaintextDescription', plaintext);
                  }}
                />
              </FormItem>
            )}
          />
          <div>
            <FormField
              control={control}
              name="venueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white" isRequired>
                    Location
                    <FormMessage />
                  </FormLabel>
                  <ToggleGroup
                    size={'sm'}
                    type="single"
                    defaultValue="physical"
                    value={field.value ?? ''}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    className="flex-wrap justify-start gap-3 py-2"
                  >
                    <ToggleGroupItem
                      value={VenueType.Physical}
                      aria-label="Toggle physical"
                      className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      <BuildingOfficeIcon className="size-4" />
                      Venue
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={VenueType.Virtual}
                      aria-label="Toggle virtual"
                      className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      <LinkIcon className="size-4" />
                      Online
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value={VenueType.Later}
                      aria-label="Toggle decideLater"
                      className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      <Clock1 className="size-4" />
                      Decide Later
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            {venueType !== VenueType.Later && (
              <FormInput
                name="location"
                control={control}
                placeholder={
                  venueType === VenueType.Physical ? 'One Line Address Of Venue' : 'Meeting Link'
                }
                className="mt-2"
                isRequired
              />
            )}
            {venueType == VenueType.Physical && (
              <FormInput
                name="locationMapUrl"
                control={control}
                placeholder="Map link To Venue"
                className="mt-2 [&_input]:rounded-l-none"
              >
                <span className="flex items-center justify-center rounded-l-[6px] bg-dark-500 px-2.5 py-2 whitespace-nowrap">
                  <Link className="w-4 h-4" />
                </span>
              </FormInput>
            )}
          </div>
          <FormSwitch
            control={control}
            name="hostPermissionRequired"
            className="!mt-1 data-[state=checked]:bg-[linear-gradient(188deg,#AC6AFF_53.34%,#DF7364_116.65%)]"
            thumbClassName="bg-white"
            containerClassName="flex flex-row justify-between items-start gap-3"
            label="Required Approval"
            description="Needs host permission to join event"
          />
          <FormSwitch
            control={control}
            name="discoverable"
            className="!mt-1 data-[state=checked]:bg-[linear-gradient(188deg,#AC6AFF_53.34%,#DF7364_116.65%)]"
            thumbClassName="bg-white"
            containerClassName="flex flex-row justify-between items-start gap-3"
            label="Public Event"
            description="Event will be displayed on Discover page."
          />
          <FormSelectInput
            control={control}
            label="Capacity"
            name="capacity"
            options={capacityOptions}
            placeholder="Select or enter Capacity"
            defaultValue={20}
            allowCustomInput={true}
            ariaLabel="Select Capacity"
            className="w-full"
            emptyMessage="No options found"
            disabled={false}
          />

          <Drawer>
            <DrawerTrigger asChild className="lg:hidden">
              <Button className="h-[44px] px-4 text-white" variant="tertiary">
                Preview
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[80vh] bg-[linear-gradient(162.44deg,#5162FF_0%,#413DEB_100%)] px-6 pb-[28px] lg:hidden">
              <EventPreview className="overflow-y-scroll" />
            </DrawerContent>
          </Drawer>
          {requireSignIn ? (
            <SigninDialog variant="signin">
              <Button
                type="button"
                disabled={isButtonDisabled}
                className="m mt-2 min-h-11 w-full rounded-[1.25rem] text-base font-semibold text-white"
              >
                {isLoading ? <LoaderCircle className="animate-spin" /> : <>{buttonText}</>}
              </Button>
            </SigninDialog>
          ) : (
            <Button
              type="submit"
              disabled={isButtonDisabled}
              className="m mt-2 min-h-11 w-full rounded-[1.25rem] text-base font-semibold text-white"
            >
              {isLoading ? <LoaderCircle className="animate-spin" /> : <>{buttonText}</>}
            </Button>
          )}
        </form>
        <EventPreview className="sticky top-28 hidden w-full max-w-[424px] rounded-[1.25rem] bg-[linear-gradient(162.44deg,#5162FF_0%,#413DEB_100%)] px-6 py-7 lg:block" />
      </section>
    </Form>
  );
};

export default EventForm;
