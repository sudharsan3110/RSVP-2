import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { eventHostColumns } from '../data-columns/event-host';
import AddCoHost from './add-host';
import { useDeleteCohost, useGetEventCohosts } from '@/lib/react-query/event';
import { useParams } from 'next/navigation';

const EventHostManagment = ({ className }: PropsWithClassName) => {
  const { mutate: deleteCohostMutate } = useDeleteCohost();
  const { id: eventId } = useParams();
  const { data: cohostData, isLoading } = useGetEventCohosts(eventId as string);

  const removeCohost = (cohostId: string) => {
    deleteCohostMutate({ eventId: eventId as string, cohostId });
  };

  return (
    <section className={cn('space-y-3', className)}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Add a Host</h2>
          <p className="text-sm text-secondary">Add hosts, special guests, and event managers.</p>
        </div>
        <AddCoHost />
      </header>
      <DataTable
        columns={eventHostColumns(removeCohost)}
        data={cohostData ?? []}
        loading={isLoading}
      />
    </section>
  );
};

export default EventHostManagment;
