import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { FieldValues, FormProvider as Form, UseFormReturn } from 'react-hook-form';

type Props<T extends FieldValues> = {
  children: ReactNode;
  methods: UseFormReturn<T>;
  className?: string;
  onSubmit: () => void;
};

export default function FormProvider<T extends FieldValues>({
  children,
  onSubmit,
  className,
  methods,
}: Props<T>) {
  return (
    <Form {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={cn(className)}>
        {children}
      </form>
    </Form>
  );
}
