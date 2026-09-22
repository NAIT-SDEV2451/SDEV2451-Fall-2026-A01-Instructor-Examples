// import my trip card
import TripCard from "./TripCard";

export default function TripInfo({trip}) {
  const {
    vehicle_detail,
    driver_detail,
    start_location,
    end_location,
    start_time
  } = trip // remember is object destructuring

  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <TripCard
      label="Vehicle"
      title={vehicle_detail.license_plate}
      subtitle={`${vehicle_detail.make} ${vehicle_detail.model} ${vehicle_detail.year}`}
    />

  </div>


}