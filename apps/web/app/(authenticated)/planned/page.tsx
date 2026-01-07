'use client';

import Container from '@/components/common/Container';
import LoadingScreen from '@/components/common/LoadingScreen';
import NoResults from '@/components/common/NoResults';
import Timeline from '@/components/planned-events/Timeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { EventParams } from '@/lib/axios/event-API';
import { useGetUpcomingEvents } from '@/lib/react-query/event';
import {
  NO_PLANNED_EVENTS_MESSAGE,
  NO_PLANNED_EVENTS_TITLE,
  NO_PAST_EVENTS_TITLE,
} from '@/utils/constants';
import { useState } from 'react';

const PlannedEvents = () => {
  return (
    <Container asChild>
      <main className="mt-8 flex select-none flex-col justify-start md:justify-normal">
        <Tabs defaultValue="upcoming">
          <section className="flex flex-col items-start justify-between gap-5 md:flex-row">
            <h1 className="text-3xl font-semibold">
              You are <span className="text-primary">Going To</span>
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

          <TabsContent value="upcoming" className="my-12">
            <UpcomingEvents />
          </TabsContent>

          <TabsContent value="past" className="my-12">
            <PastEvents />
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  );
};

const UpcomingEvents = () => {
  const [filter] = useState<EventParams>({
    page: 1,
    limit: 10,
    startDate: new Date(),
  });
  const { data, isLoading, isError } = useGetUpcomingEvents(filter);

  if (isLoading) return <LoadingScreen className="h-96" />;

  if (isError) return <div>Error loading events</div>;
  if (data?.events.length === 0)
    return (
      <NoResults
        image="/images/no-event-image.svg"
        altText="no-event-image"
        imgWidth={200}
        showBtn
        btnText="Discover Events"
        btnLink="/discover"
        imgHeight={200}
        title={NO_PLANNED_EVENTS_TITLE}
        message={NO_PLANNED_EVENTS_MESSAGE}
      />
    );
  return <Timeline events={data?.events} />;
};

const PastEvents = () => {
  const [filter] = useState<EventParams>({
    page: 1,
    limit: 10,
    endDate: new Date(),
  });

  const { data, isLoading, isError } = useGetUpcomingEvents(filter);

  if (isLoading) return <LoadingScreen className="h-96" />;

  if (isError) return <div>Error loading events</div>;

  if (data?.events.length === 0)
    return (
      <NoResults
        image="/images/no-event-image.svg"
        altText="no-event-image"
        imgWidth={200}
        imgHeight={200}
        title={NO_PAST_EVENTS_TITLE}
        message={NO_PLANNED_EVENTS_MESSAGE}
        showBtn={true}
        btnText="Discover Events"
        btnLink="/discover"
      />
    );

  return <Timeline events={data?.events} />;
};

export default function Page() {
  return <PlannedEvents />;
}
