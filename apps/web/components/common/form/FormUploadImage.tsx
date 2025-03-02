'use client';

import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import api from '@/lib/axios/instance';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState } from 'react';
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form';
import { Icons } from '../Icon';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (file: File) => {
    setIsUploading(true);
    try {
      const response = await api.get('/event/upload-image', { params: { filename: file.name } });
      const signedUrl = response.data.signedUrl;
      const fileUrl = URL.createObjectURL(file);
      onChange({ file: fileUrl, url: signedUrl });
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload failed:', error);
      onChange(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={() => (
        <FormItem className={className}>
          {label && <FormLabel className={cn('text-white', labelClassName)}>{label}</FormLabel>}
          <FormControl>
            <div className="mt-4 space-y-4">
              {value && (
                <div className="relative aspect-square w-full rounded-lg bg-secondary">
                  {/* @eslint-disable-next-line */}
                  <img
                    src={value.file}
                    alt="Uploaded Image"
                    className="aspect-square rounded-lg bg-white object-cover"
                  />
                  <Button
                    className="absolute -right-2 -top-2 z-10"
                    onClick={() => onChange(null)}
                    variant="destructive"
                    size="icon"
                    radius="sm"
                  >
                    <X size={18} />
                  </Button>
                </div>
              )}
              {!value && (
                <div className="flex flex-col items-center gap-4">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file) handleSave(file);
                    }}
                    className="sr-only"
                    id={`file-upload-${name}`}
                  />
                  {!isUploading && (
                    <label
                      htmlFor={`file-upload-${name}`}
                      className="w-full cursor-pointer gap-2 rounded-xl border bg-background p-4 text-center text-sm text-secondary"
                    >
                      <Icons.alert className="mx-auto mb-3" />
                      <p className="mb-1">
                        <span className="font-semibold text-primary">Click to upload</span>&nbsp;
                        <span>or drag and drop</span>
                      </p>
                      <p>SVG, PNG, JPG or GIF (max. 800x800px)</p>
                    </label>
                  )}
                  {isUploading && (
                    <div className="w-full cursor-pointer rounded-xl border bg-background p-4 text-center text-sm text-secondary">
                      <Icons.upload className="mx-auto mb-3" />
                      <p className="mb-2">Uploading File Please Wait...</p>
                      <div>
                        <Progress value={uploadProgress} />{' '}
                        <span className="ml-2 font-semibold text-primary">{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default FormImageUpload;
