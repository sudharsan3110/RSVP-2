import Footer from '@/components/common/Footer';
import Guest from '@/components/common/header/Guest';
import NoResults from '@/components/common/NoResults';

const NotFound = () => {
  return (
    <>
      <Guest />
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
      <Footer />
    </>
  );
};

export default NotFound;
