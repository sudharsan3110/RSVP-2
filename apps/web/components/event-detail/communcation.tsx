import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEventCommunications } from '@/lib/react-query/communication';
import { Event } from '@/types/events';
import { getProfilePictureUrl, venueDisplay } from '@/utils/event';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ClockIcon, LinkIcon, MessageCircleIcon, UsersIcon, UserIcon, Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';

interface CommunicationProps {
  event: Event;
  totalAttendees: number;
  updatedAt?: string;
}

interface CommunicationMessage {
  user: {
    fullName: string;
    id: string;
    profileIcon: number;
  };
  content: string;
  time: string;
  updatedAt: string;
}

interface CommunicationsData {
  data: CommunicationMessage[];
}

const Communication = ({ event, totalAttendees }: CommunicationProps) => {
  const { data: communicationsData, isLoading } = useEventCommunications(event.id);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const formatDate = (timestamp: string) => {
    return dayjs(timestamp).format('dddd, MMMM D');
  };

  const formatTimeRange = () => {
    const startTime = dayjs(event.startTime).format('h:mm A');
    const endTime = dayjs(event.endTime).format('h:mm A');
    const startDate = dayjs(event.startTime).format('dddd, MMMM D');
    const endDate = dayjs(event.endTime).format('dddd, MMMM D');

    return {
      startTime,
      endTime,
      startDate,
      endDate,
      isSameDay: startDate === endDate,
    };
  };

  const timeInfo = formatTimeRange();

  // Calculate remaining seats and capacity info
  const capacity = event.capacity || 0;
  const remainingSeats = capacity - totalAttendees;
  const cohosts = event.cohosts?.length ?? 0;

  return (
    <section className="flex w-full flex-col space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center space-x-3">
        <MessageCircleIcon className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold">Updates on your event</h3>
      </div>

      {/* Event Info Summary - 3 Grid Layout */}
      <Card className="bg-dark-900 border-dark-700 overflow-hidden">
        <CardContent className="p-0">
          <div className="flex justify-between gap-0 md:flex-row flex-col">
            {/* Image Section */}
            <div className="relative md:h-48 w-fit flex md:flex-row flex-col">
              <Image
                src={event.eventImageUrl}
                alt={event.name}
                width={100}
                height={100}
                className="object-cover aspect-square h-full w-auto md:rounded-l-lg rounded-t-lg"
              />
              <div className="p-6">
                {event.category && (
                  <Badge className="mb-2 text-xs font-medium tracking-wide capitalize text-white">
                    {event.category}
                  </Badge>
                )}
                <h4 className="font-semibold text-white text-lg mb-3">{event.name}</h4>
                <div className="space-y-2 text-sm text-secondary">
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>
                      {timeInfo.isSameDay
                        ? timeInfo.startDate
                        : `${timeInfo.startDate} - ${timeInfo.endDate}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarDaysIcon className="h-4 w-4" />
                    <span>
                      {timeInfo.startTime} - {timeInfo.endTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {event?.isPhysical && <MapPinIcon className="h-4 w-4" />}
                    {event?.isVirtual && <LinkIcon className="h-4 w-4" />}
                    {event?.isLater && <ClockIcon className="h-4 w-4" />}
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

            {/* Primary Details Section */}

            {/* Secondary Details Section */}
            <div className="p-6 bg-dark-800">
              <h5 className="font-medium text-white mb-3">Event Details</h5>
              <div className="space-y-2 text-sm text-secondary">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-4 w-4" />
                  <span>
                    {totalAttendees} attending • {capacity} capacity
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
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

      {/* Messages Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Messages</h4>
          <Badge variant="secondary" className="text-xs">
            {communicationsData?.data?.length || 0} messages
          </Badge>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {communicationsData?.data?.length > 0 && !isLoading ? (
          <div className="space-y-4 max-w-3xl">
            {(communicationsData as CommunicationsData)?.data?.map(
              (msg: CommunicationMessage, index: number) => (
                <Card
                  key={index}
                  className="bg-dark-800 border-dark-600 hover:bg-dark-700 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={getProfilePictureUrl(msg.user?.profileIcon ?? 1)}
                          alt={msg.user?.fullName}
                        />
                        <AvatarFallback>{msg.user?.fullName.charAt(0)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-white">{msg.user?.fullName}</span>
                          </div>
                          <div className="text-xs text-secondary">
                            {formatDate(msg.updatedAt)} at {formatTime(msg.updatedAt)}
                          </div>
                        </div>

                        <div
                          className="prose prose-invert text-white max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: msg.content,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        ) : (
          <Card className="bg-dark-900 border-dark-700">
            <CardContent className="p-8 text-center">
              <MessageCircleIcon className="h-12 w-12 text-secondary mx-auto mb-4" />
              <p className="text-secondary text-lg">No communications yet.</p>
              <p className="text-secondary text-sm mt-2">Messages from hosts will appear here</p>
            </CardContent>
          </Card>
        )}
      </section>
    </section>
  );
};

export default Communication;
