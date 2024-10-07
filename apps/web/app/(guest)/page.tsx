"use client";

import Container from "@/components/common/Container";
import PopularSection from "@/components/home/PopularSection";
import { Button } from "@/components/ui/button";
import { useVerifySignin } from "@/lib/react-query/auth";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

function Home() {
  const searchParams = useSearchParams();
  const { mutate } = useVerifySignin();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      mutate(token);
    }
  }, []);

  return (
    <>
      <Container className="relative flex w-full flex-col items-center justify-center space-y-10 bg-cover pb-20 pt-36 xl:pb-32 xl:pt-44">
        <h1 className="relative z-10 text-center text-3xl font-bold !leading-tight md:text-5xl xl:text-6xl">
          Dive into events starting here.
          <br className="hidden md:block" />
          <p className="text-gradient inline">Create, Share, </p>
          and Sell Tickets Easily.
        </h1>
        <Button
          variant={"gradient"}
          className="text-md relative z-10 h-auto py-3 md:px-9 md:py-4 md:text-lg"
          size={"lg"}
        >
          Host a Event
        </Button>
        <Image
          src="/images/hero-background-mobile.svg"
          loading="eager"
          width={375}
          height={375}
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
