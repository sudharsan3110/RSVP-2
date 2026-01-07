import { useParams } from 'next/navigation';
import EventDetailsTable from './EventDetailsTable';
import { EventHeroSection } from './EventHeroSection';
import { useGetEventById } from '@/lib/react-query/event';

const GuestManageSection = () => {
  const eventId = useParams().id?.toString();
  const { data } = useGetEventById(eventId);
  const capacity = data?.event.capacity ?? 0;
  const totalAttendees = data?.totalAttendees ?? 0;
  return (
    <section className="space-y-6">
      <EventHeroSection eventCapacity={capacity} totalAttendees={totalAttendees} />
      <EventDetailsTable eventCapacity={capacity} totalAttendees={totalAttendees} />
    </section>
  );
};

export default GuestManageSection;
