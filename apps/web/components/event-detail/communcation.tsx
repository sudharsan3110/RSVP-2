'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/types/events';
import { venueDisplay } from '@/utils/event';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ClockIcon, LinkIcon, UsersIcon, UserIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { ChatContainer } from '@/components/chat/chat-container';
import { useEventCommunications } from '@/lib/react-query/communication';
import { formatDate } from '@/utils/formatDate';

interface CommunicationProps {
  event: Event;
  totalAttendees: number;
  updatedAt?: string;
}

const Communication = ({ event, totalAttendees }: CommunicationProps) => {
  const { data: communicationData, isLoading: isMessagesLoading } = useEventCommunications(
    event.id
  );

  const messages = communicationData?.data ?? [];

  const formatTimeRange = () => {
    const startTime = formatDate(event.startTime, { timeOnly: true });
    const endTime = formatDate(event.endTime, { timeOnly: true });
    const startDate = formatDate(event.startTime, { dateOnly: true });
    const endDate = formatDate(event.endTime, { dateOnly: true });

    return {
      startTime,
      endTime,
      startDate,
      endDate,
      isSameDay: startDate === endDate,
    };
  };

  const timeInfo = formatTimeRange();

  const capacity = event.capacity || 0;
  const remainingSeats = capacity - totalAttendees;
  const cohosts = event.cohosts?.length ?? 0;

  return (
    <section className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatContainer
          title={`${event.name}`}
          subtitle={`Hosted by ${event?.creator?.fullName ?? event?.creator?.userName}`}
          messages={messages}
          isLoading={isMessagesLoading}
          variant="fullscreen"
        />
      </div>

      <Card className="bg-dark-900 border-dark-700 w-full lg:w-[340px]">
        <CardContent className="p-0 h-full flex flex-col">
          <div className="flex flex-col h-full">
            <div className="w-full flex-col">
              <Image
                src={event.eventImageUrl}
                alt={event.name}
                width={0}
                height={0}
                sizes="100vw"
                className="w-full h-auto object-cover rounded-t-lg"
              />
              <div className="p-6">
                {event.category && (
                  <Badge className="mb-2 text-xs font-medium tracking-wide capitalize text-white">
                    {event?.category?.name}
                  </Badge>
                )}
                <h4 className="font-semibold text-white text-lg mb-3">{event.name}</h4>
                <div className="space-y-2 text-sm text-secondary">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4 shrink-0" />
                    <span>
                      {timeInfo.isSameDay
                        ? timeInfo.startDate
                        : `${timeInfo.startDate} - ${timeInfo.endDate}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 shrink-0" />
                    <span>
                      {timeInfo.startTime} - {timeInfo.endTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event?.isPhysical && <MapPinIcon className="h-4 w-4 shrink-0" />}
                    {event?.isVirtual && <LinkIcon className="h-4 w-4 shrink-0" />}
                    {event?.isLater && <ClockIcon className="h-4 w-4 shrink-0" />}
                    <span>
                      {event?.isPhysical && venueDisplay(event)}
                      {event?.isVirtual && (
                        <Link
                          href={event?.venueUrl ?? ''}
                          target="_blank"
                          className="hover:underline hover:text-primary"
                        >
                          {venueDisplay(event)}
                        </Link>
                      )}
                      {event?.isLater && 'To be announced'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-dark-800 flex-1">
              <h5 className="font-medium text-white mb-3">Event Details</h5>
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4 shrink-0" />
                  <span>
                    {totalAttendees} attending • {capacity} capacity
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 shrink-0" />
                  <span>
                    {cohosts > 0 ? `${cohosts} cohost${cohosts > 1 ? 's' : ''}` : 'Single host'}
                  </span>
                </div>
                {remainingSeats > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                      {remainingSeats} seats remaining
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Communication;
