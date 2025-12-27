'use client';
import Container from '@/components/common/Container';
import EditEventForm from '@/components/create-event/EditEventForm';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useGetEventById } from '@/lib/react-query/event';
import NoResults from '@/components/common/NoResults';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingScreen from '@/components/common/LoadingScreen';

const EditEventPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { data } = useCurrentUser();
  const { data: eventData, isLoading } = useGetEventById(params.id);

  const isCreator = eventData?.event.checkCreator(data?.id);
  const isPastEvent = eventData?.event ? new Date(eventData.event.endTime) < new Date() : false;

  useEffect(() => {
    if (!isLoading && isPastEvent) {
      if (window.history.length > 1) router.back();
      else router.replace(`/events/${params.id}/manage`);
    }
  }, [isLoading, isPastEvent, router, params.id]);

  if (isLoading || isPastEvent) return <LoadingScreen />;

  if (!isCreator && !isLoading) {
    return (
      <NoResults
        title="Page not found"
        message="The page you are looking for does not exist."
        showBtn
        btnText="Go to home"
        btnLink="/"
        image="/images/no-event-image.svg"
        imgWidth={200}
        imgHeight={200}
        className="pt-20 min-h-[calc(80vh-10rem)]"
      />
    );
  }

  return (
    <Container className="container-main py-8">
      <h2 className="text-2xl/[2.25rem] font-semibold text-white">Edit Event</h2>
      <EditEventForm />
    </Container>
  );
};

export default EditEventPage;
