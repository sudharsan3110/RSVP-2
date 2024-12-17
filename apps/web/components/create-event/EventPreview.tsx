import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { UseFormWatch } from 'react-hook-form';
import { ReactNode } from 'react';
import { CreateEventFormType } from '@/lib/zod/event';

type EventPreviewProps = {
  watch: UseFormWatch<CreateEventFormType>;
  className?: string;
  children?: ReactNode;
};

const EventPreview = ({ watch, className, children }: EventPreviewProps) => {
  return (
    <section className={className}>
      {children}
      <div className="mb-6 flex gap-3.5 lg:mb-[50px]">
        <MapPinIcon className="mt-[3px] size-6 shrink-0" />
        <p className="line-clamp-2 text-[1.125rem]/[1.5rem] font-medium text-white">
          {watch('location') || '-'}
        </p>
      </div>
      <section className="flex gap-3.5">
        <CalendarIcon className="mt-[3px] size-6 shrink-0" />
        <div className="text-white">
          <p className="text-sm font-semibold">From</p>
          <span className="font-medium">
            {watch('fromDate') ? dayjs(watch('fromDate')).format('DD MMM YYYY') : '-'},
          </span>
          <span className="ml-1 font-medium">{watch('fromTime') || '-'}</span>
          <p className="mt-3 text-sm font-semibold">To</p>
          <span className="font-medium">
            {watch('toDate') ? dayjs(watch('toDate')).format('DD MMM YYYY') : '-'},
          </span>
          <span className="ml-1 font-medium">{watch('toTime') || '-'}</span>
        </div>
      </section>
    </section>
  );
};

export default EventPreview;
