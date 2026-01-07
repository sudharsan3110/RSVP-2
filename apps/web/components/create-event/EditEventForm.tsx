'use client';

import { UpdateEventSubmissionType } from '@/lib/axios/event-API';
import { useGetEventById, useUpdateEvent, useGetCategoryList } from '@/lib/react-query/event';
import { CreateEventFormType } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import { formatDate } from '@/utils/formatDate';
import EventLimitDialog from './EventLimitDialog';
import type { AxiosError } from 'axios';
import { handleEventLimitError } from '@/lib/utils';
import type { LimitErrorResponse } from '@/lib/utils';

const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);

const EditEventForm = () => {
  const eventId = useParams().id as string;
  const { data, isLoading } = useGetEventById(eventId);
  const { mutate, isPending } = useUpdateEvent();
  const [alertOpen, setAlertOpen] = useState(false);
  const [formPayload, setFormPayload] = useState<CreateEventFormType | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const { data: categories } = useGetCategoryList();

  async function onSubmit(formPayload: CreateEventFormType) {
    const {
      name,
      category,
      description,
      plaintextDescription,
      eventImageUrl,
      venueType,
      locationMapUrl,
      hostPermissionRequired,
      discoverable,
      capacity,
      location,
      fromTime,
      fromDate,
      toTime,
      toDate,
    } = formPayload;

    if (
      alertOpen == false &&
      data?.event?.hostPermissionRequired === true &&
      hostPermissionRequired === false
    ) {
      setAlertOpen(true);
      setFormPayload(formPayload);
      return;
    }

    const submissionData: UpdateEventSubmissionType = {
      id: eventId,
      name,
      category,
      richtextDescription: description,
      plaintextDescription,
      eventImageUrl: eventImageUrl ?? '',
      venueType,
      venueAddress: venueType === VenueType.Physical ? location : undefined,
      venueUrl:
        venueType === VenueType.Virtual
          ? location
          : venueType === VenueType.Physical
            ? locationMapUrl
            : undefined,
      hostPermissionRequired,
      discoverable,
      capacity,
      startTime: combineDateAndTime(fromDate, fromTime),
      endTime: combineDateAndTime(toDate, toTime),
    };

    mutate(submissionData, {
      onError: (error: AxiosError<LimitErrorResponse>) => {
        handleEventLimitError(error, setLimitMessage);
      },
    });
  }

  const event = data?.event;

  const defaultValues: CreateEventFormType = {
    name: event?.name ?? '',
    category: event?.category?.id ?? '',
    description: event?.description ?? '',
    plaintextDescription: '',
    venueType: event?.venueType ?? VenueType.Physical,
    location: event?.venueAddress ?? event?.venueUrl ?? '',
    locationMapUrl: event?.venueUrl ?? undefined,
    hostPermissionRequired: event?.hostPermissionRequired ?? false,
    discoverable: event?.discoverable ?? false,
    fromTime: event?.startTime ? formatDate(event.startTime, { time24: true }) : '',
    fromDate: event?.startTime ?? allowedDate,
    toTime: event?.endTime ? formatDate(event.endTime, { time24: true }) : '',
    toDate: event?.endTime ?? allowedDate,
    capacity: event?.capacity ?? 0,
    eventImageUrl: event?.eventImageUrl ?? '',
  };

  if (isLoading) {
    return <p className="flex items-center justify-center h-full w-full">Loading...</p>;
  }

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm
        isEditing
        defaultValues={defaultValues}
        isLoading={isPending}
        onSubmit={onSubmit}
        eventCategoryOptions={categories}
      />
      <ChangeVisibility
        open={alertOpen}
        onConfirm={() => {
          if (formPayload) {
            onSubmit(formPayload);
          }
          setAlertOpen(false);
        }}
        onCancel={() => {
          setAlertOpen(false);
        }}
      />
      {limitMessage && (
        <EventLimitDialog
          open={true}
          onOpenChange={(open) => !open && setLimitMessage(null)}
          message={limitMessage}
        />
      )}
    </>
  );
};

export default EditEventForm;

const ChangeVisibility = ({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change Visibility</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Removing &quot;Host Permission Required&quot; will move all waiting attendees to going.
          Are you sure you want to proceed?
        </AlertDialogDescription>
        <div className="flex justify-end gap-2 mt-6">
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
