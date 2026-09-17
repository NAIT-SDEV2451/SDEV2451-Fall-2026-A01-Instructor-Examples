import { useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import { useDrivers } from '../hooks/useDrivers'
import { useVehicles } from '../hooks/useVehicles'


function CreateTripPage() {
  const navigate = useNavigate()

  const { drivers } = useDrivers()
  const { vehicles } = useVehicles()


  function handleSubmit(formData) {
    // In a real app: POST to /api/v1/trips/ then navigate
    console.log('New trip submitted:', formData)


    navigate('/trips')
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
