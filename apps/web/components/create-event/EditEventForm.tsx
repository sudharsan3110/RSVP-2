'use client';

import { UpdateEventSubmissionType } from '@/lib/axios/event-API';
import { useGetEventById, useUpdateEvent } from '@/lib/react-query/event';
import { fileFromUrl } from '@/lib/utils';
import { CreateEventFormType } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import axios from 'axios';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { useState } from 'react';
const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);
allowedDate.setDate(allowedDate.getDate() + 1);

const EditEventForm = () => {
  const eventId = useParams().id as string;
  const { data, isLoading } = useGetEventById(eventId);
  const { mutate, isPending } = useUpdateEvent();
  const [alertOpen, setAlertOpen] = useState(false);
  const [formPayload, setFormPayload] = useState<CreateEventFormType | null>(null);

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
      eventImageUrl: eventImageUrl.url ?? '',
      venueType,
      venueAddress: venueType === VenueType.Physical ? location : undefined,
      venueUrl:
        venueType === VenueType.Virtual
          ? location
          : venueType === VenueType.Physical
            ? locationMapUrl
            : undefined,
      hostPermissionRequired,
      capacity,
      startTime: combineDateAndTime(fromDate, fromTime),
      endTime: combineDateAndTime(toDate, toTime),
      eventDate: new Date(
        Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
      ),
    };

    // Upload image if it's a new image
    if (eventImageUrl.file && eventImageUrl.signedUrl) {
      const imageFile = await fileFromUrl(eventImageUrl.file, 'event-image');
      try {
        await axios.put(eventImageUrl.signedUrl, imageFile, {
          headers: {
            'Content-Type': imageFile.type,
          },
        });
      } catch (error) {
        console.error('Error uploading image', error);
      }
    }

    // If the image is not changed, we don't need to upload it again
    else if (eventImageUrl.file) {
      submissionData.eventImageUrl = eventImageUrl.file;
    }
    mutate(submissionData);
  }

  const event = data?.event;

  const defaultValues: CreateEventFormType = {
    name: event?.name ?? '',
    category: event?.category ?? '',
    description: event?.description ?? '',
    venueType: event?.venueType ?? VenueType.Physical,
    location: event?.venueAddress ?? event?.venueUrl ?? '',
    locationMapUrl: event?.venueUrl ?? '',
    hostPermissionRequired: event?.hostPermissionRequired ?? false,
    fromTime: dayjs(event?.startTime).format('HH:mm'),
    fromDate: event?.eventDate ?? allowedDate,
    toTime: dayjs(event?.endTime).format('HH:mm'),
    toDate: event?.endTime ?? allowedDate,
    capacity: event?.capacity ?? 0,
    eventImageUrl: {
      signedUrl: '',
      file: event?.eventImageUrl ?? '',
      url: '',
      type: '',
    },
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
