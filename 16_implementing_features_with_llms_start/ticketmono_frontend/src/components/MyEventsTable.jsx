import { formatMoney } from '../utils/formatMoney'

function formatDate(dateTime) {
  return new Date(dateTime).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function MyEventsTable({ events }) {
  return (
    <div className="overflow-x-auto bg-base-100 shadow rounded-box">
      <table className="table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Date & Venue</th>
            <th>Status</th>
            <th>Sold</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id}>
              <td className="font-semibold">{event.name}</td>
              <td>
                <p>{formatDate(event.date_time)}</p>
                <p className="text-base-content/60">{event.venue.name}</p>
              </td>
              <td>
                {event.status === 'upcoming' ? (
                  <span className="badge badge-success">Upcoming</span>
                ) : (
                  <span className="badge badge-neutral">Past</span>
                )}
              </td>
              <td>{event.tickets_sold.toLocaleString('en-US')}</td>
              <td>{formatMoney(event.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MyEventsTable
