'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Attendee } from '@/types/attendee';
import { toast } from 'sonner';
import NoResults from '../common/NoResults';
import AttendeeDetailsContent from './AttendeeDetailsContent';
import { useVerifyAttendee } from '@/lib/react-query/event';
import { Icons } from '../common/Icon';
import { useState } from 'react';

interface AttendeeDetailsProps {
  attendee: Attendee | null;
  loading: boolean;
  error: string | null;
  onCheckIn: () => void;
}

const AttendeeDetails = ({ attendee, loading, error, onCheckIn }: AttendeeDetailsProps) => {
  const { mutate, isPending, error: responseError } = useVerifyAttendee();

  const handleVerify = () => {
    if (attendee) {
      mutate(
        {
          eventId: attendee.eventId,
          attendeeId: attendee.id,
        },
        {
          onSuccess: () => {
            onCheckIn();
            toast.success('Attendee checked in successfully');
          },
        }
      );
    }
  };
  const isNotAllowed = attendee && attendee.allowedStatus === false;
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Attendee Details</CardTitle>
      </CardHeader>
      <CardContent className="grow pb-5">
        {error || responseError ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{responseError?.response?.data.message || error}</AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : attendee ? (
          <AttendeeDetailsContent attendee={attendee} />
        ) : (
          <div className="mx-auto flex h-full max-w-72 flex-col items-center justify-center">
            <NoResults
              title="No Attendee Found"
              message="Please Enter the Ticket Code or Scan the QR Code"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isNotAllowed && <NotAllowed />}
        {attendee && !error && !isNotAllowed && (
          <Button
            className="w-full rounded-md py-3.5 font-semibold !opacity-100"
            variant={attendee.hasAttended ? 'subtle' : 'default'}
            disabled={attendee.hasAttended || isPending}
            onClick={handleVerify}
          >
            {isPending ? 'Verifying...' : attendee.hasAttended ? 'Already Checked In' : 'Check In'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

const NotAllowed = () => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Not Allowed</AlertTitle>
      <AlertDescription>This attendee is not allowed to attend the event.</AlertDescription>
    </Alert>
  );
};

export default AttendeeDetails;
