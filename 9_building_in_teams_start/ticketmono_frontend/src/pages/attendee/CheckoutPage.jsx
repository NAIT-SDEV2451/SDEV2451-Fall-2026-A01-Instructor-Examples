import { useCart } from '../../hooks/useCart'
import { useCreateOrder } from '../../hooks/useCreateOrder'

function CheckoutPage() {
  const { items, clearCart } = useCart()

  const { mutate, isPending, isSuccess } = useCreateOrder()

  // let's create the funciton that will handle the order placement
  const handlePlaceOrder = () => {
    // building the body
    const orderItems = cartItems.map((item)=> {
      return {
        event_id: item.eventId,
        ticket_tier_id: item.tierId,
        quantity: item.quantity,
      }
    })
    // let's post to the backend with our mutation
    mutate(orderItems, {
      // we could also move this into the useCreateOrder hook as well.
      onSuccess: () => {
        // clear cart
        clearCart()
      }
    })
  }

  const cartItems = Object.values(items)
  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.tierPrice),
    0
  )

  // let's display something on success
  if (isSuccess) {
    return <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <p className="text-base-content/60">Thank you for your order</p>
    </div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      {cartItems.length === 0 ? (
        <p className="text-base-content/60">Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={`${item.eventId}-${item.tierId}`}
              className="flex justify-between py-3 border-b border-base-300"
            >
              <div>
                <p className="font-semibold">{item.eventName}</p>
                <p className="text-sm text-base-content/60">
                  {item.tierName} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${(item.quantity * parseFloat(item.tierPrice)).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between pt-4 font-bold text-lg">
            <span>Total</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
          <div className="mt-6">
            <button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className="btn btn-primary w-full"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CheckoutPage
