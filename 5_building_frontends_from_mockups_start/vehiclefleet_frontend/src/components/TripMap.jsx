// make a placeholder so that we can add the map functionality.

export default function TripMap({ startLocation, endLocation }) {
  // this is going to show the path.
  return <div className="card bg-base-200 shadow-sm">
    <div className="card-body items-center justify-center min-h-48 text-base-content/40 text-sm">
      route map — {startLocation} → {endLocation}
    </div>
  </div>
}