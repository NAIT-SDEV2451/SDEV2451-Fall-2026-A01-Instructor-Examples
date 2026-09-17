import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query'

import { fetchTrips, createTrip } from '../api/fleet'

// there's multiple ways to do this
// because we're going to make two hooks
// one for create one for fetching but
// you could do one if you wanted to.

export function useTrips() {
  const {
    data: trips = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['trips'],
    // the key that will be invalidated by useTrips
    queryFn: fetchTrips
  });
  return {
    trips,
    isLoading,
    isError,
    error,
  }
}

export function useCreateTrip() {
  // create/change data on the server
  // and we want our state to reflect
  // these changes on the frontend.

  // we get the queryClient
  const queryClient = useQueryClient()

  // make the mutation creating the data
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => { // if it's a 200ish status
      // we're going to invalidate the queryKey
      queryClient.invalidateQueries({
        queryKey: ['trips']
      })
    }
  })

}