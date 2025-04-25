'use client';

import { UpdateEventSubmissionType } from '@/lib/axios/event-API';
import { useGetEventById, useUpdateEvent } from '@/lib/react-query/event';
import { fileFromUrl } from '@/lib/utils';
import { CreateEventFormType } from '@/lib/zod/event';
import { combineDateAndTime } from '@/utils/time';
import axios from 'axios';
import dayjs from 'dayjs';
import { useParams } from 'next/navigation';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import { VenueType } from '@/types/events';
const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);
allowedDate.setDate(allowedDate.getDate() + 1);

const EditEventForm = () => {
  const eventId = useParams().id as string;
  const { data, isLoading } = useGetEventById(eventId);
  const { mutate, isPending } = useUpdateEvent();

  async function onSubmit(data: CreateEventFormType) {
    const {
      name,
      category,
      description,
      eventImageUrl,
      venueType,
      hostPermissionRequired,
      capacity,
      location,
      fromTime,
      fromDate,
      toTime,
      toDate,
    } = data;

    const submissionData: UpdateEventSubmissionType = {
      id: eventId,
      name,
      category,
      description,
      eventImageUrl: eventImageUrl.url ?? '',
      venueType,
      venueAddress: venueType === VenueType.Physical ? location : undefined,
      venueUrl: venueType === VenueType.Virtual ? location : undefined,
      hostPermissionRequired,
      capacity,
      startTime: combineDateAndTime(fromDate, fromTime),
      endTime: combineDateAndTime(toDate, toTime),
      eventDate: fromDate,
    };

    // Upload image if it's a new image
    if (eventImageUrl.file && eventImageUrl.signedUrl) {
      const imageFile = await fileFromUrl(eventImageUrl.file, 'event-image');
      try {
        await axios.put(eventImageUrl.signedUrl, imageFile);
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
    location: event?.venueAddress ?? '',
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
    },
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm defaultValues={defaultValues} isLoading={isPending} onSubmit={onSubmit} />
    </>
  );
};

export default EditEventForm;
