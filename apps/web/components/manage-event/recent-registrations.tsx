import { recentRegistrationColumns } from '@/components/data-columns/recent-registration';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import useQueryParams from '@/hooks/useSearchParams.tsx';
import { useGetAttendeeByEventId } from '@/lib/react-query/event';
import { useParams } from 'next/navigation';
import { AttendeeStatus } from '@/types/attendee';

const RecentRegistrations = ({ className }: PropsWithClassName) => {
  const queryParams = useQueryParams();
  const params = useParams();
  const eventId = params.id?.toString() || '';
  const { data, isLoading } = useGetAttendeeByEventId({
    eventId,
    status: [AttendeeStatus.Going, AttendeeStatus.Waiting],
    limit: 3,
    sortBy: 'registrationTime',
  });
  const recentRegistrations = data?.attendees || [];

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
      <DataTable
        columns={recentRegistrationColumns}
        data={recentRegistrations}
        loading={isLoading}
        emptyStateText="No registrations yet"
        skeletonRows={3}
      />
    </section>
  );
};

export default RecentRegistrations;
