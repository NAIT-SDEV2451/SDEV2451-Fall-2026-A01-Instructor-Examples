import { useEffect } from 'react'
import TripList from '../components/TripList'
import StatCard from '../components/StatCard'
import AverageDistanceChart from '../components/AverageDistanceChart'
import TripsPagination from '../components/TripsPagination'
import { useTrips } from '../hooks/useTrips'
import { useStats } from '../hooks/useStats'
// let's import the usePagination hook
import { usePagination } from '../hooks/usePagination'


const STAT_CARDS = [
  { key: 'total_vehicles', label: 'Total Vehicles', color: 'bg-primary text-primary-content' },
  { key: 'total_drivers', label: 'Total Drivers', color: 'bg-secondary text-secondary-content' },
  { key: 'total_trips', label: 'Total Trips', color: 'bg-accent text-accent-content' },
  { key: 'avg_trip_distance', label: 'Average Trip Distance', color: 'bg-neutral text-neutral-content' },
]

function TripsPage() {

  const {page, setTotalCount } = usePagination()

  // pass the page into the hook.
  const { trips, isLoading } = useTrips(page)
  const { stats } = useStats()

  // check if the trips are loaded and put the total count
  useEffect(()=> {
    console.log(trips)
    if (!trips.count) {
      return
    }
    setTotalCount(trips.count)
  }, [trips])


  if (isLoading) {
    return <span className="loading loading-spinner loading-md" />
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, color }) => (
          <StatCard key={key} label={label} value={stats?.[key]} color={color} />
        ))}
      </div>

      {stats?.avg_distance_per_week?.length > 0 && (
        <AverageDistanceChart data={stats.avg_distance_per_week} />
      )}

      <div>
        <h2 className="text-xl font-semibold mb-3">Trips</h2>
        {/* It's really important to know that our results are now
        on the key of results. */}
        {isLoading
          ? <span className="loading loading-spinner loading-md" />
          : <TripList trips={trips.results} />
        }
        <TripsPagination />
      </div>
    </div>
  )
}

export default TripsPage
