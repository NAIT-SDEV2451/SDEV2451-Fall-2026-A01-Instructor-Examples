import apiClient from './client'

export async function fetchEvents() {
  const response = await apiClient('/events/')
  if (!response.ok) {
    throw new Error("Failed to fetch events")
  }
  return response.json()
}