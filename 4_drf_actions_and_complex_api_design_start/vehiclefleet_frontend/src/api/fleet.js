const BASE_URL = 'http://localhost:8000/api/v1'

export async function fetchVehicles({search}) {
  let url = `${BASE_URL}/vehicles/`
  if (search) {
    url = `${url}?search=${encodeURIComponent(search)}`
  }
  console.log(search)
  console.log(url)
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch vehicles')
  return response.json()
}

export async function fetchDrivers() {
  const response = await fetch(`${BASE_URL}/drivers/`)
  if (!response.ok) throw new Error('Failed to fetch drivers')
  return response.json()
}

export async function fetchTrips() {
  const response = await fetch(`${BASE_URL}/trips/`)
  if (!response.ok) throw new Error('Failed to fetch trips')
  return response.json()
}

export async function createTrip(data) {
  const response = await fetch(`${BASE_URL}/trips/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create trip')
  return response.json()
}
