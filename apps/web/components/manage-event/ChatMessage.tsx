import Image from 'next/image';
import { useMemo } from 'react';
import { userAvatarOptions } from '@/utils/constants';

interface ChatMessageProps {
  message: string;
  time: string;
  user: any;
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

const ChatMessage = ({ message, time, user }: ChatMessageProps) => {
  const profilePictureUrl = useMemo(() => {
    const profileUrl = userAvatarOptions.find((option) => option.id === user?.profileIcon);
    return profileUrl?.src ?? userAvatarOptions[0]?.src;
  }, [user?.profileIcon]);

  return (
    <div className="z-0 mb-4 flex w-full bg-dark-800 px-4 py-2 items-start gap-3 rounded-sm">
      <Image
        src={profilePictureUrl}
        alt="profile picture"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <div className="text-sm font-semibold text-white">{user.fullName}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div
          className="prose prose-invert text-white"
          dangerouslySetInnerHTML={{
            __html: message,
          }}
        />
      </div>
    </div>
  );
};

export default ChatMessage;
