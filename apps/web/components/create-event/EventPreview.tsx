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
    setValue('eventImageUrl', {
      signedUrl: '',
      file: '',
      url: '',
    });
  };

  return (
    <section className={className}>
      {image.file && (
        <figure className="relative mx-auto mb-4 aspect-square md:w-3/4">
          <img
            src={image.file}
            alt="Event Image"
            className="aspect-square overflow-clip rounded-lg object-cover mt-2 md:mt-0"
          />
          <Button
            className="absolute -right-2 -top-2 z-10 hidden bg-opacity-80 hover:bg-destructive hover:bg-opacity-100 hover:text-white md:flex"
            onClick={removeImage}
            variant="secondary"
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
