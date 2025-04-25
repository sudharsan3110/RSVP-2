'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createEventFormSchema, CreateEventFormType } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { eventCategoryOptions, evenTimeOptions } from '@/utils/constants';
import { BuildingOfficeIcon, LinkIcon } from '@heroicons/react/16/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { Clock1 } from 'lucide-react';
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
type Props = {
  defaultValues: CreateEventFormType;
  isLoading: boolean;
  onSubmit: (data: CreateEventFormType) => void;
};

const EventForm = ({ defaultValues, isLoading, onSubmit }: Props) => {
  const allowedDate = new Date();
  allowedDate.setHours(0, 0, 0, 0);
  allowedDate.setDate(allowedDate.getDate() + 1);

  const form = useForm<CreateEventFormType>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: defaultValues,
  });

  const venueType = form.watch('venueType');

  return (
    <Form {...form}>
      <section className="flex items-start justify-between gap-20">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex max-w-[585px] grow flex-col gap-[1.125rem]"
        >
          <FormImageUpload
            control={form.control}
            name="eventImageUrl"
            className="md:hidden"
            label="Event Image"
          />
          <FormInput label="Event Name" name="name" control={form.control} />
          <FormCombobox
            control={form.control}
            label="Category"
            name="category"
            placeholder="Select a category"
            options={eventCategoryOptions}
          />
          <div className="flex max-w-96 items-end gap-3.5">
            <FormGroupSelect
              control={form.control}
              label="From"
              name="fromTime"
              defaultValue="17:00"
              options={evenTimeOptions}
            />
            <FormDatePicker
              control={form.control}
              name="fromDate"
              iconClassName="opacity-100"
              // disabled={(date) => date <= new Date(new Date().setHours(0, 0, 0, 0))}
              disabled={(date) => date < allowedDate}
            />
          </div>
          {form.formState.errors.fromDateTime && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.fromDateTime.message}
            </p>
          )}
          <div className="flex max-w-96 items-end gap-3.5">
            <FormGroupSelect
              control={form.control}
              label="To"
              name="toTime"
              defaultValue="20:00"
              options={evenTimeOptions}
            />
            <FormDatePicker
              control={form.control}
              name="toDate"
              iconClassName="opacity-100"
              initialFocus={true}
              disabled={(date) => date < form.getValues('fromDate')}
            />
          </div>
          {form.formState.errors.toDateTime && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.toDateTime.message}
            </p>
          )}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <Tiptap description={field.value} limit={300} onChange={field.onChange} />
              </FormItem>
            )}
          />
          <div>
            <FormField
              control={form.control}
              name="venueType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Location</FormLabel>
                  <ToggleGroup
                    size={'sm'}
                    type="single"
                    defaultValue="physical"
                    value={field.value}
                    onValueChange={(value) => {
                      if (value) field.onChange(value);
                    }}
                    className="flex-wrap justify-start gap-3 py-2"
                  >
                    <ToggleGroupItem
                      value="physical"
                      aria-label="Toggle physical"
                      className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      <BuildingOfficeIcon className="size-4" />
                      Venue
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="virtual"
                      aria-label="Toggle virtual"
                      className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                    >
                      <LinkIcon className="size-4" />
                      Online
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="later"
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
                control={form.control}
                placeholder={venueType === VenueType.Physical ? 'Address' : 'Event Link'}
                className="mt-2"
              />
            )}
          </div>
          <FormSwitch
            control={form.control}
            name="hostPermissionRequired"
            className="!mt-1 data-[state=checked]:bg-[linear-gradient(188deg,#AC6AFF_53.34%,#DF7364_116.65%)]"
            thumbClassName="bg-white"
            containerClassName="flex flex-col lg:flex-row justify-between lg:items-end gap-3"
            label="Required Approval"
            description="Needs host permission to join event"
          />
          <FormInput
            control={form.control}
            label="Capacity"
            name="capacity"
            type="number"
            inputClassName={`[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
          />
          <Drawer>
            <DrawerTrigger asChild className="lg:hidden">
              <Button className="h-[44px] px-4 text-white" variant="tertiary">
                Preview
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-[linear-gradient(162.44deg,#5162FF_0%,#413DEB_100%)] px-6 pb-[28px] lg:hidden">
              <EventPreview />
            </DrawerContent>
          </Drawer>
          {form.formState.errors.eventImageUrl && (
            <p className="hidden text-sm font-medium text-destructive lg:block">
              {form.formState.errors.eventImageUrl.message}
            </p>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="m mt-2 min-h-11 w-full rounded-[1.25rem] text-base font-semibold text-white"
          >
            {isLoading ? 'Saving...' : 'Save Event'}
          </Button>
        </form>
        <EventPreview className="sticky top-28 hidden w-full max-w-[424px] rounded-[1.25rem] bg-[linear-gradient(162.44deg,#5162FF_0%,#413DEB_100%)] px-6 pb-[28px] pt-8 lg:block" />
      </section>
    </Form>
  );
};

export default EventForm;
