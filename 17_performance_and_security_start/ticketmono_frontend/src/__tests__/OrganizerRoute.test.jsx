import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'

import OrganizerRoute from '../components/auth/OrganizerRoute'
import { AuthContext } from '../contexts/AuthContext'
import { renderWithProviders } from '../test/renderWithProviders'

function renderAs(user) {
  renderWithProviders(
    <AuthContext.Provider value={{ user }}>
      <Routes>
        <Route path="/" element={<p>Home page</p>} />
        <Route path="/login" element={<p>Login page</p>} />
        <Route
          path="/organizer"
          element={<OrganizerRoute><p>Organizer page</p></OrganizerRoute>}
        />
      </Routes>
    </AuthContext.Provider>,
    { initialEntries: ['/organizer'] }
  )
}

describe('OrganizerRoute', () => {
  it('shows the page to organizers', () => {
    renderAs({ id: 1, username: 'alice', role: 'event_organizer' })

    expect(screen.getByText('Organizer page')).toBeInTheDocument()
  })

  it('sends regular users to the home page', () => {
    renderAs({ id: 2, username: 'sam', role: 'user' })

    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('Organizer page')).not.toBeInTheDocument()
  })

  it('sends logged out visitors to the login page', () => {
    renderAs(null)

    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
