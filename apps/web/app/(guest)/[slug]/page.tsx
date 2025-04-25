import Container from '@/components/common/Container';
import EventDetail from '@/components/event-detail/EventDetail';
import { eventAPI } from '@/lib/axios/event-API';
import { AxiosError } from 'axios';
import { notFound } from 'next/navigation';

const EventDetailPage = async ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;
  try {
    const eventData = await eventAPI.getEventBySlug(slug);
    if (!eventData) notFound();

    return (
      <Container className="container-main pt-8">
        <EventDetail eventData={eventData} />
      </Container>
    );
  } catch (error) {
    console.error('Error fetching event:', error);
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 404) {
      notFound();
    }
    return (
      <Container className="container-main pt-8">
        <h1 className="text-red-500">Error loading event details. Please try again later.</h1>
      </Container>
    );
  }
};

export default EventDetailPage;
