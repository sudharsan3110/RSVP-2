'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Define the shape of your data
export type EventHost = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
};

// Static data example for table
export const eventHostsData: EventHost[] = [
  {
    id: '1',
    name: 'Olivia Rhye',
    email: 'olivia@example.com',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Phoenix Baker',
    email: 'phoenix@example.com',
    status: 'Inactive',
  },
];

export const eventHostColumns: ColumnDef<EventHost>[] = [
  {
    accessorKey: 'name',
    header: 'Host',
    cell: ({ row }) => (
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage
            src={`https://avatar.vercel.sh/${row.original.id}.png`}
            alt={row.original.name}
          />
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const host = row.original;
      return (
        <Button
          variant="destructive"
          radius="sm"
          size="sm"
          onClick={() => {
            // Handle remove host action
            console.log(`Remove host: ${host.name}`);
          }}
        >
          Remove Host
        </Button>
      );
    },
  },
];
