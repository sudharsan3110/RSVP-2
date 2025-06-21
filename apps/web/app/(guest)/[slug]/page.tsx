import Container from '@/components/common/Container';
import EventDetail from '@/components/event-detail/EventDetail';
import { eventAPI } from '@/lib/axios/event-API';
import { AxiosError } from 'axios';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface EventData {
  event: {
    name: string;
    description?: string;
    eventImageUrl?: string;
    category?: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const eventData = await eventAPI.getEventBySlug(params.slug);
    if (!eventData) {
      return {
        title: 'Event Not Found',
        description: 'The requested event could not be found.',
      };
    }

    const event = eventData.event;
    return {
      title: event.name,
      description: event.description || `Join us for ${event.name}`,
      openGraph: {
        title: event.name,
        description: event.description || `Join us for ${event.name}`,
        images: event.eventImageUrl ? [event.eventImageUrl] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: event.name,
        description: event.description || `Join us for ${event.name}`,
        images: event.eventImageUrl ? [event.eventImageUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Event Details',
      description: 'View event details and information.',
    };
  }
}

const EventDetailPage = async ({ params }: { params: { slug: string } }) => {
  const slug = params.slug;
  try {
    const eventData = await eventAPI.getEventBySlug(slug);
    if (!eventData) notFound();

    const serializedEvent = JSON.parse(JSON.stringify(eventData));

    return (
      <Container className="container-main pt-8">
        <EventDetail eventData={serializedEvent} />
      </Container>
    );
  } catch (error) {
    const axiosError = error as AxiosError<{ message: string }>;
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
