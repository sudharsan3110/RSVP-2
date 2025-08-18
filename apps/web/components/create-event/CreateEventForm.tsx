'use client';

import { useCreateEvent } from '@/lib/react-query/event';
import { useCurrentUser } from '@/lib/react-query/auth';
import { CreateEventFormType, CreateEventSubmissionType } from '@/lib/zod/event';
import { VenueType } from '@/types/events';
import { combineDateAndTime } from '@/utils/time';
import { useEffect, useMemo, useState } from 'react';
import { Separator } from '../ui/separator';
import EventForm from './EventForm';
import { usePersistentState } from '@/hooks/useLocalStorage';
import { FORM_CACHE_KEY, EXPIRY_MINUTES } from '@/utils/constants';

function getAllowedDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

const CreateEventForm = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultValues = useMemo<CreateEventFormType>(() => {
    const allowedDate = getAllowedDate();
    return {
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
  }, []);
  const { data: user } = useCurrentUser();
  const { mutate } = useCreateEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [value, setPersistentValue] = usePersistentState<CreateEventFormType>(
    FORM_CACHE_KEY,
    defaultValues,
    EXPIRY_MINUTES
  );
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

  if (!mounted) return null;
  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm
        defaultValues={value}
        isLoading={isLoading}
        onSubmit={onSubmit}
        requireSignIn={!user}
        setPersistentValue={setPersistentValue}
      />
    </>
  );
};

export default CreateEventForm;
