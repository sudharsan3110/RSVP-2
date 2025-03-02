import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';

interface EventCardSkeletonProps {
  className?: string;
}

export const EventCardSkeleton = ({ className }: EventCardSkeletonProps) => {
  return (
    <article
      className={cn('space-y-2.5 rounded-[10px] border border-dark-500 bg-dark-900 p-3', className)}
    >
      <figure>
        <Skeleton className="h-44 w-full rounded-[8px]" />
      </figure>
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-5 w-4/5" />
      </div>
      <section className="flex items-center text-sm">
        <Skeleton className="h-6 w-24" />
      </section>
      <Skeleton className="h-9 w-full rounded-full" />
      <Skeleton className="h-9 w-full rounded-full" />
    </article>
  );
};
