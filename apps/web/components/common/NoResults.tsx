import { Search } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Container from './Container';
interface NoResultsProps {
  title: string;
  message: string;
  image?: string;
  altText?: string;
  className?: string;
  imgWidth?: number;
  imgHeight?: number;
  showBtn?: boolean;
  btnText?: string;
  btnLink?: string;
  btnIcon?: string;
}

const NoResults = ({
  title,
  message,
  image,
  altText = '',
  imgWidth,
  imgHeight,
  showBtn,
  className,
  btnText,
  btnLink,
  btnIcon,
}: NoResultsProps) => {
  return (
    <Container className={cn('flex flex-col items-center justify-center', className)}>
      <div className="mx-auto mb-5 w-fit">
        {image ? (
          <Image src={image} alt={altText} width={imgWidth} height={imgHeight} />
        ) : (
          <div className="rounded-lg border border-dark-500 p-3.5">
            <Search className="size-7" />
          </div>
        )}
      </div>
      <h2 className="mb-2 text-center text-xl font-semibold">{title}</h2>
      <p className="text-center font-medium text-tertiary">{message}</p>
      {showBtn && (
        <Link href={btnLink || ''} className="max-w-sm mx-auto mt-4 flex justify-center">
          <Button variant="default" className="max-w-sm w-full">
            {btnIcon && (
              <Image src={btnIcon} alt="add-icon" width={16.5} height={16.5} className="mr-2" />
            )}
            {btnText}
          </Button>
        </Link>
      )}
    </Container>
  );
};

export default NoResults;
