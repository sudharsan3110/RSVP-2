import { Skeleton } from '@/components/ui/skeleton';

export default function EventDetailLoading() {
  return (
    <section
      className="container-main w-full max-w-[90rem] pt-8"
      aria-busy="true"
      aria-label="Loading event details"
    >
      <main>
        <div className="relative mx-auto h-[300px] w-full overflow-hidden sm:h-[350px] sm:w-[600px] md:h-[400px] md:w-[800px] lg:h-[600px] lg:w-[970px]">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>

        <div className="my-6 flex flex-col items-start md:my-12">
          <Skeleton className="mb-4 h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4 md:h-10 md:w-1/2" />
        </div>

        <div className="flex flex-col-reverse items-start justify-between gap-8 md:flex-row">
          <div className="mt-6 w-full md:mt-0 md:w-[60%]">
            <div className="mb-6 flex items-center">
              <Skeleton className="mr-5 h-12 w-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>

            <div className="flex items-center">
              <Skeleton className="mr-5 h-12 w-12 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>

            <div className="mt-6 p-3 pl-0">
              <Skeleton className="mb-3 h-5 w-32" />
              <div className="mt-3 flex items-center">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="ml-3 h-4 w-40" />
              </div>
            </div>

            <div className="mt-12">
              <Skeleton className="mb-4 h-7 w-40" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>

          <div className="w-full md:w-[481px]">
            <div className="w-full rounded-lg bg-dark-900 p-6 shadow-lg">
              <Skeleton className="mb-2 h-6 w-32" />
              <Skeleton className="mb-4 h-5 w-48" />

              <div className="flex items-center pb-2 pt-4">
                <div className="flex -space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-dark-900" />
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-dark-900" />
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-dark-900" />
                  <Skeleton className="h-10 w-10 rounded-full border-2 border-dark-900" />
                </div>
                <Skeleton className="ml-3 h-4 w-16" />
              </div>

              <div className="mt-6 space-y-3">
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
