'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Cohost, Role } from '@/types/cohost';
import { VERCEL_AVATAR_BASE_URL } from '@/utils/constants';
import { ColumnDef } from '@tanstack/react-table';

// Define the shape of your data
export type EventHost = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
};

export const eventHostColumns = (
  handleRemoveCohost: (cohostId: string) => void
): ColumnDef<Cohost >[] => [
    {
      accessorKey: 'name',
      header: 'Host',
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`${VERCEL_AVATAR_BASE_URL}/${row.original.user?.id}.png`}
              alt={row.original.user?.fullName}
            />
            <AvatarFallback>{row.original.user?.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium">{row.original.user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{row.original.user?.primaryEmail}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const host = row.original;
          if (row.original.role === Role.CREATOR) return <></>;
        return (
          <Button
            variant="destructive"
            radius="sm"
            size="sm"
            onClick={() => {
              if (host?.user?.id) handleRemoveCohost(host.user.id);
            }}
          >
            Remove Host
          </Button>
        );
      },
    },
  ];
