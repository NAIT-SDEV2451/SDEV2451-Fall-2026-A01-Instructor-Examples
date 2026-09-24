// we're going to need our useQuery and useMutation
// and the queryClient because we're going to be
// invalidating data.
import {
  useQuery, useMutation, useQueryClient
} from "@tanstack/react-query"

import {
  fetchTripMap,
  completeTrip,
  startTrip,
} from '../api/fleet'

export function useTripDetails(id) {
  const queryClient = useQueryClient()

  // we're fetching the map.
  const {
    data: trip = [],
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['trip-map', id],
    queryFn: () => fetchTripMap(id),
    enabled: !!id // converting to a boolean.
  })

  // let's create our mutations
  const startTripMutation = useMutation({
    mutationFn: () => startTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trip-map', id]
      })
    }
  })

  const completeTripMutation = useMutation({
    mutationFn: () => completeTrip(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['trip-map', id]
      })
    }
  })

  return {
    trip, isLoading, isError, error, startTripMutation,
    completeTripMutation
  }
}