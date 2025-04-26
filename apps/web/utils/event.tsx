import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendeeStatus } from '@/types/attendee';
import { Event, VenueType } from '@/types/events';
import { userAvatarOptions } from '@/utils/constants';
export const venueDisplay = (event: Event | null) => {
  switch (event?.venueType) {
    case VenueType.Physical:
      return trimText(event?.venueAddress || '');
    case VenueType.Virtual:
      return trimText(event?.venueUrl || '');
    case VenueType.Later:
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

export const getBadgeVariant = (status: AttendeeStatus) => {
  switch (status) {
    case AttendeeStatus.Going:
      return 'success';
    case AttendeeStatus.NotGoing:
      return 'destructive';
    case AttendeeStatus.Pending:
      return 'secondary';
    default:
      return 'default';
  }
};

export const getProfilePictureUrl = (profileIConId: number | string) => {
  const profileUrl = userAvatarOptions.find((option) => option.id === profileIConId);
  return profileUrl?.src ?? userAvatarOptions[0].src;
};
