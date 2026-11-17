import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCreateEvent } from '../../hooks/useCreateEvent'
import { useVenues } from '../../hooks/useVenues'

const EMPTY_TIER = { name: '', price: '' }

function CreateEventPage() {
  const navigate = useNavigate()
  const { data: venues, isLoading, isError } = useVenues()
  const { mutate, isPending, error } = useCreateEvent()

  const [name, setName] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [venueId, setVenueId] = useState('')
  const [tiers, setTiers] = useState([EMPTY_TIER])

  function updateTier(index, field, value) {
    setTiers(tiers.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier)))
  }

  function handleSubmit(e) {
    e.preventDefault()
    mutate(
      {
        name,
        // The input gives local time with no timezone. toISOString converts it
        // to UTC so the event is saved at the time the organizer actually chose.
        date_time: new Date(dateTime).toISOString(),
        venue_id: Number(venueId),
        ticket_tiers: tiers,
      },
      { onSuccess: () => navigate('/organizer/events') }
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center mt-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Failed to load your venues. Please try again later.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/organizer/events" className="btn btn-ghost btn-sm mb-4">
        Back to My Events
      </Link>
      <h1 className="text-2xl font-bold mb-6">Create Event</h1>

      {venues.length === 0 ? (
        <p className="text-base-content/60">You need a venue before you can create an event.</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="alert alert-error">
              <span>{error.message}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label" htmlFor="event-name">
              <span className="label-text">Event name</span>
            </label>
            <input
              id="event-name"
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="event-date-time">
              <span className="label-text">Date and time</span>
            </label>
            <input
              id="event-date-time"
              type="datetime-local"
              className="input input-bordered w-full"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label" htmlFor="event-venue">
              <span className="label-text">Venue</span>
            </label>
            <select
              id="event-venue"
              className="select select-bordered w-full"
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              required
            >
              <option value="">Choose a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>{venue.name}</option>
              ))}
            </select>
          </div>

          <h2 className="text-lg font-semibold mt-2">Ticket Tiers</h2>
          {tiers.map((tier, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                aria-label={`Tier ${index + 1} name`}
                placeholder="Tier name"
                className="input input-bordered flex-1"
                value={tier.name}
                onChange={(e) => updateTier(index, 'name', e.target.value)}
                required
              />
              <input
                type="number"
                aria-label={`Tier ${index + 1} price`}
                placeholder="Price"
                min="0"
                step="0.01"
                className="input input-bordered w-32"
                value={tier.price}
                onChange={(e) => updateTier(index, 'price', e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setTiers(tiers.filter((_, i) => i !== index))}
                disabled={tiers.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setTiers([...tiers, EMPTY_TIER])}
            >
              Add Tier
            </button>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={isPending}>
            {isPending ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      )}
    </div>
  )
}

export default CreateEventPage
