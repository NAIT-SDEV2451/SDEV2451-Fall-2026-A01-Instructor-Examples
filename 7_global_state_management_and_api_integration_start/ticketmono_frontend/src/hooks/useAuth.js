import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";


export function useAuth() {
  // we're just going to expose our
  // AuthContext
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must in an AuthProvider')
  }
  return context
}