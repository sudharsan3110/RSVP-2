"use client";

import React from "react";
import Link from "next/link";
import {
  TicketIcon,
  CalendarDateRangeIcon,
  UserIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { Button } from "../../ui/button";
import Logo from "../Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Avatar, AvatarImage } from "../../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import Container from "../Container";
import { Icons } from "../Icon";
import useScroll from "@/hooks/useScroll";

const Autheticated = () => {
  const isScrolled = useScroll();

  return (
    <>
      <nav
        className={`sticky top-0 z-30 h-20 w-full py-5 ${isScrolled ? "border-b bg-background" : ""}`}
      >
        <Container className="mx-auto flex justify-between gap-8 lg:gap-12">
          <Logo />
          <div className="flex flex-1">
            <div className="hidden gap-3 md:flex">
              <Link href="/events">
                <Button className="text-md text-white" variant={"ghost"}>
                  <TicketIcon className="mr-2 h-5 w-5 text-white" />
                  Events
                </Button>
              </Link>
              <Link href="/planned">
                <Button className="text-md text-white" variant={"ghost"}>
                  <CalendarDateRangeIcon className="mr-2 h-5 w-5 text-white" />
                  Planned
                </Button>
              </Link>
              <Link href="/discover">
                <Button className="text-md text-white" variant={"ghost"}>
                  <Icons.discover />
                  Discover
                </Button>
              </Link>
            </div>
            <div className="ml-auto flex gap-6">
              <Button variant="default">Create Event</Button>
              <DropdownMenu>
                <DropdownMenuTrigger data-testid="profile-dropdown-button">
                  <Avatar>
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="profile image"
                    />
                    <AvatarFallback>P</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-[10px]"
                  align="end"
                  alignOffset={-5}
                  sideOffset={5}
                >
                  <DropdownMenuLabel className="text-base">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer rounded-xl">
                    <UserIcon className="mr-3 h-6 w-6" />
                    <span className="text-base">Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer rounded-xl">
                    <ArrowRightEndOnRectangleIcon className="mr-3 h-6 w-6 text-destructive" />
                    <span className="text-base text-destructive">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Container>
      </nav>

      <div className="fixed bottom-0 left-0 right-0 flex h-16 w-full origin-bottom transform items-center justify-between gap-3 bg-background px-4 md:hidden">
        <Link href="/events">
          <Button
            className="text-md group text-white hover:bg-primary active:bg-primary"
            variant={"ghost"}
          >
            <TicketIcon className="mr-2 h-5 w-5 text-white" />
            <span className="w-0 overflow-hidden group-hover:w-fit">
              Events
            </span>
          </Button>
        </Link>
        <Link href="/planned">
          <Button
            className="text-md group text-white hover:bg-primary active:bg-primary"
            variant={"ghost"}
          >
            <CalendarDateRangeIcon className="mr-2 h-5 w-5 text-white" />
            <span className="w-0 overflow-hidden group-hover:w-fit">
              Planned
            </span>
          </Button>
        </Link>
        <Link href="">
          <Button
            className="text-md group text-white hover:bg-primary active:bg-primary"
            variant={"ghost"}
          >
            <Icons.discover />
            <span className="w-0 overflow-hidden group-hover:w-fit">
              Discover
            </span>
          </Button>
        </Link>
      </div>
    </>
  );
};

export default Autheticated;
