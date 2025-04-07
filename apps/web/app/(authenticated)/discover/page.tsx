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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useDebounce from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { locationName } from '@/utils/constants';
import {
  CheckIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const DiscoverEvents = () => {
  const [open, setOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSort, setSelectedSort] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [page] = useState(1);
  const [limit] = useState(10);
  const debouncedSearchQuery = useDebounce(searchQuery, 600);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        if (debouncedSearchQuery) queryParams.append('searchParam', debouncedSearchQuery);
        if (selectedSort) {
          queryParams.append('sortBy', selectedSort);
        }
        if (selectedLocation) queryParams.append('location', selectedLocation);
        if (selectedTag) queryParams.append('category', selectedTag);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/event/filter?${queryParams.toString()}`
        );

        const data = await response.json();

        if (response.ok) {
          setEvents(data.data);
        } else {
          console.error('Error fetching events:', data.message);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [debouncedSearchQuery, selectedSort, selectedLocation, page, limit, selectedTag]);

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
                <input
                  type="text"
                  className="block w-full rounded-md border border-dark-500 bg-dark-500 py-2 pl-10 pr-3 leading-5 text-white placeholder-white focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500 sm:text-sm"
                  placeholder="Search Events"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    {selectedLocation
                      ? locationName.find((location) => location.value === selectedLocation)?.label
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
                              setSelectedLocation(location.value);
                              setOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedLocation === location.value ? 'opacity-100' : 'opacity-0'
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

              <Select onValueChange={(value) => setSelectedSort(value)}>
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
            <Tags selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
          </section>

          <section className="mt-6">
            {loading ? (
              <p className="text-center text-white">Loading events...</p>
            ) : events.length > 0 ? (
              <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <NoResults title="No Events found" message="Try adjusting your search filters." />
            )}
          </section>
        </section>
      </main>
    </Container>
  );
};

export default DiscoverEvents;
