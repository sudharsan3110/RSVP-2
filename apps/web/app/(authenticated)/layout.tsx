import Autheticated from '@/components/common/header/Autheticated';
import LegalStrip from '@/components/common/LegalStrip';
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
      <LegalStrip authenticated={true} />
    </div>
  );
};

export default AuthenticatedLayout;
