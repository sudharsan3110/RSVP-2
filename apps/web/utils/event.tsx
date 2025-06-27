import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AttendeeStatus } from '@/types/attendee';
import { Event, VenueType } from '@/types/events';
import { Cohost, Role } from '@/types/cohost';
import { User } from '@/types/user';
import { userAvatarOptions } from '@/utils/constants';

export const venueDisplay = (event: Event | null) => {
  switch (event?.venueType) {
    case VenueType.Physical:
      return trimText(event?.venueAddress || '');
    case VenueType.Virtual:
      return trimText(event?.venueUrl || '');
    case VenueType.Later:
      return 'The event location will be announced soon.';
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

export const isCurrentUserCohost = (userData?: User, cohosts: Cohost[] = []): boolean => {
  return cohosts.some(
    (cohost) =>
      cohost.user &&
      cohost.role === Role.MANAGER &&
      userData &&
      cohost.user.userName === userData.userName
  );
};

export const checkIfUserIsNotCohost = (userData?: User, cohosts: Cohost[] = []): boolean => {
  if (!userData) return false;
  return !cohosts.some(
    (cohost) =>
      cohost.user &&
      (cohost.role === Role.MANAGER || cohost.role === Role.CREATOR) &&
      userData &&
      cohost.user.userName === userData.userName
  );
};
