'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Separator } from '../ui/separator';

type Attendee = {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
};
type ConfirmCoHostProps = {
  selectedCoHost: Attendee;
  isConfirmationDialogOpen: boolean;
  setIsConfirmationDialogOpen: (isOpen: boolean) => void;
};
const ConfirmCoHost = ({
  selectedCoHost,
  isConfirmationDialogOpen,
  setIsConfirmationDialogOpen,
}: ConfirmCoHostProps) => {
  const [loading, setLoading] = useState(false);

  const submitCoHostRequest = () => {
    setLoading(true);
    console.log(selectedCoHost);
    // API call to add co-host will be added here
    setTimeout(() => {
      setLoading(false);
      setIsConfirmationDialogOpen(false);
      toast.success(`${selectedCoHost?.name} has been added as co-host`);
    }, 2000);
  };
  return (
    <Dialog
      open={isConfirmationDialogOpen}
      onOpenChange={(isOpen) => setIsConfirmationDialogOpen(isOpen)}
    >
      <DialogContent className="p-0 sm:max-w-[520px]">
        <DialogHeader className="p-6 pb-0 text-left">
          <DialogTitle>Please Confirm Co-host</DialogTitle>
          <DialogDescription className="text-xs text-secondary">
            Are you sure you want to grant co-host permissions to {selectedCoHost?.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 px-6">
          <h3>They will be able to:</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-start space-x-2">
              <Check className="mt-1 h-4 w-4 text-green-500" />
              <div className="jutify-start flex flex-col">
                <p className="text-sm">Event Management</p>
                <p className="text-xs text-secondary-dark">
                  Ability to edit event details, schedules, and settings
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="mt-1 h-4 w-4 text-green-400" />
              <div className="jutify-start flex flex-col">
                <p className="text-sm">Attendee Control</p>
                <p className="text-xs text-secondary-dark">
                  Full access to manage participants and attendence
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="mt-1 h-4 w-4 text-green-400" />
              <div className="jutify-start flex flex-col">
                <p className="text-sm">Communications</p>
                <p className="text-xs text-secondary-dark">
                  Permission to send notifications and updates to all attendees
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Check className="mt-1 h-4 w-4 text-green-400" />
              <div className="jutify-start flex flex-col">
                <p className="text-sm">Analytics Access</p>
                <p className="text-xs text-secondary-dark">
                  View event statistics, attendance data, and engagement metrics
                </p>
              </div>
            </div>
          </div>
        </div>
        <Separator />

        {loading ? (
          <DialogFooter className="flex flex-row gap-2 px-6 pb-4">
            <DialogClose asChild>
              <Button disabled className="w-full rounded-md" variant="tertiary">
                Cancel
              </Button>
            </DialogClose>

            <Button disabled className="w-full rounded-md">
              <LoaderCircle className="animate-spin" />
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter className="flex flex-row gap-2 px-6 pb-4">
            <DialogClose asChild>
              <Button className="w-full rounded-md" variant="tertiary">
                Cancel
              </Button>
            </DialogClose>

            <Button onClick={submitCoHostRequest} className="w-full rounded-md">
              Add Co-Host
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmCoHost;
