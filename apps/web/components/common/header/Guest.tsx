'use client';

import SigninDialog from '@/components/auth/SigninDialog';
import AutheticatedHeader from '@/components/common/header/AutheticatedHeader.tsx';
import { useCurrentUser } from '@/lib/react-query/auth';
import useScroll from '@/hooks/useScroll';
import Link from 'next/link';
import { Button } from '../../ui/button';
import Container from '../Container';
import Logo from '../Logo';

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
