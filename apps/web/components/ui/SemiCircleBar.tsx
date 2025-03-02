type Props = {
  score: number;
  total: number;
};

export default function SemiCircleBar({ score, total }: Props) {
  const percentage = (score / total) * 100;

  return (
    <div className="relative flex h-32 w-full justify-between p-1 sm:w-full">
      <svg className="h-full w-full" viewBox="0 0 100 50">
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M10 50 A40 40 0 0 1 90 50"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset={125.6 - (percentage / 100) * 125.6}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-2 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold sm:text-2xl">
          {score}/{total}
        </span>
      </div>
    </div>
  );
}
