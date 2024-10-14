import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { PlusIcon } from '@heroicons/react/24/solid';
import { eventHostColumns, eventHostsData } from '../data-columns/event-host';

const EventHostManagment = ({ className }: PropsWithClassName) => {
  return (
    <section className={cn('space-y-3', className)}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row">
        <div>
          <h2 className="text-xl font-semibold">Add a Host</h2>
          <p className="text-sm text-secondary">Add hosts, special guests, and event managers.</p>
        </div>
        <Button radius="sm" variant="tertiary">
          <PlusIcon className="mr-2 size-4" />
          Add host
        </Button>
      </header>
      <DataTable columns={eventHostColumns} data={eventHostsData} />
    </section>
  );
};

export default EventHostManagment;
