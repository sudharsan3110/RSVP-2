import React, { useState } from 'react';
import SemiCircleBar from '../ui/SemiCircleBar';
import { Icons } from '../common/Icon';
import { Card, CardHeader } from '../ui/card';
import { useGetAttendeeExcelByEventId, useInviteGuests } from '@/lib/react-query/event';
import { useParams } from 'next/navigation';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatDate } from '@/utils/formatDate';
import { InviteGuestModal } from './InviteGuestModal';
import { InviteResultsModal } from './InviteResultModal';
import { AxiosError } from 'axios';

type EventHeroSectionProps = Readonly<{
  totalAttendees: number;
  eventCapacity: number;
}>;

export const EventHeroSection = ({ totalAttendees, eventCapacity }: EventHeroSectionProps) => {
  const eventId = useParams().id?.toString();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteResults, setInviteResults] = useState(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  const { mutateAsync, isPending } = useGetAttendeeExcelByEventId();
  const { mutateAsync: inviteGuests, isPending: isInviting } = useInviteGuests();

  const downloadExcel = async () => {
    try {
      if (!eventId) return;
      const response = await mutateAsync({ eventId: eventId, sortBy: 'createdAt' });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'] || 'application/octet-stream',
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const date = formatDate(dayjs(), { dateOnly: true });
      link.download = `guest-list-${eventId}-${date}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('Downloaded Successfully');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleInviteGuests = async (emails: string[]) => {
    try {
      if (!eventId) return;

      const { data } = await inviteGuests({ eventId, emails });

      setInviteResults(data);
      setIsResultsModalOpen(true);

      const successCount = (data.invited?.length || 0) + (data.restored?.length || 0);
      if (successCount > 0) {
        toast.success(`${successCount} invitation${successCount > 1 ? 's' : ''} sent successfully`);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage =
        axiosError.response?.data?.message || 'Failed to send invitations. Please try again.';

      toast.error(errorMessage);
    }
  };

  const percentage = ((totalAttendees / (eventCapacity || 1)) * 100).toFixed(2);

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
            <SemiCircleBar score={totalAttendees} total={eventCapacity} />
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
            disabled={isPending}
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
              <Icons.download className="text-xl" />
            </div>
            <div className="ml-5 text-left">
              <h3 className="font-bold text-white">
                {isPending ? 'Downloading...' : 'Download Guest List'}
              </h3>
              <p className="text-sm text-gray-200">Download data of your guest in xlsx.</p>
            </div>
          </button>

          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex h-[96px] w-full items-center rounded-lg bg-dark-500 p-4 cursor-pointer"
          >
            <div className="flex h-[64px] w-[64px] items-center justify-center rounded-lg bg-white">
              <Icons.mail className="text-xl" />
            </div>
            <div className="ml-5 text-left">
              <h3 className="font-bold text-white">Invite Your Guest</h3>
              <p className="text-sm text-gray-200">Invite guests instantly with email.</p>
            </div>
          </button>

          <div className="flex h-[96px] w-full cursor-not-allowed items-center rounded-lg bg-orange p-4 opacity-50">
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
      <InviteGuestModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInvite={handleInviteGuests}
        isPending={isInviting}
      />
      <InviteResultsModal
        open={isResultsModalOpen}
        onOpenChange={setIsResultsModalOpen}
        results={inviteResults}
      />
    </div>
  );
};
