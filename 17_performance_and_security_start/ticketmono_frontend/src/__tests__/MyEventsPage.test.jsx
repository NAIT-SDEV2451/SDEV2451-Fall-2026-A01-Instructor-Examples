import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import MyEventsPage from '../pages/organizer/MyEventsPage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'

const MY_EVENTS_URL = 'http://localhost:8000/api/v1/events/mine/'

describe('MyEventsPage', () => {
  it('shows a loading spinner while events are loading', () => {
    const { container } = renderWithProviders(<MyEventsPage />)

    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })

  it('renders my events and the totals across them', async () => {
    renderWithProviders(<MyEventsPage />)

    await waitFor(() => {
      expect(screen.getByText('Indie Rock Night')).toBeInTheDocument()
      expect(screen.getByText('Comedy Open Mic')).toBeInTheDocument()
    })
    expect(screen.getByText('$200.50')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows a message when there are no events', async () => {
    server.use(http.get(MY_EVENTS_URL, () => HttpResponse.json([])))

    renderWithProviders(<MyEventsPage />)

    await waitFor(() => {
      expect(screen.getByText("You haven't created any events yet.")).toBeInTheDocument()
    })
  })

  it('shows an error message if the request fails', async () => {
    server.use(
      http.get(MY_EVENTS_URL, () => {
        return HttpResponse.json({ detail: 'Server error' }, { status: 500 })
      })
    )

    renderWithProviders(<MyEventsPage />)

    await waitFor(() => {
      expect(
        screen.getByText('Failed to load your events. Please try again later.')
      ).toBeInTheDocument()
    })
  })
})
