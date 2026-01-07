import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { eventHostColumns } from '../data-columns/event-host';
import AddCoHost from './add-host';
import { useGetEventCohosts } from '@/lib/react-query/event';
import { useParams } from 'next/navigation';
import { useGetEventById } from '@/lib/react-query/event';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useMemo } from 'react';

const EventHostManagment = ({ className }: PropsWithClassName) => {
  const { id: eventId } = useParams();
  const { data: cohostData, isLoading } = useGetEventCohosts(eventId as string);
  const { data: userData } = useCurrentUser();
  const { data: eventData } = useGetEventById(eventId as string);

  const isCreator = eventData?.event.checkCreator(userData?.id);

  const columns = useMemo(() => eventHostColumns(isCreator ?? false), [isCreator]);

  return (
    <section className={cn('space-y-3', className)}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Add a Host</h2>
          <p className="text-sm text-secondary">Add hosts, special guests, and event managers.</p>
        </div>
        {isCreator && <AddCoHost />}
      </header>
      <DataTable
        columns={columns}
        skeletonRows={3}
        data={cohostData ?? []}
        loading={isLoading}
        emptyStateText="No hosts found"
      />
    </section>
  );
};

export default EventHostManagment;
