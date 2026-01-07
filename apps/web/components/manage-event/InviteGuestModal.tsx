import React, { useState, KeyboardEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_INVITE_EMAILS } from '@/utils/constants';

interface InviteGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (emails: string[]) => Promise<void>;
  isPending?: boolean;
}

export const InviteGuestModal: React.FC<InviteGuestModalProps> = ({
  open,
  onOpenChange,
  onInvite,
  isPending = false,
}) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Email validation regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleCancle = () => {
    onOpenChange(false);
    setEmails([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    } else if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      // Remove last email on backspace if input is empty
      removeEmail(emails.length - 1);
    }
  };

  const addEmail = (emailString?: string) => {
    const sourceEmail = emailString !== undefined ? emailString : inputValue;
    const email = sourceEmail.trim();

    if (emails.length >= MAX_INVITE_EMAILS) {
      toast.error(`You can add a maximum of ${MAX_INVITE_EMAILS} email addresses.`);
      return;
    }

    if (!email) return;

    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (emails.includes(email)) {
      toast.error('This email is already added');
      return;
    }
    setEmails((prevEmails) => [...prevEmails, email]);

    if (emailString === undefined) {
      setInputValue('');
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;

    const potentialEmails = pastedText
      .split(/[,\n\s]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const remainingSlots = MAX_INVITE_EMAILS - emails.length;

    if (remainingSlots <= 0) {
      toast.error(`You can add a maximum of ${MAX_INVITE_EMAILS} email addresses.`);
      return;
    }

    const validNewEmails = potentialEmails
      .filter((email) => isValidEmail(email) && !emails.includes(email))
      .slice(0, remainingSlots);

    if (validNewEmails.length === 0) {
      toast.error('No valid or unique emails found in pasted text.');
      return;
    }

    setEmails((prev) => [...prev, ...validNewEmails]);

    const skipped = potentialEmails.length - validNewEmails.length;
    if (skipped > 0) {
      toast.info(
        `${validNewEmails.length} emails added. ${skipped} were invalid, duplicates, or exceeded the limit.`
      );
    }
    setInputValue('');
  };

  const removeEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleInvite = async () => {
    if (emails.length === 0) {
      toast.error('Please add at least one email address');
      return;
    }

    try {
      await onInvite(emails);
      // Reset on success
      setEmails([]);
      setInputValue('');
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Invite Your Guests</DialogTitle>
          <DialogDescription>
            Enter email addresses separated by commas. Press Enter or comma to add each email.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex h-40 flex-wrap gap-x-2 gap-y-2 content-start overflow-y-auto rounded-md border border-input bg-background p-3 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 custom-scrollbar">
            {emails.map((email, index) => (
              <div
                key={index}
                className="flex h-7 shrink-0 items-center gap-x-1 rounded-md bg-primary px-2.5 py-1 text-sm text-primary-foreground whitespace-nowrap "
              >
                <span className="max-w-[170px] truncate">{email}</span>
                <button
                  type="button"
                  onClick={() => removeEmail(index)}
                  className="ml-1 rounded-sm hover:bg-primary/80 transition-colors flex-shrink-0"
                  disabled={isPending}
                  aria-label={`Remove ${email}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => addEmail()}
              placeholder={emails.length === 0 ? 'Enter email addresses...' : ''}
              className="min-w-[200px] flex-1 border-0 p-0 h-7 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isPending}
            />
          </div>
          {emails.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {emails.length} of {MAX_INVITE_EMAILS} {emails.length === 1 ? 'email' : 'emails'}{' '}
              added
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancle}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={isPending || emails.length === 0}
            className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            {isPending
              ? 'Sending...'
              : `Send ${emails.length > 0 ? `(${emails.length})` : ''} Invitations`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
