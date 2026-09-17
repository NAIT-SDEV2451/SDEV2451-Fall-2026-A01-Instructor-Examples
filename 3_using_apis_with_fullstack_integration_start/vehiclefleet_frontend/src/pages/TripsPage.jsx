import TripList from '../components/TripList'
import { TRIPS } from '../mockData'
import { useTrips } from '../hooks/useTrips'


function TripsPage() {
  const {
    trips,
    isLoading,
    isError
  } = useTrips()

  if (isLoading) {
    <div>
      <h2 className="text-xl font-semibold mb-3">Trips</h2>
      <span className="loading loading-spinner loading-md"></span>
    </div>
  }



  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">Trips</h2>
      <TripList trips={TRIPS} />
    </div>
  )
}

export default TripsPage
