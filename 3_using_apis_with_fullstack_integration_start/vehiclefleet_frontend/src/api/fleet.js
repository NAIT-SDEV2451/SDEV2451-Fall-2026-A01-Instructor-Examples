// we're going to define the base url.
// Note: this is normally a environment variables
// it's different on the frontend and the backend
const BASE_URL = `http://localhost:8000/api/v1`
// really be particular with how you do your slashes.

// create some async functions to
// fetch (get)
  // - vehicles
  // - drivers
  // - trips
// fetch (create/post)
  // a trip

// note this is just an export because we
// will have many.
export async function fetchVehicles() {
  // make the fetch request.
  const response = await fetch(`${BASE_URL}/vehicles/`)
  // this is handling the 400 case so that it
  // throws an error rather than be silent.
  if (!response.ok) {
    throw new Error('Failed to fetch vehicles')
  }
  // if it hits here it should be okay
  // parsing the data from the response.
  return response.json()
}

export async function fetchDrivers() {
  const response = await fetch(`${BASE_URL}/drivers/`)
  if (!response.ok) {
    throw new Error('Failed to fetch vehicles')
  }
  return response.json()
}

export async function fetchTrips() {
  const response = await fetch(`${BASE_URL}/trips/`)
  if (!response.ok) {
    throw new Error('Failed to fetch trips')
  }
  return response.json()
}

// data is an object.
export async function createTrip(data) {
  // create data on the server (post request)
  const response = await fetch(`${BASE_URL}/trips/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error('Failed create trip')
  }
  return response.json()
}