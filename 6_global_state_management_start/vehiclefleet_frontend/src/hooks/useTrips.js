import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { fetchTrips, createTrip } from '../api/fleet'

// we need to change our hook to take in a page.
export function useTrips(page = 1) {

  const { data, isLoading, isError, error } = useQuery({
    // we need to change these so that we can use our
    // query param.
    queryKey: ['trips', page], // caching each page on the trips.
    queryFn: () => fetchTrips(page),
    // here we want our data to stay until the new data is loaded
    placeholderData: keepPreviousData
  })

  return {
    trips: data ?? [],
    isLoading,
    isError,
    error,
  }
}

export function useCreateTrip() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      // when we creat ea trip this actually invalidates all
      // pages of trips.
      queryClient.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
