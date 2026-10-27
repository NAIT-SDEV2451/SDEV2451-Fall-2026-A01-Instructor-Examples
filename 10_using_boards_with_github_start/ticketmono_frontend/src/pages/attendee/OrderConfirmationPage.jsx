import { useParams } from 'react-router-dom'

import { useOrder } from '../../hooks/useOrder'

export default function OrderConfirmationPage() {
  const { id } = useParams()
  // use the hook that we just created!
  const {
    data: order,
    isLoading,
    isError
  } = useOrder(id) // pass in the id.

  // this is for students, this is a sample check to see what's going on with your
  // query, I'd use this to debug a lot.
  // if you do something with the order here before you handle
  // error, and loading states it'll give you an error on next launch
  // console.log("current state of query")
  // console.log("order", order)
  // console.log("isLoading", isLoading)
  // console.log("isError", isError)

  if (isLoading) {
    return <p className="text-center py-8">Loading your order...</p>
  }

  if (isError) {
    return <p className="text-center py-8">Failed to load order try again...</p>
  }

  return (<div className="max-w-2xl mx-auto px-4 py-8">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-base-content/60">Order #{order.id}</p>
    </div>

    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <h2 className="card-title text-lg mb-4">Your Tickets</h2>
        {order.tickets.map((ticket) => {
          return <div
            key={ticket.id}
            className="flex justify-between items-center py-3 border-b border-base-300 last:border-0"
          >
            <div>
              <p className="font-semibold">{ticket.tier.event_name}</p>
              <p className="text-sm text-base-content/60">
                {ticket.tier.name} x 1
              </p>
            </div>
          </div>
        })}
      </div>
    </div>
  </div>)
}
