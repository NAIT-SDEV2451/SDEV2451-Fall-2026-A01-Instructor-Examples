// let's make our api function

import apiClient from './client'

// note that items is going to be a list of specific items.
export async function createOrder(items) {
  const response = await apiClient("/orders/", {
    method: "POST",
    body: JSON.stringify({ items }) // note: { items } is the same as { items: items }
  })
  if (!response.ok) {
    throw new Error("failed to create order")
  }
  return response.json()
}
