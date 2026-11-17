import { useQuery } from '@tanstack/react-query'
import { fetchMyEvents } from '../api/events'

export function useMyEvents() {
  return useQuery({
    queryKey: ['events', 'mine'],
    queryFn: fetchMyEvents,
  })
}
