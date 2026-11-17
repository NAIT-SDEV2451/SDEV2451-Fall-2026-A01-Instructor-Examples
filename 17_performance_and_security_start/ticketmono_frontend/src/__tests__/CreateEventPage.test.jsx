import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

import CreateEventPage from '../pages/organizer/CreateEventPage'
import { renderWithProviders } from '../test/renderWithProviders'
import { server } from '../test/server'

const EVENTS_URL = 'http://localhost:8000/api/v1/events/'

async function fillInEvent(user) {
  await user.type(await screen.findByLabelText('Event name'), 'New Show')
  await user.type(screen.getByLabelText('Date and time'), '2027-01-15T19:30')
  await user.selectOptions(screen.getByLabelText('Venue'), 'The Aurora Room')
  await user.type(screen.getByLabelText('Tier 1 name'), 'Floor')
  await user.type(screen.getByLabelText('Tier 1 price'), '120')
}

describe('CreateEventPage', () => {
  it('submits the event with every ticket tier', async () => {
    let body
    server.use(
      http.post(EVENTS_URL, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ id: 3 }, { status: 201 })
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<CreateEventPage />)

    await fillInEvent(user)
    await user.click(screen.getByRole('button', { name: 'Add Tier' }))
    await user.type(screen.getByLabelText('Tier 2 name'), 'Balcony')
    await user.type(screen.getByLabelText('Tier 2 price'), '60')
    await user.click(screen.getByRole('button', { name: 'Create Event' }))

    await waitFor(() => {
      expect(body).toEqual({
        name: 'New Show',
        date_time: new Date('2027-01-15T19:30').toISOString(),
        venue_id: 1,
        ticket_tiers: [
          { name: 'Floor', price: '120' },
          { name: 'Balcony', price: '60' },
        ],
      })
    })
  })

  it('shows the error from the API when creating fails', async () => {
    server.use(
      http.post(EVENTS_URL, () => {
        return HttpResponse.json(
          { venue_id: ['Choose one of your venues.'] },
          { status: 400 }
        )
      })
    )
    const user = userEvent.setup()
    renderWithProviders(<CreateEventPage />)

    await fillInEvent(user)
    await user.click(screen.getByRole('button', { name: 'Create Event' }))

    expect(await screen.findByText('Choose one of your venues.')).toBeInTheDocument()
  })
})
