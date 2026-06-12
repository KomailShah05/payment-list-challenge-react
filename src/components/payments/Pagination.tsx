import { memo } from "react";
import { I18N } from "../../constants";
import Button from "../ui/Button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

const Pagination = memo(({ page, totalPages, onPrevious, onNext }: PaginationProps) => (
  <div data-testid="pagination" className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
    <Button
      data-testid="prev-button"
      variant="ghost"
      onClick={onPrevious}
      disabled={page <= 1}
      aria-label={I18N.PREVIOUS_BUTTON}
      aria-disabled={page <= 1}
    >
      {I18N.PREVIOUS_BUTTON}
    </Button>

    <span
      data-testid="page-label"
      className="text-sm font-medium text-gray-700"
      aria-live="polite"
      aria-atomic="true"
    >
      {I18N.PAGE_LABEL} {page}
    </span>

    <Button
      data-testid="next-button"
      variant="ghost"
      onClick={onNext}
      disabled={page >= totalPages}
      aria-label={I18N.NEXT_BUTTON}
      aria-disabled={page >= totalPages}
    >
      {I18N.NEXT_BUTTON}
    </Button>
  </div>
));

export default Pagination;
