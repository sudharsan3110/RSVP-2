'use client';

import { useCurrentUser } from '@/lib/react-query/auth';
import {
  useCreateAttendee,
  useGetAttendeeTicketDetails,
  useSoftDeleteAttendee,
} from '@/lib/react-query/event';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';
import { Button } from '../ui/button';
import { LoaderCircle } from 'lucide-react';

type GetTicketsButtonProps = {
  eventId: string;
  isPermissionRequired: boolean;
  creatorId: string;
};

const GetTicketsButton = ({ eventId, isPermissionRequired, creatorId }: GetTicketsButtonProps) => {
  const { data: userData, isLoading: userDataLoading } = useCurrentUser();
  const { mutate, isSuccess, isPending: createAttendeeLoading } = useCreateAttendee();
  const { isSuccess: attendeeDataSuccess, isLoading } = useGetAttendeeTicketDetails(eventId);
  const {
    mutate: cancelRegistration,
    isSuccess: cancelRegistrationSuccess,
    reset: resetCancelRegistration,
    isPending: isCancelling,
  } = useSoftDeleteAttendee();

  const handleGetTickets = async () => {
    resetCancelRegistration();
    mutate(eventId);
  };

  const handleCancelRegistration = () => {
    cancelRegistration(eventId);
  };

  if (isLoading && userDataLoading) {
    return (
      <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2" disabled>
        Loading...
      </Button>
    );
  }

  if (userData?.id === creatorId) {
    return (
      <Link href={`/events/${eventId}/manage`} className="w-full">
        <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2 text-center">
          Manage Events
        </Button>
      </Link>
    );
  }

  if ((isSuccess || attendeeDataSuccess) && !cancelRegistrationSuccess) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Link href={`/ticket/${eventId}`}>
          <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2">
            Show Tickets
          </Button>
        </Link>
        <Button
          variant={isCancelling ? 'subtle' : 'destructive'}
          className="w-full rounded-full px-4 py-2"
          onClick={handleCancelRegistration}
          disabled={isCancelling}
        >
          {isCancelling ? <LoaderCircle className="animate-spin" /> : <>Cancel Registration</>}
        </Button>
      </div>
    );
  }

  if (!userData?.id) {
    return (
      <SigninDialog variant="signin">
        <Button className="mt-4 w-full rounded-full px-4 py-2">Get Tickets</Button>
      </SigninDialog>
    );
  }

  if (isPermissionRequired) {
    return (
      <Button className="mt-4 w-full cursor-auto rounded-full px-4 py-2" variant="outline">
        Waiting for Approval
      </Button>
    );
  }

  return (
    <Button
      variant={createAttendeeLoading ? 'subtle' : 'default'}
      className="mt-4 w-full rounded-full px-4 py-2"
      onClick={handleGetTickets}
      disabled={createAttendeeLoading}
    >
      {createAttendeeLoading ? <LoaderCircle className="animate-spin" /> : <>Get Tickets</>}
    </Button>
  );
};

export default GetTicketsButton;
