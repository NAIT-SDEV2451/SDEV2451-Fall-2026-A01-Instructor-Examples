// the whole idea here is that we run our server
// before all of our tests and reset after each test.

// add the matchers for the dom on all of our tests.
import '@testing-library/jest-dom'

// these are callbacks that are called before or after the tests
// all (beforeall) tests (opposite for afterall)
// afterEach is going to be after each test.
import { afterAll, beforeAll, afterEach } from 'vitest'

import {server} from './server'

// handle these requests.
beforeAll(()=> { // before all run the server.
  return server.listen({onUnhandledRequest: "warn"})
})
afterEach(()=> {
  return server.resetHandlers() // "reset" the server after a test
})
afterAll(()=> {
  return server.close() // turn off the server.
})
