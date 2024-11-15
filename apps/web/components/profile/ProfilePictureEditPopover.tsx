'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { userAvatarOptions } from '@/utils/constants';
import { Pencil } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '../ui/button';

type Props = {
  profilePictureUrl: string;
  // eslint-disable-next-line
  setProfilePictureState: (url: string) => void;
};
const ProfilePictureEditPopover = ({ profilePictureUrl, setProfilePictureState }: Props) => {
  const [selectedPicture, setSelectedPicture] = useState(profilePictureUrl);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger>
        <span aria-label="Edit profile picture">
          <Pencil fill="white" size={16} />
        </span>
      </DialogTrigger>
      <DialogContent className="w-11/12 rounded-[12px]">
        <DialogHeader>
          <DialogTitle className="mt-4 text-start text-2xl font-semibold">Edit Profile</DialogTitle>
        </DialogHeader>
        <DialogDescription>Choose a profile icon</DialogDescription>
        <div className="my-4 grid grid-cols-3 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-10">
          {userAvatarOptions.map((avatar, index) => (
            <Image
              priority
              key={index}
              width={120}
              height={120}
              onClick={() => setSelectedPicture(avatar.id)}
              className={`cursor-pointer rounded-full bg-white ${selectedPicture === avatar.id ? 'border-[4px] border-primary' : ''}`}
              src={avatar.src}
              alt="Profile picture option"
              data-testid={`profile-picture-option${index}`}
            />
          ))}
        </div>
        <Button
          onClick={() => {
            setProfilePictureState(selectedPicture);
            setIsDialogOpen(false);
          }}
          className="ml-auto mt-3 h-9 rounded-[6px] text-sm font-semibold text-white"
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureEditPopover;
