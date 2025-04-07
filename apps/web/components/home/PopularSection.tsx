import Container from '@/components/common/Container';
import EventCard from '@/components/common/EventCard';
import { usePopularEvents } from '@/lib/react-query/event';
import { IEvent } from '@/types/event';
import Link from 'next/link';
import SigninDialog from '@/components/auth/SigninDialog.tsx';

const PopularSection = () => {
  const { data: events, isLoading } = usePopularEvents(3);

  if (isLoading || (events && events.length === 0)) {
    return <></>;
  }

  return (
    <Container className="relative z-10 space-y-8 md:space-y-12 animate-fade-in text-secondary">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wide md:text-[28px]">Popular Events</h2>
        <Link href="/discover" className="hidden md:block">
          See all events
        </Link>
      </header>
      <div className="grid grid-cols-4 gap-10 sm:grid-cols-8 xl:grid-cols-12">
        {events?.map((event: IEvent) => (
              <EventCard key={event.id} className="col-span-4" event={event} />
        ))}
      </div>
      <SigninDialog variant={'signup'}>
        <Link href="/discover" className="mx-auto block w-fit md:hidden">
          See all events
        </Link>
      </SigninDialog>
    </Container>
  );
};

export default PopularSection;
