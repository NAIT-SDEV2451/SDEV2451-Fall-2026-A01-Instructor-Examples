import { useParams } from 'react-router-dom'

import EventDetailsHeader from '../../components/EventDetailsHeader'
import TicketTierList from '../../components/TicketTierList'

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
  return (
    <div className="max-w-2xl mx-auto py-8">
      <EventDetailsHeader />
      <TicketTierList tiers={STATIC_TIERS} />
    </div>
  )
}

export default EventDetailPage
