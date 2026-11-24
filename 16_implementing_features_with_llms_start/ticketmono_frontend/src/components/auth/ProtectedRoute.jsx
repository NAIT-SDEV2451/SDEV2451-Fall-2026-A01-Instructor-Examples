import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Wrap any route that requires the user to be logged in.
// If the user is not authenticated, they are redirected to /login.
// The `replace` prop replaces the current history entry so the user
// cannot press Back to get to the protected page without logging in.
// Pass `role` to also require that role. Other logged-in users go to the home page.
function ProtectedRoute({ children, role }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
