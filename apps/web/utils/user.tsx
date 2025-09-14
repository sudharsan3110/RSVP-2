import { SocialPlatform } from '@/types/user';
import { ReactElement } from 'react';
import { Icons } from '@/components/common/Icon';

export const getSocialLink = (type: SocialPlatform, handle: string): string => {
  const platforms: Record<SocialPlatform, string> = {
    PERSONAL_WEBSITE: `https://${handle}`,
    INSTAGRAM: `https://instagram.com/${handle}`,
    TWITTER: `https://x.com/${handle}`,
  };
  return platforms[type];
};

export const getIcon = (type: string): ReactElement | null => {
  const icons: Record<string, ReactElement> = {
    PERSONAL_WEBSITE: <Icons.globe className="cursor-pointer" />,
    INSTAGRAM: <Icons.instagram className="cursor-pointer" />,
    TWITTER: <Icons.twitter className="cursor-pointer" />,
  };
  return icons[type];
};
