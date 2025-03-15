import { PropsWithChildren, Suspense } from 'react';
import LoadingScreen from './LoadingScreen';

const SuspenseBoundary = ({ children }: PropsWithChildren) => {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
};

export default SuspenseBoundary;
