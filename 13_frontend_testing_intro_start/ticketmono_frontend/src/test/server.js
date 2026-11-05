// this is going to create the Mock server that will
// respond to requests on the backend here.


import { setupServer } from 'msw/node' // the mock server
import { handlers } from './handlers' // all of our endpoints

export const server = setupServer(
  ...handlers
  // remember spreading an array is just making the each item in the
  // list a param of the setup server function
)