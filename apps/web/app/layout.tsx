import { NuqsAdapter } from 'nuqs/adapters/next/app';
import QueryProvider from '@/lib/react-query';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'rsvp | Create, Share and Sell Tickets Easily',
  description:
    'Unlock the power of effortless event planning and management with our intuitive RSVP service. Seamlessly collect attendee responses and track guest lists.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryProvider>
      <html lang="en" className="scroll-pt-[90px]">
        <head>
          {process.env.NEXT_PUBLIC_API_URL && (
            <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} crossOrigin="anonymous" />
          )}
          <link rel="dns-prefetch" href="https://s3.amazonaws.com" />
        </head>
        <body className={cn(plusJakartaSans.className, 'dark flex min-h-screen flex-col')}>
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster richColors />
        </body>
      </html>
    </QueryProvider>
  );
}
