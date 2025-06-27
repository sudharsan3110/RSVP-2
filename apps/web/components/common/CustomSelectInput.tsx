'use client';

import type React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, X } from 'lucide-react';
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

interface CustomSelectSingleFieldProps {
  options: SelectOption[];
  placeholder?: string;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  value?: number;
  className?: string;
  ariaLabel?: string;
  allowCustomInput?: boolean;
  emptyMessage?: string;
}

export default function CustomSelectInput({
  options,
  value,
  placeholder = 'Select or type...',
  defaultValue,
  onValueChange,
  className = 'w-[90vw] hover:rounded-[8px] md:w-[200px]',
  ariaLabel,
  allowCustomInput = true,
  emptyMessage = 'No options found',
}: CustomSelectSingleFieldProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>((value ?? defaultValue)?.toString() || '');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [customInputMode, setCustomInputMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (value !== undefined && !isTypingRef.current) {
      const selectedOption = options.find((opt) => opt.value === value);
      if (selectedOption && !selectedOption.isOthers) {
        setInputValue(selectedOption.label);
        setCustomInputMode(false);
      } else if (selectedOption?.isOthers || !selectedOption) {
        setInputValue(value.toString());
        setCustomInputMode(true);
      }
    }
  }, [value, options]);

  const updateFilteredOptions = useCallback(() => {
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
  }, [inputValue, options, customInputMode]);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateFilteredOptions();
    }, 100);
    return () => clearTimeout(handler);
  }, [updateFilteredOptions]);

  const handleInputChange = (newValue: string) => {
    isTypingRef.current = true;
    setInputValue(newValue);
    const parsed = Number(newValue);
    if (!isNaN(parsed)) {
      onValueChange?.(parsed);
    }
    if (!open) {
      setOpen(true);
    }

    setTimeout(() => {
      isTypingRef.current = false;
    }, 100);
  };

  const handleInputFocus = () => {
    setOpen(true);
  };

  const handleInputBlur = () => {
    if (
      allowCustomInput &&
      customInputMode &&
      inputValue &&
      !options.some((opt) => opt.value === Number(inputValue))
    ) {
      setTimeout(() => setOpen(false), 150);
    }
    isTypingRef.current = false;
  };

  const handleSelectOption = (option: SelectOption) => {
    if (option.isOthers) {
      setCustomInputMode(true);
      setInputValue('');
      onValueChange?.(0);
      inputRef.current?.focus();
    } else {
      setInputValue(option.label);
      setCustomInputMode(false);
      onValueChange?.(option.value);
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleAcceptCustomValue = () => {
    const parsed = Number(inputValue);
    if (!isNaN(parsed)) {
      onValueChange?.(parsed);
    }
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setInputValue('');
    setCustomInputMode(false);
    onValueChange?.(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (allowCustomInput && customInputMode && inputValue) {
        handleAcceptCustomValue();
      } else if (!open) {
        setOpen(true);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown' && !open) {
      setOpen(true);
    }
  };

  const isCustomValue =
    allowCustomInput &&
    customInputMode &&
    inputValue &&
    !options.some((opt) => opt.value === Number(inputValue)) &&
    !isNaN(Number(inputValue));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn('relative', className)}>
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="pr-20"
            aria-label={ariaLabel}
            readOnly={!customInputMode}
          />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {inputValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-muted"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => setOpen(!open)}
            >
              <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
            </Button>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
        onInteractOutside={(e) => {
          if (inputRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <Command>
          <CommandList>
            {isCustomValue && (
              <CommandGroup>
                <CommandItem
                  value={`custom-${inputValue}`}
                  onSelect={handleAcceptCustomValue}
                  className="cursor-pointer bg-muted/50"
                >
                  <div className="flex flex-col w-full">
                    <span className="font-medium">Use {inputValue}</span>
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
  );
}
