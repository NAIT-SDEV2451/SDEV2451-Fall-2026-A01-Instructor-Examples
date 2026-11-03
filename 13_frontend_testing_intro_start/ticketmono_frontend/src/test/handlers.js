// docs are here when you want to review them.
// https://mswjs.io/docs/quick-start
import {http, HttpResponse } from 'msw'

// we need to mock the backend url that we're using (the base url)
const BASE_URL = 'http://localhost:8000/api/v1'

// sample data that is returned from an event api endpoint.
export const mockEvents = [
  {
    id: 1,
    name: 'Indie Rock Night',
    date_time: '2026-11-14T19:30:00Z',
    venue: { id: 1, name: 'The Aurora Room', address: '221 King St W' },
  },
  {
    id: 2,
    name: 'Comedy Open Mic',
    date_time: '2026-11-20T20:00:00Z',
    venue: { id: 2, name: 'Backroom Lounge', address: '77 Jasper Ave' },
  },
]

// let's set up the handlers to return the data
export const handlers = [
  // the first endpoint we're "mocking" is the list events
  http.get(`${BASE_URL}/events/`, () => {
    return HttpResponse.json(mockEvents)
  })
]

// this doesn't create the server but is going to be where
// we define all of our mock endpoints.