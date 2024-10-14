import { cn } from '@/lib/utils';
import Image from 'next/image';

const Logo = ({ className }: PropsWithClassName) => {
  return (
    <Image
      priority
      src="/images/logo.svg"
      width={200}
      height={40}
      className={cn('h-10 w-[108px]', className)}
      alt="Logo"
    />
  );
};

export default Logo;
