'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';
import Container from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import QRScanner from '@/components/scanner/QRScanner';
import TicketInput from '@/components/scanner/TicketInput';
import AttendeeDetails from '@/components/scanner/AttendeeDetails';
import { IAttendee } from '@/types/attendee';

const ScannerPage = () => {
  const [attendeeData, setAttendeeData] = useState<IAttendee | null>(null);

  return (
    <Container className="py-8 xl:px-[7.25rem]">
      <section className="hidden items-center justify-between sm:flex">
        <h1 className="text-2xl font-semibold">Check In For Comic Con 2024</h1>
        <Button asChild variant="tertiary" radius="sm">
          <Link href="/event">
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
            <div className="sm:hidden">
              {attendeeData ? (
                <AttendeeDetails attendee={attendeeData} onCheckIn={() => setAttendeeData(null)} />
              ) : (
                <QRScanner onScan={setAttendeeData} />
              )}
            </div>
            <div className="hidden sm:block">
              <QRScanner onScan={setAttendeeData} />
            </div>
          </TabsContent>
          <TabsContent value="ticket-number">
            <div className="sm:hidden">
              {attendeeData ? (
                <AttendeeDetails attendee={attendeeData} onCheckIn={() => setAttendeeData(null)} />
              ) : (
                <TicketInput onSubmit={setAttendeeData} />
              )}
            </div>
            <div className="hidden sm:block">
              <TicketInput onSubmit={setAttendeeData} />
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
          <AttendeeDetails attendee={attendeeData} onCheckIn={() => setAttendeeData(null)} />
        </div>
      </section>
    </Container>
  );
};

export default ScannerPage;
