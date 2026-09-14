// Import both components for vehicles and drivers
import VehicleList from "../components/VehicleList"
import DriverList from "../components/DriverList"
// import the mock data
import { VEHICLES, DRIVERS } from "../mockData"
// use "dat" knowledge of jsx to render the lists.


// name your components the same as the file.
export default function VehiclesAndDriversPage() {
  return <div className="flex flex-col gap-8">
    <section>
      <h2 className="text-xl font-semibold mb-3">
        Vehicles
      </h2>
      <VehicleList vehicles={VEHICLES} />
    </section>
    <section>
      <h2 className="text-xl font-semibold mb-3">
        Drivers
      </h2>
      <DriverList drivers={DRIVERS} />
    </section>
  </div>
}