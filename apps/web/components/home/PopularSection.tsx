import Container from '@/components/common/Container';
import EventCard from '@/components/common/EventCard';
import { usePopularEvents } from '@/lib/react-query/event';
import { IEvent } from '@/types/event';
import { EventCardSkeleton } from '../common/EventCardSkeleton';
import Link from 'next/link';

const PopularSection = () => {
  const { data: events, isLoading } = usePopularEvents(3);

  if (events?.length === 0) {
    return null;
  }

  return (
    <Container className="relative z-10 space-y-8 md:space-y-12">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-wide md:text-[28px]">Popular Events</h2>
        <Link href="/discover" className="hidden md:block">
          See all events
        </Link>
      </header>
      <div className="grid grid-cols-4 gap-10 sm:grid-cols-8 xl:grid-cols-12">
        {isLoading
          ? Array(3)
              .fill(null)
              .map((_, index) => (
                <EventCardSkeleton key={`skeleton-${index}`} className="col-span-4" />
              ))
          : events?.map((event: IEvent) => (
              <EventCard key={event.id} className="col-span-4" event={event} />
            ))}
      </div>
      <Link href="/discover" className="mx-auto block w-fit md:hidden">
        See all events
      </Link>
    </Container>
  );
};

export default PopularSection;
