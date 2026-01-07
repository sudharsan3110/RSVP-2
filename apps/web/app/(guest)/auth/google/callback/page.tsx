'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useGoogleSignin } from '@/lib/react-query/auth';

export default function GoogleCallback() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const { mutate } = useGoogleSignin();

  useEffect(() => {
    if (!code) return;
    mutate({ code });
  }, [code, mutate]);

  return (
    <div className="flex justify-center items-center py-20">
      <LoaderCircle className="animate-spin w-10 h-10 text-muted-foreground" />
    </div>
  );
}
