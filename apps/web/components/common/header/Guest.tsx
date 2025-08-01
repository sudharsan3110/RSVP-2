'use client';

import SigninDialog from '@/components/auth/SigninDialog';
import AutheticatedHeader from '@/components/common/header/AutheticatedHeader.tsx';
import { useCurrentUser } from '@/lib/react-query/auth';
import useScroll from '@/hooks/useScroll';
import Link from 'next/link';
import { Button } from '../../ui/button';
import Container from '../Container';
import Logo from '../Logo';
import { Icons } from '../Icon'

const Guest = () => {
  const isScrolled = useScroll();
  const { data: loginedUser } = useCurrentUser();

  if (loginedUser) return <AutheticatedHeader />;

  return (
    <nav
      className={`animate-slide-in-from-top sticky top-0 z-30 h-20 w-full py-5 ${isScrolled ? 'border-b bg-background' : ''}`}
    >
      <Container className="mx-auto flex justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/discover">
          <Button
            className="text-md group text-gray-400 hover:bg-gray-700 hover:text-white"
            variant={'ghost'}
          >
            <Icons.discover className="mr-2 h-5 w-5 group-hover:text-white" />
            <span className="hidden md:inline">Discover</span>
          </Button>
        </Link>
        <SigninDialog variant="signin">
          <Button variant={'secondary'} className="text-md text-black">
            Get Started
          </Button>
        </SigninDialog>
      </Container>
    </nav>
  );
};

export default Guest;
