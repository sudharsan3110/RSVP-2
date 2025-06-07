'use client';
import Container from '@/components/common/Container.tsx';
import EventCard from '@/components/common/EventCard.tsx';
import NoResults from '@/components/common/NoResults';
import SuspenseBoundary from '@/components/common/SuspenseBoundary';
import { Button } from '@/components/ui/button';
import CustomSelect from '@/components/ui/CustomSelect';
import useDebounce from '@/hooks/useDebounce';
import { useGetMyEvents } from '@/lib/react-query/event.ts';
import { cn } from '@/lib/utils.ts';
import { NO_EVENT_TITLE, NO_EVENTS_MESSAGE } from '@/utils/constants.ts';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon, Loader2 } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';

interface HandleSearchEvent {
  target: {
    value: string;
  };
}

const Events = () => {
  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      status: parseAsString.withDefault('active').withOptions({ clearOnDefault: false }),
      sort: parseAsString.withDefault('date').withOptions({ clearOnDefault: false }),
      sortOrder: parseAsString.withDefault('desc').withOptions({ clearOnDefault: false }),
      search: parseAsString.withDefault(''),
    },
    { history: 'push' }
  );
  const debouncedSearchQuery = useDebounce(filters.search, 600);
  const { data, isLoading, error } = useGetMyEvents({
    ...filters,
    sortOrder: filters.sortOrder as 'asc' | 'desc' | undefined,
    search: debouncedSearchQuery,
  });
  const [value, setValue] = useState('');
  const [isFilterOpen] = useState(true);

  const handleSearch = (e: HandleSearchEvent) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 data-testid="loader" className="h-10 w-10 animate-spin" />
      </div>
    );
  const hasActiveFilters = !!(filters.status || filters.search || value);

  const getNoResultsProps = () => {
    const defaultProps = {
      image: '/images/no-event-image.svg',
      altText: 'no-event-image',
      imgWidth: 200,
      imgHeight: 200,
      title: NO_EVENT_TITLE,
      message: NO_EVENTS_MESSAGE,
      showBtn: true,
      btnText: 'Create Event',
      btnLink: '/create-event',
      btnIcon: '/images/add-icon.svg',
      onClick: undefined,
    };

    if (hasActiveFilters) {
      return {
        image: '/images/no-event-image.svg',
        altText: 'no-event-image',
        imgWidth: 200,
        imgHeight: 200,
        title: 'No events match your filters',
        message: 'Try adjusting your search or filters to see more results.',
        btnText: 'Clear Filters',
        btnLink: undefined,
        showBtn: true,
        onClick: handleClearFilters,
      };
    }

    return defaultProps;
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      status: '',
      sort: '',
      sortOrder: '',
      search: '',
    });
    setValue('');
  };

  const handleSort = () => {
    setFilters((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
  };

  if (error) return <div>{error.message}</div>;

  return (
    <Container className="mt-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            Manage Your <span className="text-primary">Events</span>
          </h1>
        </div>
      </header>
      {data?.events?.length != 0 ? (
        <main>
          <section className="flex flex-col gap-6">
            <section className="flex w-full flex-col items-center justify-between md:flex-row">
              <div className="flex w-full flex-1 items-center md:mr-12 md:max-w-2xl">
                <div className="relative flex w-full">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
                  </div>
                  <Input
                    type="text"
                    className="block w-full rounded-full bg-dark-500 py-2 pl-10 pr-3 leading-5"
                    placeholder="Event Name..."
                    onChange={handleSearch}
                    value={filters.search}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'mt-6 md:mt-0',
                  isFilterOpen
                    ? 'hidden gap-6 sm:flex-row md:flex md:flex-row'
                    : 'flex flex-col items-center justify-center gap-6 md:hidden'
                )}
              >
                <CustomSelect
                  value={filters.status}
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                  placeholder="Select Status"
                  ariaLabel="Select Event Status"
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))
                  }
                />

                <div className="flex items-center">
                  <TooltipProvider>
                    <Tooltip delayDuration={500}>
                      <TooltipTrigger asChild>
                        <Button
                          radius="sm"
                          variant="tertiary"
                          onClick={handleSort}
                          className="rounded-r-none bg-transparent"
                        >
                          {filters.sortOrder === 'asc' ? (
                            <ArrowUpNarrowWideIcon size={16} />
                          ) : (
                            <ArrowDownNarrowWideIcon size={16} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {filters.sortOrder === 'asc'
                          ? 'Sort Order: Ascending'
                          : 'Sort Order: Descending'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <CustomSelect
                    value={filters.sort}
                    options={[
                      { value: 'date', label: 'Date' },
                      { value: 'attendees', label: 'Attendees' },
                    ]}
                    placeholder="Sort By"
                    ariaLabel="Sort By"
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value }))}
                    className="border-l-0 rounded-l-none"
                  />
                </div>
              </div>
            </section>
          </section>
          <div
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            data-testid="events-list"
          >
            {data?.events?.map((eventData) => (
              <EventCard event={eventData} key={eventData.id} type="manage" />
            ))}
          </div>
        </main>
      ) : (
        <section className="mx-auto my-12 w-full text-center" data-testid="no-events">
          <NoResults {...getNoResultsProps()} />
        </section>
      )}
    </Container>
  );
};

export default function EventsPage() {
  return (
    <SuspenseBoundary>
      <Events />
    </SuspenseBoundary>
  );
}
