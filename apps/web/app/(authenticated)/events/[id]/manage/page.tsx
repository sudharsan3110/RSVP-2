import Container from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewSection from '@/components/manage-event/overview-section';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const ManageEventPage = () => {
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
          <ScrollArea className="w-full sm:w-[cacl(100vh-36px)]">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="more">More</TabsTrigger>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <TabsContent className="mt-6" value="overview">
            <OverviewSection />
          </TabsContent>
        </Tabs>
      </main>
    </Container>
  );
};

export default ManageEventPage;
