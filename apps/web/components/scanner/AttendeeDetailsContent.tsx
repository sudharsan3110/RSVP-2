import { Attendee } from '@/types/attendee';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type Props = {
  attendee: Attendee;
};

const AttendeeDetailsContent = ({ attendee }: Props) => {
  return (
    <section className="space-y-4 font-bold">
      <div className="flex gap-4">
        <div className="space-y-2">
          <h3 className="text-sm text-secondary">ATTENDEE NAME</h3>
          <p className="text-xl">{attendee?.user?.fullName}</p>
        </div>
        <Avatar className="h-[60px] w-[60px]">
          <AvatarImage src={attendee?.user?.profileIconUrl} alt={attendee?.user?.fullName} />
          <AvatarFallback>{attendee?.user?.initials}</AvatarFallback>
        </Avatar>
      </div>
      <div className="space-y-2">
        <h3 className="text-sm text-secondary">CONFIRMATION CODE</h3>
        <p className="text-xl">{attendee?.qrToken}</p>
      </div>
    </section>
  );
};

export default AttendeeDetailsContent;
