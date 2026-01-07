'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, TriangleAlert } from 'lucide-react';
import Container from '@/components/common/Container';
import ProfileForm from '@/components/profile/ProfileForm';
import SecondaryEmailForm from '@/components/profile/SecondaryEmailForm';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useMemo } from 'react';
import ProfileFormSkeleton from '@/components/profile/ProfileFormLoading';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { DeactivateAccountDialog } from '@/components/profile/DeactivateAccountDialog';
import PhoneNumberForm from '@/components/profile/PhoneNumberForm';

const ProfilePage = () => {
  const { data, isSuccess, isLoading } = useCurrentUser();

  const user = useMemo(() => {
    if (!isSuccess) return null;
    return data;
  }, [isSuccess, data]);

  return (
    <Container className="container-main py-8">
      <section className="flex flex-col gap-1">
        <h1 className="text-2xl/[36px] font-semibold">Profile</h1>
        <p className="font-medium text-secondary">Manage your profile settings</p>
      </section>

      {user && !user.isCompleted && (
        <Alert className="mt-6 w-fit" variant="warning">
          <TriangleAlert
            className="-mt-[2px] inline-flex !text-amber-600"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <AlertTitle className="text-sm tracking-normal">
            Complete your profile to increase your ticket approval chances and get the most out of
            your experience.
          </AlertTitle>
        </Alert>
      )}

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
          This feature is coming soon. In case of urgent requirements, contact support@rsvp.kim.
        </p>
        <Button className="w-fit whitespace-nowrap rounded-[6px] text-sm/[24px]" disabled>
          <Download className="mr-2.5" size={20} /> Download
        </Button>
      </section>

      <Separator className="my-11 bg-separator" />
      <section className="max-w-xl" aria-labelledby="delete-account-title">
        <h2 id="delete-account-title" className="font-semibold text-white">
          Delete my account
        </h2>
        <p className="mb-6 mt-1 text-sm text-secondary">
          If you no longer wish to use RSVP, you can deactivate your account. Your account will be
          permanently deleted after 6 months of inactivity.
        </p>
        {user && <DeactivateAccountDialog userId={user?.id} />}
      </section>
    </Container>
  );
};

export default ProfilePage;
