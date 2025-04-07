import { useProfileUpdate } from '@/lib/react-query/user';
import { phoneNumberFormSchema, PhoneNumberFormType } from '@/lib/zod/profile';
import { IUser } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import ProfileSection from './ProfileSection';
import { Loader2 } from 'lucide-react';

type Props = {
  user: IUser;
};

const PhoneNumberForm = ({ user }: Props) => {
  const { mutate, isPending } = useProfileUpdate();
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
    mutate(
      { contact },
      {
        onSuccess: () => {
          form.reset(form.getValues());
        },
      }
    );
  };

  return (
    <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <ProfileSection title="Phone Number" description="Invites will be sent to this phone number.">
        <FormInput
          control={form.control}
          name="contact"
          label="Phone Number"
          aria-label="Phone Number"
        />

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="reset"
            onClick={resetForm}
            variant="tertiary"
            radius="sm"
            disabled={!form.formState.isDirty}
          >
            Reset
          </Button>
          <Button
            type="submit"
            radius="sm"
            disabled={!form.formState.isDirty || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving
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

export default PhoneNumberForm;
