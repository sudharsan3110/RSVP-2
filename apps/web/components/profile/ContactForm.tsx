import { useProfileUpdate } from '@/lib/react-query/user';
import { phoneNumberFormSchema, PhoneNumberFormType } from '@/lib/zod/profile';
import { IUser } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import ProfileSection from './ProfileSection';

type Props = {
  user: IUser;
};

const PhoneNumberForm = ({ user }: Props) => {
  const { mutate } = useProfileUpdate();
  const form = useForm<PhoneNumberFormType>({
    resolver: zodResolver(phoneNumberFormSchema),
    defaultValues: {
      contact: user?.contact || '',
    },
  });

  const resetForm = () => {
    form.reset();
  };

  const onSubmit = async (data: PhoneNumberFormType) => {
    let contact = data.contact ?? undefined;
    mutate({ contact });
  };

  return (
    <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <ProfileSection title="Phone Number" description="Invites will be sent to this phone number.">
        <FormInput control={form.control} name="contact" label="Phone Number" />

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

export default PhoneNumberForm;
