import { useParams, Link } from 'react-router-dom'

import EventDetailsHeader from '../../components/EventDetailsHeader'
import TicketTierList from '../../components/TicketTierList'

import { useEvent } from '../../hooks/useEvent'

import { useCart } from '../../hooks/useCart'

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

  // let's get the cart items
  const { items } = useCart()
  // if there are items let's checkout
  const hasItems = Object.keys(items).length > 0

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
      <EventDetailsHeader event={event} />
      <TicketTierList
        tiers={event.ticket_tiers}
        eventId={event.id}
        eventName={event.name}
      />
      {/* if it has items then we can checkout */}
      {hasItems && (
        <div className="mt-6">
          <Link to="/checkout"
            className="btn btn-primary w-full">
            Go to Checkout
          </Link>
        </div>
      )}
    </div>
  )
}

export default EventDetailPage
