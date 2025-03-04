import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import Container from './Container';

const LoadingScreen = ({ className }: PropsWithClassName) => {
  return (
    <Container asChild>
      <Skeleton className={cn(className)} />
    </Container>
  );
};

export default LoadingScreen;
