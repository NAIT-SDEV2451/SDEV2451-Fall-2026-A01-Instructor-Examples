import { createContext, useEffect, useState } from "react";
import { useMutation } from '@tanstack/react-query'
import {
  loginUser,
  registerUser,
  refresh,
  me,
} from '../api/auth'
import { setAuthCallbacks } from '../api/client'
import {
  clearStoredTokens,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from '../api/tokenStorage'

// create the context
export const AuthContext = createContext(null)

// create the provider that will hold all of this information
export default function AuthProvider({ children }) {
  // our original state will be for the accesstoken and the user.
  // they will use the stored items from localstorage as the default
  const [user, setUser] = useState(() => getStoredUser())
  const [accessToken, setAccessToken] = useState(() => getAccessToken())

  // on logout and for cleanup we want to clear everything
  function clearAuthState() {
    // clear the memory
    setUser(null)
    setAccessToken(null)
    // clear all of the localStorage
    clearStoredTokens()
  }
  // let's create all of our mutations
  // login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      // perform the api call.
      const response = await loginUser(credentials)
      if (!response.ok) {
        throw new Error("login failed")
      }
      // get the tokens from the response.
      const tokens = await response.json()
      // set the access token on localStorage
      setAccessToken(tokens.access)

      // let's get the user profile
      const meResponse = await me()
      if (!meResponse.ok) {
        throw new Error("user profile fetch failed")
      }
      const me = await meResponse.json()

      // return both tokens and the user
      return { tokens, me }
    }
  })

  // registration mutation
  const registerMutation = useMutation({
    mutationFn: async (userData) => {
      // perform the api call.
      const response = await registerUser(userData)
      if (!response.ok) {
        throw new Error("registration failed")
      }
      return response.json()
    }
  })



  // logout wierdly enough is not a mutation, it's just clearing the AuthState





  return <AuthContext.Provider value={{
    user,
    accessToken,
    // functions
    register: registerMutation.mutate

  }}>
    {children}
  </AuthContext.Provider>
}
