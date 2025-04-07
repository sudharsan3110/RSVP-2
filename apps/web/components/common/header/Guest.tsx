'use client';

import SigninDialog from '@/components/auth/SigninDialog';
import AutheticatedHeader from '@/components/common/header/AutheticatedHeader.tsx';
import useScroll from '@/hooks/useScroll';
import { Bars2Icon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '../../ui/button';
import Container from '../Container';
import Logo from '../Logo';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';

const Guest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScroll();
  const { loginedUser } = useLoggedInUser();

  if (loginedUser) return <AutheticatedHeader />;

  return (
    <>
      <nav
        className={`animate-slide-in-from-top sticky top-0 z-30 h-20 w-full py-5 ${isScrolled ? 'border-b bg-background' : ''}`}
      >
        <Container className="mx-auto flex justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <div className="hidden gap-14 md:flex">
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
