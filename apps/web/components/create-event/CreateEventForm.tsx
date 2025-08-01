'use client';

import { useCreateEvent } from '@/lib/react-query/event';
import { useCurrentUser } from '@/lib/react-query/auth';
import { CreateEventFormType, CreateEventSubmissionType } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import { useState } from 'react';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const allowedDate = new Date();
allowedDate.setHours(0, 0, 0, 0);
allowedDate.setDate(allowedDate.getDate() + 1);

const defaultValues: CreateEventFormType = {
  name: '',
  category: '',
  description: '',
  plaintextDescription: '',
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
    type: '',
  },
};

const CreateEventForm = () => {
  const { data: user } = useCurrentUser();
  const { mutate } = useCreateEvent();
  const [isLoading, setIsLoading] = useState(false);  
  const { hasLocalStorage, setFormData,setLocalStorage } = useLocalStorage({
    defaultValues,
  });

  
  async function onSubmit(data: CreateEventFormType) {
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
    } = data;

    const submissionData: CreateEventSubmissionType = {
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
    };

    mutate(submissionData);

  }

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm 
        defaultValues={defaultValues} 
        isLoading={isLoading} 
        onSubmit={onSubmit} 
        requireSignIn={!user}
        setLocalStorage={setLocalStorage}
        setFormData={setFormData}
        hasLocalStorage={hasLocalStorage}
      />
    </>
  );
};

export default CreateEventForm;
