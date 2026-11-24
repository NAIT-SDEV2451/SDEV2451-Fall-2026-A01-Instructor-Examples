import { useState } from 'react'
import { describe, it, expect } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { delay, http, HttpResponse } from 'msw'

import MyEventsPage from '../pages/organizer/MyEventsPage'
import { AuthContext } from '../contexts/AuthContext'
import { renderWithProviders } from '../test/renderWithProviders'
import { mockMyEvents } from '../test/handlers'
import { server } from '../test/server'

const MY_EVENTS_URL = 'http://localhost:8000/api/v1/events/mine/'

const alice = { id: 100, username: 'alice_organizer', role: 'event_organizer' }
const bob = { id: 101, username: 'bob_organizer', role: 'event_organizer' }

// Lets a test switch accounts while keeping the same query cache.
function PageWithUserSwitch() {
  const [user, setUser] = useState(alice)

  return (
    <AuthContext.Provider value={{ user }}>
      <button onClick={() => setUser(bob)}>Switch to bob</button>
      <MyEventsPage />
    </AuthContext.Provider>
  )
}

function renderPage() {
  return renderWithProviders(
    <AuthContext.Provider value={{ user: alice }}>
      <MyEventsPage />
    </AuthContext.Provider>
  )
}

function expectTotals() {
  expect(screen.getByText('Tickets sold').parentElement).toHaveTextContent('1,250')
  expect(screen.getByText('Gross revenue').parentElement).toHaveTextContent('$30,500.50')
}

describe('MyEventsPage', () => {
  it('shows a loading spinner while events are loading', () => {
    const { container } = renderPage()

    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('shows an error message if the request fails', async () => {
    server.use(
      http.get(MY_EVENTS_URL, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      })
    )

    renderPage()

    expect(
      await screen.findByText('Failed to load your events. Please try again later.')
    ).toBeInTheDocument()
  })

  it('shows a message if the organizer has no events', async () => {
    server.use(
      http.get(MY_EVENTS_URL, () => {
        return HttpResponse.json({
          totals: { events: 0, tickets_sold: 0, revenue: '0.00' },
          events: [],
        })
      })
    )

    renderPage()

    expect(await screen.findByText("You don't have any events yet.")).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('shows the totals for all events', async () => {
    renderPage()

    await screen.findByRole('heading', { name: 'My Events' })

    // "Events" is also a sidebar link, so look for the one inside a stat.
    const eventsStat = screen.getByText('Events', { selector: '.stat-title' })
    expect(eventsStat.parentElement).toHaveTextContent('Events2')
    expectTotals()
  })

  it('shows the data for each event in its own row', async () => {
    renderPage()

    const pastRow = await screen.findByRole('row', { name: /Indie Rock Night/ })
    expect(within(pastRow).getByText('November 14, 2026')).toBeInTheDocument()
    expect(within(pastRow).getByText('The Aurora Room')).toBeInTheDocument()
    expect(within(pastRow).getByText('Past')).toBeInTheDocument()
    expect(within(pastRow).getByText('1,200')).toBeInTheDocument()
    expect(within(pastRow).getByText('$30,000.00')).toBeInTheDocument()

    const upcomingRow = screen.getByRole('row', { name: /Comedy Open Mic/ })
    expect(within(upcomingRow).getByText('Upcoming')).toBeInTheDocument()
    expect(within(upcomingRow).getByText('50')).toBeInTheDocument()
    expect(within(upcomingRow).getByText('$500.50')).toBeInTheDocument()
  })

  it('filters the table by tab without changing the totals', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Indie Rock Night')

    await user.click(screen.getByRole('button', { name: 'Upcoming' }))
    expect(screen.getByText('Comedy Open Mic')).toBeInTheDocument()
    expect(screen.queryByText('Indie Rock Night')).not.toBeInTheDocument()
    expectTotals()

    await user.click(screen.getByRole('button', { name: 'Past' }))
    expect(screen.getByText('Indie Rock Night')).toBeInTheDocument()
    expect(screen.queryByText('Comedy Open Mic')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Indie Rock Night')).toBeInTheDocument()
    expect(screen.getByText('Comedy Open Mic')).toBeInTheDocument()
  })

  it('shows a message if the selected tab has no events', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(MY_EVENTS_URL, () => {
        return HttpResponse.json({ ...mockMyEvents, events: [mockMyEvents.events[0]] })
      })
    )
    renderPage()
    await screen.findByText('Indie Rock Night')

    await user.click(screen.getByRole('button', { name: 'Upcoming' }))

    expect(screen.getByText('No upcoming events.')).toBeInTheDocument()
  })

  it.each(['+ Create event', 'Sales', 'Attendees', 'Settings'])(
    'disables %s because it is not built yet',
    async (name) => {
      renderPage()

      expect(await screen.findByRole('button', { name })).toBeDisabled()
    }
  )

  it('does not show the previous organizer their events after switching accounts', async () => {
    const user = userEvent.setup()
    renderWithProviders(<PageWithUserSwitch />)
    await screen.findByText('Indie Rock Night')

    // Bob's request never finishes, so anything on screen came from the cache.
    server.use(http.get(MY_EVENTS_URL, () => delay('infinite')))
    await user.click(screen.getByRole('button', { name: 'Switch to bob' }))

    expect(screen.queryByText('Indie Rock Night')).not.toBeInTheDocument()
  })
})
