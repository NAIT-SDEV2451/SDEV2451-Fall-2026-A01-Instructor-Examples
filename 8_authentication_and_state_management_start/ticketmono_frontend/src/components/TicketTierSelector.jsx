import { useState } from "react"

export default function TicketTierSelector(
  { tier }
) {
  const [quantity, setQuantity] = useState(0)

  const decrement = () => {
    setQuantity(
      // we use the old value and remove one.
      // we set it to the maxmimum between the val above
      // and zero so it's never negative.
      (q) => Math.max(0, q - 1)
    )
  }

  const increment = () => {
    // we're assuming infinite tickets, but we'd
    // have to check this on the venue and event as well.
    setQuantity(quantity + 1)
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