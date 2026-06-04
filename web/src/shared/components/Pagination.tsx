import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
}

const DOTS = '...';

const usePagination = ({
  totalPages,
  currentPage,
  siblingCount = 1,
}: {
  totalPages: number;
  currentPage: number;
  siblingCount?: number;
}) => {
  return React.useMemo(() => {
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + 1 + i
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    
    return [];
  }, [totalPages, currentPage, siblingCount]);
};

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
}) => {
  const paginationRange = usePagination({
    currentPage,
    totalPages,
    siblingCount,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-1.5', className)}>
      <IconButton
        icon={<ChevronLeft />}
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={onPrevious}
        aria-label="Previous page"
      />

      {paginationRange.map((pageNumber, idx) => {
        if (pageNumber === DOTS) {
          return (
            <div
              key={`dots-${idx}`}
              className="flex h-8 w-8 items-center justify-center text-slate-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        return (
          <Button
            key={pageNumber}
            variant={pageNumber === currentPage ? 'primary' : 'outline'}
            size="sm"
            className={cn('min-w-[32px] h-8 px-2 py-0', pageNumber === currentPage ? '' : 'text-slate-600')}
            onClick={() => onPageChange(pageNumber as number)}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </Button>
        );
      })}

      <IconButton
        icon={<ChevronRight />}
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={onNext}
        aria-label="Next page"
      />
    </div>
  );
};
