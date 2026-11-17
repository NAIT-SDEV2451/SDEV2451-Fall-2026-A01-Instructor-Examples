import apiClient from './client'

// DRF validation errors can be nested, for example:
// { "ticket_tiers": [{ "price": ["Ensure this value is greater than or equal to 0."] }] }
function firstErrorMessage(error) {
  if (typeof error === 'string') return error
  for (const value of Object.values(error ?? {})) {
    const message = firstErrorMessage(value)
    if (message) return message
  }
  return null
}

export async function fetchEvents() {
  const res = await apiClient('/events/')
  if (!res.ok) throw new Error('Failed to fetch events.')
  return res.json()
}

export async function fetchEvent(id) {
  const res = await apiClient(`/events/${id}/`)
  if (!res.ok) throw new Error('Failed to fetch event.')
  return res.json()
}

export async function fetchMyEvents() {
  const res = await apiClient('/events/mine/')
  if (!res.ok) throw new Error('Failed to fetch your events.')
  return res.json()
}

export async function createEvent(event) {
  const res = await apiClient('/events/', {
    method: 'POST',
    body: JSON.stringify(event),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(firstErrorMessage(error) ?? 'Failed to create event.')
  }
  return res.json()
}
