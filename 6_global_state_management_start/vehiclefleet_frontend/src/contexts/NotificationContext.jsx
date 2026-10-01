// make the controller for the notification context.
import { createContext, useState } from 'react'

// import my toast
import Toast from '../components/Toast'

// create the context that exposes and holds the variables
// from the values in the provider
export const NotificationContext = createContext(null)

// let's create the provider/wrapper to use on the App.
export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState()

  // we're going to have three funcs
  // show an error,
  function showError(message) {
    setNotification({
      message,
      type: 'error'
    })
  }
  // show success
  function showSuccess(message) {
    setNotification({
      message,
      type: 'success'
    })
  }
  // hide
  function hide() {
    setNotification(null)
  }

  return <NotificationContext.Provider value={{
    showError,
    showSuccess,
    hide,
  }}>
    <Toast notification={notification} hide={hide} />
    {children}
  </NotificationContext.Provider>

}