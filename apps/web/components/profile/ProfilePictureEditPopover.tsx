'use client';

import { Control, Controller } from 'react-hook-form';
import { ProfileFormType } from '@/lib/zod/profile';
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
  control: Control<ProfileFormType>;
};

const ProfilePictureEditPopover = ({ control }: Props) => {
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
          <Controller
            name="profile_icon"
            control={control}
            render={({ field }) => (
              <>
                {userAvatarOptions.map((avatar, index) => (
                  <Image
                    priority
                    key={index}
                    width={120}
                    height={120}
                    onClick={() => field.onChange(avatar.id)}
                    className={`cursor-pointer rounded-full bg-white ${
                      field.value === avatar.id ? 'border-[4px] border-primary' : ''
                    }`}
                    src={avatar.src}
                    alt="Profile picture option"
                    data-testid={`profile-picture-option${index}`}
                  />
                ))}
              </>
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureEditPopover;
