import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Attendee } from '@/types/attendee';
import { ColumnDef } from '@tanstack/react-table';
import { useUpdateAttendeeStatus } from '@/lib/react-query/event';
import { useState, useEffect } from 'react';
import { getBadgeVariant, getProfilePictureUrl } from '@/utils/event';
import { formatDate } from '@/utils/formatDate';
import { toast } from 'sonner';

type AllowedGuestColumnProps = Readonly<{
  attendee: Attendee;
  eventCapacity: number;
  currentAllowedCount: number;
}>;

const attendeeColumns = (
  eventCapacity: number,
  currentAllowedCount: number
): ColumnDef<Attendee>[] => [
  {
    accessorKey: 'name',
    header: () => <div className="block !w-[18rem] text-left">Name</div>,
    cell: ({ row }) => {
      const guest = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={getProfilePictureUrl(guest.user?.profileIcon ?? 1)} />
            <AvatarFallback>{guest.user?.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {guest.user?.fullName || guest.user?.userName || 'Unknown Host'}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const variant: BadgeVariant = getBadgeVariant(status);

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'hasAttended',
    header: 'Attendance',
    cell: ({ row }) => (
      <Badge variant={row.original.hasAttended ? 'success' : 'destructive'}>
        {row.original.hasAttended ? 'Attended' : 'Not Attended'}
      </Badge>
    ),
  },
  {
    accessorKey: 'ticketId',
    header: 'Ticket ID',
    cell: ({ row }) => {
      const ticketId = row.original.qrToken.toUpperCase();
      return ticketId;
    },
  },
  {
    accessorKey: 'allowGuest',
    header: 'Allow Guest',
    cell: ({ row }) => {
      const allowGuest = row.original.allowedStatus;
      return (
        <AllowedGuestColumn
          attendee={row.original}
          eventCapacity={eventCapacity}
          currentAllowedCount={currentAllowedCount}
        />
      );
    },
  },
  {
    accessorKey: 'date',
    header: 'Registration Date',
    cell: ({ row }) => {
      const date = row.original.registrationTime;
      return formatDate(date, { dateOnly: true });
    },
  },
];

const AllowedGuestColumn = ({
  attendee,
  eventCapacity,
  currentAllowedCount,
}: AllowedGuestColumnProps) => {
  const { mutate } = useUpdateAttendeeStatus();

  useEffect(() => {
    setIsToggled(attendee.allowedStatus);
  }, [attendee.allowedStatus]);

  const [isToggled, setIsToggled] = useState(attendee.allowedStatus);

  const isCapacityReached = currentAllowedCount >= eventCapacity;
  const isDisabled = isCapacityReached && !isToggled;

  const handleCheckedChange = (checked: boolean) => {
    const previousValue = isToggled;
    mutate(
      {
        eventId: attendee.eventId,
        attendeeId: attendee.id,
        allowedStatus: checked,
      },
      {
        onError: () => {
          setIsToggled(previousValue);
          toast.error('Failed to update status');
        },
      }
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">
            <Switch
              checked={isToggled}
              onCheckedChange={handleCheckedChange}
              disabled={isDisabled}
            />
          </div>
        </TooltipTrigger>
        {isDisabled && (
          <TooltipContent>
            <p>Slots Full</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export { attendeeColumns };
