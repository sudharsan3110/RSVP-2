import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { IEvent } from '@/types/event';

export const venueDisplay = (event: IEvent | null) => {
  switch (event?.venueType) {
    case 'physical':
      return trimText(event?.venueAddress || '');
    case 'virtual':
      return trimText(event?.venueUrl || '');
    case 'later':
      return 'You will be notified once host updates the details';
    default:
      return '';
  }
};

const trimText = (venue: string) => {
  return venue.length > 40 ? (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger className="text-left">{venue.substring(0, 40) + '...'}</TooltipTrigger>
        <TooltipContent>{venue}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    venue
  );
};
