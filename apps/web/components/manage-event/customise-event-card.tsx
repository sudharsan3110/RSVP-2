'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useGetEventById } from '@/lib/react-query/event';
import { formatDateTime } from '@/lib/utils';
import { CalendarIcon, Check, MapPinIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';

const CustomiseEventCard = ({ className }: PropsWithClassName) => {
  const { id } = useParams();
  if (typeof id !== 'string') notFound();

  const { data, isSuccess } = useGetEventById(id);
  const [showCopied, setShowCopied] = useState(false);

  if (!isSuccess) return notFound();

  const { event } = data;
  const { date, time } = formatDateTime(event.startTime.toISOString());
  const { date: endDate, time: endTime } = formatDateTime(event.endTime.toISOString());

  const handleShare = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);

      setShowCopied(true);

      setTimeout(() => {
        setShowCopied(false);
      }, 400);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <CardDescription> </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-12 md:flex-row">
        <Image
          priority
          src={event.eventImageUrl}
          width={300}
          height={300}
          className="aspect-square w-full rounded-[8px] object-cover md:h-40 md:w-40"
          alt="event-image"
        />
        <div className="flex flex-col justify-between gap-4">
          <header className="space-y-1">
            <h2 className="line-clamp-2 text-left text-xl font-semibold text-white">
              {event.name}
            </h2>
            <p className="text-sm text-secondary">Hosted By - {event.creator?.full_name}</p>
          </header>
          <div className="flex items-center gap-3.5">
            <MapPinIcon className="size-5 shrink-0" />
            <p className="line-clamp-2 max-w-sm truncate font-medium text-white">
              {event.venueAddress}
            </p>
          </div>
          <div className="flex gap-3.5 text-sm">
            <CalendarIcon className="mt-[3px] size-5 shrink-0" />
            <div className="flex flex-wrap gap-3.5">
              <div>
                <p className="mb-1 text-xs font-semibold">From</p>
                <span className="font-medium">{date}</span>
                <span className="ml-1 font-medium">{time}</span>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold">To</p>
                <span className="font-medium">{endDate}</span>
                <span className="ml-1 font-medium">{endTime}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 sm:flex-row">
        <Link href={`/events/${id}/edit`} className="w-full sm:flex-1">
          <Button className="w-full sm:flex-1" radius="sm" variant="tertiary">
            Edit Event
          </Button>
        </Link>
        <Button className="w-full sm:flex-1" radius="sm" variant="tertiary" onClick={handleShare}>
          {showCopied ? (
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center rounded-md bg-purple-500/20 p-1">
                <Check className="size-3.5 text-primary" />
              </div>
              <span>Link Copied</span>
            </div>
          ) : (
            'Share Event'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomiseEventCard;
