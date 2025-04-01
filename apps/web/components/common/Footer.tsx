'use client';

import Logo from './Logo';
import { cn, helpCenterUrl } from '@/lib/utils';
import Container from './Container';
import Link from 'next/link';
import SigninDialog from '../auth/SigninDialog';
import { useLoggedInUser } from '@/hooks/useLoggedInUser';

const Footer = ({ className }: PropsWithClassName) => {
  const currentYear = new Date().getFullYear();
  const { loginedUser } = useLoggedInUser();

  return (
    <footer data-testid="footer" className={cn('footer mt-auto pt-16 animate-slide-in-from-bottom', className)}>
      <div className="bg-black py-8">
        <Container className="flex flex-col justify-between sm:flex-row text-secondary">
          <div>
            {!loginedUser && (
              <>
                <Logo className="mb-4 h-10 w-fit" />
                <div className="flex items-end space-x-2 align-middle">
                  <p className="font-semibold leading-none">
                    Powered by 
                    <a href="https://team.shiksha" className="hover:underline underline-offset-4">
                      {' '}Team.Shiksha
                    </a>
                  </p>
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
                  <Link href="#" className="text-secondary h-fit px-0 py-0">
                    Sign In
                  </Link>
                </SigninDialog>
                <Link href={helpCenterUrl}>
                  Help
                </Link>
                <Link href="/release">
                  About
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-y-4 text-sm font-medium"></div>
            <div
              className={cn(
                'flex text-sm font-medium',
                !loginedUser ? 'flex-col gap-y-4' : 'flex-row gap-x-6'
              )}
            >
              <Link href="/release#changelog">
                Release
              </Link>
              <Link href="/privacy-terms/#terms">
                Terms of Service
              </Link>
              <Link href="/privacy-terms">
                Privacy Policy
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
