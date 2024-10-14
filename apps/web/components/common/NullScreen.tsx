'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Container from '@/components/common/Container';
import Link from 'next/link';

const NullScreen = () => {
  return (
    <Container className="flex grow flex-col items-center justify-center py-8">
      <Image
        priority
        className="pb-8"
        src="/images/null-screen-create-event.svg"
        width={200}
        height={200}
        alt="No events"
      />
      <h2 className="text-2xl font-semibold">No Events Planned</h2>
      <p className="text-center text-sm font-normal text-secondary">
        You have no upcoming events. Why not host one?
      </p>
      <Link href="/create-event" className="mt-6">
        <Button className="h-10 w-full rounded-lg bg-purple-600 px-4 text-base text-white">
          <Plus className="mr-2" size={20} />
          Create Event
        </Button>
      </Link>
    </Container>
  );
};

export default NullScreen;
