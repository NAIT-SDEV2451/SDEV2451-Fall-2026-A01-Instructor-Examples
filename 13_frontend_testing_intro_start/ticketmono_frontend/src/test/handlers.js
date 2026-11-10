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

export const mockUser = { id: 1, username: 'gary', role: 'user' }

// A fake JWT: header.payload.signature. Only the payload is real base64 JSON,
// because AuthContext decodes it to read user_id.
const FAKE_ACCESS_TOKEN = `header.${btoa(JSON.stringify({ user_id: 1 }))}.signature`

// let's set up the handlers to return the data
export const handlers = [
  // the first endpoint we're "mocking" is the list events
  http.get(`${BASE_URL}/events/`, () => {
    return HttpResponse.json(mockEvents)
  }),
  // a couple of views for our login page.
  http.post(`${BASE_URL}/auth/login/`, () => {
    // just a note this is a simulated successful response
    // on login of a user.
    return HttpResponse.json({
      access: FAKE_ACCESS_TOKEN,
      refresh: "fake-refresh-lol"
    })
  }),
  // me endpoint is hit during login the function
  // so we need to mock it.
  http.get(`${BASE_URL}/auth/me/`, () => {
    return HttpResponse.json(mockUser)
  })
]

// this doesn't create the server but is going to be where
// we define all of our mock endpoints.