import { useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import { useDrivers } from '../hooks/useDrivers'
import { useVehicles } from '../hooks/useVehicles'

// import my useCreateTrip mutation hook.
import { useCreateTrip } from '../hooks/useTrips'

function CreateTripPage() {
  const navigate = useNavigate()

  const { drivers } = useDrivers()
  const { vehicles } = useVehicles()

  const {
    mutate: createTripMutation, // will execute the mutation function
    // you need to call this with the data.
    isPending
  } = useCreateTrip()

  function handleSubmit(formData) {
    // In a real app: POST to /api/v1/trips/ then navigate
    console.log('New trip submitted:', formData)
    createTripMutation(formData, {
      onSuccess: () => {
        navigate('/trips')
      }
    })
  }

  if (isPending) {
    return <div>
      <h2 className="text-xl font-semibold mb-4">Create a New Trip</h2>
      <span className="loading loading-spinner loading-md"></span>
    </div>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Create a New Trip</h2>
      <TripForm
        vehicles={vehicles}
        drivers={drivers}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default CreateTripPage
