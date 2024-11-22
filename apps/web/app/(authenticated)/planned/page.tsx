'use client';

import Container from '@/components/common/Container';
import Timeline from '@/components/planned-events/Timeline';
import NullScreen from '@/components/common/NullScreen';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PlannedEvents = () => {
  return (
    <Tabs defaultValue="upcoming">
      <Container asChild>
        <main className="mt-8 flex select-none flex-col justify-start md:justify-normal">
          <section className="mb-12 flex flex-col items-start justify-between gap-5 md:flex-row">
            <h1 className="text-3xl font-semibold md:text-3xl">
              Your Planned <span className="text-primary">Events</span>
            </h1>

            <TabsList style="default">
              <TabsTrigger value="upcoming" style="default">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" style="default">
                Past
              </TabsTrigger>
            </TabsList>
          </section>

          <TabsContent value="upcoming">
            <Timeline />
          </TabsContent>

          <TabsContent value="past">
            <NullScreen />
          </TabsContent>
        </main>
      </Container>
    </Tabs>
  );
};

export default PlannedEvents;
