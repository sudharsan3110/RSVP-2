import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RefreshCw, XCircle, AlertCircle } from 'lucide-react';

type InviteResults = {
  invited: { email: string }[];
  restored: { email: string }[];
  failed: { email: string; reason: string }[];
  skipped: { email: string; reason: string }[];
};

interface InviteResultsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: InviteResults | null;
  onRetryFailed?: () => void;
}

export const InviteResultsModal: React.FC<InviteResultsModalProps> = ({
  open,
  onOpenChange,
  results,
  onRetryFailed,
}) => {
  if (!results) return null;

  const totalProcessed =
    results.invited.length +
    results.restored.length +
    results.failed.length +
    results.skipped.length;
  const hasFailures = results.failed.length > 0;
  const allSuccess = results.invited.length + results.restored.length === totalProcessed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Invitations Sent Successfully
              </>
            ) : hasFailures ? (
              <>
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                Invitations Partially Sent
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Invitations Processed
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-left ml-7">
            {totalProcessed} {totalProcessed === 1 ? 'email' : 'emails'} processed
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Invited */}
          {results.invited.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                <CheckCircle2 className="h-4 w-4" />
                <h3 className="font-semibold">Successfully Invited ({results.invited.length})</h3>
              </div>
              <div className="ml-6 space-y-1">
                {results.invited.map((el, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-md"
                  >
                    {el.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restored */}
          {results.restored.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-500">
                <RefreshCw className="h-4 w-4" />
                <h3 className="font-semibold">Restored ({results.restored.length})</h3>
              </div>
              <p className="ml-6 text-sm text-muted-foreground mb-2">
                These guests were previously removed and have been restored.
              </p>
              <div className="ml-6 space-y-1">
                {results.restored.map((el, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-md"
                  >
                    {el.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skipped */}
          {results.skipped.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                <AlertCircle className="h-4 w-4" />
                <h3 className="font-semibold">Skipped ({results.skipped.length})</h3>
              </div>
              <p className="ml-6 text-sm text-muted-foreground mb-2">
                These guests were already invited.
              </p>
              <div className="ml-6 space-y-1">
                {results.skipped.map((el, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 px-3 py-2 rounded-md"
                  >
                    {el.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Failed */}
          {results.failed.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
                <XCircle className="h-4 w-4" />
                <h3 className="font-semibold">Failed ({results.failed.length})</h3>
              </div>
              <p className="ml-6 text-sm text-muted-foreground mb-2">
                These invitations could not be sent. Please try again.
              </p>
              <div className="ml-6 space-y-1">
                {results.failed.map((el, index) => (
                  <div
                    key={index}
                    className="text-sm text-muted-foreground bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-md"
                  >
                    {el.email}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {hasFailures && onRetryFailed && (
            <Button
              type="button"
              variant="outline"
              onClick={onRetryFailed}
              className="w-full sm:w-auto"
            >
              Retry Failed
            </Button>
          )}
          <Button type="button" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
