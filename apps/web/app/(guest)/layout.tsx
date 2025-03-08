'use client';

import { Suspense } from 'react';
import Guest from '@/components/common/header/Guest';
import Footer from '@/components/common/Footer';

const GuestLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Suspense>
      <Guest />
      {children}
      <Footer className="w-full self-end" />
    </Suspense>
  );
};

export default GuestLayout;
