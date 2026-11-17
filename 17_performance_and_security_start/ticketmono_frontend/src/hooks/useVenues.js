import { useQuery } from '@tanstack/react-query'
import { fetchVenues } from '../api/venues'

export function useVenues() {
  return useQuery({
    queryKey: ['venues'],
    queryFn: fetchVenues,
  })
}
