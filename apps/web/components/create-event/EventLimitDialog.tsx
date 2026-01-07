'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, CalendarX } from 'lucide-react';

type EventLimitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
};

const EventLimitDialog = ({ open, onOpenChange, message }: EventLimitDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <CalendarX className="h-5 w-5 text-white" />
          </div>
        </div>

        <DialogHeader className="items-center">
          <DialogTitle>Event Limit Reached</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center gap-6">
          <DialogDescription className="text-base">{message}</DialogDescription>

          <Button
            asChild
            className="flex items-center gap-2 px-6"
            aria-label="Contact support on X"
          >
            <a href="https://x.com/TeamShiksha" target="_blank" rel="noopener noreferrer">
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventLimitDialog;
