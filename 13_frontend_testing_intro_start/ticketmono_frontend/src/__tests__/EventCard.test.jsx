// we're going to understand the fundamentals by testing
// the rendering of this event card
import { describe, it, test, expect } from "vitest";

// this is going to make it so that we can select items on the page.
import { screen } from "@testing-library/react";

// the component that we're testing
import EventCard from "../components/EventCard";

// the events we created to mock we can just use the data
import { mockEvents } from "../test/handlers";
import { renderWithProviders } from "../test/renderWithProviders";


// in vitest you can create a testing section with describe
describe("EventCard", () => {
  // we're goign to get the first event
  const event = mockEvents[0]

  // note: it and test do the samething
  test("renders the event name", ()=> {
    // render the component
    renderWithProviders(
      <EventCard event={event} /> // pass in jsx
    )

    // select the item with the title
    const titleElement = screen.getByText('Indie Rock Night')
    // we could do the following
    // const titleElement = screen.getByText(event.name)
    // check to see if it's in the document.
    expect(titleElement).toBeInTheDocument()
    // to be in the document is a jest dom matcher
    // docs for this is here https://github.com/testing-library/jest-dom
  })

  // practice with doing the same thign as above except with
  // venue name and the address.

})