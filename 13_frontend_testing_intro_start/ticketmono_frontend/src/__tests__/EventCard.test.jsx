// we're going to understand the fundamentals by testing
// the rendering of this event card
import { describe, it, test, expect } from "vitest";

// this is going to make it so that we can select items on the page.
// if you want to take a look at how to select items
// take a look at the docs here: https://testing-library.com/docs/queries/about/
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
  it("renders the venue name and address", () => {
    // render the component
    renderWithProviders(
      <EventCard event={event} /> // pass in jsx
    )

    const venueName = screen.getByText(event.venue.name)
    const address = screen.getByText(event.venue.address)

    expect(venueName).toBeInTheDocument()
    expect(address).toBeInTheDocument()
  })

  it('links to the event detail page', ()=> {
    renderWithProviders(
      <EventCard event={event} /> // pass in jsx
    )

    // get the link by role
    const link = screen.getByRole('link', {name: "Get Tickets"})
    // this is because we're creating a link with the link component.
    expect(link).toHaveAttribute('href', '/events/1')
  })
})