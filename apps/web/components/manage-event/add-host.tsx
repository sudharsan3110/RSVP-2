'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import useDebounce from '@/hooks/useDebounce';
import { useGetAttendeeByEventId } from '@/lib/react-query/event';
import { cn } from '@/lib/utils';
import { Attendee } from '@/types/attendee';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import NoResults from '../common/NoResults';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import ConfirmCoHost from './confirm-host';

const AddCoHost = ({ className }: PropsWithClassName) => {
  const [selectedCoHost, setSelectedCoHost] = useState<Attendee | null>(null);
  const [isCohostSelectionDialogOpen, setIsCohostSelectionDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { id } = useParams();
  const { data } = useGetAttendeeByEventId({
    eventId: id as string,
    sortBy: 'registrationTime',
  });
  let usersData = data?.attendees || [];

  const toggleCohostSelectionDialog = (isOpen: boolean) => {
    setIsCohostSelectionDialogOpen(isOpen);
    if (!isOpen) {
      setSearchQuery('');
      setSelectedCoHost(null);
    }
  };

  const handleSelectCoHostForConfirmation = (attendee: Attendee) => {
    setSelectedCoHost(attendee);
    setIsCohostSelectionDialogOpen(false);
    setIsConfirmationDialogOpen(true);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const filteredAttendees =
    debouncedSearchQuery !== ''
      ? usersData?.filter((attendee: Attendee) =>
          attendee.user?.primaryEmail.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        )
      : usersData;

  return (
    <section className={cn('space-y-3', className)}>
      <Dialog open={isCohostSelectionDialogOpen} onOpenChange={toggleCohostSelectionDialog}>
        <DialogTrigger asChild>
          <Button radius="sm" size="sm" variant="tertiary" className="w-full">
            <PlusIcon className="mr-2 size-4" />
            Add host
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add Co-host</DialogTitle>
            <DialogDescription className="text-xs text-secondary">
              Search your host with email or name
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="z-10 h-5 w-5 text-white" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border border-dark-500 bg-dark-500 py-2 pl-10 pr-3 text-sm leading-5 text-white placeholder-secondary-dark focus:border-dark-500 focus:outline-none focus:ring-2 focus:ring-dark-500"
                placeholder="Search email."
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </div>

            <ScrollArea className="h-72">
              <div className="flex flex-col gap-3 text-center">
                {filteredAttendees?.length > 0 ? (
                  filteredAttendees.map((attendee: Attendee) => (
                    <div
                      key={attendee.id}
                      className="bg-dark-600 flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={attendee.user?.profileIconUrl}
                            alt={attendee.user?.fullName}
                          />
                          <AvatarFallback>
                            {attendee.user?.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium">{attendee.user?.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {attendee.user?.primaryEmail}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSelectCoHostForConfirmation(attendee)}
                        className="h-8 rounded-md px-4 py-2 text-xs"
                      >
                        Add Host
                      </Button>
                    </div>
                  ))
                ) : (
                  <>
                    <NoResults
                    className='mt-10'
                      title="No User found"
                      message="Please confirm that if user is registered on the platform."
                    />
                    {isValidEmail(searchQuery) && (
                      <Button
                        onClick={() => {
                          setIsCohostSelectionDialogOpen(false);
                          setIsConfirmationDialogOpen(true);
                        }}
                        className="mt-4"
                      >
                        Invite {searchQuery.slice(0, 10)}...  as Co-host
                      </Button>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {isValidEmail(searchQuery) && (
        <ConfirmCoHost
          selectedCoHost={searchQuery}
          isConfirmationDialogOpen={isConfirmationDialogOpen}
          setIsConfirmationDialogOpen={setIsConfirmationDialogOpen}
        />
      )}
    </section>
  );
};

export default AddCoHost;
