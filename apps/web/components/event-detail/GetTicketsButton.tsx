'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LoaderCircle, MessageCircleMore, TicketCheck, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrentUser } from '@/lib/react-query/auth';
import {
  useCreateAttendee,
  useGetAttendeeTicketDetails,
  useSoftDeleteAttendee,
} from '@/lib/react-query/event';
import { Cohost } from '@/types/cohost';
import { checkIfUserIsNotCohost, isCurrentUserCohost } from '@/utils/event';
import SigninDialog from '../auth/SigninDialog';
import { Button } from '../ui/button';

const CalendarDropdown = dynamic(
  () => import('../common/CalendarDropdown').then((mod) => ({ default: mod.CalendarDropdown })),
  {
    loading: () => (
      <Button variant="subtle" className="w-full rounded-full px-4 py-2" disabled>
        Loading...
      </Button>
    ),
    ssr: false,
  }
);

type GetTicketsButtonProps = {
  cohosts?: Cohost[];
  eventId: string;
  isPermissionRequired: boolean;
  creatorId: string;
  remainingSeats: number;
  eventSlug: string;
  isPastEvent: boolean;
};

const GetTicketsButton = ({
  cohosts,
  eventId,
  isPermissionRequired,
  creatorId,
  remainingSeats,
  eventSlug,
  isPastEvent,
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
    isPastEvent &&
    (isSuccess || attendeeDataSuccess) &&
    !cancelRegistrationSuccess &&
    attendeeData?.allowedStatus
  ) {
    return (
      <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2 text-center">
        Event has passed
      </Button>
    );
  }

  if (
    (isSuccess || attendeeDataSuccess) &&
    !cancelRegistrationSuccess &&
    attendeeData?.allowedStatus
  ) {
    return (
      <div className="flex w-full mt-4 px-4 flex-row items-center justify-around gap-2">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`${eventSlug}/communication`}>
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary bg-black text-primary transition-all hover:bg-primary hover:text-white">
                  <MessageCircleMore className="h-6 w-6" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Updates</TooltipContent>
          </Tooltip>
          <CalendarDropdown eventId={eventId} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/ticket/${eventId}`}>
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary bg-black text-primary transition-all hover:bg-primary hover:text-white">
                  <TicketCheck className="h-6 w-6" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Show Ticket</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isCancelling ? 'subtle' : 'ghost'}
                className="h-12 w-12 shrink-0 rounded-full border-2 bg-red-500 p-0 hover:bg-red-600"
                onClick={handleCancelRegistration}
                disabled={isCancelling}
              >
                {isCancelling ? (
                  <LoaderCircle className="animate-spin text-white" />
                ) : (
                  <X className="w-3/4 h-3/4 p-1 text-white stroke-1" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Cancel Registration</TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
    <>
      {isPastEvent ? (
        <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2 text-center">
          Event has passed
        </Button>
      ) : (
        <Button
          variant={createAttendeeLoading ? 'subtle' : 'default'}
          className="mt-4 w-full rounded-full px-4 py-2 h-[50px]"
          onClick={handleGetTickets}
          disabled={createAttendeeLoading}
        >
          {createAttendeeLoading ? <LoaderCircle className="animate-spin" /> : <>Get Tickets</>}
        </Button>
      )}
    </>
  );
};

export default GetTicketsButton;
