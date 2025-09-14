'use client';

import React, { ReactElement, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';
import { Card, CardContent } from '@/components/ui/card';
import { Icons } from '@/components/common/Icon';
import Container from '@/components/common/Container';
import { useUserDetailsByUsername } from '@/lib/react-query/user';
import { userAvatarOptions } from '@/utils/constants';
import { SocialPlatform } from '@/types/user';
import { getIcon, getSocialLink } from '@/utils/user';

const Page = () => {
  const params = useParams();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const { data: userDetails } = useUserDetailsByUsername(username || '');

  const profilePictureUrl = useMemo(() => {
    const profileUrl = userAvatarOptions.find(
      (option) => option.id === userDetails?.data?.data.profileIcon
    );
    return profileUrl?.src ?? userAvatarOptions[0]?.src;
  }, [userDetails?.data?.data.profileIcon]);

  const date_string = userDetails?.data?.data.created_at;
  const date_object = dayjs(date_string);
  const formatted_date = date_object.format('dddd, MMMM DD');

  return (
    <Container className="container-main py-16">
      <section className="mx-auto my-1 w-full max-w-[31rem]">
        <Card className="border-none bg-transparent">
          <CardContent>
            <div className="flex items-end gap-4 flex-wrap">
              <div className="relative size-28 shrink-0">
                <Image
                  src={profilePictureUrl}
                  alt={'user-image'}
                  fill
                  className="rounded-full border-primary border-2 object-cover "
                />
              </div>
              <div className="flex items-center justify-start gap-6">
                {userDetails?.data?.data.socialLinks.map(
                  ({ handle, type }: { handle: string; type: SocialPlatform }) => (
                    <Link
                      href={getSocialLink(type, handle)}
                      target="_blank"
                      key={`${type}-${handle}`}
                    >
                      {getIcon(type)}
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <h3 className="text-2xl font-bold text-white">
                {userDetails?.data?.data.fullName || userDetails?.data?.data.username}
              </h3>
              {userDetails?.data?.data.bio && (
                <p className="text-base text-secondary">{userDetails?.data?.data.bio}</p>
              )}
            </div>
            <section className="mt-5 space-y-6">
              {formatted_date && (
                <div className="flex items-center gap-5">
                  <Icons.calendar className="shrink-0" />
                  <span>
                    <p className="text-sm text-secondary">Joined on</p>
                    <p className="text-base font-semibold text-white">{formatted_date}</p>
                  </span>
                </div>
              )}
              {userDetails?.data?.data?.location && (
                <div className="flex items-center gap-5">
                  <Icons.location className="shrink-0" />
                  <span>
                    <p className="text-sm text-secondary">Location</p>
                    <p className="text-base font-semibold text-white">
                      {userDetails?.data?.data.location}
                    </p>
                  </span>
                </div>
              )}
            </section>
          </CardContent>
        </Card>
      </section>
    </Container>
  );
};

export default Page;
