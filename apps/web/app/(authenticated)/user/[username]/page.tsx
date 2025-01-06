import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Icons } from '@/components/common/Icon';
import Container from '@/components/common/Container';
import Link from 'next/link';

const userData = {
  userName: 'Pratiyush',
  facebook: 'https://www.facebook.com/pratiyush.kejriwal/',
  instagram: 'https://www.instagram.com/mein_pk_hoon_pk/',
  twitter: 'https://x.com/mein_pk',
  location: 'JP Nagar, 7th phase',
  joinedAt: 'Tuesday, August 13',
};

const page = () => {
  return (
    <Container className="container-main py-16">
      <section className="mx-auto my-1 w-full max-w-[31rem]">
        <Card className="border-none bg-transparent">
          <CardContent>
            <div className="flex items-center justify-start gap-4 sm:flex-col lg:flex-row">
              <div className="relative h-32 w-32">
                <Image
                  src="/images/user-avatar-curly-hair-beard.svg"
                  alt={'user-image'}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div className="mt-10 flex items-center justify-start gap-4">
                <Link href={userData.instagram} target="_blank">
                  <Icons.instagram className="cursor-pointer" />
                </Link>
                <Link href={userData.twitter} target="_blank">
                  <Icons.twitter className="cursor-pointer" />
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-2xl font-bold">{userData.userName}</h3>
              <p className="text-base text-secondary">
                We&apos;re excited to have you join our community of creators! To securely access
                your account, simply click the magic link below:
              </p>

              <div className="flex items-center justify-start gap-4 space-y-4">
                <Icons.calendar />
                <span>
                  <p className="text-sm text-secondary">Joined on</p>
                  <p className="text-base font-semibold">{userData.joinedAt}</p>
                </span>
              </div>

              <div className="flex items-center justify-start gap-4 space-y-4">
                <Icons.location />
                <span>
                  <p className="text-sm text-secondary">Location</p>
                  <p className="text-base font-semibold">{userData.location}</p>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
};

export default page;
