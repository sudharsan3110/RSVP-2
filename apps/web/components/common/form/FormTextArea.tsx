'use client';

import { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

function FormTextArea<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  description,
  descriptionClassName,
  label,
  ...props
}: {
  label?: string;
  control: Control<TFieldValues>;
  name: TName;
  description?: string;
  descriptionClassName?: string;
} & React.InputHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="text-white">
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea {...props} {...field} />
          </FormControl>
          {description && (
            <FormDescription className={descriptionClassName}>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormTextArea;
