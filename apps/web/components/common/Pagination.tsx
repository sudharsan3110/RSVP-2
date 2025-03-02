import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import React from 'react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
};

const TablePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onChange,
  className = '',
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const showEllipsisStart = currentPage > 4;
    const showEllipsisEnd = currentPage < totalPages - 3;

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (showEllipsisStart) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Show pages around current page
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }

      if (showEllipsisEnd) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Pagination
      className={`flex flex-col items-center justify-between space-y-2 border-t px-6 py-4 sm:flex-row sm:space-y-0 ${className}`}
    >
      <PaginationPrevious
        onClick={() => currentPage > 1 && onChange(currentPage - 1)}
        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
      />
      <PaginationContent className="flex space-x-2">
        {getPageNumbers().map((pageNum, idx) =>
          pageNum === -1 ? (
            <PaginationEllipsis key={`ellipsis-${idx}`} />
          ) : (
            <PaginationLink
              key={pageNum}
              onClick={() => onChange(pageNum)}
              isActive={currentPage === pageNum}
              className={currentPage === pageNum ? 'pointer-events-none' : ''}
            >
              {pageNum}
            </PaginationLink>
          )
        )}
      </PaginationContent>
      <PaginationNext
        onClick={() => currentPage < totalPages && onChange(currentPage + 1)}
        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
      />
    </Pagination>
  );
};

export default TablePagination;
