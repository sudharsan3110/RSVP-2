'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { ClockIcon, LinkIcon, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { Event } from '@/types/events';
import { getProfilePictureUrl, venueDisplay } from '@/utils/event';
import { Badge } from '../ui/badge';
import AvatarGroup from './AvatarGroup';

const GetTicketsButton = dynamic(() => import('./GetTicketsButton'), {
  ssr: false,
});

const EventDetail = ({ eventData }: { eventData: { event: Event; totalAttendees: number } }) => {
  const router = useRouter();
  const { event: eventInfo, totalAttendees } = eventData;
  const event = new Event(eventInfo);
  const [formattedStartDate, setFormattedStartDate] = useState('');
  const [formattedStartTime, setFormattedStartTime] = useState('');
  const [formattedEndTime, setFormattedEndTime] = useState('');
  const [formattedEndDate, setFormattedEndDate] = useState('');

  useEffect(() => {
    setFormattedStartDate(formatDate(event.startTime, { dateOnly: true }));
    setFormattedStartTime(formatDate(event.startTime, { timeOnly: true }));
    setFormattedEndTime(formatDate(event.endTime, { timeOnly: true }));
    setFormattedEndDate(formatDate(event.endTime, { dateOnly: true }));
  }, [event.startTime, event.endTime]);

  const additionalCount = totalAttendees > 4 ? totalAttendees - 4 : 0;
  const userAvatarLimit = totalAttendees > 4 ? 4 : totalAttendees;
  const isPastEvent = new Date(event.endTime) < new Date();

  const cohosts = event.cohosts?.length ?? 0;
  const capacity = event.capacity ?? 0;

  const remainingSeats = capacity - totalAttendees;

  const handleUserClick = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    userName: string | undefined
  ) => {
    e.preventDefault();

    if (!userName) return;

    if (event.creator?.userName === userName && event.creator?.isDeleted) {
      return;
    }

    router.push(`/user/${userName}`);
    return;
  };

  return (
    <main>
      <div className="relative w-full overflow-hidden">
        <Image
          src={event.eventImageUrl}
          objectFit="cover"
          width={200}
          height={200}
          priority
          alt="event-details-background"
          className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-md md:block"
        />
        <div className="relative mx-auto h-[300px] w-full object-cover sm:h-[350px] sm:w-[600px] md:h-[400px] md:w-[800px] lg:h-[600px] lg:w-[970px]">
          <figure className="relative h-full w-full">
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-center bg-cover filter blur-xl scale-105" />
              <Image
                src={event.eventImageUrl}
                width={1920}
                height={1080}
                priority
                className="relative z-10 h-full w-full object-contain"
                alt="event-detail-desktop"
              />
            </div>
          </figure>
        </div>
      </div>
      <article className="my-6 flex flex-col items-start md:my-12">
        {event.category ? (
          <Badge className="mb-4 text-sm font-medium tracking-wide capitalize text-white">
            {event?.category?.name}
          </Badge>
        ) : null}
        <p className="text-2xl font-bold md:text-4xl">{event?.name}</p>
      </article>
      <section className="flex flex-col-reverse items-start justify-between gap-8 md:flex-row">
        <section className="mt-6 w-full md:mt-0 md:w-[60%]">
          <section className="mb-6 flex items-center">
            <div className="mr-[20px] rounded-[8px] bg-dark-500 p-3">
              <CalendarDaysIcon className="h-[24px] w-[24px]" />
            </div>
            <article className="font-bold">
              {formattedStartTime && formattedEndTime && formattedStartDate ? (
                <>
                  <p>
                    {formattedStartDate === formattedEndDate
                      ? formattedStartDate
                      : formattedStartDate + ' - ' + formattedEndDate}
                  </p>
                  <p className="text-sm text-secondary">
                    {formattedStartTime} - {formattedEndTime}
                  </p>
                </>
              ) : (
                <p className="text-sm text-secondary">
                  <Loader2 data-testid="loader" className="h-6 w-6 animate-spin" />
                </p>
              )}
            </article>
          </section>
          <section className="flex items-center">
            <div className="mr-[20px] rounded-[8px] bg-dark-500 p-3">
              {event?.isPhysical && <MapPinIcon className="h-[24px] w-[24px]" />}
              {event?.isVirtual && <LinkIcon className="h-[24px] w-[24px]" />}
              {event?.isLater && <ClockIcon className="h-[24px] w-[24px]" />}
            </div>
            <article className="font-bold">
              <p>
                {event?.isPhysical && 'Location'}
                {event?.isVirtual && 'Event Link'}
                {event?.isLater && 'To be announced'}
              </p>
              {event?.isPhysical && <p className="text-sm text-secondary">{venueDisplay(event)}</p>}

              {event?.isVirtual && (
                <Link
                  href={event?.venueUrl ?? ''}
                  target="_blank"
                  className="text-sm text-secondary hover:underline hover:text-primary"
                >
                  <p>{venueDisplay(event)}</p>
                </Link>
              )}
            </article>
          </section>
          <section className="mt-6 p-3 pl-0">
            <p className="font-semibold">Hosted {cohosts > 1 && '& Cohosted'} By</p>

            <div className="mt-3">
              <Link
                href={`/user/${event.creator?.userName}`}
                className={`block mt-3 textDecoration-none`}
                onClick={(e) => {
                  handleUserClick(e, event?.creator?.userName);
                }}
              >
                <div className="flex items-center">
                  <Image
                    src={getProfilePictureUrl(event?.creator?.profileIcon ?? 1)}
                    alt="Creator Avatar"
                    width={48}
                    height={48}
                    className="rounded-full border-primary border-2 object-cover"
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium capitalize">
                      {event?.creator?.fullName?.toLowerCase() ||
                        event?.creator?.userName ||
                        'Deleted User'}
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {cohosts > 0 &&
              event?.cohosts
                ?.filter((cohost) => cohost.role !== 'CREATOR')
                .map((cohost, index) => (
                  <Link
                    key={index}
                    href={`/user/${event.creator?.userName}`}
                    className="block mt-3"
                    style={{ textDecoration: 'none' }}
                    onClick={(e) => handleUserClick(e, cohost?.user?.userName)}
                  >
                    <div className="mt-3 flex items-center">
                      <Image
                        src={getProfilePictureUrl(cohost.user?.profileIcon ?? 1)}
                        alt="Host Avatar"
                        width={48}
                        height={48}
                        className="rounded-full border-primary border-2 object-cover"
                      />
                      <p className="ml-3 text-sm font-medium capitalize text-secondary">
                        {cohost.user?.fullName?.toLowerCase() || cohost.user?.userName}
                      </p>
                    </div>
                  </Link>
                ))}
          </section>
          {event.description !== '' ? (
            <article className="mt-12">
              <h2 className="text-2xl font-bold">About Event</h2>
              <div
                className="prose-ol:m-0 prose-li:m-0 prose-p:m-0 prose-h1:m-0 prose-h2:m-0 prose prose-invert text-white"
                dangerouslySetInnerHTML={{
                  __html: event.description || '<p>Description not available.</p>',
                }}
              />
            </article>
          ) : null}
        </section>
        <section className="w-full rounded-xl shadow-lg md:w-[481px]">
          <section className="w-full flex flex-col rounded-xl p-6 bg-dark-900 shadow-lg md:w-[481px]">
            {!event?.isActive ? (
              <p className="text-red-500">Event has been cancelled</p>
            ) : (
              <>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col space-y-3">
                    {isPastEvent ? (
                      <h2 className="text-xl font-bold">Registration closed</h2>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold">Registration</h2>
                        <p className="font-semibold">
                          {remainingSeats > 0
                            ? `${remainingSeats} Seats are Remaining.`
                            : 'No Seats Remaining.'}
                        </p>
                      </>
                    )}
                  </div>

                  {!isPastEvent && totalAttendees > 0 && (
                    <div className="flex items-center justify-center gap-2">
                      <AvatarGroup additionalCount={additionalCount} limit={userAvatarLimit} />
                      <p className="text-sm font-semibold">{totalAttendees} going</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {/* {event?.hostPermissionRequired && (
              <section className="mt-4 flex items-center">
                <CheckBadgeIcon className="mr-2.5 size-6 text-green-500" />
                <article className="flex flex-col">
                  <p className="font-semibold">Required Approval</p>
                  <p className="text-sm text-secondary">Needs host permission to join event</p>
                </article>
              </section>
            )} */}

            {event?.isActive && (
              <GetTicketsButton
                remainingSeats={remainingSeats}
                cohosts={event.cohosts}
                creatorId={event.creatorId}
                eventId={event.id}
                eventSlug={event.slug}
                isPermissionRequired={event?.hostPermissionRequired}
                isPastEvent={isPastEvent}
              />
            )}
          </section>
        </section>
      </section>
    </main>
  );
};

export default EventDetail;
