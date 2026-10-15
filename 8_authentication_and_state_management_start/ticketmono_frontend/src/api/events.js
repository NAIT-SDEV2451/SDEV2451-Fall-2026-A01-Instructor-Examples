import apiClient from './client'

export async function fetchEvents() {
  const response = await apiClient('/events/')
  if (!response.ok) {
    throw new Error("Failed to fetch events")
  }
  return response.json()
}

// note we could make this a single func in the
// future but we're not right now.
export async function fetchEvent(id) {
  const response = await apiClient(`/events/${id}`)
  if (!response.ok) {
    throw new Error("Failed to fetch events")
  }
  return response.json()
}