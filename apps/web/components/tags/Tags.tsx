import { eventCategoryColors } from '@/utils/constants';
import { X } from 'lucide-react'; // Importing Lucide Icons
import React, { useEffect, useRef } from 'react';

export type TagType = {
  selectedTag: string | null;
  setSelectedTag: (value: string) => void;
  tagList: { value: string; label: string }[];
};

const EventCategoryFilter = (props: TagType) => {
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
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const tagClickHandler = (tagText: string) => {
    props.setSelectedTag(tagText);
  };

  const clearSelectedTag = (e: React.MouseEvent) => {
    e.stopPropagation();
    props.setSelectedTag('');
  };

  return (
    <div className="relative w-full">
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex overflow-x-auto pb-2 md:overflow-x-visible md:pb-0"
        role="list"
        aria-label="Tags"
      >
        <div className="flex flex-nowrap gap-3 md:flex-wrap md:justify-start">
          {props.tagList.map((tag, index) => (
            <span
              key={index}
              onClick={() => tagClickHandler(tag.value)}
              className={`relative flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[8px] px-3 py-1 text-sm font-medium text-black transition-all duration-200 ${
                eventCategoryColors[
                  tag.label.toLocaleLowerCase() as keyof typeof eventCategoryColors
                ]
              } ${
                props.selectedTag === tag.value
                  ? 'scale-105 border-2 border-white bg-opacity-80 shadow-md'
                  : 'border border-transparent opacity-80 hover:opacity-100'
              }`}
            >
              {tag.label}
              {props.selectedTag === tag.value && (
                <button
                  onClick={clearSelectedTag}
                  className="absolute -right-2 -top-2 rounded-full bg-gray-700 p-1 text-white hover:bg-gray-900"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventCategoryFilter;
