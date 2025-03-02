'use client';
import Container from '@/components/common/Container.tsx';
import EventCard from '@/components/common/EventCard.tsx';
import NoResults from '@/components/common/NoResults';
import NullScreen from '@/components/common/NullScreen';
import { Button } from '@/components/ui/button.tsx';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import useDebounce from '@/hooks/useDebounce';
import { useGetEvent } from '@/lib/react-query/event.ts';
import { cn } from '@/lib/utils.ts';
import { IEvent } from '@/types/event.ts';
import { locationName, NO_EVENT_TITLE, NO_EVENTS_MESSAGE } from '@/utils/constants.ts';
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface HandleSearchEvent {
  target: {
    value: string;
  };
}

const Events = () => {
  const { data: event, isLoading, error } = useGetEvent();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isFilterOpen] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<IEvent[] | undefined>(event);

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    if (event) {
      setFilteredEvents(
        event.filter((eventData) => eventData.name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
  }, [debouncedSearchText, event]);

  const handleSearch = (e: HandleSearchEvent) => {
    setSearchText(e.target.value);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return event?.length != 0 ? (
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

              <Select>
                <SelectTrigger
                  className="w-[90vw] hover:rounded-[8px] md:w-[200px]"
                  aria-label="Sort By"
                >
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem className="cursor-pointer hover:rounded-[8px]" value="date">
                      Date
                    </SelectItem>
                    <SelectItem className="cursor-pointer hover:rounded-[8px]" value="attendees">
                      Attendees
                    </SelectItem>
                    <SelectItem className="cursor-pointer hover:rounded-[8px]" value="price">
                      Price
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="mt-1"></section>
        </section>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents?.map((eventData: IEvent) => (
            <EventCard event={eventData} key={eventData.id} type="manage" />
          ))}
        </div>
      </main>
    </Container>
  ) : (
    <section className="mx-auto my-48 w-full max-w-[352px] text-center">
      <NoResults title={NO_EVENT_TITLE} message={NO_EVENTS_MESSAGE} />
    </section>
  );
};

export default Events;
