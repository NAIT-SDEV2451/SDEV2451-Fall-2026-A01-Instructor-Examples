// let's get the first trip from the mockdata
import { TRIPS } from "../mockData";
import BackButton from "../components/BackButton";
import TripMap from "../components/TripMap";
import TripInfo from "../components/TripInfo";
export default function TripDetailPage() {
  // let's select the one
  const trip = TRIPS[4] // in our mock data the endtime for the 4 is null
  // create a variable called in progress to see if the end time is null
  const isInProgress = trip.end_time === null

  return <>
    <div className="flex flex-col gap-6">
      <div>
        {/* back button */}
        <BackButton to={`/trips`} label="Back to Trips" />
        {/* Title */}
        <div class="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Trip #{trip.id}</h1>
          { isInProgress &&
            <span className="badge badge-info">In Progress</span>
          }
        </div>
      </div>
      <TripMap
        startLocation={trip.start_location}
        endLocation={trip.end_location}
      />
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-outline">Get Directions</button>
        <button className="btn btn-outline">Complete Trip</button>
        <button className="btn btn-outline">Can't Be Delivered</button>
      </div>
      <TripInfo trip={trip} />
    </div>
  </>
}