'use client';

import SigninDialog from '@/components/auth/SigninDialog';
import Autheticated from '@/components/common/header/Autheticated';
import useScroll from '@/hooks/useScroll';
import { Bars2Icon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../../ui/button';
import Container from '../Container';
import Logo from '../Logo';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';

const navItemsWithoutSignup = [
  { name: 'Find Events', href: '/discover', target: false },
  { name: 'Help Center', href: 'http://help.rsvp.kim', target: true },
];

const Guest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScroll();
  const { loginedUser } = useLoggedInUser();

  if (loginedUser) return <Autheticated />;

  return (
    <>
      <nav
        className={`sticky top-0 z-30 h-20 w-full py-5 ${isScrolled ? 'border-b bg-background' : ''}`}
      >
        <Container className="mx-auto flex justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="hidden gap-14 md:flex">
            {navItemsWithoutSignup.map((item) => (
              <Link href={item.href} key={item.name} target={item.target ? '_blank' : ''}>
                <Button className="text-md text-white" variant={'link'}>
                  {item.name}
                </Button>
              </Link>
            ))}

            <div className="space-x-3">
              <SigninDialog variant="signin">
                <Button variant={'outline'} className="text-md border-[#AC6AFF]">
                  Sign In
                </Button>
              </SigninDialog>
              <SigninDialog variant="signup">
                <Button variant={'secondary'} className="text-md text-black">
                  Sign up
                </Button>
              </SigninDialog>
            </div>
          </div>

          <div className="flex md:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-md"
              aria-label="hamburger-button"
            >
              <Bars2Icon className="text-white" />
            </Button>

            {isOpen && (
              <div className="absolute right-0 top-16 w-[224px] bg-[#151516] shadow-lg md:hidden">
                <div className="relative z-30 flex flex-col items-center gap-4 py-5">
                  {navItemsWithoutSignup.map((item) => (
                    <Link href={item.href} key={item.name}>
                      <Button
                        className="text-md text-white"
                        variant={'link'}
                        data-testid={`${item.name} hamburgerIcon`}
                      >
                        {item.name}
                      </Button>
                    </Link>
                  ))}

                  <SigninDialog variant="signin">
                    <Button
                      variant={'outline'}
                      className="text-md"
                      data-testid={`Sign In hamburgerIcon`}
                    >
                      Sign In
                    </Button>
                  </SigninDialog>
                  <SigninDialog variant="signup">
                    <Button
                      variant={'secondary'}
                      className="text-md text-black"
                      data-testid={`Sign up hamburgerIcon`}
                    >
                      Sign up
                    </Button>
                  </SigninDialog>
                </div>
              </div>
            )}
          </div>
        </Container>
      </nav>
    </>
  );
};

export default Guest;
