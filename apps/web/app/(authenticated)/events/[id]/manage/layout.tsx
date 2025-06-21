'use client';

import LoadingScreen from '@/components/common/LoadingScreen';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useGetEventById } from '@/lib/react-query/event';
import { Loader2 } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';

const CheckCohostLayout = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams();
  if (typeof id !== 'string') notFound();
  const { data: userData } = useCurrentUser();

  const { data, isLoading, isSuccess, status } = useGetEventById(id);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  if (status === 'error') return notFound();

  if (!isSuccess) return <div>Something went wrong</div>;

  const { event } = data;
  const isCoHost = event.checkCohostByUserName(userData?.userName);

  if (!isCoHost) return notFound();

  return <>{children}</>;
};

export default CheckCohostLayout;
