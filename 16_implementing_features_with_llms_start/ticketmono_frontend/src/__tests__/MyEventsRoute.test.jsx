import { afterEach, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import App from '../App'
import { clearStoredTokens, setStoredUser } from '../api/tokenStorage'

// Renders the real App to check that the route itself is protected.
// App has its own providers and router, so renderWithProviders isn't used here.
function openMyEvents(user) {
  if (user) setStoredUser(user)
  window.history.pushState({}, '', '/my-events')
  render(<App />)
}

describe('/my-events route', () => {
  afterEach(() => {
    clearStoredTokens()
    window.history.pushState({}, '', '/')
  })

  it('shows the page to an organizer', async () => {
    openMyEvents({ id: 100, username: 'alice_organizer', role: 'event_organizer' })

    expect(await screen.findByRole('heading', { name: 'My Events' })).toBeInTheDocument()
  })

  it('redirects a regular user to the home page', async () => {
    openMyEvents({ id: 1, username: 'regular_user', role: 'user' })

    expect(await screen.findByRole('heading', { name: 'Upcoming Events' })).toBeInTheDocument()
  })

  it('redirects a logged out user to the login page', async () => {
    openMyEvents(null)

    expect(await screen.findByRole('heading', { name: 'Log In' })).toBeInTheDocument()
  })
})
