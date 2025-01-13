'use client';

import { Button } from '../ui/button';
import { useCreateAttendee, useGetAttendeeDetails } from '@/lib/react-query/event';
import SigninDialog from '../auth/SigninDialog';
import { useCurrentUser } from '@/lib/react-query/auth';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type GetTicketsButtonProps = {
  eventId: string;
};

const GetTicketsButton = ({ eventId }: GetTicketsButtonProps) => {
  const { data: userData, isLoading: userDataLoading } = useCurrentUser();
  const { mutate, isSuccess } = useCreateAttendee();
  const { mutate: getAttendeeData, isSuccess: attendeeDataSuccess } = useGetAttendeeDetails();
  const [loading, setLoading] = useState(true);

  const handleGetTickets = async () => {
    mutate(eventId);
  };

  useEffect(() => {
    if (!userData || !userData.data?.data?.id) return;
    getAttendeeData(
      { eventId, userId: userData.data.data.id },
      {
        onSettled: () => setLoading(false),
      }
    );
  }, [eventId, userData]);

  if (loading && userDataLoading) {
    return (
      <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2" disabled>
        Loading...
      </Button>
    );
  }

  if (isSuccess || attendeeDataSuccess) {
    return (
      <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2">
        <Link href={`/ticket/${eventId}`}>Show Tickets</Link>
      </Button>
    );
  }

  if (!userData?.data?.data) {
    return (
      <SigninDialog variant="signin">
        <Button className="mt-4 w-full rounded-full px-4 py-2">Get Tickets</Button>
      </SigninDialog>
    );
  }

  return (
    <Button className="mt-4 w-full rounded-full px-4 py-2" onClick={handleGetTickets}>
      Get Tickets
    </Button>
  );
};

export default GetTicketsButton;
