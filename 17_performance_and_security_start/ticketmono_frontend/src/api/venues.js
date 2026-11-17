import apiClient from './client'

export async function fetchVenues() {
  const res = await apiClient('/venues/')
  if (!res.ok) throw new Error('Failed to fetch venues.')
  return res.json()
}
