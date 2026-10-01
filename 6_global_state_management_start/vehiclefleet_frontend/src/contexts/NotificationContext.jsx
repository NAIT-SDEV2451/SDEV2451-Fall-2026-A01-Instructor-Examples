// make the controller for the notification context.
import { createContext, useState } from 'react'

// import my toast
import Toast from '../components/Toast'

// create the context that exposes and holds the variables
// from the values in the provider
export const NotificationContext = createContext(null)

// let's create the provider/wrapper to use on the App.
export default function NotificationProvider({ children }) {


  return <>
    <Toast />
    {children}
  </>
}