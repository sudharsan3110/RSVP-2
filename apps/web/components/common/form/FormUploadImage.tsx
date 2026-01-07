'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import { Control, FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form';
import { Icons } from '../Icon';
import { Cropper, ReactCropperElement } from 'react-cropper';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUploadEventImage } from '@/lib/react-query/event';
import 'cropperjs/dist/cropper.css';

function FormImageUpload<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  className,
  labelClassName,
}: {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  className?: string;
  labelClassName?: string;
}) {
  const {
    field: { value, onChange },
  } = useController({
    name,
    control,
  });

  const { setValue, clearErrors } = useFormContext<TFieldValues>();
  const cropperRef = useRef<ReactCropperElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const { mutateAsync: uploadImage } = useUploadEventImage();
  const previewFile = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    setImage(fileUrl);
    setOpen(true);
  };
  const removeImage = () => {
    setValue(name, '' as TFieldValues[TName], {
      shouldDirty: true,
      shouldTouch: true,
    });
    setOpen(false);
  };

  const handleCropAndUpload = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;
    cropper.getCroppedCanvas().toBlob(async (blob) => {
      if (!blob) return;
      setIsUploading(true);
      setUploadProgress(0);
      const file = new File([blob], 'event.png', { type: 'image/png' });
      try {
        const { actualUrl } = await uploadImage({
          file,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });
        setUrl(actualUrl);
        if (actualUrl) {
          setValue(name, actualUrl as TFieldValues[TName], {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
        clearErrors(name);
      } catch (err) {
        throw new Error('Error while uploading Image');
      } finally {
        setIsUploading(false);
        setOpen(false);
        setImage(null);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 'image/png');
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          {label && <FormLabel className={cn('text-white', labelClassName)}>{label}</FormLabel>}
          <FormControl>
            <>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                  </DialogHeader>
                  {image && (
                    <>
                      <Cropper
                        className="object-cover max-h-96"
                        src={image}
                        style={{ width: '100%' }}
                        aspectRatio={1}
                        guides={true}
                        viewMode={1}
                        ref={cropperRef}
                        autoCropArea={1}
                        background={false}
                      />
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={handleCropAndUpload}
                          disabled={isUploading}
                          className="flex-1"
                        >
                          {isUploading ? 'Uploading...' : 'Set Event Image'}
                        </Button>
                      </div>
                      {isUploading && <Progress value={uploadProgress} className="mt-2" />}
                    </>
                  )}
                </DialogContent>
              </Dialog>
              {value ? (
                <figure className="relative mx-auto mb-4 w-full max-w-3xl aspect-square lg:hidden">
                  <div className="relative w-full h-full overflow-hidden rounded-lg">
                    <div
                      className="absolute inset-0 bg-center bg-cover filter blur-xl scale-105"
                      style={{ backgroundImage: `url(${value})` }}
                    />
                    <img
                      src={value}
                      alt="Uploaded Image"
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
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <input
                    className="sr-only"
                    type="file"
                    accept=".png, .jpg, .svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        previewFile(file);
                        e.target.value = '';
                      }
                    }}
                    id={`file-upload-${name}`}
                  />
                  <label
                    htmlFor={`file-upload-${name}`}
                    className="w-full cursor-pointer gap-2 rounded-xl border bg-background p-4 text-center text-sm text-secondary"
                  >
                    <Icons.alert className="mx-auto mb-3" />
                    <p className="mb-1">
                      <span className="font-semibold text-primary">Click to upload</span>
                    </p>
                    <p>SVG, PNG, JPG or GIF </p>
                    <p className="font-thin mt-1 italic">(Recommended Aspect Ratio. 1:1)</p>
                  </label>
                </div>
              )}
            </>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormImageUpload;
