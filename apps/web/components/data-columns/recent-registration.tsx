'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { AvatarFallback, Avatar, AvatarImage } from '../ui/avatar';
import { Attendee } from '@/types/attendee';
import { getBadgeVariant, getProfilePictureUrl } from '@/utils/event';
import { formatDate } from '@/utils/formatDate';

export const recentRegistrationColumns: ColumnDef<Attendee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center">
        <Avatar>
          <AvatarImage src={getProfilePictureUrl(row.original?.user?.profileIcon ?? 0)} />
          <AvatarFallback>{row.original?.user?.initials}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <div className="font-medium">
            {row.original?.user?.fullName || row.original?.user?.userName || 'Unknown Host'}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original?.status;
      const variant: BadgeVariant = getBadgeVariant(status);

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'registrationDate',
    header: 'Registration Date',
    cell: ({ row }) => {
      const date = row.original.registrationTime;
      return formatDate(date, { dateOnly: true });
    },
  },
];
