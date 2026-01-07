import { useProfileUpdate } from '@/lib/react-query/user';
import { secondaryEmailFormSchema, SecondaryEmailFormType } from '@/lib/zod/profile';
import { User } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import ProfileSection from './ProfileSection';

type Props = {
  user: User;
};

const SecondaryEmailForm = ({ user }: Props) => {
  const { mutate, isPending } = useProfileUpdate();
  const form = useForm<SecondaryEmailFormType>({
    resolver: zodResolver(secondaryEmailFormSchema),
    defaultValues: {
      email: user?.primaryEmail || '',
      secondaryEmail: user?.secondaryEmail || '',
    },
  });

  const hasSecondaryEmail = form.watch('secondaryEmail');

  const resetForm = () => {
    form.reset();
  };

  const addSecondaryEmail = () => {
    form.setValue('secondaryEmail', ' ', { shouldDirty: true });
  };

  const removeSecondaryEmail = () => {
    form.setValue('secondaryEmail', null, { shouldDirty: true });
  };

  const onSubmit = async (data: SecondaryEmailFormType) => {
    const secondaryEmail = data.secondaryEmail;
    mutate(
      { secondaryEmail },
      {
        onSuccess: () => {
          form.reset(form.getValues());
        },
      }
    );
  };

  return (
    <FormProvider methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <ProfileSection
        title="Email address"
        description="Invites will be sent to this email address."
      >
        <FormInput
          control={form.control}
          disabled
          name="email"
          label="Email"
          type="email"
          aria-label="email"
        />

        {hasSecondaryEmail && (
          <FormInput
            control={form.control}
            name="secondaryEmail"
            label="Secondary Email"
            aria-label="secondary email"
            type="email"
          />
        )}

        {!hasSecondaryEmail ? (
          <Button
            onClick={addSecondaryEmail}
            type="button"
            className="mr-auto w-fit"
            variant="ghost"
            size="sm"
          >
            <Plus className="mr-2 size-4" />
            Add Another
          </Button>
        ) : (
          <Button
            onClick={removeSecondaryEmail}
            type="button"
            className="mr-auto w-fit"
            variant="destructive"
            size="sm"
            radius="sm"
          >
            <Trash2 className="mr-2 size-4" />
            Remove Secondary Email
          </Button>
        )}

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
          <Button type="submit" radius="sm" disabled={!form.formState.isDirty || isPending}>
            {isPending ? (
              <>
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

export default SecondaryEmailForm;
