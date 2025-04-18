import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface UseQueryParamsOptions {
  defaultValues?: Record<string, string | number | boolean | null>;
}

const useQueryParams = <T extends string = string>(options: UseQueryParamsOptions = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { defaultValues } = options;

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const urlParams = new URLSearchParams(searchParams.toString());

      if (value === undefined || value === null) {
        urlParams.delete(name);
      } else {
        urlParams.set(name, value);
      }

      return urlParams.toString();
    },
    [searchParams]
  );

  const set = useCallback(
    (key: T, value: string) => {
      router.push(`${pathname}?${createQueryString(key, value)}`);
    },
    [pathname, router, createQueryString]
  );

  const get = useCallback(
    (key: T, defaultValue?: string) => {
      const value = searchParams.get(key);
      return value !== null ? value : defaultValues?.[key] || defaultValue || null;
    },
    [searchParams, defaultValues]
  );

  const values = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  return { get, set, values };
};

export default useQueryParams;
