import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import Image from 'next/image';
import { Button } from '../ui/button';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { IEventCard } from '@/types/event.ts';
import dayjs from 'dayjs';

export enum EventCardType {
  MANAGE_EVENT = 'MANAGE_EVENT',
  VIEW_SLUG = 'VIEW_SLUG',
}

const EventCard = ({ className, event }: IEventCard) => {
  const router = useRouter();

  const handleBtnClick = ({ id, type }: { id?: string; type: string }) => {
    if (!id) return;
    switch (type) {
      case EventCardType.MANAGE_EVENT:
        router.push(`/events/${id}/manage`);
        break;
      case EventCardType.VIEW_SLUG:
        router.push(`/${id}`);
        break;
      default:
        break;
    }
  };

  return (
    <article
      className={cn('space-y-2.5 rounded-[10px] border border-dark-500 bg-dark-900 p-3', className)}
    >
      <figure>
        <Image
          priority
          src="/images/demo-event-image.png"
          width={300}
          height={200}
          className="h-44 w-full rounded-[8px] object-cover"
          alt={'demo-event-image'}
        />
      </figure>
      <p className="flex flex-col">
        <span className="text-xl font-bold">{event?.name}</span>
        <span className="mb-3 font-semibold">{event?.host}</span>
        <span className="font-bold">
          {event?.startTime ? dayjs(event.startTime).format('HH:mm A, DD MMM YYYY') : ''}
        </span>
        <span className="font-medium">{event?.venueAddress?.substring(0, 35)}</span>
      </p>
      <section className="flex items-center text-sm">
        <div className="flex items-center">
          <CheckCircleIcon className="mr-2 w-[18px]" />
          <span>{event?.numberOfAttendees} going</span>
        </div>
      </section>
      <Button
        onClick={() => {
          handleBtnClick({ id: event?.id, type: EventCardType.MANAGE_EVENT });
        }}
        variant="tertiary"
        radius="default"
        className="w-full border-primary"
      >
        Manage <ArrowUpRightIcon className="ml-2 h-4 w-4" />
      </Button>
      {event && (
        <Button
          onClick={() => {
            handleBtnClick({ id: event?.slug, type: EventCardType.VIEW_SLUG });
          }}
          variant="tertiary"
          radius="default"
          className="w-full border-primary"
        >
          Public View <ArrowUpRightIcon className="ml-2 h-4 w-4" />
        </Button>
      )}
    </article>
  );
};

export default EventCard;
