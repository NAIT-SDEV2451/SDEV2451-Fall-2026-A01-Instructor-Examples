import apiClient from './client'

export async function createOrder(items) {
  const res = await apiClient('/orders/', {
    method: 'POST',
    body: JSON.stringify({ items }),
  })
  if (!res.ok) throw new Error('Failed to create order.')
  return res.json()
}

// let's create the order that we got last class.
export async function fetchOrder(id) {
  const response = await apiClient(`/orders/${id}/`)
  if (!response.ok) {
    throw new Error("Failed to fetch order")
  }
  return response.json()
}
