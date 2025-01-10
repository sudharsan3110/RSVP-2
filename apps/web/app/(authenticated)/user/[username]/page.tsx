'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/common/Icon';
import Container from '@/components/common/Container';
import { useUserDetailsByUsername } from '@/lib/react-query/user';

const Page = () => {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const { data: userDetails } = useUserDetailsByUsername(username || '');

  const date_string = userDetails?.data?.data.created_at;
  const date_object = dayjs(date_string);
  const formatted_date = date_object.format('dddd, MMMM DD');
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
                {userDetails?.data?.data.instagram && (
                  <Link href={userDetails?.data?.data.instagram} target="_blank">
                    <Icons.instagram className="cursor-pointer" />
                  </Link>
                )}

                {userDetails?.data?.data.twitter && (
                  <Link href={userDetails?.data?.data.twitter} target="_blank">
                    <Icons.twitter className="cursor-pointer" />
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <h3 className="text-2xl font-bold">{userDetails?.data?.data.username}</h3>
              <p className="text-base text-secondary">
                We&apos;re excited to have you join our community of creators! To securely access
                your account, simply click the magic link below:
              </p>
              {formatted_date && (
                <div className="flex items-center justify-start gap-4 space-y-4">
                  <Icons.calendar />
                  <span>
                    <p className="text-sm text-secondary">Joined on</p>
                    <p className="text-base font-semibold">{formatted_date}</p>
                  </span>
                </div>
              )}
              {userDetails?.data?.data?.location && (
                <div className="flex items-center justify-start gap-4 space-y-4">
                  <Icons.location />
                  <span>
                    <p className="text-sm text-secondary">Location</p>
                    <p className="text-base font-semibold">{userDetails?.data?.data.location}</p>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
};

export default Page;
