import Guest from '@/components/common/header/Guest';
import React, { Suspense } from 'react';
import Footer from '@/components/common/FooterNonAuthenticated';
import LegalStrip from '@/components/common/LegalStrip';

const GuestLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Suspense>
      <Guest />
      {children}
      <Footer className="mt-24" />
      <LegalStrip authenticated={false} />
    </Suspense>
  );
};

export default GuestLayout;
