import TripList from '../components/TripList'
import { TRIPS } from '../mockData'
import { useTrips } from '../hooks/useTrips'


function TripsPage() {
  const {
    trips,
    isLoading,
    isError,
    error
  } = useTrips()

  // guards for errors and loading.
  if (isLoading) {
    return <div>
      <h2 className="text-xl font-semibold mb-3">Trips</h2>
      <span className="loading loading-spinner loading-md"></span>
    </div>
  }

  if (isError) {
    return <div>
      <h2 className="text-xl font-semibold mb-3">Trips</h2>
      <div
        className="text-md"
      >
        An error has occurred.
        {error.toString()}
      </div>
    </div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Trips</h2>
      <TripList trips={trips} />
    </div>
  )
}

export default TripsPage
