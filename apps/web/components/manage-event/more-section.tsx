'use client';

import {
  useCancelEventMutation,
  useDeleteEventMutation,
  useEditEventSlug,
} from '@/lib/react-query/event';
import { useForm } from 'react-hook-form';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import { Separator } from '../ui/separator';
import { Event } from '@/types/Events';

const MoreSection = ({ event, slug }: { event: Event; slug: string }) => {
  const { id: eventId, isCancelled } = event;
  const { mutate, isPending } = useEditEventSlug();
  const { mutate: delMutate, isPending: deleteLoading } = useDeleteEventMutation();
  const { mutate: cancelMutate, isPending: cancelLoading } = useCancelEventMutation();

  const form = useForm({
    defaultValues: { slug },
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  const onSubmit = (data: { slug: string }) => {
    mutate({ eventId, slug: data.slug }, { onSuccess: () => reset({ slug: data.slug }) });
  };

  return (
    <section className="space-y-8">
      <section className="space-y-6 md:w-1/2">
        <div className="mt-5">
          <h3 className="mb-1 text-base">Event Page</h3>
          <p className="text-sm">
            When you choose a new URL, the current one will no longer work. Do not update your URL
            if you have already shared this
          </p>
        </div>

        <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput control={form.control} name="slug" label="Public URL">
            <span className="block rounded-l-[6px] bg-dark-500 px-2.5 py-2">https://rsvp.com/</span>
          </FormInput>
          <div className="mt-4 flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              className="rounded-[6px] border-dark-500"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button
              variant="default"
              className="rounded-[6px]"
              type="submit"
              disabled={isPending || !isDirty}
            >
              Update
            </Button>
          </div>
        </FormProvider>
      </section>

      <Separator className="my-11 bg-separator" />
      {isCancelled ? (
        <section className="space-y-6 md:w-1/2">
          <h3>Event Cancelled</h3>
          <p className="text-sm">
            This event has been cancelled. Attendees have been notified of the cancellation.
          </p>
        </section>
      ) : (
        <section className="space-y-6 md:w-1/2">
          <h3>Cancel Event</h3>

          <p className="text-sm">
            Canceling this event cannot be undone. All attendees will be notified of the
            cancellation. However, the host will still have access to the event details and related
            information.
          </p>

          <Button
            variant="destructive"
            className="rounded-[6px]"
            onClick={() => cancelMutate(eventId)}
            disabled={cancelLoading}
          >
            Cancel Event
          </Button>
        </section>
      )}
      <Separator className="my-11 bg-separator" />

      <section className="space-y-6 md:w-1/2">
        <h3>Delete Event</h3>

        <p className="text-sm">
          Deleting this event will remove all event data and associated metadata. The host will no
          longer have access to any information related to this event. This action cannot be undone.
        </p>

        <Button
          variant="destructive"
          className="rounded-[6px] opacity-50 hover:opacity-100"
          onClick={() => delMutate(eventId)}
          disabled={deleteLoading}
        >
          Delete My Event
        </Button>
      </section>
    </section>
  );
};

export default MoreSection;
