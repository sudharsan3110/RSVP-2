import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '../ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Image from 'next/image';
import { Icons } from '../common/Icon';
import { useSignInMutation } from '@/lib/react-query/auth';

const formSchema = z.object({
  email: z.string().email(),
});

interface SigninDialogProps {
  children: React.ReactNode;
  variant: 'signin' | 'signup';
}

const SigninDialog: React.FC<SigninDialogProps> = ({ children, variant }) => {
  const [isEmailSent, setIsEmailSent] = useState<null | { email: string }>(null);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { mutate } = useSignInMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email') {
        setIsEmailValid(!formSchema.safeParse({ email: value.email }).success);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    mutate(values.email);
  }

  const title = variant === 'signin' ? 'Sign In to Your Account' : 'Sign Up for an Account';
  const description =
    variant === 'signin'
      ? 'Please provide the email so we can send the magic link'
      : 'Create an account to get started';

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => {
        setIsDialogOpen(!isDialogOpen);
        form.reset();
        setIsEmailSent(null);
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[92%] rounded-[12px]">
        {!isEmailSent && (
          <>
            <DialogHeader>
              <DialogTitle className="text-start text-2xl font-semibold">{title}</DialogTitle>
              <DialogDescription className="text-start text-sm font-medium">
                {description}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white" htmlFor="email">
                        Email Address
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="rounded-[6px] bg-[#262729]" id="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={isEmailValid}
                  type="submit"
                  name="send-magic-link"
                  // onClick={() =>
                  //   // setIsEmailSent({
                  //   //   email: form.getValues('email'),
                  //   // })
                  // }
                  className="mt-5 flex w-full items-center gap-2.5 px-4 py-[10px] text-sm font-medium text-white"
                >
                  <Icons.lock />
                  Send magic link
                </Button>
              </form>
            </Form>
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
            <p className="mt-3 text-center">{`We've just sent an email to you at ${isEmailSent.email}. Click to verify.`}</p>
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
