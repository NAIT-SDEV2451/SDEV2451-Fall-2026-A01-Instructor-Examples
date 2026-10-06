// our enhanced fetch

import  { getAccessToken } from './tokenStorage'

// our backend api url.
const BASE_URL = 'http://localhost:8000/api/v1'

// placeholders for some callbacks.
let _onTokenRefresh = null
let _onLogout = null
let _refreshPromise = null

// let's create a function to populate these
// this will be used by our auth context.
export function setAuthCallbacks({onTokenRefresh, onLogout}) {
  _onTokenRefresh = onTokenRefresh
  _onLogout = onLogout
}

// this is going to be our enhanced fetch piece, it will automatically
// add the token to the headers, and add the default headers  to
// our application.
// as well we're going to make this an interceptor (you can also do this)
// with axios in the future.
export default async function apiClient(endpoint, options={}) {
  // the endpoint is self explanatory.

  // get the access token
  const accessToken = getAccessToken()

  // construct headers for every request
  const headers = {
    "Content-Type": "application/json",
    // spread the options of headers if it exists
    ...options.headers,
    // If there's a token available we're going to add the
    ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : {})
  }

  // let's make the request
  let res = await fetch(`${BASE_URL}${endpoint}`, {...options, headers})

  // in a bit we're going to attempt a silent refresh if our token
  // expires.

  return res
}