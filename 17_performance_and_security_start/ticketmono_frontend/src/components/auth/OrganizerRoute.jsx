import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Wrap any route that only event organizers should see.
// This only controls what the user sees. The API enforces the same
// rule, because anyone can send a request without using this page.
function OrganizerRoute({ children }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'event_organizer') {
    return <Navigate to="/" replace />
  }

  return children
}

export default OrganizerRoute
