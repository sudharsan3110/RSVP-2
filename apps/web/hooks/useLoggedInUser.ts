import { useCurrentUser } from '@/lib/react-query/auth';
import { useMemo } from 'react';

export function useLoggedInUser() {
  const { data, dataUpdatedAt } = useCurrentUser();

  const loginedUser = useMemo(() => {
    return data?.data;
  }, [dataUpdatedAt]);

  return { loginedUser };
}
