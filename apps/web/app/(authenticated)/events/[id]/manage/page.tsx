'use client';

import Container from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewSection from '@/components/manage-event/overview-section';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import GuestManageSection from '@/components/manage-event/guest-manage-section';
import MoreSection from '@/components/manage-event/more-section';
import Communication from '@/components/manage-event/Communication';
import { useParams } from 'next/navigation';

const ManageEventPage = () => {
  const params = useParams();
  return (
    <Container className="min-h-screen space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Comin Con 2024</h1>
          <p className="text-secondary">Manage your event</p>
        </div>
        <Button variant="tertiary" radius="sm">
          Event Page <ArrowUpRightIcon className="ml-2 h-4 w-4" />
        </Button>
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
            <Communication eventId={params.id} />
          </TabsContent>
          <TabsContent className="mt-6" value="more">
            <MoreSection />
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  );
};

export default ManageEventPage;
