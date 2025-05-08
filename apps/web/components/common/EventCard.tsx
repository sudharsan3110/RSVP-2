import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';
import { venueDisplay } from '@/utils/event';
import { Event } from '@/types/events';

type CardProps = {
  className?: string;
  event: Event;
  type: 'manage' | 'guest';
};

const Card = ({ className, event, type }: CardProps) => {
  return (
    <article
      className={cn(
        'space-y-2.5 rounded-[10px] border border-dark-500 bg-dark-900 p-3 hover:scale-105 transition-transform duration-300 ease-in-out',
        className
      )}
    >
      <figure className="relative mx-auto mb-4 w-full aspect-auto">
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <div
            className="absolute inset-0 bg-center bg-cover filter blur-xl scale-105"
            style={{ backgroundImage: `url(${event?.eventImageUrl})` }}
          />
          <Image
            priority
            src={event?.eventImageUrl}
            width={300}
            height={200}
            className="relative z-10 h-44 w-full rounded-[8px] object-contain"
            alt="event-image"
          />
        </div>
      </figure>
      <section className="flex flex-col">
        <span className="text-xl font-bold line-clamp-1">{event?.name}</span>
        <span className="mb-3 font-semibold">Hosted By - {event?.creator?.fullName}</span>
        <span className="font-bold">
          {event?.startTime ? dayjs(event.startTime).format('HH:mm A, DD MMM YYYY') : ''}
        </span>
        <span className="font-medium">{venueDisplay(event)}</span>
      </section>
      {/* {!!event?.numberOfAttendees && event?.numberOfAttendees > 0 && (
        <section className="flex items-center text-sm">
          <CheckCircleIcon className="mr-2 w-[18px]" />
          <span>{event?.numberOfAttendees} going</span>
        </section>
      )} */}
      {type === 'manage' && (
        <>
          <Link href={`/events/${event?.id}/manage`} passHref className="block">
            <Button variant="tertiary" radius="default" className="w-full border-primary">
              Manage <ArrowUpRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/${event?.slug}`} passHref className="block">
            <Button variant="tertiary" radius="default" className="w-full border-primary">
              Public View <ArrowUpRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </>
      )}
    </article>
  );
};

const EventCard = ({ className, event, type }: CardProps) => {
  if (type === 'manage') {
    return <Card className={className} event={event} type={type} />;
  }

  return (
    <Link href={`/${event?.slug}`} className={className}>
      <Card event={event} type={type} />
    </Link>
  );
};
export default EventCard;
