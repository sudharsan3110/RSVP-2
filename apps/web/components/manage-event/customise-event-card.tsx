import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CalendarIcon, MapPinIcon } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

const CustomiseEventCard = ({ className }: PropsWithClassName) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customise Event</CardTitle>
        <CardDescription>
          Customise your event page with title and description to attract more attendees.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-12 md:flex-row">
        <Image
          priority
          src="/images/demo-event-image.png"
          width={300}
          height={300}
          className="aspect-square w-full rounded-[8px] object-cover md:h-40 md:w-40"
          alt={'event-image'}
        />
        <div className="flex flex-col justify-between gap-4">
          <header className="space-y-1">
            <h2 className="line-clamp-2 text-left text-xl font-semibold text-white">
              Comic Con 2024, Banglore
            </h2>
            <p className="text-sm text-secondary">Hosted By - Quireverse, Anime Community</p>
          </header>
          <div className="flex items-center gap-3.5">
            <MapPinIcon className="size-5 shrink-0" />
            <p className="line-clamp-2 font-medium text-white">New York City</p>
          </div>
          <div className="flex gap-3.5 text-sm">
            <CalendarIcon className="mt-[3px] size-5 shrink-0" />
            <div className="flex flex-wrap gap-3.5">
              <div>
                <p className="mb-1 text-xs font-semibold">From</p>
                <span className="font-medium">12 Dec 2023</span>
                <span className="ml-1 font-medium">10:00 AM</span>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold">To</p>
                <span className="font-medium">15 Dec 2023</span>
                <span className="ml-1 font-medium">4:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row">
        <Button className="w-full sm:flex-1" radius="sm" variant="tertiary">
          Edit Event
        </Button>
        <Button className="w-full sm:flex-1" radius="sm" variant="tertiary">
          Share Event
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomiseEventCard;
