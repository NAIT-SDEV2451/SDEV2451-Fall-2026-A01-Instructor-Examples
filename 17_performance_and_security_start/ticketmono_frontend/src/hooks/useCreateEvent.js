import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEvent } from '../api/events'

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEvent,
    // Every event query key starts with 'events', so this refreshes
    // both the attendee list and My Events.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
