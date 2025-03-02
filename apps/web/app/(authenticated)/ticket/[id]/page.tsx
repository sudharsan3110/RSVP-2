'use client';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useCancelEvent, useGetAttendeeDetails, useGetEventById } from '@/lib/react-query/event';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { Presentation } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import QRCode from 'react-qr-code';

const TicketPage = () => {
  const { id } = useParams();

  if (typeof id !== 'string') notFound();

  const { data: userData } = useCurrentUser();
  const { data: attendeeData, isLoading: isAttendeeLoading } = useGetAttendeeDetails(id);
  const { data: eventData, isLoading: isEventLoading } = useGetEventById(id);
  const { mutate: cancelEvent } = useCancelEvent();

  const qrToken = attendeeData?.qrToken || '';
  const confirmationCode = `${qrToken?.slice(0, 3)} - ${qrToken?.slice(3, 6)}`;
  const attendeeName = userData?.data?.full_name || 'Guest';
  const eventName = eventData?.event?.name || 'Event';
  const eventDescription = eventData?.event?.description || '';
  const eventDate = eventData?.event?.startTime
    ? new Date(eventData?.event?.startTime).toISOString().split('T')[0]
    : 'TBD';

  const handleEventCancel = () => {
    if (typeof id === 'string') {
      cancelEvent({ eventId: id });
    }
  };

  const loading = isAttendeeLoading || isEventLoading;

  return (
    <div className="container-main my-10">
      <header className="text-4xl font-bold md:text-5xl md:leading-[67px]">
        <p>See you there on</p>
        <span className="text-primary">{eventName}</span>
      </header>
      <div className="my-6 flex flex-col items-center gap-x-10 md:flex-row">
        <div className="mb-6 w-full font-medium md:m-auto md:w-1/2">
          <p dangerouslySetInnerHTML={{ __html: eventDescription }} />
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-x-10 gap-y-3 md:w-1/2 md:flex-row">
          {eventData?.event?.venueType === 'virtual' ? (
            <Button className="h-12 w-full rounded-[6px] md:w-1/2">
              <Presentation className="mr-2 size-6" />
              See Meeting
            </Button>
          ) : eventData?.event?.venueType === 'physical' ? (
            <Button className="h-12 w-full rounded-[6px] md:w-1/2">
              <MapPinIcon className="mr-2 size-6" />
              Get Directions
            </Button>
          ) : null}
          <Button
            className="h-12 w-full rounded-[6px] border bg-dark-900 md:w-1/2"
            variant="destructive"
            onClick={handleEventCancel}
          >
            Cancel ticket
          </Button>
        </div>
      </div>
      <section className="relative my-20 flex w-full flex-col items-stretch justify-between text-dark-500 md:h-[368px] md:flex-row">
        <div className="absolute inset-0 h-full w-full rounded-[40px] bg-[#D0D0D0]" />
        <div className="relative flex items-center px-16 py-12 md:w-2/5 md:py-0">
          <div className="qr-border rounded-[2rem] p-8">
            <QRCode
              value={qrToken}
              bgColor="#D0D0D0"
              size={224}
              level="Q"
              className="lg:max-w-auto h-auto w-full max-w-full lg:w-auto"
            />
          </div>
        </div>
        <div className="relative flex items-center border-t border-dashed py-[72px] md:w-3/5 md:border-l md:border-t-0 md:py-5">
          <div className="absolute -left-3 -top-3 hidden size-6 rounded-full bg-background md:block"></div>
          <div className="absolute -bottom-3 -left-3 hidden size-6 rounded-full bg-background md:block"></div>
          <div className="absolute -left-3 -top-3 size-6 rounded-full bg-background md:hidden"></div>
          <div className="absolute -right-3 -top-3 size-6 rounded-full bg-background md:hidden"></div>
          <div className="flex flex-col gap-y-6 px-5 md:px-[70px]">
            <div>
              <p className="text-base font-bold">ATTENDEE NAME</p>
              <p className="mt-2 text-4xl font-bold md:text-5xl">{attendeeName}</p>
            </div>
            <div>
              <p className="font-bold">EVENT</p>
              <p className="mt-2 text-2xl font-bold">
                {eventName}, {eventDate}
              </p>
            </div>
            <div>
              <p className="font-bold">CONFIRMATION CODE</p>
              <p className="mt-3 text-4xl font-bold uppercase md:text-5xl">{confirmationCode}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TicketPage;
