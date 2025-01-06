import Image from 'next/image';
import { userAvatarOptions } from '@/utils/constants';

type AvatarGroupProps = Readonly<{
  additionalCount?: number;
  limit?: number;
}>;

export default function AvatarGroup({ additionalCount = 0, limit = 4 }: AvatarGroupProps) {
  const avatarsToShow = userAvatarOptions.slice(0, limit);

  return (
    <div className="flex -space-x-1">
      {avatarsToShow.map((avatar, index) => (
        <Image
          key={index}
          className="rounded-full ring-2 ring-white"
          src={avatar.src}
          width={24}
          height={24}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      {additionalCount > 0 && (
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-slate-100 px-1.5 text-xs font-semibold text-dark-800 ring-2 ring-white">
          +{additionalCount}
        </span>
      )}
    </div>
  );
}
