'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function FormInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  lableClassName,
  inputClassName,
  label,
  children,
  className,
  ...props
}: {
  label?: string;
  control: Control<TFieldValues>;
  className?: string;
  lableClassName?: string;
  children?: React.ReactNode;
  inputClassName?: string;
  name: TName;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel className={cn('text-white', lableClassName)}>{label}</FormLabel>}
          <FormControl className="flex">
            <div>
              {children}
              <Input
                className={cn('rounded-[6px] bg-dark-900 text-white', inputClassName)}
                {...props}
                {...field}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormInput;
