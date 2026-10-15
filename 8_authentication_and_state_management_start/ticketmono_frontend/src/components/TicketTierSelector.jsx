import { useState } from "react"
import { useCart } from "../hooks/useCart"


export default function TicketTierSelector(
  { tier, eventId, eventName }
) {
  const [quantity, setQuantity] = useState(0)
  // we're going to update the cart here.
  const { updateCart } = useCart()

  const decrement = () => {
    // we use the old value and remove one.
    // we set it to the maxmimum between the val above
    // and zero so it's never negative.
    const newQuantity = Math.max(0, quantity - 1)
    setQuantity(newQuantity)
    // we're going to update the overall cart
    updateCart({
      eventId,
      eventName,
      tierId: tier.id,
      tierName: tier.name,
      tierPrice: tier.name,
      quantity: newQuantity
    })

  }

  const increment = () => {
    // we're assuming infinite tickets, but we'd
    // have to check this on the venue and event as well.
    const newQuantity = quantity + 1
    setQuantity(newQuantity)
    updateCart({
      eventId,
      eventName,
      tierId: tier.id,
      tierName: tier.name,
      tierPrice: tier.name,
      quantity: newQuantity
    })
  }

  return <div className="flex items-center justify-between p-4 bg-base-100 rounded-box shadow">
    <div>
      <p className="font-semibold">
        {tier.name}
      </p>
      <p className="text-sm text-base-content/60">
        ${tier.price}
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        className="btn btn-sm btn-outline"
        onClick={decrement}
      >-</button>
      <span
        className="w-6 text-center font-medium">
        {quantity}
      </span>
      <button
        className="btn btn-sm btn-outline"
        onClick={increment}
      >+</button>
    </div>
  </div>
}