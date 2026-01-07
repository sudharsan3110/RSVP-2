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
import EventLimitDialog from './EventLimitDialog';
import type { AxiosError } from 'axios';
import { handleEventLimitError } from '@/lib/utils';
import type { LimitErrorResponse } from '@/lib/utils';
import { useGetCategoryList } from '@/lib/react-query/event';

function getAllowedDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

const CreateEventForm = () => {
  const [mounted, setMounted] = useState(false);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);

  const { data: user } = useCurrentUser();
  const { mutate, isPending } = useCreateEvent();
  const { data: categories } = useGetCategoryList();

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
      discoverable: true,
      fromTime: '17:00',
      fromDate: allowedDate,
      toTime: '18:00',
      toDate: allowedDate,
      capacity: 20,
      eventImageUrl: '',
    };
  }, []);

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
      discoverable,
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

  if (!mounted) return null;

  return (
    <>
      <div className="mt-1 flex items-baseline justify-between">
        <p className="font-medium text-secondary">Fill in the form below to create a new event</p>
      </div>
      <Separator className="my-9 bg-separator" />
      <EventForm
        defaultValues={value}
        isLoading={isPending}
        onSubmit={onSubmit}
        requireSignIn={!user}
        setPersistentValue={setPersistentValue}
        eventCategoryOptions={categories}
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

export default CreateEventForm;
