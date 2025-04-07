import { useForm } from 'react-hook-form';
import FormProvider from '../ui/form-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import ProfileSection from './ProfileSection';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import Image from 'next/image';
import ProfilePictureEditPopover from './ProfilePictureEditPopover';
import FormTextArea from '../common/form/FormTextArea';
import { useMemo } from 'react';
import { userAvatarOptions } from '@/utils/constants';
import { useProfileUpdate } from '@/lib/react-query/user';
import { IUser } from '@/types/user';
import { profileFormSchema, ProfileFormType } from '@/lib/zod/profile';
import { Loader2 } from 'lucide-react';

type Props = {
  user: IUser;
};

const ProfileForm = ({ user }: Props) => {
  const { mutate, isPending } = useProfileUpdate();
  const form = useForm<ProfileFormType>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: user.full_name ?? '',
      location: user.location ?? '',
      bio: user?.bio ?? '',
      profile_icon: user?.profile_icon ?? '',
      twitter: user?.twitter ?? '',
      website: user?.website ?? '',
      instagram: user?.instagram ?? '',
    },
  });

  const bio = form.watch('bio');
  const profileIcon = form.watch('profile_icon');

  const resetForm = () => {
    form.reset();
  };

  const onSubmit = (data: ProfileFormType) => {
    mutate(data, {
      onSuccess: () => {
        form.reset(form.getValues());
      },
    });
  };

  const profilePictureUrl = useMemo(() => {
    const profileUrl = userAvatarOptions.find((option) => option.id === profileIcon);
    return profileUrl?.src ?? userAvatarOptions[0]?.src!;
  }, [profileIcon]);

  return (
    <FormProvider
      methods={form}
      onSubmit={form.handleSubmit(onSubmit, (error) => {
        console.log(error);
      })}
    >
      <ProfileSection title="Public profile" description="This will be displayed on your profile.">
        <div className="flex items-end">
          <Image
            width={80}
            height={80}
            priority
            src={profilePictureUrl}
            alt="Profile picture"
            className="rounded-full border-2 border-solid border-purple-500 bg-white"
          />
          <ProfilePictureEditPopover control={form.control} />
        </div>
        <FormInput control={form.control} name="full_name" label="Full name" type="text" />
        <FormInput control={form.control} name="location" label="Location" type="text" />
        <div className="space-y-1.5">
          <FormTextArea control={form.control} name="bio" label="Bio" />
          <p className="text-sm text-secondary">{500 - bio?.length} characters left</p>
        </div>
        <FormInput
          control={form.control}
          name="twitter"
          label="Twitter/X"
          type="text"
          inputClassName="rounded-l-none"
        >
          <span className="block rounded-l-[6px] bg-dark-500 px-2.5 py-2">https://x.com/</span>
        </FormInput>
        <FormInput
          control={form.control}
          name="instagram"
          label="Instagram"
          type="text"
          inputClassName="rounded-l-none"
        >
          <span className="block rounded-l-[6px] bg-dark-500 px-2.5 py-2">
            https://instagram.com/
          </span>
        </FormInput>
        <FormInput
          control={form.control}
          name="website"
          label="Website"
          type="text"
          inputClassName="rounded-l-none"
        >
          <span className="block rounded-l-[6px] bg-dark-500 px-2.5 py-2">https://</span>
        </FormInput>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={resetForm}
            type="reset"
            variant="tertiary"
            radius="sm"
            disabled={!form.formState.isDirty}
          >
            Reset
          </Button>
          <Button type="submit" radius="sm" disabled={!form.formState.isDirty || isPending}>
            {isPending ? (
              <>
                Saving
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </ProfileSection>
    </FormProvider>
  );
};

export default ProfileForm;
