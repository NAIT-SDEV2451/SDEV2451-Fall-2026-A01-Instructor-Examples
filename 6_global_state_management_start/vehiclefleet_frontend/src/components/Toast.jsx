// this component is going to pop up and then hide after
// three seconds (we'll control this else where)
import { useEffect } from "react"

const AUTO_HIDE_MS = 3000

export default function Toast({notification, hide}) {
  // let's make an effect that will hide the notification
  useEffect(()=> {
    if (!notification) {
      return
    }
    const timer = setTimeout(hide, AUTO_HIDE_MS)
    // clean up of the effect
    return () => clearTimeout(timer)
  }, [notification])


  // notification will be {message, type}

  // let's make a guard to show nothing if the notification
  // is null
  if (!notification) {
    return null
  }

  // let's change the alert message based on the type
  const alertClass = notification.type == 'success' ? 'alert-success' : 'alert-error'

  return <div className="toast toast-top toast-end z-50 mt-15">
    <div className={`alert ${alertClass}`}>
      <span>{notification.message}</span>
    </div>
  </div>
}