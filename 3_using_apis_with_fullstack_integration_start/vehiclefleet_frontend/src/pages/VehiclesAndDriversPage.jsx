import VehicleList from '../components/VehicleList'
import DriverList from '../components/DriverList'
import { VEHICLES, DRIVERS } from '../mockData'
// let's import our hook here which takes care of the request
// end to end with our state.
import { useVehicles } from '../hooks/useVehicles'

function VehiclesAndDriversPage() {
  // load the vehicles
  const {
    vehicles, // the data,
    isLoading: loadingVehicles, //obj destructuring techinque
  } = useVehicles()

  console.log("vehicles", vehicles)
  console.log("loadingVehicles", loadingVehicles)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Vehicles</h2>
        {/* Let's use a ternary to use the new fetching  */}
        { loadingVehicles
          ? <span className="loading loading-spinner loading-md"></span>
          : <VehicleList vehicles={vehicles} />
        }
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Drivers</h2>
        <DriverList drivers={DRIVERS} />
      </section>
    </div>
  )
}

export default VehiclesAndDriversPage
