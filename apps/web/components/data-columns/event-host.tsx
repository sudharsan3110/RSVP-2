'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Cohost, Role } from '@/types/cohost';
import { useDeleteCohost } from '@/lib/react-query/event';
import { VERCEL_AVATAR_BASE_URL } from '@/utils/constants';
import { ColumnDef, Row } from '@tanstack/react-table';
import { useCurrentUser } from '@/lib/react-query/auth';

// Define the shape of your data
export type EventHost = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
};

export const eventHostColumns = (isCreator: boolean): ColumnDef<Cohost>[] => [
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
    cell: ({ row }) => <ActionColumn row={row} isCreator={isCreator} />,
  },
];

const ActionColumn = ({ row, isCreator }: { row: Row<Cohost>; isCreator: boolean }) => {
  const { mutate: deleteCohostMutate } = useDeleteCohost();
  const { data: userData } = useCurrentUser();

  const host = row.original;
  if (host.role === Role.CREATOR) return <></>;

  const isCohost = host.user && userData && host.user.userName === userData.userName;

  if (!isCreator && !isCohost) {
    return <></>;
  }

  const handleRemoveCohost = () => {
    deleteCohostMutate({ eventId: host.eventId, userId: host.userId });
  };

  return (
    <Button variant="destructive" radius="sm" size="sm" onClick={handleRemoveCohost}>
      {isCohost ? 'Leave' : 'Remove Host'}
    </Button>
  );
};
