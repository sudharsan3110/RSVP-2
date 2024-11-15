'use client';

import Image from 'next/image';
import Logo from './Logo';
import { cn } from '@/lib/utils';
import Container from './Container';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';

const FooterNonAuthenticated = ({ className }: PropsWithClassName) => {
  return (
    <footer data-testid="footer" className={cn('footer', className)}>
      <div className="bg-black px-11 py-10 lg:py-20">
        <Container className="flex flex-col justify-between sm:flex-row">
          <div>
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
          </div>
          <div className="mt-16 flex flex-col gap-x-28 gap-y-9 md:flex-row lg:mt-auto">
            <div className="flex flex-col gap-y-4 text-sm font-medium">
              <SigninDialog variant="signin">
                <span>Sign In</span>
              </SigninDialog>
              <Link href="/release">Help</Link>
            </div>
            <div className="flex flex-col gap-y-4 text-sm font-medium">
              <Link href="/">RSVP</Link>
              <Link href="/about">About</Link>
              <Link href="https://github.com/TeamShiksha">Github</Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default FooterNonAuthenticated;
