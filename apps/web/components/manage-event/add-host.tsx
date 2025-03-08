'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlusIcon } from '@heroicons/react/24/solid';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useState } from 'react';
import ConfirmCoHost from './confirm-host';
import NoResults from '../common/NoResults';
import { useGetAttendeeByEventId } from '@/lib/react-query/event';
import { Attendee } from '@/types/attendee';
import { useParams } from 'next/navigation';

const AddCoHost = ({ className }: PropsWithClassName) => {
  const [selectedCoHost, setSelectedCoHost] = useState<Attendee | null>(null);
  const [isCohostSelectionDialogOpen, setIsCohostSelectionDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams();
  const { data, isLoading: isAttendeeLoading } = useGetAttendeeByEventId({
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

  const filteredAttendees =
    searchQuery !== ''
      ? usersData?.filter((attendee: Attendee) =>
          attendee.user.primary_email.toLowerCase().includes(searchQuery.toLowerCase())
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
        <DialogContent className="sm:max-w-[425px]">
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
                            src={`https://avatar.vercel.sh/${attendee.id}.png`}
                            alt={attendee.user.full_name}
                          />
                          <AvatarFallback>
                            {attendee.user?.full_name?.charAt(0) || 'R'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium">{attendee.user.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {attendee.user.primary_email}
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
                  <NoResults
                    title="No User found"
                    message="Please confirm that if user is registered on the platform."
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      {selectedCoHost && (
        <ConfirmCoHost
          selectedCoHost={selectedCoHost}
          isConfirmationDialogOpen={isConfirmationDialogOpen}
          setIsConfirmationDialogOpen={setIsConfirmationDialogOpen}
        />
      )}
    </section>
  );
};

export default AddCoHost;
