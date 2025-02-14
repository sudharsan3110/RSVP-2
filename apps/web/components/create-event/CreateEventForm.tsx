'use client';

import { useCreateEvent } from '@/lib/react-query/event';
import { fileFromUrl } from '@/lib/utils';
import { CreateEventFormType, CreateEventSubmissionType } from '@/lib/zod/event';
import { combineDateAndTime } from '@/utils/time';
import axios from 'axios';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';

const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);
allowedDate.setDate(allowedDate.getDate() + 1);

const defaultValues: CreateEventFormType = {
  name: '',
  category: '',
  description: '',
  venueType: 'physical',
  location: '',
  hostPermissionRequired: false,
  fromTime: '17:00',
  fromDate: allowedDate,
  toTime: '20:00',
  toDate: allowedDate,
  capacity: 20,
  eventImageId: {
    signedUrl: '',
    file: '',
    url: '',
  },
};

const CreateEventForm = () => {
  const { mutate, isPending } = useCreateEvent();

  async function onSubmit(data: CreateEventFormType) {
    const {
      name,
      category,
      description,
      eventImageId,
      venueType,
      hostPermissionRequired,
      capacity,
      location,
      fromTime,
      fromDate,
      toTime,
      toDate,
    } = data;

    const submissionData: CreateEventSubmissionType = {
      name,
      category,
      description,
      eventImageId: eventImageId.url ?? '',
      venueType,
      venueAddress: venueType === 'physical' ? location : undefined,
      venueUrl: venueType === 'virtual' ? location : undefined,
      hostPermissionRequired,
      capacity,
      startTime: combineDateAndTime(fromDate, fromTime),
      endTime: combineDateAndTime(toDate, toTime),
      eventDate: fromDate,
    };

    if (eventImageId.file && eventImageId.signedUrl) {
      const imageFile = await fileFromUrl(eventImageId.file, 'event-image');
      await axios.put(eventImageId.signedUrl, imageFile);
      mutate(submissionData);
    }
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

export default CreateEventForm;
