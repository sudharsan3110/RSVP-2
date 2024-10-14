'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bars2Icon } from '@heroicons/react/24/solid';
import { Button } from '../../ui/button';
import Logo from '../Logo';
import Container from '../Container';
import useScroll from '@/hooks/useScroll';
import SigninDialog from '@/components/auth/SigninDialog';

const navItemsWithoutSignup = [
  { name: 'Find Events', href: '/search' },
  { name: 'Help Center', href: '/help' },
];

const Guest = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isScrolled = useScroll();

  return (
    <>
      <nav className={`fixed z-30 h-20 w-full py-5 ${isScrolled ? 'border-b bg-background' : ''}`}>
        <Container className="mx-auto flex justify-between">
          <Logo />
          <div className="hidden gap-14 md:flex">
            {navItemsWithoutSignup.map((item) => (
              <Link href={item.href} key={item.name}>
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
