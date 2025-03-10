import { data, recentRegistrationColumns } from '@/components/data-columns/recent-registration';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import useQueryParams from '@/hooks/useSearchParams.tsx';

const RecentRegistrations = ({ className }: PropsWithClassName) => {
  const queryParams = useQueryParams();

  return (
    <section className={cn('space-y-3', className)}>
      <header className="flex flex-col justify-between gap-3 sm:flex-row">
        <h2 className="text-lg font-semibold">Recent Registrations</h2>
        <Button
          radius="sm"
          size="sm"
          variant="tertiary"
          onClick={() => {
            queryParams.set('tab', 'guests');
          }}
        >
          View all
          <ArrowRightIcon className="ml-2 size-4" />
        </Button>
      </header>
      <DataTable columns={recentRegistrationColumns} data={data} />
    </section>
  );
};

export default RecentRegistrations;
