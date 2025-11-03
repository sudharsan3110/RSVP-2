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
import { checkIfUserIsNotCohost, isCurrentUserCohost } from '@/utils/event';
import { LoaderCircle, TicketCheck, MessageCircleMore, X } from 'lucide-react';
import { CalendarDropdown } from '../common/CalendarDropdown';

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

  const isCohost = isCurrentUserCohost(userData, cohosts ?? []);
  const isNotCohost = checkIfUserIsNotCohost(userData, cohosts ?? []);
  const {
    isSuccess: attendeeDataSuccess,
    isLoading: isAttendeeLoading,
    data: attendeeData,
  } = useGetAttendeeTicketDetails(eventId, isNotCohost);
  const {
    mutate: cancelRegistration,
    isSuccess: cancelRegistrationSuccess,
    reset: resetCancelRegistration,
    isPending: isCancelling,
  } = useSoftDeleteAttendee();

  const handleGetTickets = async () => {
    resetCancelRegistration();
    mutate({
      eventId,
      requiresApproval: isPermissionRequired,
    });
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
      <div className="flex w-full mt-4 flex-row items-center justify-around gap-4">
        <Link href={`${eventSlug}/communication`}>
          <MessageCircleMore className="w-12 h-12 bg-primary rounded-xl p-2 text-white transition-colors hover:text-black" />
        </Link>
        <CalendarDropdown eventId={eventId} />
        <Link href={`/ticket/${eventId}`}>
          <TicketCheck className="w-12 h-12 bg-primary rounded-xl p-2 text-white transition-colors hover:text-black" />
        </Link>
        <Button
          variant={isCancelling ? 'subtle' : 'destructive'}
          className="w-[50px] h-[50px] rounded-xl"
          onClick={handleCancelRegistration}
          disabled={isCancelling}
        >
          {isCancelling ? <LoaderCircle className="animate-spin" /> : <X />}
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
      className="mt-4 w-full rounded-full px-4 py-2 h-[50px]"
      onClick={handleGetTickets}
      disabled={createAttendeeLoading}
    >
      {createAttendeeLoading ? <LoaderCircle className="animate-spin" /> : <>Get Tickets</>}
    </Button>
  );
};

export default GetTicketsButton;
