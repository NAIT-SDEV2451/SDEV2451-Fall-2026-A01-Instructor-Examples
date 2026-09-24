import { useParams } from "react-router-dom";
// let's get the first trip from the mockdata
import { TRIPS } from "../mockData";
import BackButton from "../components/BackButton";
import TripMap from "../components/TripMap";
import TripInfo from "../components/TripInfo";

import { useTripDetails } from "../hooks/useTripDetails";
import { startTrip } from "../api/fleet";

// we're going to use this on the badge.
// a note you could put this in a trip status component.
const STATUS_BADGE = {
  pending: "badge-ghost",
  in_progress: "badge-info",
  completed: "badge-success",
  failed: "badge-error",
}
const STATUS_LABEL = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  failed: "Failed",
}

export default function TripDetailPage() {
  // I want to get the id from the url.
  const { id } = useParams()

  const {
    trip, isLoading, isError, error, startTripMutation,
    completeTripMutation
  } = useTripDetails(id)

  const start = () => {
    startTripMutation.mutate()
  }


  // let's put a couple guards
  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (isError || !trip) {
    return <p className="text-error">
      error {error.toString()}
    </p>
  }

  return <>
    <div className="flex flex-col gap-6">
      <div>
        {/* back button */}
        <BackButton to={`/trips`} label="Back to Trips" />
        {/* Title */}
        <div class="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Trip #{trip.id}</h1>
          {/* Let's update our badge. */}
          <span className={`badge ${STATUS_BADGE[trip.status]}`}>
            {STATUS_LABEL[trip.status]}
          </span>

        </div>
      </div>
      <TripMap
        startLocation={trip.start_location}
        endLocation={trip.end_location}
      />
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-outline">Get Directions</button>
        {/* Let's handle some functionality where we should
        different buttons based on the status */}
        { trip.status == "pending"
          && <>
            {/* I don't want to be able to click it if its pending. */}
            <button
              className="btn btn-outline"
              onClick={start}
              disabled={startTripMutation.isPending}
            >Start Trip</button>
          </>
        }
        { trip.status == "in_progress"
          && <>
            {/* do it for complete trip. */}
            <button className="btn btn-outline">Complete Trip</button>
            <button className="btn btn-outline">Can't Be Delivered</button>
          </>
        }
      </div>
      <TripInfo trip={trip} />
    </div>
  </>
}