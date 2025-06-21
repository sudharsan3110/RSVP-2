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
import { Cohost } from '@/types/cohost';
import { isCurrentUserCohost } from '@/utils/event';
import { LoaderCircle } from 'lucide-react';

type GetTicketsButtonProps = {
  cohosts?: Cohost[];
  eventId: string;
  isPermissionRequired: boolean;
  creatorId: string;
  remainingSeats: number;
  eventSlug: string;
};

const GetTicketsButton = ({
  cohosts,
  eventId,
  isPermissionRequired,
  creatorId,
  remainingSeats,
  eventSlug,
}: GetTicketsButtonProps) => {
  const { data: userData, isLoading: userDataLoading } = useCurrentUser();
  const { mutate, isSuccess, isPending: createAttendeeLoading } = useCreateAttendee();
  const {
    isSuccess: attendeeDataSuccess,
    isLoading: isAttendeeLoading,
    data: attendeeData,
  } = useGetAttendeeTicketDetails(eventId);
  const {
    mutate: cancelRegistration,
    isSuccess: cancelRegistrationSuccess,
    reset: resetCancelRegistration,
    isPending: isCancelling,
  } = useSoftDeleteAttendee();

  const isCohost = isCurrentUserCohost(userData, cohosts);

  const handleGetTickets = async () => {
    resetCancelRegistration();
    mutate(eventId);
  };

  const handleCancelRegistration = () => {
    cancelRegistration(eventId);
  };

  if (remainingSeats <= 0) {
    return (
      <Button className="mt-4 w-full cursor-auto rounded-full px-4 py-2" variant="outline">
        No Tickets Remaining
      </Button>
    );
  }

  if (userDataLoading || isAttendeeLoading) {
    return (
      <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2" disabled>
        Loading...
      </Button>
    );
  }

  if (!userData?.id) {
    return (
      <SigninDialog variant="signin">
        <Button className="mt-4 w-full rounded-full px-4 py-2">Get Tickets</Button>
      </SigninDialog>
    );
  }

  if (userData.id === creatorId || isCohost) {
    return (
      <Link href={`/events/${eventId}/manage`} className="w-full">
        <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2 text-center">
          Manage Events
        </Button>
      </Link>
    );
  }

  if (
    (isSuccess || attendeeDataSuccess) &&
    !cancelRegistrationSuccess &&
    attendeeData?.allowedStatus
  ) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Link href={`${eventSlug}/communication`}>
          <Button className="mt-4 w-full rounded-full px-4 py-2">Updates</Button>
        </Link>
        <Link href={`/ticket/${eventId}`}>
          <Button variant="subtle" className="w-full rounded-full px-4 py-2">
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

  if (
    (isSuccess || attendeeDataSuccess) &&
    !cancelRegistrationSuccess &&
    !attendeeData?.allowedStatus
  ) {
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
