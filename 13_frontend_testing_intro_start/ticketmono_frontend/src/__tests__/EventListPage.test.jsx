import { describe, it, test, expect } from "vitest";

import { screen, waitFor } from "@testing-library/react";

// we're going to also mock an api error in the tests
import {http, HttpResponse} from 'msw'

import EventsListPage from "../pages/attendee/EventsListPage";
import { renderWithProviders } from "../test/renderWithProviders";

// we'll need to modify this.
import { server } from "../test/server";

const EVENTS_URL = "http://localhost:8000/api/v1/events/"

describe("EventsListPage", () => {
  it("shows a loading spinner while events are loading", ()=> {
    // render the component
    // and we're going to select things using our knowledge of
    // queryselector from the past.
    const { container } = renderWithProviders(<EventsListPage />)

    const loadingSpinner = container.querySelector(".loading-spinner")

    expect(loadingSpinner).toBeInTheDocument()
  })

  it("renders every event once loading finishes", async () => {
    // note the test is async
    renderWithProviders(<EventsListPage />)

    // wait for is going to wait for a bit to see if these will render.
    await waitFor(()=> { // docs: https://testing-library.com/docs/dom-testing-library/api-async/#waitfor
      // I know these are mockEvents in the "handlers" file
      const event_one = screen.getByText("Indie Rock Night")
      const event_two = screen.getByText("Comedy Open Mic")

      expect(event_one).toBeInTheDocument()
      expect(event_two).toBeInTheDocument()
    })

  })


})
