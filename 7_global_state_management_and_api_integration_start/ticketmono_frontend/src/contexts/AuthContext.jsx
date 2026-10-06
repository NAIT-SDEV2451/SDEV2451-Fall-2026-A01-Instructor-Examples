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


  return <AuthContext.Provider value={{}}>
    {children}
  </AuthContext.Provider>
}
