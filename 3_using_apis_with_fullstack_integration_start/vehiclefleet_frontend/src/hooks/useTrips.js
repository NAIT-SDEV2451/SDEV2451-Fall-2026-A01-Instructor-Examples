import {
  useQuery
} from '@tanstack/react-query'

import { fetchTrips } from '../api/fleet'

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
    queryFn: fetchTrips
  });
  return {
    trips,
    isLoading,
    isError,
    error,
  }
}