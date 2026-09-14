import TripForm from "../components/TripForm"
// let's import the mock data here.
import { VEHICLES, DRIVERS } from "../mockData"


export default function CreateTripPage() {
  // let's make a handler for the submission.
  const handleSubmit = (formData) => {
    console.log(formData)
  }

  return <div>
    <h2 className="text-xl font-semibold mb-4">
      Create a new Trip
    </h2>
    <TripForm
      onSubmit={handleSubmit}
      vehicles={VEHICLES}
      drivers={DRIVERS}
    />
    {/* passing a reference to the function. */}
  </div>
}