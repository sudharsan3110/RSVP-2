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
import { Event } from '@/types/events';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import ConfirmationAlert from './confirmationAlert';

const MoreSection = ({ event, slug }: { event: Event; slug: string }) => {
  const { id: eventId, isActive } = event;
  const { mutate, isPending } = useEditEventSlug();
  const { mutate: delMutate, isPending: deleteLoading } = useDeleteEventMutation();
  const { mutate: cancelMutate, isPending: cancelLoading } = useCancelEventMutation();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm({
    defaultValues: { slug },
  });

  const {
    reset,
    formState: { isDirty },
  } = form;

  const onSubmit = (data: { slug: string }) => {
    mutate({ eventId, slug: data.slug.trim() }, { onSuccess: () => reset({ slug: data.slug }) });
  };

  const handleCancelEvent = () => {
    cancelMutate(eventId);
    setShowCancelDialog(false);
  };

  const handleDeleteEvent = () => {
    delMutate(eventId);
    setShowDeleteDialog(false);
  };

  return (
    <section className="space-y-8">
      <section className="space-y-6 md:w-1/2">
        <div className="mt-5">
          <h3 className="mb-1 text-base font-semibold text-white">Event Page</h3>
          <p className="text-sm text-secondary">
            When you choose a new URL, the current one will no longer work. Do not update your URL
            if you have already shared this
          </p>
        </div>

        <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
          <FormInput control={form.control} name="slug" label="Public URL">
            <span className="block rounded-l-[6px] bg-dark-500 px-2.5 py-2 whitespace-nowrap">
              https://rsvp.com/
            </span>
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
      {!isActive ? (
        <section className="space-y-1 md:w-1/2">
          <h3 className="font-semibold text-white">Event Cancelled</h3>
          <p className="text-sm text-secondary">
            This event has been cancelled. Attendees have been notified of the cancellation.
          </p>
        </section>
      ) : (
        <section className="md:w-1/2">
          <h3 className="font-semibold text-white">Cancel Event</h3>

          <p className="mt-1 mb-6  text-sm text-secondary">
            Canceling this event cannot be undone. All attendees will be notified of the
            cancellation. However, the host will still have access to the event details and related
            information.
          </p>

          <Button
            variant={cancelLoading ? 'subtle' : 'destructive'}
            className="rounded-[6px]"
            onClick={() => setShowCancelDialog(true)}
            disabled={cancelLoading}
          >
            {cancelLoading ? <LoaderCircle className="animate-spin" /> : <>Cancel</>}
          </Button>
          <ConfirmationAlert
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
            onConfirm={handleCancelEvent}
            isLoading={cancelLoading}
            title="Cancel"
            description={`Are you sure you want to cancel this event? To confirm, please type the event name: "${event.name}".`}
            confirmationText={event.name}
            buttonText="Cancel"
          />
        </section>
      )}
      <Separator className="my-11 bg-separator" />

      <section className="md:w-1/2">
        <h3 className="font-semibold text-white">Archive Event</h3>

        <p className="mt-1 mb-6 text-sm text-secondary">
          Archiving this event will remove all event data and associated metadata. The host will no
          longer have access to any information related to this event. This action cannot be undone.
        </p>

        <Button
          variant={deleteLoading ? 'subtle' : 'destructive'}
          className="rounded-[6px] opacity-50 hover:opacity-100"
          onClick={() => setShowDeleteDialog(true)}
          disabled={deleteLoading}
        >
          {deleteLoading ? <LoaderCircle className="animate-spin" /> : <>Archive</>}
        </Button>
        <ConfirmationAlert
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDeleteEvent}
          isLoading={deleteLoading}
          title="Archive"
          description={`Are you sure you want to archive this event? To confirm, please type the event name: "${event.name}".`}
          confirmationText={event.name}
          buttonText="Archive"
        />
      </section>
    </section>
  );
};

export default MoreSection;
