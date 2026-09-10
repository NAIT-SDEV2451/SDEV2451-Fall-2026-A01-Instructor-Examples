
export default function TripList({trips}) {

  return (
    <div className="overflow-x-auto">

      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>From</th>
            <th>To</th>
            <th>Start Time</th>
            <th>Distance (km)</th>
          </tr>
        </thead>
        <tbody>
          {/* first we're going to use static data to loop through */}
          {trips.map((trip)=> {
            // when you're returning something
            // you need to return a single node.
            return <tr key={trip.id}>
              <td>{trip.id}</td>
              {/* I need to go through and select the keys */}
              <td>{trip.vehicle_detail.make} {trip.vehicle_detail.model}</td>
              <td>{trip.driver_detail.name}</td>
              <td>{trip.start_location}</td>
              <td>{trip.end_location}</td>
              {/* we're going to convert the time to a date */}
              <td>{new Date(trip.start_time).toLocaleString()}</td>
              {/* we're using ?? below which is going to show when
              the condition is false.
              This is the opposite of && which only shows if it's true.
              */}
              <td>
                { trip.distance ?? ( // below will only show if trip.distance is false.
                  <span className="badge badge-warning badge-sm">
                    in progress
                  </span>
                )}
              </td>
            </tr>

          })}
        </tbody>
      </table>

    </div>
  )
}