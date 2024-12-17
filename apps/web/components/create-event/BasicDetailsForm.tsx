'use client';

import FormInput from '../common/form/FormInput';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import FormGroupSelect from '../common/form/FormSelect';
import FormDatePicker from '../common/form/FormDatePicker';
import { eventCapacityOptions, eventCategoryOptions, evenTimeOptions } from '@/utils/constants';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Separator } from '../ui/separator';
import EventPreview from './EventPreview';
import { BuildingOfficeIcon, LinkIcon } from '@heroicons/react/16/solid';
import FormSwitch from '../common/form/FormSwitch';
import Tiptap from '../ui/tiptap';
import FormCombobox from '../common/form/FormCombobox';
import { createEventFormSchema, CreateEventFormType } from '@/lib/zod/event';

const BasicDetailsForm = () => {
  const form = useForm<CreateEventFormType>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      eventname: '',
      location: '',
      locationType: 'venue',
      requiresApproval: false,
      fromTime: '17:00',
      fromDate: new Date(),
      toTime: '20:00',
      toDate: new Date(),
    },
  });

  function onSubmit(values: CreateEventFormType) {
    console.log(values);
  }

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Manage your profile settings</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <h3 className="mb-8 font-semibold text-white">Basic Details</h3>
      <Form {...form}>
        <section className="flex items-start justify-between gap-20">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex max-w-[585px] grow flex-col gap-[1.125rem]"
          >
            <FormInput label="Event Name" name="eventname" control={form.control} />
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
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                name="locationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Location</FormLabel>
                    <ToggleGroup
                      size={'sm'}
                      type="single"
                      defaultValue="venue"
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                      className="justify-start gap-3 py-2"
                    >
                      <ToggleGroupItem
                        value="venue"
                        aria-label="Toggle venue"
                        className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        <BuildingOfficeIcon className="size-4" />
                        Venue
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="online"
                        aria-label="Toggle online"
                        className="h-6 items-center gap-1 rounded-[1.25rem] bg-gray-100 px-3 text-xs/[1.25rem] text-slate-800 data-[state=on]:bg-primary data-[state=on]:text-white"
                      >
                        <LinkIcon className="size-4" />
                        Online
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormInput
                name="location"
                control={form.control}
                placeholder={form.watch('locationType') === 'venue' ? 'Address' : 'Event Link'}
                className="mt-2"
              />
            </div>
            <section className="mb-3.5 mt-[18px]">
              <h3 className="mb-8 font-semibold text-white">Joining Details</h3>
              <FormSwitch
                control={form.control}
                name="requiresApproval"
                className="!mt-1 data-[state=checked]:bg-[linear-gradient(188deg,#AC6AFF_53.34%,#DF7364_116.65%)]"
                thumbClassName="bg-white"
                containerClassName="flex flex-col lg:flex-row justify-between lg:items-end gap-3"
                label="Required Approval"
                description="Needs host permission to join event"
              />
            </section>
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
                <DrawerHeader className="mb-2 pl-0">
                  <DrawerTitle className="text-left text-4xl text-white">
                    {form.watch('eventname') || '-'}
                  </DrawerTitle>
                  <DrawerDescription />
                </DrawerHeader>
                <EventPreview watch={form.watch} />
              </DrawerContent>
            </Drawer>
            <Button className="m mt-2 min-h-11 w-full rounded-[1.25rem] text-base font-semibold text-white">
              Create Event
            </Button>
          </form>
          <EventPreview
            watch={form.watch}
            className="sticky top-28 hidden w-full max-w-[424px] rounded-[1.25rem] bg-[linear-gradient(162.44deg,#5162FF_0%,#413DEB_100%)] px-6 pb-[28px] pt-8 lg:block"
          >
            <h2 className="mb-[86px] line-clamp-2 text-left text-4xl font-semibold text-white">
              {form.watch('eventname') || '-'}
            </h2>
          </EventPreview>
        </section>
      </Form>
    </>
  );
};

export default BasicDetailsForm;
