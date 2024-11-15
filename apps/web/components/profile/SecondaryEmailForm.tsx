import { useProfileUpdate } from '@/lib/react-query/user';
import { secondaryEmailFormSchema, SecondaryEmailFormType } from '@/lib/zod/profile';
import { IUser } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import ProfileSection from './ProfileSection';

type Props = {
  user: IUser;
};

const SecondaryEmailForm = ({ user }: Props) => {
  const { mutate } = useProfileUpdate();
  const form = useForm<SecondaryEmailFormType>({
    resolver: zodResolver(secondaryEmailFormSchema),
    defaultValues: {
      email: user?.primary_email || '',
      secondary_email: user?.secondary_email || '',
    },
  });

  const secondaryEmail = form.watch('secondary_email');

  const resetForm = () => {
    form.reset();
  };

  const addSecondaryEmail = () => {
    form.setValue('secondary_email', ' ');
  };

  const onSubmit = async (data: SecondaryEmailFormType) => {
    let secondary_email = data.secondary_email;
    mutate({ secondary_email });
  };

  return (
    <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <ProfileSection
        title="Email address"
        description="Invites will be sent to this email address."
      >
        <FormInput control={form.control} disabled name="email" label="Email" type="email" />

        {secondaryEmail != '' && (
          <FormInput
            control={form.control}
            name="secondary_email"
            label="Secondary Email"
            type="email"
          />
        )}

        <Button
          onClick={addSecondaryEmail}
          type="button"
          className="mr-auto w-fit"
          variant="ghost"
          size="sm"
          disabled={!!secondaryEmail}
        >
          <Plus className="mr-2 size-4" />
          Add Another
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button type="reset" onClick={resetForm} variant="tertiary" radius="sm">
            Reset
          </Button>
          <Button type="submit" radius="sm">
            Save
          </Button>
        </div>
      </ProfileSection>
    </FormProvider>
  );
};

export default SecondaryEmailForm;
