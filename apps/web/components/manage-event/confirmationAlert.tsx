'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Input } from '../ui/input';

interface CancelEventPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  confirmationText: string;
  buttonText: string;
}

const ConfirmationAlert = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title,
  description,
  confirmationText,
  buttonText,
}: CancelEventPopoverProps) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmationValid = confirmText === confirmationText;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-11/12 rounded-[12px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>{description}</AlertDialogDescription>
        <div className="flex flex-col gap-2 my-4">
          <label htmlFor="typeHere">Type here</label>
          <Input
            type="text"
            name="typeHere"
            id="typeHere"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={confirmationText}
          />
        </div>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isLoading || !isConfirmationValid}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 /> {buttonText}
              </span>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationAlert;
