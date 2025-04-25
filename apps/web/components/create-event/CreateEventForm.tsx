'use client';

import { useCreateEvent } from '@/lib/react-query/event';
import { fileFromUrl } from '@/lib/utils';
import { CreateEventFormType, CreateEventSubmissionType } from '@/lib/zod/event';
import { combineDateAndTime } from '@/utils/time';
import axios from 'axios';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import { useState } from 'react';
import { VenueType } from '@/types/events';
const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);
allowedDate.setDate(allowedDate.getDate() + 1);

const defaultValues: CreateEventFormType = {
  name: '',
  category: '',
  description: '',
  venueType: VenueType.Physical,
  location: '',
  hostPermissionRequired: false,
  fromTime: '17:00',
  fromDate: allowedDate,
  toTime: '20:00',
  toDate: allowedDate,
  capacity: 20,
  eventImageUrl: {
    signedUrl: '',
    file: '',
    url: '',
  },
};

const CreateEventForm = () => {
  const { mutate } = useCreateEvent();
  const [isLoading, setIsLoading] = useState(false);
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

    const submissionData: CreateEventSubmissionType = {
      name,
      category,
      description,
      eventImageUrl:data.eventImageUrl.url ?? '',
      venueType,
      venueAddress: venueType === VenueType.Physical ? location : undefined,
      venueUrl: venueType === VenueType.Virtual ? location : undefined,
      hostPermissionRequired,
      capacity,
      startTime: combineDateAndTime(fromDate, fromTime),
      endTime: combineDateAndTime(toDate, toTime),
      eventDate: fromDate,
    };

    if (data.eventImageUrl.file && data.eventImageUrl.signedUrl) {
      setIsLoading(true)
      const imageFile = await fileFromUrl(data.eventImageUrl.file, 'event-image');
      await axios.put(data.eventImageUrl.signedUrl, imageFile);
      mutate(submissionData);
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm defaultValues={defaultValues} isLoading={isLoading} onSubmit={onSubmit} />
    </>
  );
};

export default CreateEventForm;
