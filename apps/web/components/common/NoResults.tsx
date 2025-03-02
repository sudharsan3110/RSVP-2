import { Search } from 'lucide-react';

interface NoResultsProps {
  title: string;
  message: string;
}

const NoResults = ({ title, message }: NoResultsProps) => {
  return (
    <>
      <div className="mx-auto mb-5 w-fit rounded-lg border border-dark-500 p-3.5">
        <Search className="size-7" />
      </div>
      <h2 className="mb-2 text-center text-xl font-semibold">{title}</h2>
      <p className="text-center font-medium text-tertiary">{message}</p>
    </>
  );
};

export default NoResults;
