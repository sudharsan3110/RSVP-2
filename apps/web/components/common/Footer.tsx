'use client';

import Image from 'next/image';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import Container from './Container';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';
import { Button } from '../ui/button';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';

const Footer = ({ className }: PropsWithClassName) => {
  const currentYear = new Date().getFullYear();

  const { loginedUser } = useLoggedInUser();

  return (
    <footer data-testid="footer" className={cn('footer mt-auto pt-16', className)}>
      <div className="bg-black px-11 py-8">
        <Container className="flex flex-col justify-between sm:flex-row">
          <div>
            {!loginedUser && (
              <>
                <Logo className="mb-4 h-10 w-fit" />
                <div className="flex items-end space-x-2">
                  <p className="font-semibold leading-none">
                    Powered By
                    <a href="https://team.shiksha" className="hover:underline">
                      {' '}
                      Team.Shiksha
                    </a>
                  </p>
                  <Image
                    priority
                    src="/images/team-shiksha-logo.svg"
                    width={50}
                    height={50}
                    className="h-5"
                    alt="Team.Shiksha Logo"
                    data-testid="team-shiksha-logo"
                  />
                </div>
              </>
            )}

            <p className="mt-4 text-sm text-secondary">
              © {currentYear} Team Shiksha. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-x-28 gap-y-9 md:flex-row lg:mt-auto">
            {!loginedUser && (
              <div className="flex flex-col gap-y-4 text-sm font-medium">
                <SigninDialog variant="signin">
                  <Button variant="link" className="h-fit px-0 py-0 hover:underline">
                    Sign In
                  </Button>
                </SigninDialog>
                <Link href="/release">Help</Link>
                <Link href="/release">About</Link>
              </div>
            )}

            <div className="flex flex-col gap-y-4 text-sm font-medium"></div>
            <div
              className={cn(
                'flex text-sm font-medium',
                !loginedUser ? 'flex-col gap-y-4' : 'flex-row gap-x-6'
              )}
            >
              <Link href="/">RSVP</Link>
              <Link href="/privacy-terms/#terms">Terms of Service</Link>
              <Link href="/privacy-terms">Privacy Policy</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
