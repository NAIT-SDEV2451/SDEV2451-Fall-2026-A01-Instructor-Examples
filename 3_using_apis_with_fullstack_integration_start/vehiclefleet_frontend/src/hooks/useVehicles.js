// the query for use vehicles.
// first we're going to import the useQuery from react query
import { useQuery } from '@tanstack/react-query'
// note the above is an async state management library
// it does not do the http requests.

// we need to import our requests
import { fetchVehicles } from '../api/fleet'

// let's create our hook
export function useVehicles() {
  const {
    data: vehicles = [], // obj destructuring to rename to vehicles
    isLoading, // be true when it's loading.
    isError, // boolean
    error // more information
  } = useQuery({
    queryKey: ['vehicles'],
    // the queryKey is really important because later on
    // when we create a vehicle we want to tell our
    // application to "refetch" the vehicles, this will be
    // done via the queryKey
    queryFn: fetchVehicles
    // the most important piece is the queryFn which
    // actually makes the request.
  })
  // returned from our hook
  return {
    vehicles,
    isLoading,
    isError,
    error
  }
}