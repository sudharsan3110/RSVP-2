import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Icons } from '../common/Icon';
import FormInput from '../common/form/FormInput';
import FormProvider from '../ui/form-provider';
import { useSignInMutation } from '@/lib/react-query/auth';

const signInFormSchema = z.object({
  email: z.string().email(),
});

export type SignInFormType = z.infer<typeof signInFormSchema>;
interface SigninDialogProps {
  children: React.ReactNode;
  variant: 'signin' | 'signup';
}

const SigninDialog: React.FC<SigninDialogProps> = ({ children, variant }) => {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { mutate } = useSignInMutation();

  const form = useForm<SignInFormType>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  async function onSubmit(values: SignInFormType) {
    mutate(values, {
      onSuccess: () => {
        setIsEmailSent(true);
      },
    });
  }

  const handleClose = (open: boolean) => {
    if (!open) setIsEmailSent(false);
  };

  const title = variant === 'signin' ? 'Sign In to Your Account' : 'Sign Up for an Account';
  const description =
    variant === 'signin'
      ? 'Please provide the email so we can send the magic link'
      : 'Create an account to get started';

  const email = form.getValues('email');

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>

        {!isEmailSent && (
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-2xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-start text-sm font-medium">
                {description}
              </DialogDescription>
            </DialogHeader>
            <FormProvider
              methods={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormInput control={form.control} name="email" />
              <Button
                type="submit"
                name="send-magic-link"
                className="mt-5 flex w-full items-center gap-2.5 px-4 py-[10px] text-sm font-medium text-white"
              >
                <Icons.lock />
                Send magic link
              </Button>
            </FormProvider>
          </>
        )}

        {isEmailSent && (
          <div className="flex flex-col items-center justify-center">
            <Image
              priority
              height={186}
              width={216}
              src={'/images/verify-email.svg'}
              alt="verify-email icon"
            />
            <p className="mt-6 text-3xl font-semibold">Check your email!</p>
            <p className="mt-3 text-center">{`We've just sent an email to you at ${email}. Click to verify.`}</p>
            <Button className="mt-10 w-full bg-primary px-4 py-[10px] font-semibold text-white">
              Click to resend
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SigninDialog;
