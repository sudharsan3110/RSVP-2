import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Attendee } from '@/types/attendee';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useAllowedGuestColumn, useUpdateAllowStatus } from '@/lib/react-query/event';
import { useState, useEffect } from 'react';
import { getBadgeVariant, getProfilePictureUrl } from '@/utils/event';

const attendeeColumns: ColumnDef<Attendee>[] = [
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
            <div className="font-medium">{guest.user?.fullName}</div>
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
      return <AllowedGuestColumn attendee={row.original} />;
    },
  },
  {
    accessorKey: 'date',
    header: 'Registration Date',
    cell: ({ row }) => {
      const date = row.original.registrationTime;
      return dayjs(date).format('DD MMM YYYY');
    },
  },
];

const AllowedGuestColumn = ({ attendee }: { attendee: Attendee }) => {
  const { mutate } = useUpdateAllowStatus();

  const { data: hasAccess } = useAllowedGuestColumn(attendee.eventId, attendee.userId);

  useEffect(() => {
    setIsToggled(attendee.allowedStatus);
  }, [attendee.allowedStatus]);

  const [isToggled, setIsToggled] = useState(attendee.allowedStatus);

  const handleCheckedChange = (checked: boolean) => {
    setIsToggled(checked);
    mutate({
      eventId: attendee.eventId,
      userId: attendee.userId,
      allowedStatus: checked,
    });
  };

    return <Switch checked={isToggled} onCheckedChange={handleCheckedChange} />;
};

export { attendeeColumns };
