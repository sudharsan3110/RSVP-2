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
      <Container className="relative flex w-full flex-col items-center justify-center bg-cover min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] text-white pb-16 md:pb-20">
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-center text-4xl font-bold !leading-tight w-full md:text-5xl xl:text-6xl animate-fade-in m-0">
            Dive into events starting here.
            <br className="hidden md:block" />
            <p className="text-gradient inline">Create, Share, </p>
            and Sell Tickets Easily.
          </h1>
          <Button
            variant={'gradient'}
            className="text-white h-auto cursor-pointer py-3 md:px-9 md:py-4 md:text-lg !mt-4 animate-fade-in hover:scale-105 transition-transform duration-300 ease-in-out"
            size={'lg'}
            onClick={() => router.push('/create-event')}
          >
            Host a Event
          </Button>
        </div>

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
        className="absolute inset-0 z-0 hidden h-auto w-full object-cover opacity-60 sm:block"
      />
      <PopularSection />
    </>
  );
}

export default Home;
