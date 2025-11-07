import { CalendarEvent, google, ics, outlook } from 'calendar-link';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { useGetEventById } from '@/lib/react-query/event';
import { CalendarPlus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const CalendarDropdown = ({ eventId }: { eventId: string }) => {
  const { data: eventData } = useGetEventById(eventId);

  const getEventDetails = () => {
    if (!eventData?.event) {
      return;
    }

    const { id, name, description, startTime, endTime, venueUrl } = eventData.event;
    const event: CalendarEvent = {
      uid: id,
      title: name,
      description: description,
      start: startTime,
      end: endTime,
      location: venueUrl,
    };

    return event;
  };

  const addEventToCalendar = (calendarType: 'google' | 'ical' | 'outlook') => {
    const event = getEventDetails();
    if (!event) return;

    let url: string | null = null;

    switch (calendarType) {
      case 'google':
        url = google(event);
        break;
      case 'ical':
        url = ics(event);
        break;
      case 'outlook':
        url = outlook(event);
        break;
      default:
        console.warn(`Unsupported calendar type: ${calendarType}`);
        return;
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary bg-black text-primary transition-all hover:bg-primary hover:text-white">
              <CalendarPlus className="h-6 w-6 " />
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">Add to Calendar</TooltipContent>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 rounded-lg"
        align="end"
        alignOffset={-5}
        sideOffset={5}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <DropdownMenuItem className="cursor-pointer" onClick={() => addEventToCalendar('google')}>
          <span>Google Calendar</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => addEventToCalendar('ical')}>
          <span>iCal</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => addEventToCalendar('outlook')}>
          <span>Outlook</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
