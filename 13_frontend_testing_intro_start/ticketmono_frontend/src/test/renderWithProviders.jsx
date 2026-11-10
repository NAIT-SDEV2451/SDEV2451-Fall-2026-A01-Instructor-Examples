// this is going to be a special "render" function
// this is going to use the render from react testing library
// but also wrap our component with context providers.

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// for our router we're going to use the memory router
import { MemoryRouter } from "react-router-dom"

import { render } from "@testing-library/react"

import { AuthProvider } from "../contexts/AuthContext"

// we're going "augment" render above with our render
// note the ui below will be the component that we render
export function renderWithProviders(ui, { intialEntries = ["/"] } = {}) {
  // we're going to set up a queryClient
  const queryClient = new QueryClient({
    // I want to remove the retries
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  // we're going to return the render except wrap the ui
  //
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={intialEntries}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}