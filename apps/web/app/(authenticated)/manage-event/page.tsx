'use client';
import Container from '@/components/common/Container';
import EventDetailsTable from '@/components/manage-event/EventDetailsTable';
import { EventHeroSection } from '@/components/manage-event/EventHeroSection';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';

const ManageEventPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const TAB_ITEMS = [
    { value: 'overview', label: 'Overview' },
    { value: 'guests', label: 'Guests' },
    { value: 'communication', label: 'Communication' },
    { value: 'more', label: 'More' },
  ];

  return (
    <Container className="container-main py-8">
      <div className="flex justify-between">
        <div>
          <h2 className="text-2xl/[2.25rem] font-semibold text-white">Comic Con 2024</h2>
          <div className="mt-1 flex items-baseline justify-between">
            <p className="font-medium text-secondary">Manage your Event</p>
          </div>
        </div>
        <div className="h-[36px] w-[133px] rounded-lg border border-zinc-700 bg-zinc-800">
          <button className="flex pl-3 pt-[0.4rem]">
            Event Page <ArrowUpRight />
          </button>
        </div>
      </div>
      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="mb-2 mt-9 flex h-auto justify-start bg-transparent"
            style="underline"
          >
            {TAB_ITEMS.map((e, i) => {
              return (
                <TabsTrigger
                  value={e.value}
                  key={i}
                  style="underline"
                  className="relative px-4 text-sm font-medium data-[state=active]:text-purple-700 data-[state=active]:shadow-none"
                >
                  {e.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>
      <EventHeroSection />
      <EventDetailsTable />
    </Container>
  );
};

export default ManageEventPage;
