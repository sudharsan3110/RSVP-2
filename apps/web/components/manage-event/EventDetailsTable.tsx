'use client';

import { attendeeColumns } from '@/components/manage-event/attendee-column';
import { Input } from '@/components/ui/input';
import { useGetAttendeeByEventId } from '@/lib/react-query/event';
import { Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import TablePagination from '../common/Pagination';
import { DataTable } from '../ui/data-table';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import useDebounce from '@/hooks/useDebounce';

interface FilterState {
  searchTerm: string;
  hasAttended?: boolean;
  page: number;
}

type EventDetailsTableProps = Readonly<{
  eventCapacity: number;
  totalAttendees: number;
}>;

export default function EventDetailsTable({
  eventCapacity,
  totalAttendees,
}: EventDetailsTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    page: 1,
  });

  const searchTerm = useDebounce(filters.searchTerm, 500);

  const params = useParams();
  const eventId = params.id?.toString() || '';

  // Pass all filters to the API call
  const { data, isLoading } = useGetAttendeeByEventId({
    eventId,
    page: filters.page,
    limit: 10,
    search: searchTerm,
    hasAttended: filters.hasAttended,
    sortBy: 'registrationTime',
  });

  const attendees = data?.attendees ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 10);

  const columns = useMemo(
    () => attendeeColumns(eventCapacity, totalAttendees),
    [eventCapacity, totalAttendees]
  );

  // Debounced search handler
  const handleSearch = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: value,
      page: 1, // Reset to first page on search
    }));
  };

  // Status filter handler
  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      hasAttended: value === 'checkedIn' ? true : value === 'pending' ? false : undefined,
      page: 1,
    }));
  };

  const tabValue = useMemo(() => {
    if (filters.hasAttended === true) return 'checkedIn';
    if (filters.hasAttended === false) return 'pending';
    return 'all';
  }, [filters.hasAttended]);

  // Page change handler
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Guest List</h2>
      <div className="rounded-lg border bg-dark-900">
        <div className="space-y-4 p-4 sm:flex sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search User"
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full max-w-xl pl-8"
            />
          </div>
          <Tabs value={tabValue} onValueChange={handleStatusChange} className="sm:w-auto">
            <TabsList className="flex justify-center sm:justify-start">
              <TabsTrigger className="flex-1" value="all">
                All
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="checkedIn">
                Checked In
              </TabsTrigger>
              <TabsTrigger className="flex-1" value="pending">
                Pending
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="overflow-x-auto">
          <DataTable columns={columns} data={attendees} loading={isLoading} />
        </div>

        <TablePagination
          currentPage={filters.page}
          totalPages={totalPages}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
}
