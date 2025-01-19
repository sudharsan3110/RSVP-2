'use client';

import Container from '@/components/common/Container';
import Timeline from '@/components/planned-events/Timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { eventAPI } from '@/lib/axios/event-API';
import { IEvent } from '@/types/event';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';

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

  return (
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
            <Timeline events={upcomingEvents} />
          </TabsContent>

          <TabsContent value="past">
            <Timeline events={pastEvents} />
          </TabsContent>
        </main>
      </Container>
    </Tabs>
  );
};

export default PlannedEvents;
