import { Link } from 'react-router-dom'

// this will be the card for a single event.
// take a look at the docs here! https://daisyui.com/components/card/?lang=en
export default function EventCard({ event }) {
  const date = new Date(event.date_time)

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  const formattedTIme = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })

  return <div className="card bg-base-100 shadow">
    <div className="card-body">
      <h2 className="card-title">{event.name}</h2>
      <p className="text-sm text-base-content/60">
        {formattedDate}, {formattedTIme}
        {/* June 14 2026, 7:00pm */}
      </p>
      <p className="text-sm">{event.venue.name}</p>
      <p className="text-sm text-base-content/60">
        {event.venue.address}
      </p>
      <div className="card-actions justify-end mt-2">
        {/* we're going to be getting the specific event by the id. */}
        <Link
          to={`/events/${event.id}`}
          className="btn btn-primary btn-sm"
        >
          Get Tickets
        </Link>
        {/*
        We change this to a link that we can navigate to.
        <button className="btn btn-primary btn-sm">
          Get Tickets
        </button> */}
      </div>
    </div>
  </div>
}