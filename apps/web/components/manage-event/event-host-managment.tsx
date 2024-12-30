import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { eventHostColumns, eventHostsData } from '../data-columns/event-host';
import AddCoHost from './add-host';

const EventHostManagment = ({ className }: PropsWithClassName) => {
  return (
    <section className={cn('space-y-3', className)}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row">
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Add a Host</h2>
          <p className="text-sm text-secondary">Add hosts, special guests, and event managers.</p>
        </div>
        <AddCoHost />
      </header>
      <DataTable columns={eventHostColumns} data={eventHostsData} />
    </section>
  );
};

export default EventHostManagment;
