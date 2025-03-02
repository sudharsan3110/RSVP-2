import Image from 'next/image';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { IEvent } from '@/types/event';
import dayjs from 'dayjs';
import GetTicketsButton from './GetTicketsButton';
import AvatarGroup from './AvatarGroup';
import { userAvatarOptions } from '@/utils/constants';
import { ClockIcon, LinkIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { venueDisplay } from '@/utils/event';

const EventDetail = ({ eventData }: { eventData: { event: IEvent; totalAttendees: number } }) => {
  const { event, totalAttendees } = eventData;
  const formattedStartDate = dayjs(event.startTime).format('dddd, MMMM D');
  const formattedStartTime = dayjs(event.startTime).format('h:mm A');
  const formattedEndTime = dayjs(event.endTime).format('h:mm A');
  const additionalCount = totalAttendees > 4 ? totalAttendees - 4 : 0;
  const userAvatarLimit = totalAttendees > 4 ? 4 : totalAttendees;

  const getProfilePictureUrl = (profileIConId: number | string) => {
    const profileUrl = userAvatarOptions.find((option) => option.id === profileIConId);
    return profileUrl?.src ?? userAvatarOptions[0]?.src!;
  };

  return (
    <main>
      <div className="relative w-full overflow-hidden">
        <Image
          src={event.eventImageId ?? '/images/event-detail-mobile.svg'}
          objectFit="cover"
          width={200}
          height={200}
          priority
          alt="event-details-background"
          className="absolute inset-0 hidden h-full w-full scale-110 object-cover blur-md md:block"
        />
        <div className="relative mx-auto h-[300px] w-full object-cover sm:h-[350px] sm:w-[600px] md:h-[400px] md:w-[800px] lg:h-[600px] lg:w-[970px]">
          <Image
            src={event.eventImageId ?? '/images/event-detail-mobile.svg'}
            width={1920}
            height={1080}
            priority
            className="h-full w-full object-cover"
            alt="event-detail-desktop"
          />
        </div>
      </div>
      <article className="my-6 flex flex-col items-start md:my-12">
        {event.category ? (
          <Badge className="mb-2 px-4 py-2 text-sm font-normal capitalize text-white">
            {event?.category}
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
              <p>{formattedStartDate}</p>
              <p className="text-sm text-secondary">
                {formattedStartTime} - {formattedEndTime}
              </p>
            </article>
          </section>
          <section className="flex items-center">
            <div className="mr-[20px] rounded-[8px] bg-dark-500 p-3">
              {event?.venueType === 'physical' && <MapPinIcon className="h-[24px] w-[24px]" />}
              {event?.venueType === 'virtual' && <LinkIcon className="h-[24px] w-[24px]" />}
              {event?.venueType === 'later' && <ClockIcon className="h-[24px] w-[24px]" />}
            </div>
            <article className="font-bold">
              <p>
                {event?.venueType === 'physical' && 'Location'}
                {event?.venueType === 'virtual' && 'Event Link'}
                {event?.venueType === 'later' && 'To be announced'}
              </p>
              <p className="text-sm text-secondary">{venueDisplay(event)}</p>
            </article>
          </section>
          <section className="mt-6 p-3 pl-0">
            <p className="font-semibold">Hosted {event?.Cohost.length > 1 && '& Cohosted'} By</p>
            {event?.Cohost.length > 0 &&
              event?.Cohost?.map((cohost, index) => (
                <div className="mt-3 flex items-center" key={index}>
                  <Image
                    src={getProfilePictureUrl(cohost.user.profile_icon)}
                    alt="Host Avatar"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <p className="ml-3 text-sm font-medium capitalize text-secondary">
                    {cohost.user.full_name}
                  </p>
                </div>
              ))}
          </section>
          {event.description !== '' ? (
            <article className="mt-12">
              <h2 className="text-2xl font-bold">About Event</h2>
              <div
                className="mt-4"
                dangerouslySetInnerHTML={{
                  __html: event.description || '<p>Description not available.</p>',
                }}
              />
            </article>
          ) : null}
        </section>
        <section className="w-full md:w-[481px]">
          <section className="w-full rounded-lg bg-dark-900 p-6 shadow-lg md:w-[481px]">
            <h2 className="text-xl font-bold">Registration</h2>
            <p className="mt-2 font-semibold">
              {event?.capacity - totalAttendees} Seats are Remaining.
            </p>
            {totalAttendees > 0 && (
              <div className="flex items-center pb-2 pt-4">
                <AvatarGroup additionalCount={additionalCount} limit={userAvatarLimit} />
                <p className="ml-3 text-sm font-semibold">{totalAttendees} going</p>
              </div>
            )}
            {event?.hostPermissionRequired && (
              <section className="mt-4 flex items-center">
                <CheckBadgeIcon className="mr-2.5 size-6 text-green-500" />
                <article className="flex flex-col">
                  <p className="font-semibold">Required Approval</p>
                  <p className="text-sm text-secondary">Needs host permission to join event</p>
                </article>
              </section>
            )}
            <GetTicketsButton
              eventId={event.id}
              isPermissionRequired={event?.hostPermissionRequired}
            />
          </section>
        </section>
      </section>
    </main>
  );
};

export default EventDetail;
