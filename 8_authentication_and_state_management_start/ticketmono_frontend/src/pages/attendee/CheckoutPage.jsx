import { useCart } from "../../hooks/useCart"

function CheckoutPage() {
  const { items } = useCart()
  // let's convert the cart items to a list.
  const cartItems = Object.values(items)

  console.log("cartItems", cartItems)


  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      <p className="text-base-content/60">Your cart is empty.</p>
      <div>
        <div
          className="flex justify-between py-3 border-b border-base-300"
        >
          <div>
            <p className="font-semibold">EVENTNAME</p>
            <p className="text-sm text-base-content/60">
              TIERNAME x QUANTITY
            </p>
          </div>
          <p className="font-medium">
            ITEM PRICE
          </p>
        </div>

        <div className="flex justify-between pt-4 font-bold text-lg">
          <span>Total</span>
          <span>$TOTAL PRICE</span>
        </div>
      </div>

    </div>
  )
}

export default CheckoutPage
