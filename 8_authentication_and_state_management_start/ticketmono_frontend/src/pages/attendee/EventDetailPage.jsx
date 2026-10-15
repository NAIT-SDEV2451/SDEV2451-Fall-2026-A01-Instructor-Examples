import { useParams } from 'react-router-dom'

import EventDetailsHeader from '../../components/EventDetailsHeader'
import TicketTierList from '../../components/TicketTierList'

import { useEvent } from '../../hooks/useEvent'

const STATIC_TIERS = [
  {
    "id": 1,
    "price": "150.00",
    "name": "Floor"
  },
  {
    "id": 2,
    "price": "85.00",
    "name": "Lower Bowl"
  },
  {
    "id": 3,
    "price": "45.00",
    "name": "Upper Bowl"
  }
]


function EventDetailPage() {
  const { id } = useParams()

  // I want you folks to esentially use the hook
  const {
    data: event,
    isLoading,
    isError
  } = useEvent(id)
  // to update event details header with the
  // information from the hook

  // pass the ticket tiers in
  // handle error and loading states.
  if (isLoading) {
    return <div className="flex justify-center mt-12">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  }

  if (isError) {
    return <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="alert alert-error">
        <span>Failed to load event {id}. Please try again later.</span>
      </div>
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <EventDetailsHeader event={event}/>
      <TicketTierList tiers={event.ticket_tiers} />
    </div>
  )
}

export default EventDetailPage
