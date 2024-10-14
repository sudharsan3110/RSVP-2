import { cn } from '@/lib/utils';
import { CheckCircleIcon } from '@heroicons/react/16/solid';
import { BookmarkSquareIcon, TicketIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const EventCard = ({ className }: PropsWithClassName) => {
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
        <span className="text-xl font-bold">Comic Con 2024, Banglore</span>
        <span className="mb-3 font-semibold">Hosted By - Quireverse, Anime Community</span>
        <span className="font-bold">10:00 AM, 12 May 2024</span>
        <span className="font-medium">Banglore, Karnataka</span>
      </p>
      <footer className="flex items-center text-sm">
        <div className="flex items-center">
          <CheckCircleIcon className="mr-2 w-[18px]" />
          <span>402 going</span>
        </div>
        <Separator orientation="vertical" className="mx-3 h-4" />
        <div className="flex items-end">
          <TicketIcon className="mr-2 w-[18px]" />
          <span>Free</span>
        </div>
        <Button variant={'ghost'} size={'icon'} className="ml-auto h-6 w-6 !p-0">
          <BookmarkSquareIcon className="w-[18px]" />
        </Button>
      </footer>
    </article>
  );
};

export default EventCard;
