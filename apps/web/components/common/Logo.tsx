import Image from 'next/image';
import { cn } from '@/lib/utils';

const Logo = ({
  className,
  betaBadgeClassName,
}: PropsWithClassName<{ betaBadgeClassName?: string }>) => {
  return (
    <div className="relative inline-block">
      <Image
        priority
        src="/images/logo.svg"
        width={108}
        height={40}
        className={className}
        alt="Logo"
      />
      <span
        className={cn(
          'absolute -top-1 -right-10 bg-blue-500 text-white text-[10px] border border-white font-bold px-1.5 py-0.5 rounded-full',
          betaBadgeClassName
        )}
      >
        BETA
      </span>
    </div>
  );
};

export default Logo;
