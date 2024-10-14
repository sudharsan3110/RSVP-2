'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { AvatarFallback, Avatar, AvatarImage } from '../ui/avatar';

// Define the shape of your data
export type Attendee = {
  id: string;
  name: string;
  status: 'Checked In' | 'Registered' | 'Cancelled';
  registrationDate: string;
};

// Static data example for table
export const data: Attendee[] = [
  {
    id: '1',
    name: 'Olivia Rhye',
    status: 'Checked In',
    registrationDate: '22 Jan 2022',
  },
  {
    id: '2',
    name: 'Phoenix Baker',
    status: 'Registered',
    registrationDate: '22 Jan 2022',
  },
  {
    id: '3',
    name: 'Lana Steiner',
    status: 'Checked In',
    registrationDate: '22 Jan 2022',
  },
  {
    id: '4',
    name: 'Demi Wilkinson',
    status: 'Cancelled',
    registrationDate: '22 Jan 2022',
  },
];

// Function to determine badge variant based on status
const getBadgeVariant = (status: Attendee['status']) => {
  switch (status) {
    case 'Checked In':
      return 'default';
    case 'Registered':
      return 'secondary';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

// Column definitions for your table
export const recentRegistrationColumns: ColumnDef<Attendee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex">
        <Avatar>
          <AvatarImage />
          <AvatarFallback>{row.original.name[0]}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="font-medium text-white">{row.original.name}</p>
          <p className="text-xs text-foreground">@{row.original.id}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as Attendee['status'];
      return <Badge variant={getBadgeVariant(status)}>{status}</Badge>;
    },
  },
  {
    accessorKey: 'registrationDate',
    header: 'Registration Date',
  },
];
