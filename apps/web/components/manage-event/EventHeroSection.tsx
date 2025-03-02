import React from 'react';
import SemiCircleBar from '../ui/SemiCircleBar';
import { Icons } from '../common/Icon';
import { Card, CardHeader } from '../ui/card';
import { useGetAttendeeExcelByEventId, useGetEventById } from '@/lib/react-query/event';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import Link from 'next/link';

export const EventHeroSection = () => {
  const [isDownload, setIsDownload] = React.useState(false);
  const eventId = useParams().id?.toString();

  const { data } = useGetEventById(eventId!);
  const { mutateAsync } = useGetAttendeeExcelByEventId();

  const downloadExcel = async () => {
    setIsDownload(true);
    try {
      if (!eventId) return;
      const response = await mutateAsync({ eventId: eventId, sortBy: 'createdAt' });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const date = dayjs().format('YYYY-MM-DD');
      link.download = `guest-list-${eventId}-${date}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Downloaded Successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to download');
    } finally {
      setIsDownload(false);
    }
  };

  const percentage = ((data?.totalAttendees || 0) / (data?.event?.capacity || 1)) * 100;

  return (
    <div className="mb-10 mt-8 w-full space-y-6">
      <h2 className="text-xl font-bold">At a Glance</h2>
      <div className="space-y-6 xl:flex xl:space-x-6 xl:space-y-0">
        <Card className="h-56 flex-1 overflow-hidden border">
          <CardHeader className="flex flex-col bg-dark-800 p-2">
            <h3 className="pl-3 pt-3 font-bold">Guest Booked</h3>
            <p className="pl-3 pt-3 text-sm text-gray-400">{`Your ${percentage}% of seats have been booked.`}</p>
          </CardHeader>
          <div className="flex items-center justify-center">
            <SemiCircleBar score={data?.totalAttendees || 0} total={data?.event?.capacity || 0} />
          </div>
        </Card>

        <div className="grid w-full flex-[3] grid-cols-1 gap-6 sm:grid-cols-2">
          <Link href={`/events/${eventId}/manage/verify`}>
            <div className="flex h-[96px] w-full items-center rounded-lg bg-green-900 p-4">
              <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
                <Icons.qrcode className="text-xl" />
              </div>
              <div className="ml-5">
                <h3 className="font-bold text-white">Check In Guest</h3>
                <p className="text-sm text-gray-200">
                  Your {percentage}% of seats have been booked.
                </p>
              </div>
            </div>
          </Link>

          <button
            onClick={downloadExcel}
            className="flex h-[96px] w-full items-center rounded-lg bg-blue p-4"
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
              <Icons.download className="text-xl" />
            </div>
            <div className="ml-5">
              <h3 className="text-left font-bold text-white">
                {isDownload ? 'Downloading...' : 'Download Guest List'}
              </h3>
              <p className="text-sm text-gray-200">Download data of your guest in xlsx.</p>
            </div>
          </button>

          <div className="flex h-[96px] w-full items-center rounded-lg bg-dark-500 p-4">
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
              <Icons.mail className="text-xl" />
            </div>
            <div className="ml-5">
              <h3 className="font-bold text-white">Invite Your Guest</h3>
              <p className="text-sm text-gray-200">Coming soon.</p>
            </div>
          </div>

          <div className="flex h-[96px] w-full items-center rounded-lg bg-orange p-4">
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
              <Icons.guest className="text-xl" />
            </div>
            <div className="ml-5">
              <h3 className="font-bold text-white">Integrations</h3>
              <p className="text-sm text-gray-200">Coming Soon.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
