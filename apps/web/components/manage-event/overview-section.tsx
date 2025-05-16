import { Separator } from '@/components/ui/separator';
import CustomiseEventCard from './customise-event-card';
import EventHostManagment from './event-host-managment';
import RecentRegistrations from './recent-registrations';
import { Event } from '@/types/events';

type OverviewProps = {
  eventData: Event;
  isSuccess: boolean;
};

const OverviewSection = ({ eventData, isSuccess }: OverviewProps) => {
  return (
    <section className="space-y-6">
      <CustomiseEventCard className="max-w-2xl" event={eventData} isSuccess={isSuccess} />
      <div className="py-4">
        <Separator />
      </div>
      <RecentRegistrations className="max-w-2xl" />
      <EventHostManagment className="max-w-2xl" />
    </section>
  );
};

export default OverviewSection;
