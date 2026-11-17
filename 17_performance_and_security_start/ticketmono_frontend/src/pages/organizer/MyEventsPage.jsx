import { Link } from 'react-router-dom'
import { useMyEvents } from '../../hooks/useMyEvents'

function MyEventsPage() {
  const { data: events, isLoading, isError } = useMyEvents()

  if (isLoading) {
    return (
      <div className="flex justify-center mt-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Failed to load your events. Please try again later.</span>
        </div>
      </div>
    )
  }

  const totalTickets = events.reduce((sum, event) => sum + event.tickets_sold, 0)
  const totalRevenue = events.reduce((sum, event) => sum + parseFloat(event.revenue), 0)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link to="/organizer/events/new" className="btn btn-primary btn-sm">
          Create Event
        </Link>
      </div>

      <div className="stats shadow w-full mb-6 bg-base-100">
        <div className="stat">
          <div className="stat-title">Events</div>
          <div className="stat-value">{events.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Tickets Sold</div>
          <div className="stat-value">{totalTickets}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Revenue</div>
          <div className="stat-value">${totalRevenue.toFixed(2)}</div>
        </div>
      </div>

      {events.length === 0 ? (
        <p className="text-base-content/60">You haven't created any events yet.</p>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-box shadow">
          <table className="table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Tickets Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.name}</td>
                  <td>
                    {new Date(event.date_time).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td>{event.venue.name}</td>
                  <td>{event.tickets_sold}</td>
                  <td>${event.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default MyEventsPage
