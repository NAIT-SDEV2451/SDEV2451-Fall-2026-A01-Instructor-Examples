import { useState } from 'react'
import { useCart } from '../hooks/useCart'

function TicketTierSelector({ tier, eventId, eventName }) {
  // const [quantity, setQuantity] = useState(0)
  // we're going to update the cart here.
  const { items, updateCart } = useCart()
  // there's a bug here can you spot it?
  // the bug is that if we go back to this page it'll
  // set the state to zero.
  // this just uses the global store.
  let key = `${eventId}-${tier.id}`
  let globalStoredItem = items[key]
  let quantity = 0;
  if (globalStoredItem) {
    quantity = globalStoredItem.quantity
  }

  function decrement() {
    const newQty = Math.max(0, quantity - 1)
    // setQuantity(newQty)
    updateCart({ eventId, eventName, tierId: tier.id, tierName: tier.name, tierPrice: tier.price, quantity: newQty })
  }

  function increment() {
    const newQty = quantity + 1
    // setQuantity(newQty)
    updateCart({ eventId, eventName, tierId: tier.id, tierName: tier.name, tierPrice: tier.price, quantity: newQty })
  }

  return (
    <div className="flex items-center justify-between p-4 bg-base-100 rounded-box shadow">
      <div>
        <p className="font-semibold">{tier.name}</p>
        <p className="text-sm text-base-content/60">${tier.price}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="btn btn-sm btn-outline" onClick={decrement}>−</button>
        <span className="w-6 text-center font-medium">{quantity}</span>
        <button className="btn btn-sm btn-outline" onClick={increment}>+</button>
      </div>
    </div>
  )
}

export default TicketTierSelector
