import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'

import Navbar from '../components/Navbar'
import { AuthContext } from '../contexts/AuthContext'
import { renderWithProviders } from '../test/renderWithProviders'

function renderNavbar(user) {
  renderWithProviders(
    <AuthContext.Provider value={{ user }}>
      <Navbar />
    </AuthContext.Provider>
  )
}

describe('Navbar', () => {
  it('shows the My Events link to an organizer', () => {
    renderNavbar({ id: 100, username: 'alice_organizer', role: 'event_organizer' })

    expect(screen.getByRole('link', { name: 'My Events' })).toHaveAttribute('href', '/my-events')
  })

  it('hides the My Events link from a regular user', () => {
    renderNavbar({ id: 1, username: 'regular_user', role: 'user' })

    expect(screen.queryByRole('link', { name: 'My Events' })).not.toBeInTheDocument()
  })

  it('hides the My Events link when logged out', () => {
    renderNavbar(null)

    expect(screen.queryByRole('link', { name: 'My Events' })).not.toBeInTheDocument()
  })
})
