'use client';

import Container from '@/components/common/Container';
import EventCard from '@/components/common/EventCard';
import NoResults from '@/components/common/NoResults';
import Tags from '@/components/tags/Tags';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TooltipContent } from '@/components/ui/tooltip';
import { Tooltip, TooltipTrigger } from '@/components/ui/tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';
import useDebounce from '@/hooks/useDebounce';
import { useGetDiscoverEvents, useGetCategoryList } from '@/lib/react-query/event';
import { Event } from '@/types/events';
import { FunnelIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowDownNarrowWideIcon, ArrowUpNarrowWideIcon } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';
import { cn } from '@/lib/utils';

const DiscoverEvents = () => {
  const pageEndRef = useRef<HTMLDivElement>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      status: parseAsString.withDefault(''),
      sort: parseAsString.withDefault('date').withOptions({ clearOnDefault: false }),
      sortOrder: parseAsString.withDefault('desc').withOptions({ clearOnDefault: false }),
      search: parseAsString.withDefault(''),
      category: parseAsString.withDefault(''),
    },
    { history: 'push' }
  );
  const debouncedSearchQuery = useDebounce(filters.search, 600);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetDiscoverEvents({
    page: filters.page,
    search: debouncedSearchQuery,
    sort: filters.sort,
    sortOrder: filters.sortOrder as 'asc' | 'desc',
    status: '',
    limit: 10,
    category: filters.category,
  });

  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoryList();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '500px',
      }
    );

    if (pageEndRef.current) {
      observer.observe(pageEndRef.current);
    }

    return () => {
      if (pageEndRef.current) {
        observer.unobserve(pageEndRef.current);
      }
    };
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  const handleSort = () => {
    setFilters((prev) => ({ ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <Container asChild>
      <main className="mt-8 flex select-none flex-col justify-center md:justify-normal">
        <h1 className="mb-12 hidden text-center text-xl font-semibold md:block md:text-left md:text-3xl">
          Find Trending <span className="text-primary">Events</span>
        </h1>

        <section className="flex flex-col gap-6">
          <section className="flex w-full flex-col items-center justify-between md:flex-row gap-4">
            <div className="flex w-full flex-1 items-center gap-6 md:mr-12 md:max-w-2xl">
              <div className="relative flex w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
                </div>
                <Input
                  type="text"
                  className="block w-full rounded-full bg-dark-500 py-2 pl-10 pr-3 leading-5"
                  placeholder="Search Events"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div className="md:hidden">
                <Button size="icon" variant={isFilterOpen ? 'destructive' : 'ghost'} asChild>
                  {isFilterOpen ? (
                    <XMarkIcon
                      data-testid="close"
                      className="h-6 w-6"
                      onClick={() => setIsFilterOpen(false)}
                    />
                  ) : (
                    <FunnelIcon
                      data-testid="funnel"
                      className="h-6 w-6"
                      onClick={() => setIsFilterOpen(true)}
                    />
                  )}
                </Button>
              </div>
            </div>

            <div
              className={cn('flex items-center w-full md:w-fit', !isFilterOpen && 'hidden md:flex')}
            >
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
          </section>

          <section className="mt-1">
            {isCategoriesLoading ? (
              <Skeleton className="w-full h-10" />
            ) : (
              <Tags
                selectedTag={filters.category}
                setSelectedTag={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                tagList={categories || []}
              />
            )}
          </section>

          <section className="mt-6">
            <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="w-full min-h-[20rem] rounded-md" />
                ))
              ) : data?.pages.flatMap((page) => page.events).length &&
                data?.pages.flatMap((page) => page.events).length > 0 ? (
                <>
                  {data?.pages
                    .flatMap((page) => page.events)
                    .map((event: Event) => {
                      return <EventCard key={event.id} event={event} type="guest" />;
                    })}
                  {isFetchingNextPage &&
                    Array.from({ length: 10 }).map((_, index) => (
                      <Skeleton key={index} className="w-full" />
                    ))}
                </>
              ) : (
                <div className="flex flex-col col-span-full items-center justify-center">
                  <NoResults title="No Events found" message="Try adjusting your search filters." />
                </div>
              )}
            </div>
            <div ref={pageEndRef} className="h-4 w-full" />
          </section>
        </section>
      </main>
    </Container>
  );
};

export default DiscoverEvents;
