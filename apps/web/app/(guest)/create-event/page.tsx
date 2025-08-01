import Container from '@/components/common/Container';
import CreateEventForm from '@/components/create-event/CreateEventForm';

const CreateEventPage = () => {
  return (
    <Container className="container-main py-8">
      <h2 className="text-2xl/[2.25rem] font-semibold text-white">Create Event</h2>
      <CreateEventForm />
    </Container>
  );
};

export default CreateEventPage;
