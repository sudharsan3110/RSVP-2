import Guest from '@/components/common/header/Guest';
import Footer from '@/components/common/Footer';
import React, { Suspense } from 'react';

const GuestLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <>
      <html>
        <body>
          <Suspense>
            <Guest />
            {children}
            <Footer className="mt-24" />
          </Suspense>
        </body>
      </html>
    </>
  );
};

export default GuestLayout;
