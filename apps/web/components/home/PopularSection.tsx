import Container from "@/components/common/Container";
import EventCard from "@/components/common/EventCard";
import { Button } from "@/components/ui/button";

const PopularSection = () => {
  return (
    <Container
      className="relative z-10 space-y-6 md:space-y-12"
      data-testid="popular-section"
    >
      <header className="flex items-center justify-between">
        <h2
          className="text-xl font-bold tracking-wide md:text-[28px]"
          data-testid="popular-events-title"
        >
          Popular Events
        </h2>
        <Button
          variant="link"
          className="mt hidden md:block"
          data-testid="see-all-events-desktop"
        >
          See all events
        </Button>
      </header>
      <div className="grid grid-cols-4 gap-10 sm:grid-cols-8 xl:grid-cols-12">
        <EventCard className="col-span-4" />
        <EventCard className="col-span-4" />
        <EventCard className="col-span-4" />
      </div>
      <Button
        variant="link"
        className="mt block w-full md:hidden"
        data-testid="see-all-events-mobile"
      >
        See all events
      </Button>
    </Container>
  );
};

export default PopularSection;
