'use client';

import Container from '@/components/common/Container';
import ErrorScreen from '@/components/common/ErrorScreen';
import LoadingScreen from '@/components/common/LoadingScreen';
import Communication from '@/components/manage-event/Communication';
import GuestManageSection from '@/components/manage-event/guest-manage-section';
import MoreSection from '@/components/manage-event/more-section';
import OverviewSection from '@/components/manage-event/overview-section';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useQueryParams from '@/hooks/useSearchParams';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useGetEventById } from '@/lib/react-query/event';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ManageEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryParams = useQueryParams({ defaultValues: { tab: 'overview' } });
  const tabValue = queryParams.get('tab', 'overview') as string | null;

  const { data, isLoading, isError } = useGetEventById(id);

  const handleTabChange = (value: string) => {
    queryParams.set('tab', value);
  };

  if (isError || !data) return <ErrorScreen message="Something went wrong" />;

  if (isLoading || !data) return <LoadingScreen className="min-h-screen" />;

  const { event } = data;

  return (
    <Container className="min-h-screen space-y-8 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold capitalize">{event.name}</h1>
          <p className="text-secondary">Manage your event</p>
        </div>
        <Link href={`/${event.slug}`} className="hidden sm:block">
          <Button variant="tertiary" radius="sm">
            Event Page <ArrowUpRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </header>
      <main>
        <Tabs defaultValue="overview" value={tabValue!} onValueChange={handleTabChange}>
          <ScrollArea className="w-full sm:w-[calc(100vw-36px)]">
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
            <MoreSection event={event} slug={event.slug} />
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  );
};

export default ManageEventPage;
