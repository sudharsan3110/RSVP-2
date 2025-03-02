'use client';

import Container from '@/components/common/Container';
import Communication from '@/components/manage-event/Communication';
import GuestManageSection from '@/components/manage-event/guest-manage-section';
import MoreSection from '@/components/manage-event/more-section';
import OverviewSection from '@/components/manage-event/overview-section';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetEventById } from '@/lib/react-query/event';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

const ManageEventPage = () => {
  const { id } = useParams();
  if (typeof id !== 'string') notFound();

  const { data, isLoading, isSuccess, status } = useGetEventById(id);

  if (isLoading) return <div>Loading...</div>;
  if (status === 'error') return notFound();

  if (!isSuccess) return <div>Something went wrong</div>;

  const { event } = data;
  return (
    <Container className="min-h-screen space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <p className="text-secondary">Manage your event</p>
        </div>
        <Link href={`/${event.slug}`} className="hidden sm:block">
          <Button variant="tertiary" radius="sm">
            Event Page <ArrowUpRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>
      <main>
        <Tabs defaultValue="overview">
          <ScrollArea className="w-full sm:h-[cacl(100vw-36px)]">
            <TabsList variant="underline" className="w-full">
              <TabsTrigger variant="underline" value="overview">
                Overview
              </TabsTrigger>
              <TabsTrigger variant="underline" value="guests">
                Guests
              </TabsTrigger>
              <TabsTrigger variant="underline" value="communication">
                Communication
              </TabsTrigger>
              <TabsTrigger variant="underline" value="more">
                More
              </TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <TabsContent className="mt-6" value="overview">
            <OverviewSection />
          </TabsContent>

          <TabsContent className="mt-6" value="guests">
            <GuestManageSection />
          </TabsContent>

          <TabsContent className="mt-6" value="communication">
            <Communication eventId={id} />
          </TabsContent>

          <TabsContent className="mt-6" value="more">
            <MoreSection eventId={id} slug={event.slug} />
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  );
};

export default ManageEventPage;
