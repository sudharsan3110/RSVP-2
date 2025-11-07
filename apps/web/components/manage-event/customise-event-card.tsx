'use client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrentUser } from '@/lib/react-query/auth';
import { formatDateTime } from '@/lib/utils';
import { Event } from '@/types/events';
import { isCurrentUserCohost, venueDisplay } from '@/utils/event';
import {
  CalendarIcon,
  Check,
  ClockIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  Share2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type CustomiseEventCarDProps = {
  className: string;
  event: Event;
  isSuccess: boolean;
};

const CustomiseEventCard = ({ className, event, isSuccess }: CustomiseEventCarDProps) => {
  const { id } = useParams();
  if (typeof id !== 'string') notFound();

  const { data: userData } = useCurrentUser();

  const isCohost = isCurrentUserCohost(userData, event.cohosts);

  const [showCopied, setShowCopied] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  if (!isSuccess) return notFound();

  const { date, time } = formatDateTime(event.startTime.toISOString());
  const { date: endDate, time: endTime } = formatDateTime(event.endTime.toISOString());

  const handleShare = async () => {
    try {
      const currentUrl = new URL(window.location.href);
      const eventPublicURL = `${currentUrl.protocol}//${currentUrl.host}/${event.slug}`;
      await navigator.clipboard.writeText(eventPublicURL);

      setShowCopied(true);
      setTooltipOpen(true);

      setTimeout(() => {
        setShowCopied(false);
        setTooltipOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderVenueInfo = () => {
    if (event.isPhysical) {
      return (
        <div className="flex items-center gap-3.5">
          <MapPinIcon className="size-5 shrink-0" />
          <p className="line-clamp-2 max-w-sm truncate font-medium text-white">
            {venueDisplay(event)}
          </p>
        </div>
      );
    }

    if (event.isVirtual) {
      return (
        <div className="flex items-center gap-3.5">
          <LinkIcon className="size-5 shrink-0" />
          <Link
            href={event.venueUrl ?? ''}
            target="_blank"
            className="line-clamp-2 max-w-sm truncate font-medium text-white hover:underline hover:text-primary"
          >
            {venueDisplay(event)}
          </Link>
        </div>
      );
    }

    if (event.isLater) {
      return (
        <div className="flex items-center gap-3.5">
          <ClockIcon className="size-5 shrink-0" />
          <p className="line-clamp-2 max-w-sm truncate font-medium text-white">To be announced</p>
        </div>
      );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center space-y-0 justify-between">
        <div>
          <CardTitle className="item-center">{event.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          {!isCohost && (
            <Link href={`/events/${id}/edit`} className="w-full sm:flex-1">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="group flex h-10 w-10 items-center justify-center border-0 p-0"
                      radius="sm"
                      variant="tertiary"
                    >
                      <PencilIcon className="size-5 text-white transition-colors group-hover:text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Edit Event</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Link>
          )}
          <TooltipProvider delayDuration={100}>
            <Tooltip
              open={tooltipOpen}
              onOpenChange={(open) => {
                if (!showCopied) {
                  setTooltipOpen(open);
                }
              }}
            >
              <TooltipTrigger asChild>
                <Button
                  className="group flex h-10 w-10 items-center justify-center border-0 p-0"
                  radius="sm"
                  variant="tertiary"
                  onClick={handleShare}
                >
                  {showCopied ? (
                    <div className="flex size-10 items-center justify-center ">
                      <Check className="size-5 text-primary" />
                    </div>
                  ) : (
                    <Share2 className="size-5 text-white transition-colors group-hover:text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="">
                {showCopied ? 'Event link Copied' : 'Share Event'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-12 md:flex-row">
        <figure className="relative md:h-40 md:w-40 aspect-square">
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 bg-center bg-cover filter blur-xl scale-105"
              style={{ backgroundImage: `url(${event?.eventImageUrl})` }}
            />
            <Image
              priority
              src={event.eventImageUrl}
              width={300}
              height={300}
              className="relative z-10 aspect-square w-full rounded-[8px] object-contain md:h-40 md:w-40"
              alt="event-image"
            />
          </div>
        </figure>
        <div className="flex flex-col justify-between gap-4">
          <header className="space-y-1">
            <h2 className="line-clamp-2 text-left text-xl font-semibold text-white">
              {event.name}
            </h2>
            <p className="text-sm text-secondary">Hosted By - {event.creator?.fullName}</p>
          </header>
          {renderVenueInfo()}
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
      <CardFooter></CardFooter>
    </Card>
  );
};

export default CustomiseEventCard;
