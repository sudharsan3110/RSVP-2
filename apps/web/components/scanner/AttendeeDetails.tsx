'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import NoResults from '../common/NoResults';
import { IAttendee } from '@/types/attendee';
import { toast } from 'sonner';
import AttendeeDetailsContent from './AttendeeDetailsContent';

interface AttendeeDetailsProps {
  attendee: IAttendee | null;
  onCheckIn: () => void;
}

const AttendeeDetails = ({ attendee, onCheckIn }: AttendeeDetailsProps) => {
  const handleCheckIn = () => {
    toast.success('Checked In Successfully');
    onCheckIn();
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Attendee Details</CardTitle>
      </CardHeader>
      <CardContent className="grow pb-5">
        {attendee ? (
          <AttendeeDetailsContent {...attendee} />
        ) : (
          <div className="mx-auto flex h-full max-w-72 flex-col items-center justify-center">
            <NoResults
              title="No Attendee Found"
              message="Please Enter the Ticket Code or Scan the QR Code"
            />
          </div>
        )}
      </CardContent>
      {attendee && (
        <CardFooter>
          <Button
            className="w-full rounded-md py-3.5 font-semibold !opacity-100"
            variant={attendee?.isCheckedIn ? 'subtle' : 'default'}
            disabled={attendee?.isCheckedIn}
            onClick={handleCheckIn}
          >
            {attendee?.isCheckedIn ? 'Already Checked In' : 'Check In'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AttendeeDetails;
