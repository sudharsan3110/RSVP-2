'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSignInMutation } from '@/lib/react-query/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Icons } from '../common/Icon';
import FormInput from '../common/form/FormInput';
import { Button } from '../ui/button';
import FormProvider from '../ui/form-provider';
import { LoaderCircle } from 'lucide-react';
import { disposableEmailValidator } from '@/lib/zod/disposible-mail';
import { Separator } from '../ui/separator';
import { useGoogleOAuth } from '../../lib/react-query/auth';

const signInFormSchema = z.object({
  email: disposableEmailValidator,
});

export type SignInFormType = z.infer<typeof signInFormSchema>;

interface SigninDialogProps {
  children: React.ReactNode;
  variant: 'signin' | 'signup';
}

const SigninDialog: React.FC<SigninDialogProps> = ({ children, variant }) => {
  const { mutate, isPending } = useSignInMutation();
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<SignInFormType>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
  });

  const email = form.getValues('email');

  const startCountdown = () => {
    setIsResendDisabled(true);
    setCountdown(120);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (isEmailSent) {
      startCountdown();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isEmailSent]);

  async function onSubmit(values: SignInFormType) {
    window.localStorage.setItem('redirect', window.location.pathname);
    mutate(values, {
      onSuccess: () => {
        setIsEmailSent(true);
      },
    });
  }

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsEmailSent(false);
      form.reset();
      setCountdown(120);
      setIsResendDisabled(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleResend = () => {
    if (!isResendDisabled) {
      mutate(
        { email },
        {
          onSuccess: () => {
            setIsEmailSent(true);
            startCountdown();
          },
        }
      );
    }
  };

  const { loginWithGoogle } = useGoogleOAuth();

  const title = variant === 'signin' ? 'Sign In to Your Account' : 'Sign Up for an Account';
  const description =
    variant === 'signin'
      ? 'Please provide the email so we can send the magic link'
      : 'Create an account to get started';

  return (
    <Dialog onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {!isEmailSent && (
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-2xl font-semibold">{title}</DialogTitle>
            </DialogHeader>

            <Button
              variant="secondary"
              onClick={loginWithGoogle}
              className="gap-3"
              aria-label="Sign in with Google OAuth"
            >
              <Icons.google className="w-5 h-5" />
              <span className="text-sm font-medium">Continue with Google</span>
            </Button>

            <div className="flex items-center gap-4 my-2">
              <Separator className="flex-1" />
              <span className="text-sm whitespace-nowrap">or</span>
              <Separator className="flex-1" />
            </div>

            <DialogDescription className="text-start text-sm font-medium">
              {description}
            </DialogDescription>

            <FormProvider
              methods={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              <FormInput control={form.control} name="email" aria-label="email" />
              <Button
                type="submit"
                name="send-magic-link"
                className="mt-5 flex w-full items-center gap-2.5 px-4 py-[10px] text-sm font-medium text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Icons.lock />
                    Send magic link
                  </>
                )}
              </Button>
            </FormProvider>
          </>
        )}

        {isEmailSent && (
          <div className="flex flex-col items-center justify-center">
            <Image
              priority
              height={188}
              width={219}
              src={'/images/verify-email.svg'}
              alt="verify-email icon"
            />
            <p className="mt-6 text-3xl font-semibold">Check your email!</p>
            <p className="mt-3 text-center">{`We've just sent an email to you at ${email}. Click to verify. The verification link will expire in 10 minutes.`}</p>
            <Button
              className="mt-10 w-full bg-primary px-4 py-[10px] font-semibold text-white"
              disabled={isResendDisabled}
              data-testid="resend-btn"
              onClick={handleResend}
            >
              {isResendDisabled
                ? `Resend in ${Math.floor(countdown / 60)}:${(countdown % 60)
                    .toString()
                    .padStart(2, '0')}`
                : 'Click to resend'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SigninDialog;
