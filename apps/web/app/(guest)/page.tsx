'use client';

import Container from '@/components/common/Container';
import PopularSection from '@/components/home/PopularSection';
import { Button } from '@/components/ui/button';
import { useVerifySignin } from '@/lib/react-query/auth';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SigninDialog from '@/components/auth/SigninDialog.tsx';

function Home() {
  const searchParams = useSearchParams();
  const { mutate } = useVerifySignin();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      mutate({ token });
    }
  }, [mutate, searchParams]);

  return (
    <>
      <Container className="relative flex w-full flex-col items-center justify-center  bg-cover py-[7rem] xl:py-[9rem] min-h-screen text-white xl:my-auto">
        <h1 className="relative z-10 text-center text-4xl font-bold !leading-tight w-full md:text-5xl xl:text-6xl animate-fade-in">
          Dive into events starting here.
          <br className="hidden md:block" />
          <p className="text-gradient inline">Create, Share, </p>
          and Sell Tickets Easily.
        </h1>
        <SigninDialog variant={'signup'}>
          <Button
            variant={'gradient'}
            className="text-white relative z-10 h-auto cursor-pointer py-3 md:px-9 md:py-4 md:text-lg !mt-5 animate-fade-in hover:scale-105 transition-transform duration-300 ease-in-out"
            size={'lg'}
            onClick={() => router.push('/create-event')}
          >
            Host a Event
          </Button>
        </SigninDialog>
        <Image
          src="/images/hero-background-mobile.svg"
          loading="eager"
          width={500}
          height={500}
          priority
          alt="hero-background-mobile"
          className="absolute inset-0 z-0 !my-0 block h-full w-full object-cover sm:hidden"
        />
      </Container>
      <Image
        src="/images/hero-background-desktop.svg"
        loading="eager"
        width={1920}
        height={1080}
        priority
        alt="hero-background-desktop"
        className="absolute inset-0 z-0 hidden h-auto w-full object-cover opacity-70 sm:block"
      />
      <PopularSection />
    </>
  );
}

export default Home;
