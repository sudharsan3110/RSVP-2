'use client';

import { Control, FieldPath, FieldValues, Path, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover } from '@radix-ui/react-popover';
import { PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { Calendar, CalendarProps } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/formatDate';

function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  description,
  label,
  className,
  iconClassName,
  initialFocus,
  ...calendarProps
}: {
  label?: string;
  control: Control<TFieldValues>;
  className?: string;
  iconClassName?: string;
  name: TName;
  description?: string;
  initialFocus?: boolean;
} & Omit<CalendarProps, 'selected' | 'onSelect' | 'mode'>) {
  const { clearErrors } = useFormContext<TFieldValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex w-full flex-col">
          {label && <FormLabel>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'focus:ring-offset-0.5 rounded-[6px] border-dark-500 bg-dark-900 pl-3 text-left font-normal focus:outline-none focus:ring-2 focus:ring-primary/80',
                    !field.value && 'text-white',
                    className
                  )}
                >
                  {field.value ? formatDate(field.value, { dateOnly: true }) : <span>Date</span>}
                  <CalendarIcon className={cn('ml-auto h-4 w-4 opacity-50', iconClassName)} />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                required
                selected={field.value}
                onSelect={(date: Date | undefined) => {
                  field.onChange(date);
                  clearErrors([name, 'fromDateTime'] as Path<TFieldValues>[]);
                }}
                initialFocus={initialFocus}
                {...calendarProps}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormDatePicker;
