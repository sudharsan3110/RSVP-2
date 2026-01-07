'use client';

import Container from '@/components/common/Container';
import AttendeeDetails from '@/components/scanner/AttendeeDetails';
import QRScanner from '@/components/scanner/QRScanner';
import TicketInput from '@/components/scanner/TicketInput';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useMediaQuery from '@/hooks/useMediaQuery';
import { eventAPI } from '@/lib/axios/event-API';
import { useGetEventById } from '@/lib/react-query/event';
import { Attendee } from '@/types/attendee';
import { AxiosError } from 'axios';
import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const ScannerPage = () => {
  const [attendeeData, setAttendeeData] = useState<Attendee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventId = useParams().id as string;
  const { data } = useGetEventById(eventId);
  const isMobile = useMediaQuery('(max-width: 639px)');

  const handleCodeScanned = async (code: string) => {
    setIsLoading(true);
    try {
      const attendee = await eventAPI.getAttendeeByTicketCode({
        eventId: String(eventId),
        ticketCode: code,
      });
      if (attendee) {
        setAttendeeData(attendee.data);
        setError(null);
      } else {
        toast.error('Attendee not found', {
          description: 'Please check the ticket code and try again.',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message ?? 'Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-8 xl:px-[7.25rem]">
      <section className="hidden items-center justify-between sm:flex">
        <h1 className="text-2xl font-semibold">Check In For {data?.event.name}</h1>
        <Button asChild variant="tertiary" radius="sm">
          <Link href={`/${data?.event.slug}`}>
            Event Page
            <ArrowUpRightIcon className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <Separator className="my-9 hidden sm:block" />

      <section className="flex flex-wrap justify-between gap-x-12">
        <Tabs defaultValue="qr-code" className="w-full sm:w-auto">
          <TabsList className="mb-2.5 w-full sm:w-auto">
            <TabsTrigger value="qr-code" className="w-full">
              QR Code
            </TabsTrigger>
            <TabsTrigger value="ticket-number" className="w-full">
              Ticket Number
            </TabsTrigger>
          </TabsList>

          <TabsContent value="qr-code">
            {isMobile ? (
              attendeeData ? (
                <AttendeeDetails
                  error={error}
                  loading={isLoading}
                  attendee={attendeeData}
                  onCheckIn={() => setAttendeeData(null)}
                />
              ) : (
                <QRScanner onScan={handleCodeScanned} />
              )
            ) : (
              <QRScanner onScan={handleCodeScanned} />
            )}
          </TabsContent>

          <TabsContent value="ticket-number">
            <div className="sm:hidden">
              {attendeeData ? (
                <AttendeeDetails
                  error={error}
                  loading={isLoading}
                  attendee={attendeeData}
                  onCheckIn={() => setAttendeeData(null)}
                />
              ) : (
                <TicketInput onSubmit={handleCodeScanned} />
              )}
            </div>
            <div className="hidden sm:block">
              <TicketInput onSubmit={handleCodeScanned} />
            </div>
          </TabsContent>

          {attendeeData && (
            <Button
              className="mt-8 w-full rounded-md py-3.5 font-semibold sm:hidden"
              onClick={() => setAttendeeData(null)}
            >
              Go Back
            </Button>
          )}
        </Tabs>

        <div className="mt-[54px] hidden min-h-[398px] max-w-[582px] grow sm:block">
          <AttendeeDetails
            error={error}
            loading={isLoading}
            attendee={attendeeData}
            onCheckIn={() => setAttendeeData(null)}
          />
        </div>
      </section>
    </Container>
  );
};

export default ScannerPage;
