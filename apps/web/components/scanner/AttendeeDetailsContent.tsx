import { IAttendee } from '@/types/attendee';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const AttendeeDetailsContent = (attendee: IAttendee) => {
  return (
    <section className="space-y-4 font-bold">
      <div className="flex gap-4">
        <div className="space-y-2">
          <h3 className="text-sm text-secondary">ATTENDEE NAME</h3>
          <p className="text-xl">{attendee?.name}</p>
        </div>
        <Avatar className="h-[60px] w-[60px]">
          <AvatarImage src={attendee?.imageUrl} alt={attendee?.name} />
          <AvatarFallback>
            {attendee?.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm text-secondary">EVENT</h3>
        <p className="text-xl">{attendee?.event}</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm text-secondary">CONFIRMATION CODE</h3>
        <p className="text-xl">{attendee?.qrToken}</p>
      </div>
    </section>
  );
};

export default AttendeeDetailsContent;
