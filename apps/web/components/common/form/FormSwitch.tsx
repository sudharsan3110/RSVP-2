'use client';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

function FormSwitch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  description,
  label,
  className,
  containerClassName,
  thumbClassName,
}: {
  label?: string;
  control: Control<TFieldValues>;
  className?: string;
  containerClassName?: string;
  thumbClassName?: string;
  name: TName;
  description?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'space-y-3 rounded-md border border-dark-500 bg-dark-900 p-3',
            containerClassName
          )}
        >
          <div className="space-y-1">
            {label && <FormLabel className="text-base font-semibold text-white">{label}</FormLabel>}
            {description && <FormDescription>{description}</FormDescription>}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              className={className}
              thumbClassName={thumbClassName}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

export default FormSwitch;
