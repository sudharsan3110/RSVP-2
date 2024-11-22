import React from 'react';
import { ArrowUp } from 'lucide-react';

export default function SemiCircleBar() {
  const score = 80;
  const total = 100;
  const percentage = (score / total) * 100;

  return (
    <div className="relative flex h-32 w-full p-1 sm:w-full">
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
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold sm:text-4xl">
          {score}/{total}
        </span>
      </div>

      <div className="absolute right-0 top-0 mr-2 mt-2 flex items-center text-green-500">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_1764_1995)">
            <path
              d="M18.3334 5.83301L11.7762 12.3902C11.4462 12.7202 11.2812 12.8852 11.0909 12.947C10.9236 13.0014 10.7433 13.0014 10.5759 12.947C10.3856 12.8852 10.2206 12.7202 9.8906 12.3902L7.60956 10.1091C7.27954 9.77914 7.11454 9.61413 6.92426 9.5523C6.75689 9.49792 6.5766 9.49792 6.40923 9.5523C6.21896 9.61413 6.05395 9.77914 5.72394 10.1091L1.66675 14.1663M18.3334 5.83301H12.5001M18.3334 5.83301V11.6663"
              stroke="#17B26A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <defs>
            <clipPath id="clip0_1764_1995">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
        <span className="ml-2 text-xs font-medium sm:text-sm md:text-base lg:text-lg">10%</span>
      </div>
    </div>
  );
}
