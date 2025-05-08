import { CreateEventFormType } from '@/lib/zod/event';
import { CalendarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../ui/button';
import ImageUploadDialog from './ImageUploadDialog';

type EventPreviewProps = {
  className?: string;
  children?: ReactNode;
  venueType?: string;
};

const EventPreview = ({ className, children, venueType }: EventPreviewProps) => {
  const { watch, setValue } = useFormContext<CreateEventFormType>();
  const image = watch('eventImageUrl');

  const removeImage = () => {
    setValue(
      'eventImageUrl',
      {
        signedUrl: '',
        file: '',
        url: '',
      },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  return (
    <section className={className}>
      {image.file && (
        <figure className="relative mx-auto mb-4 w-full max-w-3xl aspect-square">
          <div className="relative w-full h-full overflow-hidden rounded-lg">
            <div
              className="absolute inset-0 bg-center bg-cover filter blur-xl scale-105"
              style={{ backgroundImage: `url(${image.file})` }}
            />
            <img
              src={image.file}
              alt="Event Image"
              className="relative z-10 mx-auto h-full object-contain"
            />
          </div>
          <Button
            className="absolute -top-3 -right-3 z-20 bg-opacity-80 hover:bg-destructive hover:bg-opacity-100 hover:text-white"
            onClick={removeImage}
            variant="destructive"
            size="icon"
            radius="sm"
          >
            <X size={18} />
          </Button>
        </figure>
      )}
      {children}
      <h2 className="mb-4 line-clamp-2 text-left text-4xl font-semibold text-white">
        {watch('name') || '-'}
      </h2>
      {venueType === 'physical' && (
        <div className="mb-6 flex gap-3.5 lg:mb-4">
          <MapPinIcon className="mt-[3px] size-6 shrink-0" />
          <p className="line-clamp-2 text-[1.125rem]/[1.5rem] font-medium text-white">
            {watch('location') || '-'}
          </p>
        </div>
      )}
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
      {!image.file && (
        <ImageUploadDialog>
          <Button type="button" variant="secondary" radius="sm" className="mt-4 w-full">
            Add Image
          </Button>
        </ImageUploadDialog>
      )}
    </section>
  );
};

export default EventPreview;
