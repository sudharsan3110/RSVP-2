import { Skeleton } from '../ui/skeleton';

function TicketPageSkeleton() {
  return (
    <div className="container-main my-10">
      <header className="space-y-2">
        <Skeleton className="h-10 w-3/4 md:h-12" />
        <Skeleton className="h-10 w-1/2 md:h-12" />
      </header>
      <div className="my-6 flex flex-col items-center gap-x-10 md:flex-row">
        <div className="mb-6 w-full md:m-auto md:w-1/2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-4/6" />
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-x-10 gap-y-3 md:w-1/2 md:flex-row">
          <Skeleton className="h-12 w-full rounded-[6px] md:w-1/2" />
          <Skeleton className="h-12 w-full rounded-[6px] md:w-1/2" />
        </div>
      </div>
      <section className="relative my-20 flex w-full flex-col items-stretch justify-between md:h-[368px] md:flex-row">
        <div className="absolute inset-0 h-full w-full rounded-[40px] bg-muted" />
        <div className="relative flex items-center px-16 py-12 md:w-2/5 md:py-0">
          <Skeleton className="h-56 w-56 rounded-[2rem]" />
        </div>
        <div className="relative flex items-center py-[72px] md:w-3/5 md:py-5">
          <div className="flex flex-col gap-y-6 px-5 md:px-[70px]">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-8 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-2 h-6 w-64" />
            </div>
            <div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-8 w-48" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TicketPageSkeleton;
