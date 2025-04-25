'use client';

import LoadingScreen from '@/components/common/LoadingScreen';
import { useCurrentUser } from '@/lib/react-query/auth';
import { useGetEventById } from '@/lib/react-query/event';
import { notFound, useParams } from 'next/navigation';

const CheckCohostLayout = ({ children }: { children: React.ReactNode }) => {
    const { id } = useParams();
    if (typeof id !== 'string') notFound();
    const { data: userData } = useCurrentUser();

    const { data, isLoading, isSuccess, status } = useGetEventById(id);

    if (isLoading) return <LoadingScreen className="min-h-screen" />;

    if (status === 'error') return notFound();

    if (!isSuccess) return <div>Something went wrong</div>;

    const { event } = data;
    const isCoHost = event.checkCohostByUserName(userData?.userName);

    if (!isCoHost) return notFound();

    return (
        <>
            {children}
        </>
    );
};

export default CheckCohostLayout;
