import { useState } from 'react'
import TripList from '../components/TripList'
import StatCard from '../components/StatCard'
import AverageDistanceChart from '../components/AverageDistanceChart'
import { useTrips } from '../hooks/useTrips'
import { useStats } from '../hooks/useStats'

const STAT_CARDS = [
  { key: 'total_vehicles', label: 'Total Vehicles', color: 'bg-primary text-primary-content' },
  { key: 'total_drivers', label: 'Total Drivers', color: 'bg-secondary text-secondary-content' },
  { key: 'total_trips', label: 'Total Trips', color: 'bg-accent text-accent-content' },
  { key: 'avg_trip_distance', label: 'Average Trip Distance', color: 'bg-neutral text-neutral-content' },
]

function TripsPage() {
  // set the page state
  const [page, setPage] = useState(1)
  // pass the page into the hook.
  const { trips, isLoading } = useTrips(page)
  const { stats } = useStats()

  if (isLoading) {
    return <span className="loading loading-spinner loading-md" />
  }

  // let's handle two corner cases
  // the last page.
  const hasNext = !!trips.next // converts to a boolean.
  // handle the first page.
  const hasPrevious = page > 1 // or !!trips.previous

  // let's get the number of pages
  const pageSize = 5
  const numPages = Math.ceil(trips.count/pageSize)

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
        {/* Let's add the pagination below here. the structure will be
        back button, number of pages, forward button.
        */}
        <div className="flex items-center gap-3 mt-4">
          {/* we need to decrease the state of the page by one */}
          <button
            className="btn btn-sm btn-outline"
            disabled={!hasPrevious}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {numPages}</span>
          {/* we need to increase the state of the page by one */}
          <button
            className="btn btn-sm btn-outline"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>

      </div>
    </div>
  )
}

export default TripsPage
