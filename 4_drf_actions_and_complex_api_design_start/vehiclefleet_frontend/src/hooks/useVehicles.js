import { useQuery } from '@tanstack/react-query'
import { fetchVehicles } from '../api/fleet'



export function useVehicles(search = "") {
  console.log(search)
  const { data: vehicles = [], isLoading, isError, error } = useQuery({
    queryKey: ['vehicles', search],
    // we're going to change this to fetch the value
    queryFn: () => fetchVehicles({
      // on the left is the key to fetchVehicles
      // on the right is the actual value.
      search: search
    }),
  })
  return { vehicles, isLoading, isError, error }
}
