import React, { useRef, useEffect } from 'react';

const tags = [
  { text: 'Music Concert', color: 'purple' },
  { text: 'Exhibition', color: 'gray' },
  { text: 'Stand Up Show', color: 'pink' },
  { text: 'Theater', color: 'green' },
];
const colorClasses = {
  purple: 'bg-[#EDE9FF]',
  gray: 'bg-[#FFF5D7]',
  pink: 'bg-[#FFECEC]',
  green: 'bg-[#E4FFEA]',
};

const Tags = () => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current) {
        e.preventDefault();
        scrollContainerRef.current.scrollLeft += e.deltaY;
      }
    };

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, {
        passive: false,
      });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div
      ref={scrollContainerRef}
      className="scrollbar-hide flex overflow-x-auto pb-2 md:overflow-x-visible md:pb-0"
      role="list"
      aria-label="Tags"
    >
      <div className="flex flex-nowrap gap-3 md:flex-wrap md:justify-start">
        {tags.map((tag, index) => (
          <span
            key={index}
            className={`whitespace-nowrap rounded-[8px] px-3 py-1 text-xs font-medium text-black ${colorClasses[tag.color as keyof typeof colorClasses]}`}
          >
            {tag.text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Tags;
