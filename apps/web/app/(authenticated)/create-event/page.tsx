import BasicDetailsForm from '@/components/create-event/BasicDetailsForm';
import Container from '@/components/common/Container';

const CreateEventPage = () => {
  return (
    <Container className="container-main py-8">
      <h2 className="text-2xl/[2.25rem] font-semibold text-white">Create Event</h2>
      <BasicDetailsForm />
    </Container>
  );
};

export default CreateEventPage;
