import { Skeleton } from '@/components/ui/skeleton';

export default function PlannedEventsLoading() {
  return (
    <section
      className="container-main w-full max-w-[90rem] pt-8"
      aria-busy="true"
      aria-label="Loading Planned Events"
    >
      <main className="mt-8 flex select-none flex-col justify-start md:justify-normal">
        <section className="flex flex-col items-start justify-between gap-5 md:flex-row">
          <Skeleton className="h-9 w-64" />

          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-dark-500 p-1">
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="ml-1 h-7 w-16 rounded-md" />
          </div>
        </section>

        <div className="my-12 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </main>
    </section>
  );
}
