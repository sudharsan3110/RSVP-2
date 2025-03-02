'use client';

import { useCurrentUser } from '@/lib/react-query/auth';
import {
  useCreateAttendee,
  useGetAttendeeDetails,
  useGetAttendeeTicketDetails,
  useSoftDeleteAttendee,
} from '@/lib/react-query/event';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';
import { Button } from '../ui/button';

type GetTicketsButtonProps = {
  eventId: string;
  isPermissionRequired: boolean;
};

const GetTicketsButton = ({ eventId, isPermissionRequired }: GetTicketsButtonProps) => {
  const { data: userData, isLoading: userDataLoading } = useCurrentUser();
  const { mutate, isSuccess } = useCreateAttendee();
  const { isSuccess: attendeeDataSuccess, isLoading } = useGetAttendeeTicketDetails(eventId);
  const {
    mutate: cancelRegistration,
    isSuccess: cancelRegistrationSuccess,
    reset: resetCancelRegistration,
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

  if ((isSuccess || attendeeDataSuccess) && !cancelRegistrationSuccess) {
    return (
      <div className="flex w-full flex-col gap-4">
        <Link href={`/ticket/${eventId}`}>
          <Button variant="subtle" className="mt-4 w-full rounded-full px-4 py-2">
            Show Tickets
          </Button>
        </Link>
        <Button
          variant="destructive"
          className="w-full rounded-full px-4 py-2"
          onClick={handleCancelRegistration}
        >
          Cancel Registration
        </Button>
      </div>
    );
  }

  if (!userData?.data?.data) {
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
    <Button className="mt-4 w-full rounded-full px-4 py-2" onClick={handleGetTickets}>
      Get Tickets
    </Button>
  );
};

export default GetTicketsButton;
