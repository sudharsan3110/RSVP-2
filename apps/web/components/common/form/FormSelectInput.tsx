'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import { FormControl, FormItem, FormLabel } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface SelectOption {
  value: number;
  label: string;
  isOthers?: boolean;
}

interface FormSelectInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: TFieldValues[TName];
  className?: string;
  ariaLabel?: string;
  allowCustomInput?: boolean;
  emptyMessage?: string;
  disabled?: boolean;
}

function FormSelectInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  options,
  placeholder,
  defaultValue,
  className,
  ariaLabel,
  allowCustomInput = true,
  emptyMessage = 'No options found',
  disabled = false,
}: FormSelectInputProps<TFieldValues, TName>) {
  const [open, setOpen] = useState(false);
  const [customInputMode, setCustomInputMode] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    defaultValue,
  });

  const updateFilteredOptions = useCallback(
    (inputValue: string) => {
      if (inputValue && customInputMode) {
        const filtered = options.filter(
          (option) =>
            option.isOthers ||
            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.value.toString().includes(inputValue)
        );
        setFilteredOptions(filtered);
      } else {
        setFilteredOptions(options);
      }
    },
    [options, customInputMode]
  );

  useEffect(() => {
    if (field.value === undefined && defaultValue !== undefined && !isTypingRef.current) {
      field.onChange(defaultValue);
      const selectedOption = options.find((opt) => opt.value === (defaultValue as number));
      setCustomInputMode(!!selectedOption?.isOthers);
    }
  }, [field, defaultValue, options]);

  useEffect(() => {
    if (isTypingRef.current) return;

    const newDisplayValue = customInputMode
      ? field.value && field.value !== 0
        ? field.value.toString()
        : ''
      : options.find((opt) => opt.value === field.value)?.label || field.value?.toString() || '';
    setDisplayValue(newDisplayValue);
  }, [field.value, customInputMode, options]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilteredOptions(displayValue);
    }, 100);
    return () => clearTimeout(handler);
  }, [displayValue, updateFilteredOptions]);

  const handleInputChange = (newValue: string) => {
    isTypingRef.current = true;
    setDisplayValue(newValue);
    const parsed = Number(newValue);
    const valueToSet = newValue === '' ? undefined : !isNaN(parsed) ? parsed : undefined;

    field.onChange(valueToSet);
    if (!open) {
      setOpen(true);
    }
    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  };

  const handleSelectOption = (option: SelectOption) => {
    if (option.isOthers) {
      setCustomInputMode(true);
      const currentValue = field.value?.toString() || '';
      setDisplayValue(currentValue);
      setTimeout(() => {
        inputRef.current?.focus();
        if (inputRef.current) {
          inputRef.current.select();
        }
      }, 10);
    } else {
      setCustomInputMode(false);
      field.onChange(option.value);
      setOpen(false);
    }
  };

  const handleAcceptCustomValue = () => {
    const parsed = Number(displayValue);
    if (!isNaN(parsed)) {
      field.onChange(parsed);
    }
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (allowCustomInput && customInputMode && displayValue) {
        handleAcceptCustomValue();
      } else if (!open) {
        setOpen(true);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  const isCustomValue =
    allowCustomInput &&
    customInputMode &&
    displayValue &&
    !options.some((opt) => opt.value === Number(displayValue)) &&
    !isNaN(Number(displayValue));

  return (
    <FormItem className="w-full">
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Popover open={open} onOpenChange={setOpen} modal={false}>
          <PopoverTrigger asChild>
            <div className={cn('relative', className)}>
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={displayValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={() => setOpen(true)}
                className="pr-10 cursor-pointer"
                aria-label={ariaLabel}
                readOnly={!customInputMode}
                disabled={disabled}
                autoComplete="off"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform text-muted-foreground',
                    open && 'rotate-180'
                  )}
                />
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
            }}
          >
            <Command>
              <CommandList>
                {isCustomValue && (
                  <CommandGroup>
                    <CommandItem
                      value={`custom-${displayValue}`}
                      onSelect={handleAcceptCustomValue}
                      className="cursor-pointer bg-muted/50"
                    >
                      <div className="flex flex-col w-full">
                        <span className="font-medium">Use {displayValue}</span>
                        <span className="text-xs text-muted-foreground">
                          Press Enter or click to confirm
                        </span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                )}
                {filteredOptions.length > 0 && (
                  <CommandGroup>
                    {filteredOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value.toString()}
                        onSelect={() => handleSelectOption(option)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          {option.value.toString() !== option.label && !option.isOthers && (
                            <span className="text-xs text-muted-foreground">{option.value}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {filteredOptions.length === 0 && !isCustomValue && (
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </FormControl>
      {error && <p className="text-sm font-medium text-destructive">{error.message}</p>}
    </FormItem>
  );
}

export default FormSelectInput;
