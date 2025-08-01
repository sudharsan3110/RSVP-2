'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import api from '@/lib/axios/instance';
import { CreateEventFormType } from '@/lib/zod/event';
import { X } from 'lucide-react';
import { ReactNode, useCallback, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Progress } from '../ui/progress';
import { Icons } from '../common/Icon';
import axios from 'axios';
type Props = {
  children: ReactNode;
};

const ImageUploadDialog = ({ children }: Props) => {
  const { control, setValue } = useFormContext<CreateEventFormType>();
  const [image, setImage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) handleSave(droppedFile);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSave = async (file: File) => {
    if (file) {
      setIsUploading(true);
      const filename = file.name;

      try {
        const { data } = await api.get('/event/upload-image', { params: { filename } });
        setUploadProgress(100);
        const signedUrl = data.data.signedUrl;
        const fileUrl = URL.createObjectURL(file);
        const url = data.data?.url;
        if (file && signedUrl) {
          await axios.put(signedUrl, file, {
            headers: {
              'Content-Type': file.type,
            },
          });
          setValue('eventImageUrl', { url, signedUrl, file: fileUrl });
        }
        setImage(fileUrl);
        const actualUrl = signedUrl ? signedUrl.split('?')[0] : null;
        setUrl(actualUrl);
        setSignedUrl(signedUrl);
      } catch (error) {
        setImage(null);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      if (image && url)
        setValue(
          'eventImageUrl',
          { file: image, url: url, signedUrl: signedUrl },
          { shouldDirty: true, shouldTouch: true }
        );
    }
  };
  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
      <Dialog onOpenChange={handleClose}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            {image && (
              <div className="relative aspect-square w-full rounded-lg bg-secondary">
                <img
                  src={image}
                  alt="Event Image"
                  className="aspect-square rounded-lg bg-white object-cover"
                />
                <Button
                  className="absolute -right-2 -top-2 z-10"
                  onClick={() => setImage(null)}
                  variant="destructive"
                  size="icon"
                  radius="sm"
                >
                  <X size={18} />
                </Button>
              </div>
            )}
            {!image && (
              <Controller
                name="eventImageUrl"
                control={control}
                render={() => (
                  <div className="flex flex-col items-center gap-4">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/svg+xml, image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) handleSave(file);
                      }}
                      className="sr-only"
                      id="file-upload"
                    />
                    {!isUploading && (
                      <label
                        htmlFor="file-upload"
                        className="w-full cursor-pointer gap-2 rounded-xl border bg-background p-4 text-center text-sm text-secondary"
                      >
                        <Icons.alert className="mx-auto mb-3" />
                        <p className="mb-1">
                          <span className="font-semibold text-primary">Click to upload</span>&nbsp;
                          <span>or drag and drop</span>
                        </p>
                        <p>Supported: PNG, JPG or SVG</p>
                        <p className="font-thin mt-1 italic">(Recommended Aspect Ratio. 1:1)</p>
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
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ImageUploadDialog;
