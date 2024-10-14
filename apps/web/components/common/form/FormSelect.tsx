'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

function FormGroupSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  options,
  className,
  disabled,
  defaultValue,
}: {
  label?: string;
  control: Control<TFieldValues>;
  options: { value: string; label: string }[];
  className?: string;
  name: TName;
  description?: string;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full text-white">
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            disabled={disabled}
            onValueChange={field.onChange}
            value={field.value}
            defaultValue={defaultValue}
          >
            <FormControl>
              <SelectTrigger
                className={cn('rounded-[6px] bg-dark-900', className)}
                iconClassName="opacity-100"
              >
                {options.find((option) => option.value == field.value)?.label ?? (
                  <SelectValue placeholder={placeholder} />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-[6px] bg-dark-900">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="rounded-[6px]">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormGroupSelect;
