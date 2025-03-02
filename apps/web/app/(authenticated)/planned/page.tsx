'use client';

import Container from '@/components/common/Container';
import NoResults from '@/components/common/NoResults';
import Timeline from '@/components/planned-events/Timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eventAPI } from '@/lib/axios/event-API';
import { IEvent } from '@/types/event';
import { NO_PLANNED_EVENTS_MESSAGE, NO_PLANNED_EVENTS_TITLE } from '@/utils/constants';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PlannedEvents = () => {
  const searchParams = useSearchParams();
  const params: Record<string, string | undefined> = Object.fromEntries(searchParams.entries());

  const today = new Date();
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery<IEvent[] | null>({
    queryKey: ['events', params],
    queryFn: () => eventAPI.getEventsBySearchParams(params),
  });

  const upcomingEvents = events
    ?.filter((event) => new Date(event.endTime) >= today)
    .sort(
      (event1, event2) =>
        new Date(event1.startTime).getTime() - new Date(event2.startTime).getTime()
    );

  const pastEvents = events
    ?.filter((event) => new Date(event.endTime) < today)
    .sort(
      (event1, event2) =>
        new Date(event2.startTime).getTime() - new Date(event1.startTime).getTime()
    );

  if (isLoading) {
    return (
      <Container className="container-main pt-8">
        <h1 className="text-primary-500">Loading event details...</h1>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container className="container-main pt-8">
        <h1 className="text-red-500">Error loading event details. Please try again later.</h1>
      </Container>
    );
  }

  return events?.length != 0 ? (
    <Tabs defaultValue="upcoming">
      <Container asChild>
        <main className="mt-8 flex select-none flex-col justify-start md:justify-normal">
          <section className="mb-12 flex flex-col items-start justify-between gap-5 md:flex-row">
            <h1 className="text-3xl font-semibold md:text-3xl">
              Your Planned <span className="text-primary">Events</span>
            </h1>

            <TabsList variant="default">
              <TabsTrigger value="upcoming" variant="default">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" variant="default">
                Past
              </TabsTrigger>
            </TabsList>
          </section>

          <TabsContent value="upcoming">
            {upcomingEvents && <Timeline events={upcomingEvents} />}
          </TabsContent>

          <TabsContent value="past">{pastEvents && <Timeline events={pastEvents} />}</TabsContent>
        </main>
      </Container>
    </Tabs>
  ) : (
    <section className="mx-auto my-48 w-full max-w-[352px] text-center">
      <NoResults title={NO_PLANNED_EVENTS_TITLE} message={NO_PLANNED_EVENTS_MESSAGE} />
    </section>
  );
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlannedEvents />
    </Suspense>
  );
}
