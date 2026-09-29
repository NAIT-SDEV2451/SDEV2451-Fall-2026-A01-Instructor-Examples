import { usePagination } from "../hooks/usePagination";

export default function TripsPagination() {
  const {
    page,
    totalCount,
    totalPages,

    goToNext,
    goToPrevious,
    hasNext,
    hasPrevious,
  } = usePagination()

  return <div className="flex items-center gap-3 mt-4">
    {/* we need to decrease the state of the page by one */}
    <button
      className="btn btn-sm btn-outline"
      disabled={!hasPrevious}
      onClick={goToPrevious}
    >
      Previous
    </button>
    <span>Page {page} of {totalPages} of ({totalCount}) results</span>
    {/* we need to increase the state of the page by one */}
    <button
      className="btn btn-sm btn-outline"
      disabled={!hasNext}
      onClick={goToNext}
    >
      Next
    </button>
  </div>
}