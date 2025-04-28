'use client';

import Logo from './Logo';
import { cn } from '@/lib/utils';
import Container from './Container';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';
import { useCurrentUser } from '@/lib/react-query/auth';
const Footer = ({ className }: PropsWithClassName) => {
  const currentYear = new Date().getFullYear();
  const { data: loginedUser } = useCurrentUser();

  return (
    <footer
      data-testid="footer"
      className={cn('footer mt-auto pt-16 animate-slide-in-from-bottom text-white', className)}
    >
      <div className="bg-black py-8">
        <Container className="flex flex-col gap-8 justify-between sm:flex-row">
          <div>
            {!loginedUser && (
              <>
                <Logo className="mb-4 h-10 w-fit" />
                <div className="flex items-end space-x-2 align-middle">
                  <p className="font-semibold leading-none mb-4">
                    Powered by
                    <a href="https://team.shiksha" className="hover:underline underline-offset-4">
                      {' '}
                      Team.Shiksha
                    </a>
                  </p>
                </div>
              </>
            )}

            <p className="text-sm font-medium">
              © {currentYear}{' '}
              <Link href="https://team.shiksha/" target="_blank" className="hover:underline">
                Team Shiksha
              </Link>
              . All rights reserved.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-14 gap-y-8 md:gap-x-28">
            {!loginedUser && (
              <div className="flex flex-col gap-y-4 text-sm font-medium">
                <SigninDialog variant="signin">
                  <Link href="#" className="h-fit px-0 py-0">
                    Sign In
                  </Link>
                </SigninDialog>
                <Link target="_blank" href="https://help.rsvp.kim">
                  Help
                </Link>
                <Link href="/release">About</Link>
              </div>
            )}

            <div
              className={cn(
                'flex text-sm font-medium',
                !loginedUser ? 'flex-col gap-y-4' : 'flex-row gap-x-6'
              )}
            >
              <Link href="/release#changelog">Release</Link>
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
