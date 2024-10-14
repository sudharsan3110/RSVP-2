'use client';

import React, { useState } from 'react';
import Container from '@/components/common/Container';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  CheckIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Tags from '@/components/tags/Tags';
import NoSearchResults from '@/components/noSearchResults/NoSearchResults ';
import { locationName } from '@/utils/constants';

const DiscoverEvents = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);

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
                  placeholder="Comic"
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

          <section className="mt-1">
            <Tags />
          </section>
        </section>

        <section className="mx-auto my-28 w-full max-w-[352px] text-center">
          <NoSearchResults />
        </section>
      </main>
    </Container>
  );
};

export default DiscoverEvents;
