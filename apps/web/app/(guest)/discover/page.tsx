'use client';

import Container from '@/components/common/Container';
import EventCard from '@/components/common/EventCard';
import NoResults from '@/components/common/NoResults';
import Tags from '@/components/tags/Tags';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import useDebounce from '@/hooks/useDebounce';
import { useGetDiscoverEvents, useGetEvent } from '@/lib/react-query/event';
import { cn } from '@/lib/utils';
import { Event } from '@/types/events';
import { locationName } from '@/utils/constants';
import {
  CheckIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useRef, useState } from 'react';

const DiscoverEvents = () => {
  const pageEndRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      status: parseAsString.withDefault(''),
      sort: parseAsString.withDefault(''),
      search: parseAsString.withDefault(''),
      location: parseAsString.withDefault(''),
      category: parseAsString.withDefault(''),
    },
    { history: 'push' }
  );
  const debouncedSearchQuery = useDebounce(filters.search, 600);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetDiscoverEvents({
    page: filters.page,
    search: debouncedSearchQuery,
    sort: filters.sort,
    location: filters.location === 'all' ? '' : filters.location,
    status: '',
    limit: 10,
    category: filters.category,
    startDate: dayjs().startOf('day').toDate(),
  });

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

  return (
    <Container asChild>
      <main className="mt-8 flex select-none flex-col justify-center md:justify-normal">
        <h1 className="mb-12 hidden text-center text-xl font-semibold md:block md:text-left md:text-3xl">
          Find Trending <span className="text-primary">Events</span>
        </h1>

        <section className="flex flex-col gap-6">
          <section className="flex w-full flex-col items-center justify-between md:flex-row">
            <div className="flex w-full flex-1 items-center gap-6 md:mr-12 md:max-w-2xl">
              <div className="relative flex w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
                </div>
                <Input
                  type="text"
                  className="block w-full rounded-md bg-dark-500 py-2 pl-10 pr-3 leading-5 "
                  placeholder="Search Events"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <div className="md:hidden">
                <Button size="icon" variant={!isFilterOpen ? 'destructive' : 'ghost'} asChild>
                  {!isFilterOpen ? (
                    <XMarkIcon
                      data-testid="close"
                      className="h-6 w-6"
                      onClick={() => setIsFilterOpen(true)}
                    />
                  ) : (
                    <FunnelIcon
                      data-testid="funnel"
                      className="h-6 w-6"
                      onClick={() => setIsFilterOpen(false)}
                    />
                  )}
                </Button>
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[90vw] justify-between rounded-[8px] border md:w-[200px]"
                    data-testid="locationButton"
                  >
                    {filters.location
                      ? locationName.find((location) => location.value === filters.location)?.label
                      : 'Location'}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] rounded-[8px] p-0 md:w-[200px]">
                  <Command>
                    <CommandList>
                      <CommandEmpty>No Location found.</CommandEmpty>
                      <CommandGroup>
                        {locationName.map((location) => (
                          <CommandItem
                            key={location.value}
                            value={location.value}
                            onSelect={() => {
                              setFilters((prev) => ({ ...prev, location: location.value }));
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                filters.location === location.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {location.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Select onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value }))}>
                <SelectTrigger className="w-[90vw] hover:rounded-[8px] md:w-[200px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="eventDate">Date</SelectItem>
                    <SelectItem value="capacity">Attendees</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="mt-1">
            <Tags
              selectedTag={filters.category}
              setSelectedTag={(value) => setFilters((prev) => ({ ...prev, category: value }))}
            />
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
                    .map((event: Event) => <EventCard key={event.id} event={event} type="guest" />)}
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
