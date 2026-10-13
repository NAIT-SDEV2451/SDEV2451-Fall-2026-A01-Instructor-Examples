// this will be the card for a single event.

export default function EventCard() {
  return <div className="card bg-base-100 shadow">
    <div className="card-body">
      <h2 className="card-title">Summer Jazz Fest</h2>
      <p className="text-sm text-base-content/60">
        June 14 2026, 7:00pm</p>
      <p className="text-sm">Madison Square Garden</p>
      <p className="text-sm text-base-content/60">4 Pennsylvania Plaza, New York, NY 10001</p>
      <div className="card-actions justify-end mt-2">
        <button className="btn btn-primary btn-sm">Get Tickets</button>
      </div>
    </div>
  </div>
}