'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import { FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface FormDropdownInputValue {
  selectedOption: string;
  inputValue: string;
}

interface FormDropdownInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultSelected?: string;
  defaultInputValue?: string;
  className?: string;
  options: DropdownOption[];
  dropdownWidth?: string;
  dropdownPlaceholder?: string;
  inputType?: 'number' | 'text';
  allowOnlyNumbers?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  ariaLabel?: string;
  isRequired?: boolean; // Add isRequired to the interface
}

function FormDropdownInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = 'Enter value',
  disabled = false,
  defaultSelected,
  defaultInputValue = '',
  className,
  options,
  dropdownWidth = 'w-[120px]',
  dropdownPlaceholder = 'Select...',
  inputType = 'text',
  allowOnlyNumbers = false,
  searchPlaceholder = 'Search...',
  emptyMessage = 'No options found.',
  ariaLabel,
  isRequired, // Destructure isRequired here
}: FormDropdownInputProps<TFieldValues, TName>) {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue: {
      selectedOption: defaultSelected || options[0]?.value || '',
      inputValue: defaultInputValue,
    } as TFieldValues[TName],
  });

  const selectedOption = options.find((option) => option.value === selectedValue) || options[0];

  useEffect(() => {
    const fieldValue = field.value as FormDropdownInputValue | undefined;

    if (fieldValue && typeof fieldValue === 'object') {
      setSelectedValue(fieldValue.selectedOption || defaultSelected || options[0]?.value || '');
      setInputValue(fieldValue.inputValue || defaultInputValue || '');
    } else {
      const initialSelected = defaultSelected || options[0]?.value || '';
      const initialInput = defaultInputValue || '';
      setSelectedValue(initialSelected);
      setInputValue(initialInput);

      field.onChange({
        selectedOption: initialSelected,
        inputValue: initialInput,
      } as TFieldValues[TName]);
    }
  }, [field.value, defaultSelected, defaultInputValue, options, field]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (allowOnlyNumbers) {
      value = value.replace(/[^\d]/g, '');
    }

    setInputValue(value);

    const newValue = {
      selectedOption: selectedValue,
      inputValue: value,
    } as TFieldValues[TName];

    field.onChange(newValue);
  };

  const handleOptionSelect = (value: string) => {
    setSelectedValue(value);
    setOpen(false);

    const newValue = {
      selectedOption: value,
      inputValue: inputValue,
    } as TFieldValues[TName];

    field.onChange(newValue);
  };

  return (
    <div className={cn(className)}>
      {label && (
        <FormLabel className="block text-sm font-medium mb-2" isRequired={isRequired}>
          {label}
        </FormLabel>
      )}

      <div className="flex items-center gap-0 rounded-md overflow-hidden">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                'justify-between rounded-none rounded-l-md border-r-0 px-3 focus:ring-offset-0 bg-transparent h-10',
                'hover:bg-muted transition-colors',
                dropdownWidth
              )}
              type="button"
            >
              <span className="flex items-center gap-2 text-sm truncate">
                {selectedOption?.icon && <span>{selectedOption.icon}</span>}
                <span>{selectedOption?.label || dropdownPlaceholder}</span>
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            sideOffset={4}
          >
            <Command>
              <CommandInput placeholder={searchPlaceholder} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value} ${option.description || ''}`}
                      onSelect={() => handleOptionSelect(option.value)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === option.value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {option.icon && <span className="mr-2">{option.icon}</span>}
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        {option.description && (
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        )}
                      </div>
                      <span className="ml-auto text-muted-foreground text-sm">{option.value}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Input
          ref={inputRef}
          type={inputType}
          placeholder={placeholder}
          className="rounded-none rounded-r-md h-10 flex-1"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={ariaLabel || (label ? `${label} input` : 'Input field')}
        />
      </div>

      {error && <p className="text-sm font-medium text-destructive mt-2">{error.message}</p>}
    </div>
  );
}

export default FormDropdownInput;
