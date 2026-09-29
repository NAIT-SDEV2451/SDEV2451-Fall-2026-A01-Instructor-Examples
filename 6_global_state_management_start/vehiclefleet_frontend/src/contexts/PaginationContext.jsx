// we're going to make a context page controller.
import { createContext, useState } from "react";

// this is going to "hold and expose" the state that we provide
export const PaginationContext = createContext(null)

// we're going to create a "wrapper" which is going to host
// the state
export default function PaginationProvider({
  pageSize = 5, children // remember children is from react.
}) {
  // the state pages, totalPages.
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // the total count is going to be
  const totalPages = Math.ceil(totalCount / pageSize)

  // with our context
  // a note PaginationContext.Provider has changed to PaginationContext
  // in newer versions of react.
  // the value here is what we're going to pass to the
  // provider that exposes these item
  return <PaginationContext.Provider
    value={{
      // the values.
      page,
      totalCount,
      totalPages,
      setTotalCount,
      // we're going to create the callbacks to set the pages
      goToNext: (nextPage)=> {
        let safeNextPage = page+1

        // this will never go over the page and break
        setPage(safeNextPage)
      },
      goToPrevious: (lastPage)=> {
        let safeLastPage = page - 1
        // this will never go under the firstpage and break
        setPage(safeLastPage)
      }
    }}
  >
    {children}
  </PaginationContext.Provider>

}
