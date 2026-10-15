import { createContext, useState } from "react";

export const CartContext = createContext(null)

export default function CartProvider({children}) {
  // a choice we're going to make here is we're
  // going to the items in an object where
  // we're going to have a key of event_id-tier_id
  // and the value will be all of the information.
  const [items, updateCartItems] = useState({})

  // this below is basically a simple "useReducer"
  // or "redux" implementation.
  function updateCart({
    eventId, eventName, tierId, tierName, tierPrice, quantity
  }) {

  }
  // what we're going to expose to the cart provider
  const value = {
    items,
    updateCart
  }

  return <CartContext.Provider value={value}>
    {children}
  </CartContext.Provider>

}