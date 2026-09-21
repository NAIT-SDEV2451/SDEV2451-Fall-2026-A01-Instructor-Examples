import VehicleList from '../components/VehicleList'
import DriverList from '../components/DriverList'
import { useVehicles } from '../hooks/useVehicles'
import { useDrivers } from '../hooks/useDrivers'

function VehiclesAndDriversPage() {
  const { vehicles, isLoading: loadingVehicles } = useVehicles()
  const { drivers, isLoading: loadingDrivers } = useDrivers()

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Vehicles</h2>
        <input
          type="text"
          placeholder="search by make model or plate"
          className="input input-bordered w-full max-w-sm mb-3"
        />

        {loadingVehicles
          ? <span className="loading loading-spinner loading-md" />
          : <VehicleList vehicles={vehicles} />
        }
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Drivers</h2>
        {loadingDrivers
          ? <span className="loading loading-spinner loading-md" />
          : <DriverList drivers={drivers} />
        }
      </section>
    </div>
  )
}

export default VehiclesAndDriversPage
