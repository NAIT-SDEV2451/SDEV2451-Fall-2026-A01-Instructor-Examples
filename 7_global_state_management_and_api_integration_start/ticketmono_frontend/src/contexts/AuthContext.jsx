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
export default function AuthProvider({children}) {

  return <AuthContext.Provider value={{}}>
    {children}
  </AuthContext.Provider>
}
