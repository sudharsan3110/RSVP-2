'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download } from 'lucide-react';
import Container from '@/components/common/Container';
import ProfileForm from '@/components/profile/ProfileForm';
import SecondaryEmailForm from '@/components/profile/SecondaryEmailForm';
import PhoneNumberForm from '@/components/profile/ContactForm';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useMemo } from 'react';
import { IUser } from '@/types/user';
import ProfileFormSkeleton from '@/components/profile/ProfileFormLoading';

const ProfilePage = () => {
  const { data, isSuccess, isLoading } = useCurrentUser();

  const user = useMemo(() => {
    if (!isSuccess) return null;
    return data.data.data as IUser;
  }, [isSuccess, data]);

  return (
    <Container className="container-main py-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl/[36px] font-semibold">Profile</h1>
        <p className="font-medium text-secondary">Manage your profile settings</p>
      </section>

      <Separator className="my-11 bg-separator" />

      {isLoading && <ProfileFormSkeleton />}

      {user != null && !isLoading && (
        <>
          <ProfileForm user={user} />
          <Separator className="my-11 bg-separator" />
          <SecondaryEmailForm user={user} />
          <Separator className="my-11 bg-separator" />
          <PhoneNumberForm user={user} />
          <Separator className="my-11 bg-separator" />
        </>
      )}
      <section className="max-w-xl" aria-labelledby="download-data-title">
        <h2 id="download-data-title" className="font-semibold text-white">
          Download your personal data
        </h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          We believe in transparency and giving you full control over your personal information.
          That&apos;s why we offer the option to download your data directly from our app.
        </p>
        <Button className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]">
          <Download className="mr-2.5" size={20} /> Download
        </Button>
      </section>
      <Separator className="my-11 bg-separator" />
      <section className="max-w-xl" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title" className="font-semibold text-white">
          Delete my account
        </h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          If you no longer wish to use RSVP, you can permanently delete your account.
        </p>
        <Button
          variant="destructive"
          className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]"
        >
          Delete My Account
        </Button>
      </section>
    </Container>
  );
};

export default ProfilePage;
