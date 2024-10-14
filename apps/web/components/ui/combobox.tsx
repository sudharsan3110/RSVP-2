'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CheckIcon } from '@heroicons/react/24/solid';
import { ChevronUpDownIcon } from '@heroicons/react/16/solid';

type Props = {
  placeholder?: string;
  options: FormSelectOption[];
  className?: string;
  onValueChange?: (e: string) => void;
  value?: string;
  testId?: string;
  disabled?: boolean;
};

export function ComboboxSelect({
  value,
  onValueChange,
  options,
  disabled,
  testId,
  className,
  placeholder = 'Select Option...',
}: Props) {
  const [open, setOpen] = React.useState(false);
  function onSelectOptionChange(e: string) {
    if (onValueChange) {
      onValueChange(e);
    }
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          data-testid={testId}
          disabled={disabled}
          aria-expanded={open}
          className={cn('w-[200px] justify-between whitespace-nowrap', className)}
        >
          {value ? options.find((option) => option.value === value)?.label : placeholder}

          <ChevronUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command
          filter={(value, search) => {
            const label = options.find((option) => option.value === value)?.label;

            if (label && label.toLowerCase().includes(search?.toLowerCase())) return 1;
            return 0;
          }}
        >
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onSelectOptionChange(currentValue === value ? '' : currentValue);
                  }}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      'ml-auto h-4 w-4',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
