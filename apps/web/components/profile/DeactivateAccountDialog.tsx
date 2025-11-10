'use client';

import { useState } from 'react';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { useDeactivateAccount } from '@/lib/react-query/user';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface DeactivateAccountDialogProps {
  userId: string;
}

interface ErrorResponse {
  message: string;
  status: number;
}

export function DeactivateAccountDialog({ userId }: DeactivateAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deactivateAccount, isPending } = useDeactivateAccount();

  const handleDeactivate = () => {
    deactivateAccount(userId, {
      onSuccess: () => {
        setIsOpen(false);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<ErrorResponse>;
        const errorMessage = axiosError?.response?.data?.message;
        toast.error(errorMessage);
      },
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]"
        >
          Deactivate My Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="text-secondary">
            Your account will be deactivated immediately. If you need to recover your account within
            the 6-month grace period, please contact support@rsvp.kim with your registered email
            address.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4 mr-2 !text-amber-600" />
          <AlertTitle className="tracking-normal leading-5">
            Any active tickets or events will be affected by this action. You will be logged out and
            redirected to the home page.
          </AlertTitle>
        </Alert>

        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeactivate} disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="animate-spin" />
              </>
            ) : (
              'Deactivate'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
