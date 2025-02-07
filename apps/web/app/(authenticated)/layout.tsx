import Autheticated from '@/components/common/header/Autheticated';
import Footer from '@/components/common/Footer';
import React from 'react';

const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <div className="flex min-h-dvh flex-col pb-12 md:pb-0">
      <Autheticated />
      {children}
      <Footer />
    </div>
  );
};

export default AuthenticatedLayout;
