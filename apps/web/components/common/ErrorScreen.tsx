import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlertTriangleIcon } from 'lucide-react';
import Container from './Container';
import Link from 'next/link';

type PropsWithClassName = {
  className?: string;
};

type ErrorScreenProps = PropsWithClassName & {
  message?: string;
};

const ErrorScreen = ({ className, message }: ErrorScreenProps) => {
  return (
    <Container asChild>
      <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
        <div className="p-4 rounded-full bg-red-500">
          <AlertTriangleIcon className="h-10 w-10 text-white" />
        </div>
        <p className="text-center text-secondary">{message || 'An error occurred'}</p>
        <Link href="/">
          <Button
            variant="default"
            size="default"
            className="gap-2"
          >
            Let's go Back
          </Button>
          </Link>
      </div>
    </Container>
  );
};

export default ErrorScreen;