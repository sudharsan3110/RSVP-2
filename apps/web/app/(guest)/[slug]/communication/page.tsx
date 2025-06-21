'use client';
import Container from '@/components/common/Container';
import Communication from '@/components/event-detail/communcation';
import { useGetEventBySlug } from '@/lib/react-query/event';

const EventDetailPage = ({ params }: { params: { slug: string } }) => {
  const { data } = useGetEventBySlug(params.slug);
  return (
    <Container className="container-main pt-8">
      {data && <Communication event={data?.event} totalAttendees={data?.totalAttendees} />}
    </Container>
  );
};

export default EventDetailPage;
