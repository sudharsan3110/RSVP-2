'use client';
import Container from '@/components/common/Container.tsx';
import EventCard from '@/components/common/EventCard.tsx';
import NoResults from '@/components/common/NoResults';
import SuspenseBoundary from '@/components/common/SuspenseBoundary';
import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import CustomSelect from '@/components/ui/CustomSelect';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import useDebounce from '@/hooks/useDebounce';
import { useGetMyEvents } from '@/lib/react-query/event.ts';
import { cn } from '@/lib/utils.ts';
import { locationName, NO_EVENT_TITLE, NO_EVENTS_MESSAGE } from '@/utils/constants.ts';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
interface HandleSearchEvent {
  target: {
    value: string;
  };
}

const Events = () => {
  const [searchText, setSearchText] = useState('');

  const debouncedSearchText = useDebounce(searchText, 500);
  const [filters, setFilters] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      status: parseAsString.withDefault(''),
      sort: parseAsString.withDefault(''),
      search: parseAsString.withDefault(''),
    },
    { history: 'push' }
  );
  const { data, isLoading, error } = useGetMyEvents(filters);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isFilterOpen] = useState(true);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearchText }));
  }, [debouncedSearchText]);

  const handleSearch = (e: HandleSearchEvent) => {
    setSearchText(e.target.value);
  };

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 data-testid="loader" className="h-10 w-10 animate-spin" />
      </div>
    );

  if (error) return <div>{error.message}</div>;

  return data?.events?.length != 0 ? (
    <Container className="min-h-screen space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <p className="text-3xl">
            Manage Your <span className="text-primary">Events</span>
          </p>
        </div>
      </header>
      <main>
        <section className="flex flex-col gap-6">
          <section className="flex w-full flex-col items-center justify-between md:flex-row">
            <div className="flex w-full flex-1 items-center md:mr-12 md:max-w-2xl">
              <div className="relative flex w-full">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-full border border-dark-500 bg-dark-500 py-2 pl-10 pr-3 leading-5 text-white placeholder-white focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500 sm:text-sm"
                  placeholder="Comic"
                  onChange={handleSearch}
                  value={searchText}
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
                  { value: 'all', label: 'Select Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'cancel', label: 'Cancelled' },
                  // { value: 'deleted', label: 'Deleted' },
                ]}
                placeholder="Select Status"
                ariaLabel="Select Event Status"
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value === 'all' ? '' : value }))
                }
              />

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[90vw] justify-between rounded-[8px] border md:w-[200px]"
                    data-testid="locationButton"
                  >
                    {value
                      ? locationName.find((location) => location.value === value)?.label
                      : 'Location'}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[90vw] rounded-[8px] p-0 md:w-[200px]">
                  <Command>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
                      </div>
                      <input
                        type="text"
                        className="block w-full bg-transparent py-2 pl-10 pr-3 leading-5 text-white placeholder-white focus:border-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-900 sm:text-sm"
                        placeholder="Search Here..."
                      />
                    </div>
                    <CommandList>
                      <CommandEmpty>No Location found.</CommandEmpty>
                      <CommandGroup>
                        {locationName.map((location) => (
                          <CommandItem
                            key={location.value}
                            value={location.value}
                            onSelect={(currentValue) => {
                              setValue(currentValue === value ? '' : currentValue);
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                value === location.value ? 'opacity-100' : 'opacity-0'
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

              <CustomSelect
                value={filters.sort}
                options={[
                  { value: 'all', label: 'Sort By' },
                  { value: 'date', label: 'Date' },
                  { value: 'attendees', label: 'Attendees' },
                  { value: 'price', label: 'Price' },
                ]}
                placeholder="Sort By"
                ariaLabel="Sort By"
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, sort: value === 'all' ? '' : value }))
                }
              />
            </div>
          </section>

          <section className="mt-1"></section>
        </section>
        <div
          className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          data-testid="events-list"
        >
          {data?.events?.map((eventData) => (
            <EventCard event={eventData} key={eventData.id} type="manage" />
          ))}
        </div>
      </main>
    </Container>
  ) : (
    <section className="mx-auto my-48 w-full max-w-[352px] text-center" data-testid="no-events">
      <NoResults
        image="/images/no-event-image.svg"
        altText="no-event-image"
        imgWidth={200}
        imgHeight={200}
        title={NO_EVENT_TITLE}
        message={NO_EVENTS_MESSAGE}
        showBtn={true}
        btnText="Create Event"
        btnLink="/create-event"
        btnIcon="/images/add-icon.svg"
      />
    </section>
  );
};

export default function EventsPage() {
  return (
    <SuspenseBoundary>
      <Events />
    </SuspenseBoundary>
  );
}
