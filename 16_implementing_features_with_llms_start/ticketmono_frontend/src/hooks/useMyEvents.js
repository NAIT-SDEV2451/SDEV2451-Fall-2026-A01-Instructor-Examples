import { useQuery } from '@tanstack/react-query'
import { fetchMyEvents } from '../api/events'
import { useAuth } from './useAuth'

export function useMyEvents() {
  const { user } = useAuth()

  return useQuery({
    // The query cache survives logout. Including the user id stops the next
    // organizer who logs in from seeing the previous organizer's sales.
    queryKey: ['my-events', user?.id],
    queryFn: fetchMyEvents,
  })
}
