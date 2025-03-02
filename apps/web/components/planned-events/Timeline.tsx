import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import eventImageSrc from '@/public/images/demo-event-image.png';
import { Icons } from '../common/Icon';
import { IEvent } from '@/types/event';
import Link from 'next/link';

interface Event {
  title: string;
  category: string;
  time: string;
  location: string;
  attendees: string;
  isFree: boolean;
  slug: string;
}

interface DateGroup {
  date: string;
  events: Event[];
}

const transformEventsToTimelineData = (events: IEvent[]) => {
  const groupedEvents = events.reduce((acc: { [key: string]: Event[] }, event) => {
    const date = new Date(event.startTime).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedEvent: Event = {
      title: event.name,
      category: `${event.category}`,
      slug: event.slug,
      time: `${new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}, 
        ${new Date(event.startTime).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}`,
      location:
        event.venueType === 'physical'
          ? event.venueAddress || 'Location TBD'
          : event.venueUrl || 'Virtual Event',
      attendees: `${event.capacity} going`,
      isFree: !event.hostPermissionRequired,
    };

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(formattedEvent);
    return acc;
  }, {});

  const timelineData = Object.keys(groupedEvents).map((date) => ({
    date,
    events: groupedEvents[date],
  }));
  return timelineData;
};

const ComicConTimeline = ({ events }: { events?: IEvent[] }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-600">No Events Found</h2>
        <p className="mt-4 text-gray-600">
          It seems like there are no events matching your search criteria at the moment. Please try
          adjusting your filters or check back later for more updates.
        </p>
      </div>
    );
  }

  const timelineData = events ? transformEventsToTimelineData(events) : [];

  return (
    <div className="bg- mx-auto max-w-[70rem] text-white md:w-[90%]">
      <div className="relative md:pl-24">
        {/* Timeline Rod */}
        <div className="absolute bottom-0 left-0 top-0 w-0.5 bg-gray-700 md:left-24"></div>

        {timelineData.map((dateGroup, groupIndex) => (
          <div key={groupIndex} className="relative mb-8">
            {/* Event Bullet */}
            <div className="absolute left-[-5px] top-0 h-3 w-3 rounded-full bg-purple-500"></div>

            {/* Event Date - Laptop View*/}
            <div className="absolute left-[2rem] top-0 hidden pr-4 text-right text-sm font-medium md:left-[-6rem] md:block">
              {dateGroup.date}
            </div>

            {/* Container for each day */}
            <div className="pl-4 md:pl-6">
              {/* Event Date - Mobile View */}
              <div className="block pb-4 text-left text-sm font-medium md:hidden">
                {dateGroup.date}
              </div>

              {dateGroup?.events?.map((event, eventIndex) => (
                <Link key={eventIndex} href={`/${event.slug}`}>
                  {/* Container for each day */}
                  <Card
                    key={eventIndex}
                    className="mb-4 flex cursor-pointer flex-col-reverse justify-between gap-3 rounded-lg border border-dark-500 bg-dark-900 p-3 text-card-foreground shadow-sm transition-all duration-200 hover:border-b-4 hover:border-r-4 hover:border-purple-500 md:h-auto md:min-h-[190px] md:flex-row"
                  >
                    <div className="flex h-auto w-full flex-col justify-between gap-4 md:w-3/4">
                      <div className="flex flex-col gap-2">
                        <CardHeader className="flex flex-col items-start justify-between space-y-1.5 border-b-0 py-0 pl-0">
                          <CardTitle className="text-xl font-bold leading-[25.2px] tracking-tight">
                            {event.title}
                          </CardTitle>
                          <p className="text-base font-semibold leading-[19.6px]">
                            {event.category}
                          </p>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-1 p-0 pt-2">
                          <p className="text-base font-bold leading-[19.6px]">{event.time}</p>
                          <p className="text-sm font-medium leading-[19.6px]">{event.location}</p>
                        </CardContent>
                      </div>
                      <div className="flex flex-row items-center justify-start gap-3 pt-2 text-sm font-semibold text-white">
                        <div className="flex flex-row items-center justify-between gap-1 border-r-2 pr-3">
                          {/* Tick */}
                          <Icons.tick />
                          <span className="text-[14px] font-semibold leading-[16.8px]">
                            {event.attendees}
                          </span>
                        </div>

                        <div className="flex flex-row items-center justify-between gap-1">
                          {/* Ticket Icon */}
                          <Icons.ticket />
                          <span className="text-[14px] font-semibold leading-[18px]">Free</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative min-h-[350px] w-full rounded-md md:h-auto md:min-h-[160px] md:min-w-[160px] md:max-w-[160px]">
                      <div className="w-full overflow-hidden rounded-md">
                        <Image
                          src={eventImageSrc}
                          alt={event.title}
                          fill
                          style={{ objectFit: 'cover' }}
                          className="rounded-md"
                        />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComicConTimeline;
