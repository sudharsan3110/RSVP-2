import { userAvatarOptions } from '@/utils/constants';
import Image from 'next/image';
import { useMemo } from 'react';

interface ChatMessageProps {
  message: string;
  time: string;
  user: any;
}

const stripHtml = (html: string) => {
  return html.replace(/<[^>]*>/g, '');
};

const ChatMessage = ({ message, time, user }: ChatMessageProps) => {
  const cleanMessage = stripHtml(message);
  const profilePictureUrl = useMemo(() => {
    const profileUrl = userAvatarOptions.find((option) => option.id === user?.profileIcon);
    return profileUrl?.src ?? userAvatarOptions[0]?.src!;
  }, [user?.profileIcon]);

  return (
    <div className="z-0 mb-4 flex w-full items-start gap-3">
      <Image
        src={profilePictureUrl}
        alt="profile picture"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <div className="text-sm font-semibold text-white">{user.full_name}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
        <div className="bg-dark-900 p-4 text-sm text-gray-400">{cleanMessage}</div>
      </div>
    </div>
  );
};

export default ChatMessage;
