// we're goign to use the context here.
import { useContext } from "react";
import { PaginationContext } from "../contexts/PaginationContext";

export function usePagination() {
  const context = useContext(PaginationContext)
  // make a minor check.
  if (!context) {
    throw new Error('usePagination needs to be inside a PaginationProvider')
  }
  // values exposed from our context
  const {
    page,
    totalCount,
    totalPages,
    setTotalCount,
    goToNext,
    goToPrevious
  } = context

  return {
    page,
    totalCount,
    totalPages,
    setTotalCount,
    goToNext,
    goToPrevious,
    // let's make a hasNext and hasPrevious
    hasNext: page <totalPages,
    hasPrevious: page > 1,
  }
}