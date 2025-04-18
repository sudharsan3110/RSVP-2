'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge, BadgeVariant } from '@/components/ui/badge';
import { AvatarFallback, Avatar, AvatarImage } from '../ui/avatar';
import { Attendee } from '@/types/attendee';
import dayjs from 'dayjs';
import { getBadgeVariant, getProfilePictureUrl } from '@/utils/event';

export const recentRegistrationColumns: ColumnDef<Attendee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex">
        <Avatar>
          <AvatarImage src={getProfilePictureUrl(row.original?.user?.profile_icon ?? 0)} />
          <AvatarFallback>{row.original?.user?.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="font-medium text-white">{row.original?.user?.full_name}</p>
          <p className="text-xs text-foreground">@{row.original?.user?.username}</p>
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
      return dayjs(date).format('DD MMM YYYY');
    },
  },
];
