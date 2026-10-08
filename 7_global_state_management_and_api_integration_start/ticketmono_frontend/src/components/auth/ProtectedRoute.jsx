// protected pages are going to be
// show the information or redirect
// to the login page.
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth()

  // if there's no user, they're not logged in.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>
    {children}
  </>
}