import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  asChild?: boolean;
};

const Container = React.forwardRef<HTMLElement, Props>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'section';
    return (
      <Comp className={cn('container-main w-full max-w-[90rem]', className)} ref={ref} {...props} />
    );
  }
);

Container.displayName = 'Container';

export default Container;
